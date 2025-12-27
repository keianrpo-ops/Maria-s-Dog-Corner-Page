import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getCalendarClient } from "./_client";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const { startISO, endISO, timeZone } = req.body || {};
    if (!startISO || !endISO) {
      return res.status(400).json({ error: "startISO and endISO are required" });
    }

    const { calendar, calendarId } = getCalendarClient();

    const fb = await calendar.freebusy.query({
      requestBody: {
        timeMin: startISO,
        timeMax: endISO,
        timeZone: timeZone || "Europe/London",
        items: [{ id: calendarId }],
      },
    });

    const busy = fb.data.calendars?.[calendarId]?.busy || [];
    const available = busy.length === 0;

    return res.status(200).json({ available, busy });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Unknown error" });
  }
}
