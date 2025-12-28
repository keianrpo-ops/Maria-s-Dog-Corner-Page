import { google } from "googleapis";

type BookingPayload = {
  customerName: string;
  customerPhone?: string;
  service: "Daycare" | "Boarding" | "Dog Walk" | "Pet Sitting";
  dogName: string;
  dogAge?: string;
  notes?: string;

  dogCount?: number; // default 1

  startISO: string;
  endISO: string;
  timeZone?: string;
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

function serviceLabel(service: BookingPayload["service"]) {
  // Puedes dejarlo en inglés si prefieres; esto solo afecta el TEXTO visible en Calendar.
  const map: Record<BookingPayload["service"], string> = {
    Daycare: "Guardería",
    Boarding: "Hospedaje",
    "Dog Walk": "Paseo",
    "Pet Sitting": "Pet Sitting",
  };
  return map[service] ?? service;
}

function colorIdForService(service: BookingPayload["service"]) {
  // Google Calendar colorId "1".."11"
  const map: Record<BookingPayload["service"], string> = {
    "Pet Sitting": "6",
    "Dog Walk": "2",
    Daycare: "10",
    Boarding: "4",
  };
  return map[service] ?? "1";
}

function formatTime(iso: string, tz: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: tz,
  }).format(d);
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

    const body = readBody(req) as Partial<BookingPayload>;

    const required: (keyof BookingPayload)[] = ["customerName", "service", "dogName", "startISO", "endISO"];
    for (const k of required) {
      if (!body[k]) return res.status(400).json({ ok: false, error: `${String(k)} is required` });
    }

    const tz = body.timeZone || "Europe/London";
    const startISO = String(body.startISO);
    const endISO = String(body.endISO);

    const dogCount = Number(body.dogCount ?? 1);
    const safeDogCount = Number.isFinite(dogCount) && dogCount > 0 ? dogCount : 1;

    const { calendar, calendarId } = getCalendarClient();

    // CAPACIDAD (hasta 10)
    const capacity = getCapacity();
    const { dogs: bookedDogs } = await countOverlappingDogs(calendar, calendarId, startISO, endISO);

    if (bookedDogs + safeDogCount > capacity) {
      return res.status(409).json({
        ok: false,
        error: "Capacity exceeded",
        capacity,
        bookedDogs,
        requestedDogs: safeDogCount,
        remaining: Math.max(0, capacity - bookedDogs),
      });
    }

    const arr = formatTime(startISO, tz);
    const dep = formatTime(endISO, tz);

    // TÍTULO que se lee bien en Calendar (servicio + perro + dueño + horas)
    const summary =
      `${serviceLabel(body.service as BookingPayload["service"])} • ${body.dogName} • ${body.customerName}` +
      `${arr ? ` • ${arr}` : ""}${dep ? `–${dep}` : ""}` +
      `${safeDogCount > 1 ? ` • x${safeDogCount}` : ""}`;

    const descriptionLines = [
      `Owner: ${body.customerName}`,
      body.customerPhone ? `Phone: ${body.customerPhone}` : null,
      `Dog: ${body.dogName}${body.dogAge ? ` (${body.dogAge})` : ""}`,
      `Dogs count: ${safeDogCount}`,
      `Service: ${body.service}`,
      arr ? `Arrival: ${arr} (${tz})` : `Start ISO: ${startISO} (${tz})`,
      dep ? `Departure: ${dep} (${tz})` : `End ISO: ${endISO} (${tz})`,
      body.notes ? `Notes: ${body.notes}` : null,
      "",
      "Created by Maria’s Dog Corner Assistant",
    ].filter(Boolean);

    const created = await calendar.events.insert({
      calendarId,
      requestBody: {
        summary,
        description: descriptionLines.join("\n"),
        colorId: colorIdForService(body.service as BookingPayload["service"]),
        start: { dateTime: startISO, timeZone: tz },
        end: { dateTime: endISO, timeZone: tz },
        extendedProperties: {
          private: {
            mdcBooking: "1",
            mdcService: String(body.service),
            mdcOwner: String(body.customerName),
            mdcDog: String(body.dogName),
            mdcDogCount: String(safeDogCount),
          },
        },
      },
    });

    return res.status(200).json({
      ok: true,
      calendarId,
      eventId: created.data.id,
      htmlLink: created.data.htmlLink,
      summary: created.data.summary,
      capacity,
    });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.message || "Unknown error" });
  }
}
