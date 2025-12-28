import { google } from "googleapis";

type AvailabilityPayload = {
  startISO: string;
  endISO: string;
  timeZone?: string;
  service?: "Daycare" | "Boarding" | "Dog Walk" | "Pet Sitting";
  dogCount?: number; // default 1
};

let cached: { calendar: any; calendarId: string } | null = null;

function getCalendarClient() {
  if (cached) return cached;

  const b64 = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_BASE64;
  const calendarId = process.env.GOOGLE_CALENDAR_ID;

  if (!b64) throw new Error("Missing env: GOOGLE_SERVICE_ACCOUNT_KEY_BASE64");
  if (!calendarId) throw new Error("Missing env: GOOGLE_CALENDAR_ID");

  const json = Buffer.from(b64, "base64").toString("utf8");
  const creds = JSON.parse(json);

  const auth = new google.auth.JWT({
    email: creds.client_email,
    key: String(creds.private_key || "").replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });

  const calendar = google.calendar({ version: "v3", auth });
  cached = { calendar, calendarId };
  return cached;
}

function readBody(req: any) {
  if (!req?.body) return {};
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
}

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && bStart < aEnd;
}

function getEventRange(ev: any): { start: Date; end: Date } | null {
  const s = ev?.start?.dateTime || ev?.start?.date;
  const e = ev?.end?.dateTime || ev?.end?.date;
  if (!s || !e) return null;
  const start = new Date(s);
  const end = new Date(e);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  return { start, end };
}

function getCapacity() {
  const base = Number(process.env.MDC_MAX_DOGS_CAPACITY ?? "10");
  return Number.isFinite(base) && base > 0 ? base : 10;
}

async function countOverlappingDogs(calendar: any, calendarId: string, startISO: string, endISO: string) {
  const start = new Date(startISO);
  const end = new Date(endISO);

  // ventana amplia para capturar eventos que se cruzan
  const qMin = new Date(start);
  qMin.setDate(qMin.getDate() - 2);
  const qMax = new Date(end);
  qMax.setDate(qMax.getDate() + 2);

  const list = await calendar.events.list({
    calendarId,
    timeMin: qMin.toISOString(),
    timeMax: qMax.toISOString(),
    singleEvents: true,
    orderBy: "startTime",
    privateExtendedProperty: "mdcBooking=1",
    maxResults: 2500,
  });

  const items = list.data.items || [];
  let dogs = 0;

  for (const ev of items) {
    const r = getEventRange(ev);
    if (!r) continue;
    if (!overlaps(r.start, r.end, start, end)) continue;

    const dc = Number(ev?.extendedProperties?.private?.mdcDogCount ?? "1");
    dogs += Number.isFinite(dc) && dc > 0 ? dc : 1;
  }

  return { dogs };
}

export default async function handler(req: any, res: any) {
  try {
    if ((req.method || "").toUpperCase() !== "POST") {
      return res.status(405).json({ ok: false, error: "Method not allowed" });
    }

    const body = readBody(req) as Partial<AvailabilityPayload>;
    if (!body.startISO || !body.endISO) {
      return res.status(400).json({ ok: false, error: "startISO and endISO are required" });
    }

    const dogCount = Number(body.dogCount ?? 1);
    const requested = Number.isFinite(dogCount) && dogCount > 0 ? dogCount : 1;

    const { calendar, calendarId } = getCalendarClient();
    const capacity = getCapacity();

    const { dogs: bookedDogs } = await countOverlappingDogs(calendar, calendarId, String(body.startISO), String(body.endISO));
    const remaining = Math.max(0, capacity - bookedDogs);

    return res.status(200).json({
      ok: true,
      available: remaining >= requested,
      capacity,
      bookedDogs,
      requestedDogs: requested,
      remaining,
      calendarId,
    });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.message || "Unknown error" });
  }
}
