import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";
import { getAuthorizedCalendarClient, getCalendarId, getCalendarTimeZone } from "./_client.js";

const VERSION = "api/calendar/check-availability@v4";

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

function toISO(d: Date) {
  return d.toISOString();
}

function isValidDate(d: any) {
  return d instanceof Date && !isNaN(d.getTime());
}

function getCapacity(service?: string) {
  const s = (service || "").toLowerCase();
  const fallback = Number(process.env.MDC_CAPACITY_DEFAULT || 10);

  if (s.includes("daycare")) return Number(process.env.MDC_CAPACITY_DAYCARE || fallback);
  if (s.includes("boarding")) return Number(process.env.MDC_CAPACITY_BOARDING || fallback);
  if (s.includes("pet sitting") || s.includes("petsitting")) return Number(process.env.MDC_CAPACITY_PETSITTING || fallback);
  if (s.includes("dog walk") || s.includes("dogwalk") || s.includes("walk")) return Number(process.env.MDC_CAPACITY_DOGWALK || fallback);

  return fallback;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const traceId = crypto.randomUUID?.() || String(Date.now());

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, traceId, version: VERSION, error: "Method not allowed" });
  }

  try {
    const body = parseBody(req);
    const startISO = body.startISO;
    const endISO = body.endISO;
    const service = body.service || "";

    if (!startISO) {
      return res.status(400).json({ ok: false, traceId, version: VERSION, error: "Missing startISO" });
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

    const timeMin = toISO(start);
    const timeMax = toISO(end);

    // Método principal: events.list
    const list = await calendar.events.list({
      calendarId,
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 2500,
    });

    const items = (list.data.items || []).filter((e) => e.status !== "cancelled");
    const capacity = getCapacity(service);

    // Si es un calendario SOLO de reservas, esto es suficiente:
    const overlapCount = items.length;

    const available = overlapCount < capacity;

    return res.status(200).json({
      ok: true,
      traceId,
      version: VERSION,
      mode: "events.list",
      service,
      startISO: timeMin,
      endISO: timeMax,
      timeZone,
      capacity,
      overlapCount,
      available,
    });
  } catch (e: any) {
    // ✅ Siempre JSON (evita “Unexpected token … not valid JSON”)
    return res.status(500).json({
      ok: false,
      traceId,
      version: VERSION,
      error: e?.message || "Internal Server Error",
    });
  }
}
