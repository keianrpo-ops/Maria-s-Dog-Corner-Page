import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";
import { getCalendarClient, getCalendarId } from "./_client.js";

const VERSION = "calendar/create-booking@v5";
const TZ = "Europe/London";

function makeTraceId() {
  try {
    return crypto.randomUUID();
  } catch {
    return crypto.randomBytes(16).toString("hex");
  }
}

function parseBody(req: VercelRequest) {
  const b: any = (req as any).body;
  if (!b) return {};
  if (typeof b === "string") {
    try {
      return JSON.parse(b);
    } catch {
      return {};
    }
  }
  return b;
}

function ensureEndAfterStart(startISO: string, endISO?: string) {
  const start = new Date(startISO);
  if (Number.isNaN(start.getTime())) throw new Error("Invalid startISO");

  let end = endISO ? new Date(endISO) : new Date(start.getTime() + 60 * 60 * 1000);
  if (Number.isNaN(end.getTime()) || end <= start) end = new Date(start.getTime() + 60 * 60 * 1000);

  return { startISO: start.toISOString(), endISO: end.toISOString() };
}

// Convierte un Date (UTC) a "YYYY-MM-DDTHH:mm:ss" en Europe/London
function toLocalDateTimeString(date: Date, timeZone: string = TZ) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const yyyy = get("year");
  const mm = get("month");
  const dd = get("day");
  const hh = get("hour");
  const min = get("minute");
  const ss = get("second");

  return `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}`;
}

// Colores aproximados a tus botones:
// Daycare (azul), Boarding (morado), Pet Sitting (verde), Dog Walk (amarillo)
function pickColorId(service: string) {
  const s = String(service || "").toLowerCase();
  // Google Calendar event colorId: "1".."11"
  if (s.includes("daycare")) return "9";   // azul
  if (s.includes("boarding")) return "3";  // morado
  if (s.includes("pet")) return "10";      // verde
  if (s.includes("walk")) return "5";      // amarillo
  return "1";
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const traceId = makeTraceId();

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, traceId, version: VERSION, error: "Method not allowed" });
  }

  try {
    const body = parseBody(req);

    // ✅ MERGE ROBUSTO: booking sobreescribe lead, lead sobreescribe body plano
    const d = {
      ...(body || {}),
      ...((body && body.lead) || {}),
      ...((body && body.booking) || {}),
    };

    if (!d?.startISO || !d?.service) {
      return res.status(400).json({
        ok: false,
        traceId,
        version: VERSION,
        error: "Missing required fields: startISO and service.",
        diagnostic: { receivedKeys: Object.keys(d || {}) },
      });
    }

    const fixed = ensureEndAfterStart(d.startISO, d.endISO);

    const calendar = getCalendarClient();
    const calendarId = getCalendarId();

    const pet = d.dogNames || d.dogName || "Dog";
    const human = d.ownerName || d.customerName || "Owner";
    const phone = d.ownerPhone || d.contact || "N/A";

    const age = d.dogAge ? String(d.dogAge) : "";
    const breed = d.dogBreed ? String(d.dogBreed) : "";

    const vac = d.vaccinationsUpToDate ?? "";
    const neu = d.neutered ?? d.neuteredSpayed ?? "";
    const all = d.allergies ?? "";
    const beh = d.behaviour ?? d.behavior ?? "";
    const med = d.medicalNotes ?? "";

    const descLines: string[] = [];
    descLines.push(`Owner: ${human}`);
    descLines.push(`Phone: ${phone}`);
    descLines.push(`Dog: ${pet}${breed ? ` | Breed: ${breed}` : ""}${age ? ` | Age: ${age}` : ""}`);
    descLines.push(`Service: ${d.service}`);
    descLines.push("");
    descLines.push("Safety & behaviour:");
    if (vac !== "") descLines.push(`- Vaccinations up to date: ${vac}`);
    if (neu !== "") descLines.push(`- Neutered/Spayed: ${neu}`);
    if (all !== "") descLines.push(`- Allergies: ${all}`);
    if (beh !== "") descLines.push(`- Behaviour: ${beh}`);
    if (med !== "") descLines.push(`- Medical notes: ${med}`);

    const colorId = pickColorId(d.service);

    // Guardar el evento en hora local UK
    const startLocal = toLocalDateTimeString(new Date(fixed.startISO), TZ);
    const endLocal = toLocalDateTimeString(new Date(fixed.endISO), TZ);

    const event = await calendar.events.insert({
      calendarId,
      requestBody: {
        summary: `MDC • ${d.service} • ${pet} (${human})`,
        description: descLines.join("\n"),
        start: { dateTime: startLocal, timeZone: TZ },
        end: { dateTime: endLocal, timeZone: TZ },
        colorId,
      },
    });

    return res.status(200).json({
      ok: true,
      traceId,
      version: VERSION,
      eventId: event.data.id,
      summary: event.data.summary || null,
      colorId,
      startISO: fixed.startISO,
      endISO: fixed.endISO,
    });
  } catch (err: any) {
    console.error(`[${VERSION}] Error`, { traceId, error: err?.message || err });
    return res.status(500).json({
      ok: false,
      traceId,
      version: VERSION,
      error: err?.message || "Calendar booking error",
    });
  }
}
