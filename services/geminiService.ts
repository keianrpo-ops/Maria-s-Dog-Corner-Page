// services/geminiService.ts

export type ChatMessage = { role: "user" | "assistant"; content: string };

export type Lead = {
  language?: "es" | "en";
  service?: string;

  ownerName?: string;
  ownerPhone?: string;

  dogName?: string;
  dogNames?: string;

  // safety
  dogAge?: string;
  dogBreed?: string;
  vaccinationsUpToDate?: string;
  neutered?: string;
  allergies?: string;
  behaviour?: string;
  medicalNotes?: string;

  [k: string]: any;
};

export type Booking = {
  startISO: string;
  endISO?: string;
  service: string;

  dogName?: string;
  dogNames?: string;

  ownerName?: string;
  ownerPhone?: string;

  contact?: string;
  [k: string]: any;
};

function sanitizeClientMessages(messages: any[]): ChatMessage[] {
  const out: ChatMessage[] = [];

  for (const m of messages || []) {
    if (!m) continue;
    if (m.role !== "user" && m.role !== "assistant") continue;

    const c = m.content;

    if (typeof c === "string") {
      const s = c.trim();
      if (s) out.push({ role: m.role, content: s });
      continue;
    }

    if (c === null || c === undefined) continue;

    try {
      const s = String(c).trim();
      if (s) out.push({ role: m.role, content: s });
    } catch {
      continue;
    }
  }

  return out;
}

async function safeJson(r: Response) {
  try {
    return await r.json();
  } catch (err) {
    console.error("❌ Failed to parse JSON response:", err);
    return {} as any;
  }
}

function isNonEmptyString(v: any) {
  return typeof v === "string" && v.trim().length > 0;
}

function normalizeService(service?: string): string | undefined {
  if (!service) return undefined;
  const s = String(service).trim().toLowerCase();

  // English canonical
  if (s === "daycare") return "Daycare";
  if (s === "boarding") return "Boarding";
  if (s === "pet sitting" || s === "petsitting") return "Pet Sitting";
  if (s === "dog walk" || s === "dogwalk" || s === "walk") return "Dog Walk";

  // Spanish common
  if (s.includes("guarder")) return "Daycare";
  if (s.includes("hosped") || s.includes("hotel")) return "Boarding";
  if (s.includes("cuidado") || s.includes("visita")) return "Pet Sitting";
  if (s.includes("paseo") || s.includes("caminar")) return "Dog Walk";

  // Fallback: title-case-ish (but keep original)
  // If backend already uses correct canonical values, this won't run.
  return String(service).trim();
}

/**
 * Backend sometimes returns booking nested or partial.
 * We normalize fields from:
 * - data.booking
 * - data.lead
 * - (fallback) lead param passed by client
 */
function buildBookingFromResponse(data: any, leadFallback: Lead): Booking | null {
  const b = data?.booking || null;
  const lead = data?.lead || leadFallback || {};

  // service could be in booking or lead
  const serviceRaw = b?.service ?? lead?.service;
  const service = normalizeService(serviceRaw);

  // start/end must exist in booking
  const startISO = b?.startISO;
  const endISO = b?.endISO;

  // prefer booking values; fallback to lead
  const dogName = b?.dogName ?? lead?.dogName;
  const dogNames = b?.dogNames ?? lead?.dogNames;
  const ownerName = b?.ownerName ?? lead?.ownerName;
  const ownerPhone = b?.ownerPhone ?? lead?.ownerPhone ?? b?.contact;

  // Hard requirements
  if (!isNonEmptyString(service) || !isNonEmptyString(startISO)) return null;
  // endISO can be missing if backend sets default — but your create-booking requires endISO too.
  if (!isNonEmptyString(endISO)) return null;

  return {
    ...b,
    service: service!,
    startISO: String(startISO),
    endISO: String(endISO),
    dogName,
    dogNames,
    ownerName,
    ownerPhone,
  };
}

/**
 * Decide if we should call create-booking.
 * We ONLY do it if the response action is create_booking AND booking is valid.
 */
function shouldCreateBooking(data: any, booking: Booking | null) {
  if (data?.action !== "create_booking") return false;
  if (!booking) return false;

  // Extra guard (avoid 400)
  if (!isNonEmptyString(booking.service)) return false;
  if (!isNonEmptyString(booking.startISO)) return false;
  if (!isNonEmptyString(booking.endISO)) return false;

  return true;
}

