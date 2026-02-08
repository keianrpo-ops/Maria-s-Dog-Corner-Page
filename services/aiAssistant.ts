import { calculatePrice, getDogSizeFromBreed, type DogSize } from "../lib/pricing";

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
  dogSize?: "small" | "medium" | "large" | "xlarge";
  dogAllergies?: string;
  dogBehavior?: string;
  specialNeeds?: string;
  ownerName?: string;
  ownerPhone?: string;
  contact?: string;
  notes?: string;
  totalPrice?: string;
  priceBreakdown?: string;
  duration?: number;
  startLocal?: string;
  endLocal?: string;
  fixDuplicate?: boolean;
  language?: "es" | "en";
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
    } catch { continue; }
  }
  return out;
}

async function safeJson(r: Response) {
  const text = await r.text().catch(() => "");
  if (!text) return {} as any;
  try { return JSON.parse(text); } catch {
    console.error("Failed to parse JSON, raw response:", text);
    return { _raw: text };
  }
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') throw new Error(`Request timeout after ${timeoutMs}ms.`);
    throw error;
  }
}

// FUNCION CORREGIDA
export async function askAssistant(messages: ChatMessage[], lead: Lead) {
  const safe = sanitizeClientMessages(messages as any);
  console.log("🔄 Calling /api/geminiService...");
  
  let r: Response;
  try {
    r = await fetchWithTimeout("/api/geminiService", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: safe, lead }),
    }, API_TIMEOUT_MS);
  } catch (error: any) {
    console.error("❌ Fetch error:", error);
    throw new Error("Network error. Please try again.");
  }

  const data = await safeJson(r);
  if (!r.ok || data?.ok === false) throw new Error(data?.error || "API error");

  // --- SOLUCION AL UNABLE TO CALCULATE ---
  if (data.action === "create_booking" && data.booking) {
    console.log("💰 Fetching price from check-availability...");
    const availResp = await fetch("/api/calendar/check-availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startISO: data.booking.startISO,
        endISO: data.booking.endISO,
        service: data.booking.service,
        dogBreed: data.booking.dogBreed
      })
    });
    const availData = await availResp.json();
    if (availData.ok && availData.totalPrice) {
      data.booking.totalPrice = availData.totalPrice; // Sincronizado con la web
    }
  }

  return data;
}

// MANTENEMOS TODAS TUS FUNCIONES ADICIONALES
export async function createCalendarBooking(booking: Booking) {
  console.log("🔄 Creating calendar booking...");
  const r = await fetchWithTimeout("/api/calendar/create-booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ booking }),
    }, API_TIMEOUT_MS);
  return await safeJson(r);
}

export async function checkCalendarAvailability(startISO: string, endISO: string, service?: string) {
  const r = await fetchWithTimeout("/api/calendar/check-availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startISO, endISO, service }),
    }, 15000);
  return { ok: r.ok, data: await safeJson(r) };
}

export function formatBookingDates(booking: Booking): string {
  const start = new Date(booking.startISO);
  const end = new Date(booking.endISO);
  const dateOptions: Intl.DateTimeFormatOptions = { timeZone: 'Europe/London', weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
  const timeOptions: Intl.DateTimeFormatOptions = { timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit', hour12: false };
  const dateStr = start.toLocaleDateString('en-GB', dateOptions);
  const startTime = start.toLocaleTimeString('en-GB', timeOptions);
  const endTime = end.toLocaleTimeString('en-GB', timeOptions);
  return start.toDateString() === end.toDateString() ? `${dateStr}, ${startTime} - ${endTime}` : `${dateStr} ${startTime} to ${end.toLocaleDateString('en-GB', dateOptions)} ${endTime}`;
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
  if (booking.totalPrice) lines.push(`💰 Total: ${booking.totalPrice}`); // PRECIO AGREGADO AL RESUMEN
  return lines.join('\n');
}