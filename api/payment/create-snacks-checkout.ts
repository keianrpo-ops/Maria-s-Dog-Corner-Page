import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";

const STRIPE_KEY = (process.env.STRIPE_SECRET_KEY || "").trim();

const stripe = STRIPE_KEY
  ? new Stripe(STRIPE_KEY, { apiVersion: "2024-11-20.acacia" })
  : null;

function parseBody(req: VercelRequest) {
  const b: any = (req as any).body;
  if (!b) return {};
  if (typeof b === "string") {
    try { return JSON.parse(b); } catch { return {}; }
  }
  return b;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });

  if (!stripe) {
    return res.status(500).json({ ok: false, error: "Stripe not configured. Missing STRIPE_SECRET_KEY." });
  }

  try {
    const body = parseBody(req);
    const items = body.items as Array<{ id: string; name: string; price: number; quantity: number }>;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ ok: false, error: "Missing cart items" });
    }

    // Convert cart items to Stripe line_items (price in pence)
    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((it) => {
      const unit_amount = Math.round(Number(it.price) * 100); // £ -> pence
      const quantity = Math.max(1, Number(it.quantity || 1));

      if (!it.name || !Number.isFinite(unit_amount) || unit_amount <= 0) {
        throw new Error(`Invalid item: ${JSON.stringify(it)}`);
      }

      return {
        price_data: {
          currency: "gbp",
          product_data: {
            name: String(it.name).slice(0, 200),
          },
          unit_amount,
        },
        quantity,
      };
    });

    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items,
      success_url: `${baseUrl}/?snacks_payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/?snacks_payment=cancelled`,
      // Opcional: metadata básica (no metas JSON gigante)
      metadata: {
        source: "snacks_cart",
        itemsCount: String(items.length),
      },
      expires_at: Math.floor(Date.now() / 1000) + 1800,
    });

    return res.status(200).json({
      ok: true,
      sessionId: session.id,
      checkoutUrl: session.url,
      expiresAt: new Date((session.expires_at || 0) * 1000).toISOString(),
    });
  } catch (err: any) {
    console.error("create-snacks-checkout error:", err?.message || err);
    return res.status(500).json({ ok: false, error: err?.message || "Payment error" });
  }
}
