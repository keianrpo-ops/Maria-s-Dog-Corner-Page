import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";
import { getAuthorizedCalendarClient, resetCache } from "./_client";

type Booking = {
  startISO: string;
  endISO?: string;
  service: string;
  dogName?: string;
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
  fixDuplicate?: boolean;
  [k: string]: any;
};

const VERSION = "calendar/create-booking@v8-fixed-500-error";

function fmtUK(date: Date, opts: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-GB", { 
    timeZone: "Europe/London", 
    ...opts 
  }).format(date);
}

function ukRangeLabel(startISO: string, endISO?: string) {
  const s = new Date(startISO);
  const e = endISO ? new Date(endISO) : null;

  const sDate = fmtUK(s, { year: "numeric", month: "2-digit", day: "2-digit" });
  const sTime = fmtUK(s, { hour: "2-digit", minute: "2-digit", hour12: false });

  if (!e) return `${sDate} ${sTime}`;

  const eDate = fmtUK(e, { year: "numeric", month: "2-digit", day: "2-digit" });
  const eTime = fmtUK(e, { hour: "2-digit", minute: "2-digit", hour12: false });

  if (sDate === eDate) return `${sTime}–${eTime}`;
  return `${sDate} ${sTime} → ${eDate} ${eTime}`;
}

function ensureRange(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  if (e <= s) throw new Error("End must be after start");
}

