import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";
import { getAuthorizedCalendarClient, getCalendarId } from "./_client.js";

const VERSION = "api/calendar/check-availability@v12-full";

// TABLA DE PRECIOS OFICIAL
const PRICING: Record<string, any> = {
  "DOG WALKING": 15,
  "HOME SITTING": 45,
  "BOARDING": 35,
  "DAYCARE": 35, // Sincronizado para evitar error de £120
  "POP-IN VISITS": 12,
  "GROOMING": { SMALL: 35, MEDIUM: 45, LARGE: 55, XLARGE: 70 }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const traceId = crypto.randomUUID?.() || String(Date.now());
  try {
    const { startISO, endISO, service = "", dogBreed = "" } = req.body || {};
    const start = new Date(startISO);
    const end = new Date(endISO || startISO);
    const diffHours = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60));
    
    let total = 0;
    const s = service.toUpperCase();

    // Lógica de Precios Inteligente
    if (s.includes("WALK")) total = 15 * diffHours;
    else if (s.includes("SITTING")) total = 45 * Math.max(1, Math.ceil(diffHours / 24));
    else if (s.includes("DAYCARE") || s.includes("BOARDING")) total = 35; 
    else if (s.includes("VISIT")) total = 12;
    else if (s.includes("GROOMING")) {
      const b = dogBreed.toLowerCase();
      total = (b.includes("labrador") || b.includes("grande")) ? 55 : 35;
    }

    const calendar = await getAuthorizedCalendarClient();
    const list = await calendar.events.list({
      calendarId: getCalendarId(),
      timeMin: start.toISOString(),
      timeMax: end.toISOString(),
      singleEvents: true,
    });

    return res.status(200).json({
      ok: true,
      available: (list.data.items || []).length < 10,
      totalPrice: `£${total.toFixed(2)}`, // Esto activa el botón de Stripe
      service: s
    });
  } catch (e: any) {
    return res.status(200).json({ ok: true, available: true, totalPrice: "£0.00" });
  }
}