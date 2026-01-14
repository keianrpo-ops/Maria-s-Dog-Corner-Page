import type { ChatMessage, Lead, Booking } from "./geminiService";
import { askAssistant, checkCalendarAvailability, createCalendarBooking } from "./geminiService";

function mergeLead(oldLead: Lead, newLead: Lead): Lead {
  return { ...(oldLead || {}), ...(newLead || {}) };
}

function isCreateBooking(action: any): action is "create_booking" {
  return action === "create_booking";
}

function hasMinBookingFields(b: any): b is Booking {
  return !!(b && typeof b.startISO === "string" && typeof b.service === "string" && b.startISO && b.service);
}

export async function chatWithMaria(messages: ChatMessage[], lead: Lead) {
  const ai = await askAssistant(messages, lead);

  const mergedLead = mergeLead(lead, ai.lead || {});
  const reply = ai.reply;

  if (!isCreateBooking(ai.action) || !hasMinBookingFields(ai.booking)) {
    return { ...ai, lead: mergedLead, booking: ai.booking || null, reply };
  }

  const booking = ai.booking as Booking;
  const endISO = booking.endISO || booking.startISO;

  // 1) Check availability
  const avail = await checkCalendarAvailability(booking.startISO, endISO, booking.service);

  if (!avail.ok) {
    console.warn("⚠️ Availability check failed:", avail);
    // Si falla disponibilidad, NO confirmamos. Guardamos “request recorded”.
    return {
      ...ai,
      lead: mergedLead,
      booking,
      reply:
        mergedLead.language === "es"
          ? "Gracias. He registrado tu solicitud, pero ahora mismo no pude verificar la disponibilidad del calendario. Te confirmaremos en breve por este chat."
          : "Thanks. I’ve recorded your request, but I couldn’t verify calendar availability right now. We’ll confirm shortly in this chat.",
      action: "none" as const,
    };
  }

  // 2) Create booking
  const created = await createCalendarBooking({ ...booking, endISO });

  if (!created.ok) {
    console.warn("❌ Booking creation failed:", created);
    return {
      ...ai,
      lead: mergedLead,
      booking,
      reply:
        mergedLead.language === "es"
          ? "Gracias. He registrado tu solicitud, pero ahora mismo no pude confirmar automáticamente en el calendario. Te confirmaremos en breve por este chat."
          : "Thanks. I’ve recorded your request, but I couldn’t auto-confirm it on the calendar right now. We’ll confirm shortly in this chat.",
      action: "none" as const,
    };
  }

  // ✅ Confirmación final
  return {
    ...ai,
    lead: mergedLead,
    booking,
    reply:
      mergedLead.language === "es"
        ? "Reserva confirmada. ¡Listo! Tu reserva quedó registrada en el calendario."
        : "Booking confirmed. Done! Your booking has been added to the calendar.",
    action: "none" as const,
  };
}
