import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { Readable } from "stream";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-11-20.acacia",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

async function buffer(readable: Readable) {
  const chunks: Buffer[] = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export const config = {
  api: {
    bodyParser: false,
  },
};

async function createBookingInCalendar(booking: any) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    
    console.log("📅 Creating calendar booking...");
    console.log("🔗 URL:", `${baseUrl}/api/calendar/create-booking`);
    console.log("📦 Booking data:", booking);
    
    const response = await fetch(`${baseUrl}/api/calendar/create-booking`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ booking }),
    });

    const data = await response.json();
    
    console.log("📊 Calendar response:", response.status, data);
    
    if (!response.ok || !data.ok) {
      throw new Error(data.error || "Calendar booking failed");
    }

    return data;
  } catch (error: any) {
    console.error("❌ Failed to create calendar booking:", error);
    throw error;
  }
}

function logPaymentForAccounting(booking: any, session: any) {
  const timestamp = new Date().toISOString();
  const paymentInfo = {
    timestamp,
    transactionId: session.id,
    paymentIntentId: session.payment_intent,
    amount: session.amount_total ? `£${session.amount_total / 100}` : booking.totalPrice,
    currency: session.currency || "GBP",
    customer: {
      name: booking.ownerName,
      phone: booking.ownerPhone,
      email: session.customer_details?.email || "N/A",
    },
    booking: {
      service: booking.service,
      dogName: booking.dogName,
      dates: `${booking.startLocal} to ${booking.endLocal}`,
    },
    bankAccount: {
      accountHolder: "Acevedo",
      accountNumber: "61816531",
      sortCode: "60-08-24",
    },
    status: "PAID",
    calendarStatus: "PENDING",
  };

  console.log("\n" + "=".repeat(80));
  console.log("💰 PAYMENT RECEIVED - ACCOUNTING LOG");
  console.log("=".repeat(80));
  console.log(JSON.stringify(paymentInfo, null, 2));
  console.log("=".repeat(80) + "\n");

  return paymentInfo;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const buf = await buffer(req as any);
    const sig = req.headers["stripe-signature"];

    let event: Stripe.Event;

    try {
      const rawBody = buf.toString();
      event = JSON.parse(rawBody);
      console.log("🔔 Webhook event received (dev mode):", event.type);
    } catch (err: any) {
      console.error("❌ Failed to parse webhook body:", err.message);
      return res.status(400).json({ ok: false, error: "Invalid webhook body" });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      console.log("✅ Payment successful:", session.id);
      console.log("💰 Amount:", session.amount_total, session.currency?.toUpperCase());

      const bookingData = session.metadata?.bookingData;

      if (!bookingData) {
        console.error("❌ No booking data in session metadata");
        return res.status(400).json({ ok: false, error: "No booking data" });
      }

      let booking: any;
      try {
        booking = JSON.parse(bookingData);
      } catch (e) {
        console.error("❌ Failed to parse booking data");
        return res.status(400).json({ ok: false, error: "Invalid booking data" });
      }

      booking.paymentId = session.payment_intent;
      booking.paymentStatus = "paid";
      booking.paidAt = new Date().toISOString();
      booking.stripeSessionId = session.id;

      const paymentLog = logPaymentForAccounting(booking, session);

      console.log("📅 Creating calendar event for:", booking.dogName);

      try {
        const calendarResult = await createBookingInCalendar(booking);
        
        console.log("✅ Calendar event created successfully");
        console.log("📱 ACTION REQUIRED: Send authorization form to WhatsApp:", booking.ownerPhone);

        return res.status(200).json({
          ok: true,
          message: "Booking created",
          calendarEventId: calendarResult.eventId,
          paymentLog,
          customerPhone: booking.ownerPhone,
        });
      } catch (error: any) {
        console.error("❌ Calendar booking failed:", error);
        
        return res.status(500).json({
          ok: false,
          error: "Payment received but calendar booking failed",
          sessionId: session.id,
          paymentLog,
        });
      }
    }

    if (event.type === "checkout.session.expired") {
      console.log("⏱️ Checkout session expired:", event.data.object.id);
    }

    if (event.type === "payment_intent.payment_failed") {
      console.log("❌ Payment failed:", event.data.object.id);
    }

    return res.status(200).json({ ok: true, received: true });
  } catch (error: any) {
    console.error("❌ Webhook handler error:", error);
    return res.status(500).json({ ok: false, error: error.message });
  }
}