function overlaps(s1: string, e1: string, s2: string, e2: string): boolean {
  const start1 = new Date(s1).getTime();
  const end1 = new Date(e1).getTime();
  const start2 = new Date(s2).getTime();
  const end2 = new Date(e2).getTime();
  return start1 < end2 && start2 < end1;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const traceId = crypto.randomUUID();

  console.log("\n" + "=".repeat(80));
  console.log("🆕 NEW BOOKING REQUEST - TraceID:", traceId);
  console.log("=".repeat(80));

  console.log("🔄 Resetting authentication cache...");
  resetCache();

  if (req.method !== "POST") {
    return res.status(405).json({ 
      ok: false, 
      traceId, 
      version: VERSION, 
      error: "Method not allowed" 
    });
  }

  try {
    const body: any = (req as any).body || {};
    const booking: Booking | undefined = body?.booking;

    console.log("📅 Creating booking:", JSON.stringify(booking, null, 2));

    if (!booking?.startISO || !booking?.service) {
      console.log("❌ Missing required fields");
      return res.status(400).json({ 
        ok: false, 
        traceId, 
        version: VERSION, 
        error: "Missing booking.startISO or booking.service" 
      });
    }

    const calendarId = process.env.GOOGLE_CALENDAR_ID || "";
    console.log("📆 Calendar ID:", calendarId ? `${calendarId.substring(0, 20)}...` : "MISSING!");
    
    if (!calendarId) {
      console.log("❌ GOOGLE_CALENDAR_ID not set!");
      return res.status(500).json({ 
        ok: false, 
        traceId, 
        version: VERSION, 
        error: "Missing GOOGLE_CALENDAR_ID in environment variables" 
      });
    }

    const startDate = new Date(booking.startISO);
    const endDate = booking.endISO ? new Date(booking.endISO) : null;

    if (isNaN(startDate.getTime())) {
      console.log("❌ Invalid startISO");
      return res.status(400).json({ 
        ok: false, 
        traceId, 
        version: VERSION, 
        error: "Invalid startISO format" 
      });
    }

    if (!endDate || isNaN(endDate.getTime())) {
      console.log("❌ Invalid or missing endISO");
      return res.status(400).json({ 
        ok: false, 
        traceId, 
        version: VERSION, 
        error: "Missing or invalid endISO" 
      });
    }

    if (endDate <= startDate) {
      console.log("❌ endISO must be after startISO");
      return res.status(400).json({ 
        ok: false, 
        traceId, 
        version: VERSION, 
        error: "endISO must be after startISO" 
      });
    }

    const fixed: Booking = {
      ...booking,
      startISO: startDate.toISOString(),
      endISO: endDate.toISOString(),
      service: String(booking.service || "Booking"),
      dogName: booking.dogName ? String(booking.dogName).trim() : undefined,
      dogAge: booking.dogAge ? String(booking.dogAge).trim() : undefined,
      dogBreed: booking.dogBreed ? String(booking.dogBreed).trim() : undefined,
      dogAllergies: booking.dogAllergies ? String(booking.dogAllergies).trim() : undefined,
      dogBehavior: booking.dogBehavior ? String(booking.dogBehavior).trim() : undefined,
      specialNeeds: booking.specialNeeds ? String(booking.specialNeeds).trim() : undefined,
      ownerName: booking.ownerName ? String(booking.ownerName).trim() : undefined,
      ownerPhone: booking.ownerPhone ? String(booking.ownerPhone).trim() : undefined,
      notes: booking.notes ? String(booking.notes).trim() : undefined,
      totalPrice: booking.totalPrice ? String(booking.totalPrice).trim() : undefined,
    };

    console.log("✅ Fixed booking:", JSON.stringify(fixed, null, 2));

    ensureRange(fixed.startISO, fixed.endISO);

    console.log("🔑 Getting calendar client...");
    const cal = await getAuthorizedCalendarClient();
    console.log("✅ Calendar client obtained successfully");

    const timeMin = new Date(startDate.getTime() - 1000 * 60 * 60).toISOString();
    const timeMax = new Date(endDate.getTime() + 1000 * 60 * 60).toISOString();

    console.log("🔍 Checking for duplicates in range:", timeMin, "to", timeMax);

    try {
      const list = await cal.events.list({
        calendarId,
        timeMin,
        timeMax,
        singleEvents: true,
        orderBy: "startTime",
        maxResults: 50,
      });

      console.log("✅ Successfully queried calendar for existing events");

      const existing = (list.data.items || []).filter((ev) => {
        const ext = (ev.extendedProperties?.private || {}) as any;
        if (ext.mdcBooking !== "1") return false;
        if (!ev.start?.dateTime || !ev.end?.dateTime) return false;

        const sameService = (ext.service || "").toLowerCase() === fixed.service.toLowerCase();
        const sameDog = (ext.dogName || "") === (fixed.dogName || "");
        const sameOwner = (ext.ownerName || "") === (fixed.ownerName || "");
        const hitsRange = overlaps(ev.start.dateTime, ev.end.dateTime, fixed.startISO, fixed.endISO);

        return hitsRange && (sameService || (sameDog && sameOwner));
      });

      console.log(`📋 Found ${existing.length} potential duplicates`);

      if (existing.length && fixed.fixDuplicate) {
        console.log("🗑️ Deleting duplicates (fixDuplicate=true)");
        for (const ev of existing) {
          if (!ev.id) continue;
          await cal.events.delete({ calendarId, eventId: ev.id });
          console.log(`✅ Deleted event: ${ev.id}`);
        }
      } else if (existing.length) {
        console.log("⚠️ Duplicates found but fixDuplicate=false, returning 409");
        return res.status(409).json({
          ok: false,
          traceId,
          version: VERSION,
          error: "Possible duplicate booking exists in that time range. Set fixDuplicate=true to replace it.",
          details: { 
            existingCount: existing.length,
            existingEvents: existing.map(e => ({
              id: e.id,
              summary: e.summary,
              start: e.start?.dateTime,
              end: e.end?.dateTime,
            }))
          },
        });
      }
    } catch (listError: any) {
      console.error("❌ ERROR listing calendar events:");
      console.error("   Message:", listError?.message);
      console.error("   Code:", listError?.code);
      console.error("   Status:", listError?.response?.status);
      console.error("   Response:", JSON.stringify(listError?.response?.data, null, 2));
      throw listError;
    }

    const rangeShort = ukRangeLabel(fixed.startISO, fixed.endISO);
    const startFormatted = `${fmtUK(startDate, { 
      year: "numeric", 
      month: "2-digit", 
      day: "2-digit" 
    })} ${fmtUK(startDate, { 
      hour: "2-digit", 
      minute: "2-digit", 
      hour12: false 
    })}`;
    
    const endFormatted = `${fmtUK(endDate, { 
      year: "numeric", 
      month: "2-digit", 
      day: "2-digit" 
    })} ${fmtUK(endDate, { 
      hour: "2-digit", 
      minute: "2-digit", 
      hour12: false 
    })}`;

    const summary = `${fixed.service} • ${fixed.dogName || "Dog"} (${fixed.ownerName || "Owner"}) • ${rangeShort}`;

    // Descripción SIN emojis para evitar problemas de encoding
    const lines: string[] = [];
    lines.push(`DOG INFORMATION`);
    lines.push(`Name: ${fixed.dogName || "-"}`);
    if (fixed.dogAge) lines.push(`Age: ${fixed.dogAge}`);
    if (fixed.dogBreed) lines.push(`Breed: ${fixed.dogBreed}`);
    if (fixed.dogAllergies) lines.push(`Allergies: ${fixed.dogAllergies}`);
    if (fixed.dogBehavior) lines.push(`Behavior: ${fixed.dogBehavior}`);
    if (fixed.specialNeeds) lines.push(`Special Needs: ${fixed.specialNeeds}`);
    
    lines.push(``);
    lines.push(`OWNER INFORMATION`);
    lines.push(`Name: ${fixed.ownerName || "-"}`);
    lines.push(`Phone: ${fixed.ownerPhone || "-"}`);
    
    lines.push(``);
    lines.push(`BOOKING DETAILS`);
    lines.push(`Service: ${fixed.service}`);
    lines.push(`Drop-off: ${startFormatted} (UK time)`);
    lines.push(`Pick-up: ${endFormatted} (UK time)`);
    if (fixed.totalPrice) lines.push(`Total: ${fixed.totalPrice}`);
    
    if (fixed.notes) {
      lines.push(``);
      lines.push(`NOTES`);
      lines.push(fixed.notes);
    }

    lines.push(``);
    lines.push(`---`);
    lines.push(`Booking ID: ${traceId}`);
    lines.push(`Created: ${new Date().toISOString()}`);

    const description = lines.join("\n");

    console.log("📝 Event summary:", summary);
    console.log("📄 Event description length:", description.length, "chars");

    console.log("\n" + "🔧".repeat(40));
    console.log("🔧 ATTEMPTING TO CREATE EVENT - MINIMAL CONFIG");
    console.log("🔧".repeat(40));
    
    const eventPayload = {
      summary,
      description,
      start: { 
        dateTime: fixed.startISO, 
        timeZone: "Europe/London" 
      },
      end: { 
        dateTime: fixed.endISO, 
        timeZone: "Europe/London" 
      },
      extendedProperties: {
        private: {
          mdcBooking: "1",
          service: fixed.service,
          dogName: fixed.dogName || "",
          dogAge: fixed.dogAge || "",
          dogBreed: fixed.dogBreed || "",
          ownerName: fixed.ownerName || "",
          ownerPhone: fixed.ownerPhone || "",
          bookingId: traceId,
        },
      },
      // ❌ REMOVIDO colorId - puede causar error 500
      // ❌ REMOVIDO reminders - puede causar error 500
    };

    console.log("📦 Event payload:", JSON.stringify({
      ...eventPayload,
      description: `[${description.length} chars - truncated for log]`
    }, null, 2));

    try {
      console.log("⏳ Calling cal.events.insert...");
      
      const event = await cal.events.insert({
        calendarId,
        requestBody: eventPayload,
      });

      console.log("✅✅✅ EVENT CREATED SUCCESSFULLY! ✅✅✅");
      console.log("   Event ID:", event.data.id);
      console.log("   Event Link:", event.data.htmlLink);
      console.log("=".repeat(80) + "\n");

      return res.status(200).json({
        ok: true,
        traceId,
        version: VERSION,
        eventId: event.data.id,
        eventLink: event.data.htmlLink,
        summary,
        startISO: fixed.startISO,
        endISO: fixed.endISO,
        startUK: startFormatted,
        endUK: endFormatted,
      });

    } catch (insertError: any) {
      console.error("\n" + "❌".repeat(40));
      console.error("❌ GOOGLE CALENDAR INSERT ERROR");
      console.error("❌".repeat(40));
      console.error("Error Message:", insertError?.message || "No message");
      console.error("Error Code:", insertError?.code || "No code");
      console.error("HTTP Status:", insertError?.response?.status || "No status");
      console.error("HTTP Status Text:", insertError?.response?.statusText || "No status text");
      
      if (insertError?.response?.data) {
        console.error("Google API Response Data:", JSON.stringify(insertError.response.data, null, 2));
      }
      
      if (insertError?.errors) {
        console.error("Errors Array:", JSON.stringify(insertError.errors, null, 2));
      }

      if (insertError?.stack) {
        console.error("Stack Trace:", insertError.stack);
      }
      
      console.error("❌".repeat(40) + "\n");
      
      if (insertError?.code === 401 || insertError?.response?.status === 401) {
        console.error("🔐 AUTHENTICATION ERROR - Check your service account credentials!");
      }
      
      if (insertError?.code === 403 || insertError?.response?.status === 403) {
        console.error("🚫 PERMISSION ERROR - Check calendar sharing settings!");
      }
      
      if (insertError?.code === 429 || insertError?.response?.status === 429) {
        console.error("⏱️ RATE LIMIT ERROR - Too many requests!");
      }

      throw insertError;
    }

  } catch (e: any) {
    console.error("\n" + "💥".repeat(40));
    console.error("💥 UNHANDLED ERROR IN HANDLER");
    console.error("💥".repeat(40));
    console.error("Error Message:", e?.message || "No message");
    console.error("Error Code:", e?.code || "No code");
    
    if (e?.response) {
      console.error("Response Status:", e.response?.status);
      console.error("Response Data:", JSON.stringify(e.response?.data, null, 2));
    }
    
    if (e?.stack) {
      console.error("Stack Trace:", e.stack);
    }
    
    console.error("💥".repeat(40) + "\n");
    
    return res.status(500).json({ 
      ok: false, 
      traceId, 
      version: VERSION, 
      error: e?.message || "Server error",
      errorCode: e?.code,
      httpStatus: e?.response?.status,
      details: process.env.NODE_ENV === "development" ? {
        code: e?.code,
        status: e?.response?.status,
        responseData: e?.response?.data,
      } : undefined,
      stack: process.env.NODE_ENV === "development" ? e?.stack : undefined,
    });
  }
}