import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";
import { getCalendarClient, getCalendarId } from "./_client.js";

const VERSION = "calendar/check-availability@v4";
const DEFAULT_CAPACITY = Number(process.env.MDC_MAX_DOGS_CAPACITY || 10);

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

function ensureRange(startISO: string, endISO?: string) {
  const start = new Date(startISO);
  if (Number.isNaN(start.getTime())) throw new Error("Invalid startISO");

  let end = endISO ? new Date(endISO) : new Date(start.getTime() + 24 * 60 * 60 * 1000);
  if (Number.isNaN(end.getTime())) end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  if (end <= start) end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

  return { timeMin: start.toISOString(), timeMax: end.toISOString() };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const traceId = makeTraceId();

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, traceId, version: VERSION, error: "Method not allowed" });
  }

  try {
    const body = parseBody(req);
    const { startISO, endISO } = body || {};

    if (!startISO) {
      return res.status(200).json({
        ok: true,
        traceId,
        version: VERSION,
        count: 0,
        capacity: DEFAULT_CAPACITY,
      });
    }

    const calendar = getCalendarClient();
    const calendarId = getCalendarId();
    const { timeMin, timeMax } = ensureRange(startISO, endISO);

    const response = await calendar.events.list({
      calendarId,
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: "startTime",
    });

    const items = response.data.items || [];

    // Solo contamos eventos creados por el bot (mdcBooking=1)
    const bookings = items.filter((ev) => ev?.extendedProperties?.private?.mdcBooking === "1");

    return res.status(200).json({
      ok: true,
      traceId,
      version: VERSION,
      count: bookings.length,
      capacity: DEFAULT_CAPACITY,
    });
  } catch (err: any) {
    console.error(`[${VERSION}]`, { traceId, error: err?.message || err });
    return res.status(500).json({
      ok: false,
      traceId,
      version: VERSION,
      count: 0,
      capacity: DEFAULT_CAPACITY,
      error: err?.message || "Calendar error",
    });
  }
}
