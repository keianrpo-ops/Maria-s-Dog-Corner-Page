import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getCalendarClient } from "./_client";

type BookingPayload = {
  customerName: string;
  customerPhone?: string;
  service: "Daycare" | "Boarding" | "Dog Walk" | "Pet Sitting";
  dogName: string;
  dogAge?: string;
  notes?: string;

  startISO: string; // e.g. 2026-01-03T09:00:00
  endISO: string;   // e.g. 2026-01-03T17:00:00
  timeZone?: string; // default Europe/London
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const body = (req.body || {}) as BookingPayload;

    const required = ["customerName", "service", "dogName", "startISO", "endISO"];
    for (const k of required) {
      // @ts-ignore
      if (!body[k]) return res.status(400).json({ error: `${k} is required` });
    }

    const tz = body.timeZone || "Europe/London";

    const { calendar, calendarId } = getCalendarClient();

    const summary = `MDC Booking • ${body.service} • ${body.dogName}`;
    const descriptionLines = [
      `Customer: ${body.customerName}`,
      body.customerPhone ? `Phone: ${body.customerPhone}` : null,
      body.dogAge ? `Dog age: ${body.dogAge}` : null,
      body.notes ? `Notes: ${body.notes}` : null,
      "",
      "Created by Maria AI Assistant",
    ].filter(Boolean);

    // (Opcional) prevenir choque antes de crear
    const fb = await calendar.freebusy.query({
      requestBody: {
        timeMin: body.startISO,
        timeMax: body.endISO,
        timeZone: tz,
        items: [{ id: calendarId }],
      },
    });
    const busy = fb.data.calendars?.[calendarId]?.busy || [];
    if (busy.length > 0) {
      return res.status(409).json({
        error: "Slot not available",
        busy,
      });
    }

    const created = await calendar.events.insert({
      calendarId,
      requestBody: {
        summary,
        description: descriptionLines.join("\n"),
        start: { dateTime: body.startISO, timeZone: tz },
        end: { dateTime: body.endISO, timeZone: tz },
      },
    });

    return res.status(200).json({
      ok: true,
      eventId: created.data.id,
      htmlLink: created.data.htmlLink,
      summary: created.data.summary,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Unknown error" });
  }
}
