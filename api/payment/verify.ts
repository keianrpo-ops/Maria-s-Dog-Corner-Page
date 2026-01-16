import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-11-20.acacia",
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const { sessionId } = req.query;

    if (!sessionId || typeof sessionId !== "string") {
      return res.status(400).json({ ok: false, error: "Missing sessionId" });
    }

    console.log("🔍 Verifying payment session:", sessionId);

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    console.log("📊 Session status:", session.payment_status);
    console.log("📊 Session state:", session.status);

    const isPaid = session.payment_status === "paid";
    const isCancelled = session.status === "expired";

    return res.status(200).json({
      ok: true,
      status: isPaid ? "paid" : isCancelled ? "cancelled" : "pending",
      sessionId: session.id,
      amount: session.amount_total ? session.amount_total / 100 : 0,
      currency: session.currency || "gbp",
      customerEmail: session.customer_details?.email,
      metadata: session.metadata,
      booking: session.metadata,
    });
  } catch (error: any) {
    console.error("❌ Payment verification error:", error);
    return res.status(500).json({
      ok: false,
      error: error.message || "Failed to verify payment",
    });
  }
}