export async function askAssistant(messages: ChatMessage[], lead: Lead) {
  const safe = sanitizeClientMessages(messages as any);

  let r: Response;
  try {
    console.log("🔄 Calling /api/geminiService...");
    r = await fetch("/api/geminiService", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: safe, lead }),
    });
    console.log("✅ Response status:", r.status);
  } catch (e) {
    console.error("❌ Network error calling /api/geminiService:", e);
    const err = new Error("Network error calling /api/geminiService");
    (err as any).cause = e;
    throw err;
  }

  const data = await safeJson(r);

  if (!r.ok || data?.ok === false) {
    console.error("❌ API error:", data);
    const err = new Error(data?.error || `Server error (${r.status})`);
    (err as any).traceId = data?.traceId;
    (err as any).version = data?.version;
    throw err;
  }

  if (typeof data?.reply !== "string" || !data.reply.trim()) {
    console.error("❌ Invalid AI response:", data);
    const err = new Error("Invalid AI response (missing reply).");
    (err as any).traceId = data?.traceId;
    (err as any).version = data?.version;
    throw err;
  }

  // Normalize returned data
  const normalizedLead: Lead = {
    ...lead,
    ...(data?.lead || {}),
    service: normalizeService(data?.lead?.service ?? lead?.service),
  };

  const normalizedBooking = buildBookingFromResponse(data, normalizedLead);

  // Force action to none if booking is not valid
  const normalizedAction: "none" | "create_booking" =
    shouldCreateBooking(data, normalizedBooking) ? "create_booking" : "none";

  if (data?.action === "create_booking" && normalizedAction === "none") {
    console.warn(
      "⚠️ Backend requested create_booking but booking is incomplete. Preventing create-booking call.",
      {
        traceId: data?.traceId,
        version: data?.version,
        bookingFromBackend: data?.booking,
        leadFromBackend: data?.lead,
      }
    );
  }

  return {
    ok: true as const,
    traceId: String(data?.traceId || ""),
    version: data?.version,
    reply: data.reply as string,
    action: normalizedAction,
    lead: normalizedLead,
    booking: normalizedBooking,
  };
}

export async function createCalendarBooking(booking: Booking) {
  // Hard guard: avoid 400 requests
  const service = normalizeService(booking?.service);
  const startISO = booking?.startISO;
  const endISO = booking?.endISO;

  if (!isNonEmptyString(service) || !isNonEmptyString(startISO) || !isNonEmptyString(endISO)) {
    console.error("❌ createCalendarBooking called with incomplete booking:", booking);
    return {
      ok: false,
      status: 400,
      data: {
        ok: false,
        error: "Booking incomplete (missing service/startISO/endISO). Not calling API.",
        diagnostic: { service, startISO, endISO },
      },
    };
  }

  let r: Response;

  try {
    const payload: Booking = {
      ...booking,
      service: service!,
      startISO: String(startISO),
      endISO: String(endISO),
    };

    console.log("🔄 Creating booking (normalized):", payload);

    r = await fetch("/api/calendar/create-booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ booking: payload }),
    });

    console.log("✅ Booking response status:", r.status);
  } catch (e) {
    console.error("❌ Network error calling /api/calendar/create-booking:", e);
    return {
      ok: false,
      status: 0,
      data: {
        ok: false,
        error:
          "Network error calling /api/calendar/create-booking. Verifica que el servidor esté corriendo en puerto 3000.",
      },
    };
  }

  const data = await safeJson(r);
  console.log("📦 Booking data:", data);

  return {
    ok: r.ok && data?.ok !== false,
    status: r.status,
    data,
  };
}

export async function checkCalendarAvailability(startISO: string, endISO?: string) {
  let r: Response;

  try {
    console.log("🔄 Checking availability:", { startISO, endISO });

    r = await fetch("/api/calendar/check-availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startISO, endISO }),
    });

    console.log("✅ Availability response status:", r.status);
  } catch (e) {
    console.error("❌ Network error calling /api/calendar/check-availability:", e);
    return {
      ok: false,
      status: 0,
      data: {
        ok: false,
        error:
          "Network error calling /api/calendar/check-availability. Verifica que el servidor esté corriendo en puerto 3000.",
      },
    };
  }

  const data = await safeJson(r);
  console.log("📦 Availability data:", data);

  return {
    ok: r.ok && data?.ok !== false,
    status: r.status,
    data,
  };
}
