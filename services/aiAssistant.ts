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
  
  // Si hay un booking y necesita cálculo de precio
  if (data.action === "create_booking" && data.booking) {
    const booking = data.booking;
    console.log("💰 Calculating price for booking:", booking);

    // Servicio de Boarding requiere cotización personalizada
    if (booking.service === "Boarding" || booking.service === "Vacation Care") {
      console.log("📞 Boarding requires custom quote - redirecting to WhatsApp");
      return {
        ok: true,
        traceId: data.traceId,
        version: data.version,
        reply: lead.language === "es"
          ? "El servicio de Boarding (Vacation Care) requiere una cotización personalizada según las necesidades de tu perro. Por favor, contáctanos por WhatsApp para más detalles y te daremos un precio exacto. 📱"
          : "Boarding (Vacation Care) requires a custom quote based on your dog's needs. Please contact us via WhatsApp for more details and we'll give you an exact price. 📱",
        action: "none",
        lead: data.lead || {},
        booking: null,
      };
    }

    // Calcular duración
    let duration = 1;
    if (booking.startISO && booking.endISO) {
      const start = new Date(booking.startISO);
      const end = new Date(booking.endISO);
      const diffMs = end.getTime() - start.getTime();
      
      if (booking.service === "Home Sitting") {
        // Noches
        duration = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        console.log(`🌙 Home Sitting duration: ${duration} nights`);
      } else if (booking.service === "Dog Walk") {
        // Horas
        duration = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)));
        console.log(`🚶 Dog Walk duration: ${duration} hours`);
      } else if (booking.service === "Pop-in Visits") {
        // Visitas (asumimos 1 por defecto)
        duration = 1;
        console.log(`🏠 Pop-in Visits: ${duration} visit`);
      } else if (booking.service === "Grooming") {
        // Grooming es por servicio
        duration = 1;
        console.log(`✂️ Grooming: ${duration} service`);
      }
    }

    // Determinar tamaño del perro para Grooming
    let dogSize: DogSize | undefined;
    if (booking.service === "Grooming") {
      if (booking.dogBreed) {
        dogSize = getDogSizeFromBreed(booking.dogBreed);
        console.log(`🐕 Dog size detected from breed "${booking.dogBreed}": ${dogSize}`);
      } else {
        // Si no hay raza, usar medium por defecto
        dogSize = "medium";
        console.log(`🐕 Dog size defaulted to: ${dogSize}`);
      }
    }

    // Calcular precio con la tabla fija
    const priceResult = calculatePrice(booking.service, duration, dogSize);

    if (!priceResult) {
      console.error("❌ Failed to calculate price");
      throw new Error("Unable to calculate price for this service");
    }

    if (priceResult.price === 0) {
      // Servicio custom (no debería llegar aquí porque Boarding ya fue manejado arriba)
      console.log("⚠️ Service requires custom quote");
      return {
        ok: true,
        traceId: data.traceId,
        version: data.version,
        reply: lead.language === "es"
          ? "Este servicio requiere una cotización personalizada. Por favor, contacta con nosotros por WhatsApp."
          : "This service requires a custom quote. Please contact us via WhatsApp.",
        action: "none",
        lead: data.lead || {},
        booking: null,
      };
    }

    // Actualizar booking con precio calculado
    data.booking = {
      ...booking,
      totalPrice: `£${priceResult.price}`,
      priceBreakdown: priceResult.breakdown,
      duration: duration,
      language: lead.language || "en",
    };

    if (dogSize) {
      data.booking.dogSize = dogSize;
    }

    console.log("✅ Price calculated:", data.booking.totalPrice);
    console.log("📊 Breakdown:", data.booking.priceBreakdown);
  }

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