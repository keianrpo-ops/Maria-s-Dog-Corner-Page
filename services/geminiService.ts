export type ChatMessage = { role: "user" | "assistant"; content: string };

export type Lead = {
  service?: string;
  ownerName?: string;
  ownerPhone?: string;
  dogName?: string;
  dogNames?: string;
  language?: "es" | "en";
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
  const text = await r.text().catch(() => "");
  if (!text) return {} as any;

  try {
    return JSON.parse(text);
  } catch {
    // 🔥 clave para debug cuando Vercel dev devuelve HTML o texto
    return { _raw: text };
  }
}

export async function askAssistant(messages: ChatMessage[], lead: Lead) {
  const safe = sanitizeClientMessages(messages as any);

  console.log("🔄 Calling /api/geminiService...");

  const r = await fetch("/api/geminiService", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: safe, lead }),
  });

  console.log("✅ Response status:", r.status);

  const data = await safeJson(r);

  if (!r.ok || data?.ok === false) {
    console.error("❌ API error:", data);
    const err = new Error(data?.error || `Server error (${r.status})`);
    (err as any).traceId = data?.traceId;
    (err as any).version = data?.version;
    (err as any)._raw = data?._raw;
    throw err;
  }

  if (typeof data?.reply !== "string" || !data.reply.trim()) {
    console.error("❌ Invalid AI response:", data);
    const err = new Error("Invalid AI response (missing reply).");
    (err as any).traceId = data?.traceId;
    (err as any).version = data?.version;
    throw err;
  }

  return data as {
    ok: true;
    traceId: string;
    version?: string;
    reply: string;
    action: "none" | "create_booking";
    lead: Lead;
    booking: Booking | null;
  };
}

export async function createCalendarBooking(booking: Booking) {
  console.log("🔄 Creating booking:", booking);

  const r = await fetch("/api/calendar/create-booking", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ booking }),
  });

  console.log("✅ Booking response status:", r.status);

  const data = await safeJson(r);
  console.log("📦 Booking data:", data);

  return {
    ok: r.ok && data?.ok !== false,
    status: r.status,
    data,
  };
}

export async function checkCalendarAvailability(startISO: string, endISO: string, service?: string) {
  console.log("🔄 Checking availability:", { startISO, endISO, service });

  const r = await fetch("/api/calendar/check-availability", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ startISO, endISO, service }),
  });

  console.log("✅ Availability response status:", r.status);

  const data = await safeJson(r);
  console.log("📦 Availability data:", data);

  return {
    ok: r.ok && data?.ok !== false,
    status: r.status,
    data,
  };
}
