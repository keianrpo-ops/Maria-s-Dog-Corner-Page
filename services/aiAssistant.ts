export type ChatMessage = { role: "user" | "assistant"; content: string };

export type Lead = {
  service?: string;
  ownerName?: string;
  ownerPhone?: string;
  dogName?: string;
  dogNames?: string;
  dogAge?: string;
  dogBreed?: string;
  dogAllergies?: string;
  dogBehavior?: string;
  specialNeeds?: string;
  language?: "es" | "en";
  stage?: string;
  hasService?: boolean;
  hasDates?: boolean;
  startLocal?: string;
  endLocal?: string;
  [k: string]: any;
};

export type Booking = {
  service: string;
  startISO: string;
  endISO: string;
  dogName?: string;
  dogNames?: string;
  dogAge?: string;
  dogBreed?: string;
  dogAllergies?: string;
  dogBehavior?: string;
  specialNeeds?: string;
  ownerName?: string;
  ownerPhone?: string;
  contact?: string;
  notes?: string;
  totalPrice?: string;
  startLocal?: string;
  endLocal?: string;
  fixDuplicate?: boolean;
  [k: string]: any;
};

const API_TIMEOUT_MS = 28000;

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
    console.error("Failed to parse JSON, raw response:", text);
    return { _raw: text };
  }
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutMs}ms. Please try again.`);
    }
    throw error;
  }
}

export async function askAssistant(messages: ChatMessage[], lead: Lead) {
  const safe = sanitizeClientMessages(messages as any);

  console.log("🔄 Calling /api/geminiService...");
  console.log("📤 Messages:", safe.length, "messages");
  console.log("📋 Lead:", lead);

  let r: Response;
  
  try {
    r = await fetchWithTimeout(
      "/api/geminiService",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: safe, lead }),
      },
      API_TIMEOUT_MS
    );
  } catch (error: any) {
    console.error("❌ Fetch error:", error);
    
    if (error.message && error.message.includes('timeout')) {
      throw new Error("The request took too long. Please try again with a shorter message.");
    }
    
    throw new Error("Network error. Please check your connection and try again.");
  }

  console.log("✅ Response status:", r.status);

  const data = await safeJson(r);

  if (!r.ok || data?.ok === false) {
    console.error("❌ API error:", data);
    
    let errorMessage = data?.error || `Server error (${r.status})`;
    
    if (r.status === 500) {
      errorMessage = "Server error. Please try again in a moment.";
    } else if (r.status === 503) {
      errorMessage = "Service temporarily unavailable. Please try again.";
    } else if (r.status === 429) {
      errorMessage = "Too many requests. Please wait a moment and try again.";
    }
    
    const err = new Error(errorMessage);
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

  console.log("💬 AI Reply:", data.reply);
  console.log("🎬 Action:", data.action);
  if (data.booking) {
    console.log("📅 Booking data:", data.booking);
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
  console.log("🔄 Creating calendar booking...");
  console.log("📅 Booking details:", {
    service: booking.service,
    dogName: booking.dogName,
    owner: booking.ownerName,
    phone: booking.ownerPhone,
    startISO: booking.startISO,
    endISO: booking.endISO,
    notes: booking.notes,
  });

  if (!booking.startISO || !booking.endISO) {
    throw new Error("Missing start or end date");
  }

  const startDate = new Date(booking.startISO);
  const endDate = new Date(booking.endISO);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new Error("Invalid date format");
  }

  if (endDate <= startDate) {
    throw new Error("End time must be after start time");
  }

  console.log("✅ Date validation passed");
  console.log("🕐 Start:", startDate.toLocaleString('en-GB', { timeZone: 'Europe/London' }));
  console.log("🕐 End:", endDate.toLocaleString('en-GB', { timeZone: 'Europe/London' }));

  let r: Response;
  
  try {
    r = await fetchWithTimeout(
      "/api/calendar/create-booking",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ booking }),
      },
      API_TIMEOUT_MS
    );
  } catch (error: any) {
    console.error("❌ Calendar booking fetch error:", error);
    throw new Error("Failed to connect to calendar service. Please try again.");
  }

  console.log("✅ Calendar API response status:", r.status);

  const data = await safeJson(r);
  console.log("📦 Calendar response data:", data);

  if (!r.ok || data?.ok === false) {
    console.error("❌ Calendar booking failed:", data);
    throw new Error(data?.error || `Calendar API error (${r.status})`);
  }

  return {
    ok: true,
    status: r.status,
    data,
  };
}

export async function checkCalendarAvailability(
  startISO: string, 
  endISO: string, 
  service?: string
) {
  console.log("🔄 Checking availability...");
  console.log("📅 Range:", { startISO, endISO, service });

  const start = new Date(startISO);
  const end = new Date(endISO);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error("Invalid date format for availability check");
  }

  let r: Response;
  
  try {
    r = await fetchWithTimeout(
      "/api/calendar/check-availability",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startISO, endISO, service }),
      },
      15000
    );
  } catch (error: any) {
    console.error("❌ Availability check fetch error:", error);
    return {
      ok: false,
      status: 0,
      data: { error: "Failed to check availability" },
    };
  }

  console.log("✅ Availability response status:", r.status);

  const data = await safeJson(r);
  console.log("📦 Availability data:", data);

  return {
    ok: r.ok && data?.ok !== false,
    status: r.status,
    data,
  };
}

export function formatBookingDates(booking: Booking): string {
  const start = new Date(booking.startISO);
  const end = new Date(booking.endISO);
  
  const dateOptions: Intl.DateTimeFormatOptions = {
    timeZone: 'Europe/London',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  };
  
  const timeOptions: Intl.DateTimeFormatOptions = {
    timeZone: 'Europe/London',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  };
  
  const dateStr = start.toLocaleDateString('en-GB', dateOptions);
  const startTime = start.toLocaleTimeString('en-GB', timeOptions);
  const endTime = end.toLocaleTimeString('en-GB', timeOptions);
  
  if (start.toDateString() === end.toDateString()) {
    return `${dateStr}, ${startTime} - ${endTime}`;
  }
  
  const endDateStr = end.toLocaleDateString('en-GB', dateOptions);
  return `${dateStr} ${startTime} to ${endDateStr} ${endTime}`;
}

export function generateBookingSummary(booking: Booking): string {
  const lines = [
    `🐕 Dog: ${booking.dogName || 'N/A'}`,
    `👤 Owner: ${booking.ownerName || 'N/A'}`,
    `📞 Phone: ${booking.ownerPhone || 'N/A'}`,
    `📅 ${formatBookingDates(booking)}`,
  ];
  
  if (booking.dogAge) lines.push(`🎂 Age: ${booking.dogAge}`);
  if (booking.dogBreed) lines.push(`🐾 Breed: ${booking.dogBreed}`);
  if (booking.notes) lines.push(`📝 ${booking.notes}`);
  if (booking.totalPrice) lines.push(`💰 Total: ${booking.totalPrice}`);
  
  return lines.join('\n');
}