import {
  askAssistant,
  createCalendarBooking,
  checkCalendarAvailability,
  type ChatMessage,
  type Lead,
  type Booking,
} from "./geminiService";

type Lang = "es" | "en";
const TZ = "Europe/London";

function getMaxCapacity() {
  const env = (import.meta as any)?.env || {};
  const max = Number(env.VITE_MDC_MAX_DOGS_CAPACITY);
  return Number.isFinite(max) && max > 0 ? max : 10;
}

function detectLang(messages: ChatMessage[], lead: Lead, aiLead?: any): Lang {
  const forced = String(aiLead?.language || lead?.language || "").toLowerCase();
  if (forced.startsWith("es")) return "es";
  if (forced.startsWith("en")) return "en";

  const lastUser = [...messages].reverse().find((m: any) => m.role === "user")?.content || "";
  const t = String(lastUser).toLowerCase();
  if (t.includes("español") || t.includes("en español")) return "es";
  if (t.includes("english") || t.includes("in english")) return "en";

  const es = (t.match(/[¿¡áéíóúñ]/g) || []).length;
  return es > 0 ? "es" : "en";
}

function formatDateTimeRangeUK(startISO: string, endISO: string, lang: Lang) {
  const start = new Date(startISO);
  const end = new Date(endISO);

  const dateFmt = new Intl.DateTimeFormat(lang === "es" ? "es-ES" : "en-GB", {
    timeZone: TZ,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const timeFmt = new Intl.DateTimeFormat(lang === "es" ? "es-ES" : "en-GB", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: lang === "es" ? true : true,
  });

  const date = dateFmt.format(start);
  const startTime = timeFmt.format(start);
  const endTime = timeFmt.format(end);

  return { date, startTime, endTime };
}

function serviceLabel(service: string, lang: Lang) {
  const s = String(service || "").toLowerCase();
  if (lang === "es") {
    if (s.includes("daycare")) return "Guardería (Daycare)";
    if (s.includes("boarding")) return "Hospedaje (Boarding)";
    if (s.includes("pet")) return "Pet Sitting";
    if (s.includes("walk")) return "Paseo (Dog Walk)";
    return service;
  }
  // EN
  return service;
}

function yesNoLabel(v: any, lang: Lang) {
  const s = String(v ?? "").toLowerCase().trim();
  if (!s) return lang === "es" ? "No especificado" : "Not provided";
  if (lang === "es") {
    if (s === "yes" || s === "sí" || s === "si") return "Sí";
    if (s === "no") return "No";
    if (s.includes("unknown") || s.includes("no sé") || s.includes("nose")) return "No sé";
    return String(v);
  }
  // EN
  if (s === "sí" || s === "si") return "Yes";
  if (s === "no") return "No";
  if (s.includes("no sé") || s.includes("nose")) return "Unknown";
  return String(v);
}

function buildConfirmationMessage(booking: any, lang: Lang) {
  const service = serviceLabel(booking.service, lang);
  const { date, startTime, endTime } = formatDateTimeRangeUK(booking.startISO, booking.endISO, lang);

  const dogName = booking.dogName || booking.dogNames || "—";
  const dogBreed = booking.dogBreed || "—";
  const dogAge = booking.dogAge || "—";

  const ownerName = booking.ownerName || "—";
  const ownerPhone = booking.ownerPhone || "—";

  const vac = yesNoLabel(booking.vaccinationsUpToDate, lang);
  const neu = yesNoLabel(booking.neuteredSpayed ?? booking.neutered, lang);
  const allergies = String(booking.allergies ?? "—");
  const behaviour = String(booking.behaviour ?? booking.behavior ?? "—");
  const medical = String(booking.medicalNotes ?? "—");

  if (lang === "es") {
    return [
      `✅ **Confirmación de Reserva — ${service}**`,
      ``,
      `• **Estado:** Reserva confirmada`,
      `• **Servicio:** ${service}`,
      `• **Fecha:** ${date}`,
      `• **Horario:** ${startTime} – ${endTime} (hora Reino Unido)`,
      ``,
      `**Información del perro**`,
      `• **Nombre:** ${dogName}`,
      `• **Raza:** ${dogBreed}`,
      `• **Edad:** ${dogAge}`,
      ``,
      `**Información del propietario**`,
      `• **Nombre:** ${ownerName}`,
      `• **Teléfono de contacto:** ${ownerPhone}`,
      ``,
      `**Salud y comportamiento**`,
      `• **Vacunas al día:** ${vac}`,
      `• **Esterilizado/Castrado:** ${neu}`,
      `• **Alergias:** ${allergies}`,
      `• **Comportamiento:** ${behaviour}`,
      `• **Notas médicas:** ${medical}`,
      ``,
      `Si necesitas ajustar algo (hora/servicio), responde por este chat y lo revisamos.`,
    ].join("\n");
  }

  // EN
  return [
    `✅ **Booking Confirmation — ${service}**`,
    ``,
    `• **Status:** Confirmed`,
    `• **Service:** ${service}`,
    `• **Date:** ${date}`,
    `• **Time:** ${startTime} – ${endTime} (UK time)`,
    ``,
    `**Dog information**`,
    `• **Name:** ${dogName}`,
    `• **Breed:** ${dogBreed}`,
    `• **Age:** ${dogAge}`,
    ``,
    `**Owner information**`,
    `• **Name:** ${ownerName}`,
    `• **Contact phone:** ${ownerPhone}`,
    ``,
    `**Health & behaviour**`,
    `• **Vaccinations up to date:** ${vac}`,
    `• **Neutered/Spayed:** ${neu}`,
    `• **Allergies:** ${allergies}`,
    `• **Behaviour:** ${behaviour}`,
    `• **Medical notes:** ${medical}`,
    ``,
    `If you need any changes (time/service), reply here and we’ll help.`,
  ].join("\n");
}

export async function chatWithMaria(messages: ChatMessage[], lead: Lead) {
  const ai = await askAssistant(messages, lead);
  const lang = detectLang(messages, lead, ai?.lead);

  // Si no es booking, devolvemos tal cual (pero idioma lo controla el backend)
  if (!(ai.action === "create_booking" && ai.booking)) return ai;

  // 1) Availability
  let currentDogs = 0;
  const max = getMaxCapacity();

  try {
    const check = await checkCalendarAvailability(ai.booking.startISO, ai.booking.endISO);
    if (check.ok) currentDogs = Number(check.data?.count || 0);
  } catch {
    // seguimos: no bloqueamos por disponibilidad si falla
  }

  if (currentDogs >= max) {
    return {
      ...ai,
      action: "none" as const,
      reply:
        lang === "es"
          ? `Lo siento, ya tenemos los ${max} cupos llenos para ese horario. ¿Te sirve otra fecha u otra hora?`
          : `Sorry, we’re fully booked (${max} spots) for that time. Would another date or time work?`,
    };
  }

  // 2) Create booking
  const res = await createCalendarBooking(ai.booking as Booking);

  if (res.ok) {
    // Confirmación bonita (no links)
    return {
      ...ai,
      reply: buildConfirmationMessage(ai.booking, lang),
      calendar: res,
    };
  }

  // Error: mensaje profesional sin detalles técnicos
  return {
    ...ai,
    action: "none" as const,
    reply:
      lang === "es"
        ? `Gracias. He registrado tu solicitud, pero ahora mismo no pude confirmar automáticamente en el calendario. Te confirmaremos en breve por este chat.`
        : `Thanks. I’ve recorded your request, but I couldn’t confirm it in the calendar right now. We’ll confirm shortly here in the chat.`,
    calendar: res,
  };
}
