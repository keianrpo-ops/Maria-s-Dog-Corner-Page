import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";
import { getCalendarClient, getCalendarId } from "./_client";

const VERSION = "calendar/ping@v1";

function makeTraceId() {
  try {
    return crypto.randomUUID();
  } catch {
    return crypto.randomBytes(16).toString("hex");
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const traceId = makeTraceId();

  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, traceId, version: VERSION, error: "Method not allowed" });
  }

  try {
    const calendar = getCalendarClient();
    const calendarId = getCalendarId();

    // 1) intenta leer metadata del calendario
    const cal = await calendar.calendars.get({ calendarId });

    // 2) lista próximos eventos 7 días
    const now = new Date();
    const in7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const list = await calendar.events.list({
      calendarId,
      timeMin: now.toISOString(),
      timeMax: in7.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 20,
    });

    return res.status(200).json({
      ok: true,
      traceId,
      version: VERSION,
      calendarId,
      calendarSummary: cal.data?.summary || null,
      tz: cal.data?.timeZone || null,
      next7DaysCount: (list.data.items || []).length,
    });
  } catch (err: any) {
    console.error(`[${VERSION}]`, { traceId, error: err?.message || err });
    return res.status(500).json({
      ok: false,
      traceId,
      version: VERSION,
      error: err?.message || "Ping failed",
    });
  }
}
