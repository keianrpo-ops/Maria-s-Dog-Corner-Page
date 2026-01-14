import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";
import { getAuthorizedCalendarClient, getCalendarId, getCalendarTimeZone } from "./_client.js";

const VERSION = "api/calendar/create-booking@v4";

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

function isValidDate(d: any) {
  return d instanceof Date && !isNaN(d.getTime());
}

function safeStr(v: any) {
  return typeof v === "string" ? v.trim() : "";
}

function buildSummary(service: string, dogName?: string, ownerName?: string) {
  const s = safeStr(service) || "Service";
  const d = safeStr(dogName) || "Dog";
  const o = safeStr(ownerName) || "Owner";
  return `MDC • ${s} • ${d} (${o})`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const traceId = crypto.randomUUID?.() || String(Date.now());

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, traceId, version: VERSION, error: "Method not allowed" });
  }

  try {
    const body = parseBody(req);
    const booking = body.booking || body;

    const startISO = booking?.startISO;
    const endISO = booking?.endISO;
    const service = booking?.service;

    if (!startISO || !service) {
      return res.status(400).json({
        ok: false,
        traceId,
        version: VERSION,
        error: "Missing required fields: booking.startISO and booking.service",
      });
    }

    const start = new Date(startISO);
    const end = new Date(endISO || startISO);

    if (!isValidDate(start)) {
      return res.status(400).json({ ok: false, traceId, version: VERSION, error: "Invalid startISO" });
    }
    if (!isValidDate(end)) {
      return res.status(400).json({ ok: false, traceId, version: VERSION, error: "Invalid endISO" });
    }
    if (end <= start) {
      return res.status(400).json({ ok: false, traceId, version: VERSION, error: "endISO must be after startISO" });
    }

    const calendar = await getAuthorizedCalendarClient();
    const calendarId = getCalendarId();
    const timeZone = getCalendarTimeZone();

    const summary = buildSummary(service, booking?.dogName || booking?.dogNames, booking?.ownerName);
    const description = [
      `Service: ${service}`,
      `Dog: ${booking?.dogName || booking?.dogNames || ""}`,
      `Owner: ${booking?.ownerName || ""}`,
      `Phone: ${booking?.ownerPhone || ""}`,
      booking?.vaccinationsUpToDate ? `Vaccinations: ${booking.vaccinationsUpToDate}` : "",
      booking?.neutered ? `Neutered: ${booking.neutered}` : "",
      booking?.allergies ? `Allergies: ${booking.allergies}` : "",
      booking?.behaviour ? `Behaviour: ${booking.behaviour}` : "",
      booking?.medicalNotes ? `Medical notes: ${booking.medicalNotes}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const event = await calendar.events.insert({
      calendarId,
      requestBody: {
        summary,
        description,
        start: { dateTime: start.toISOString(), timeZone },
        end: { dateTime: end.toISOString(), timeZone },
        extendedProperties: {
          private: {
            source: "mdc-ai",
            service: String(service),
          },
        },
      },
    });

    return res.status(200).json({
      ok: true,
      traceId,
      version: VERSION,
      eventId: event.data.id,
      htmlLink: event.data.htmlLink,
      summary: event.data.summary,
      start: event.data.start,
      end: event.data.end,
    });
  } catch (e: any) {
    // ✅ Siempre JSON
    return res.status(500).json({
      ok: false,
      traceId,
      version: VERSION,
      error: e?.message || "Internal Server Error",
    });
  }
}
