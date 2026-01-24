import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";

// Validate Stripe key at module load
const STRIPE_KEY = (process.env.STRIPE_SECRET_KEY || "").trim();

console.log("🔑 STRIPE_SECRET_KEY raw:", JSON.stringify(STRIPE_KEY));
console.log("🔑 length:", STRIPE_KEY.length);
console.log("Stripe mode:", STRIPE_KEY?.startsWith("sk_live_") ? "LIVE" : "TEST");
console.log("Stripe key prefix:", STRIPE_KEY?.slice(0, 12));

console.log("🔑 Checking Stripe configuration...");
console.log("🔑 STRIPE_SECRET_KEY exists:", !!STRIPE_KEY);
console.log("🔑 STRIPE_SECRET_KEY length:", STRIPE_KEY?.length || 0);
console.log("🔑 STRIPE_SECRET_KEY starts with:", STRIPE_KEY?.substring(0, 7));

if (!STRIPE_KEY) {
  console.error("❌ CRITICAL: STRIPE_SECRET_KEY is not set!");
}

if (!STRIPE_KEY.startsWith("sk_")) {
  console.error("❌ STRIPE_SECRET_KEY format is invalid!");
}


let stripe: Stripe | null = null;

try {
  if (STRIPE_KEY) {
    stripe = new Stripe(STRIPE_KEY, {
      apiVersion: "2024-11-20.acacia",
    });
    console.log("✅ Stripe initialized successfully");
  }
} catch (error: any) {
  console.error("❌ Failed to initialize Stripe:", error.message);
}

function parseBody(req: VercelRequest) {
  const b: any = (req as any).body;
  if (!b) return {};
  if (typeof b === "string") {
    try {
      return JSON.parse(b);
    } catch {
      return {};
    }
  }
  return b;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log("\n========================================");
  console.log("📥 create-checkout called");
  console.log("🕐 Timestamp:", new Date().toISOString());
  console.log("🌐 Method:", req.method);
  console.log("========================================\n");
  
  if (req.method !== "POST") {
    console.log("❌ Method not allowed:", req.method);
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  // Check if Stripe is initialized
  if (!stripe) {
    console.error("❌ Stripe is not initialized. Check STRIPE_SECRET_KEY environment variable.");
    return res.status(500).json({
      ok: false,
      error: "Payment service not configured. Please contact support."
    });
  }

  try {
    const body = parseBody(req);
    console.log("📦 Raw body type:", typeof body);
    console.log("📦 Body keys:", Object.keys(body));
    
    const { booking } = body;

    if (!booking) {
      console.log("❌ No booking in request");
      console.log("📦 Full body:", JSON.stringify(body, null, 2));
      return res.status(400).json({ ok: false, error: "Missing booking data" });
    }

    console.log("✅ Booking received:");
    console.log("  - service:", booking.service);
    console.log("  - dogName:", booking.dogName);
    console.log("  - ownerName:", booking.ownerName);
    console.log("  - ownerPhone:", booking.ownerPhone);
    console.log("  - totalPrice:", booking.totalPrice);
    console.log("  - startLocal:", booking.startLocal);
    console.log("  - endLocal:", booking.endLocal);

    // Validate required fields
    if (!booking.totalPrice) {
      console.log("❌ Missing totalPrice");
      return res.status(400).json({ ok: false, error: "Missing totalPrice" });
    }

    if (!booking.service) {
      console.log("❌ Missing service");
      return res.status(400).json({ ok: false, error: "Missing service" });
    }

    // Extract amount from price string (e.g., "£30 (1 day(s) × £30)")
    console.log("💰 Parsing price:", booking.totalPrice);
    const priceMatch = booking.totalPrice.match(/£(\d+)/);
    
    if (!priceMatch) {
      console.log("❌ Price format invalid:", booking.totalPrice);
      return res.status(400).json({ 
        ok: false, 
        error: "Invalid price format. Expected format like '£30'" 
      });
    }

    const amount = parseInt(priceMatch[1], 10);
    console.log("💰 Extracted amount:", amount, "GBP");

    if (isNaN(amount) || amount <= 0) {
      console.log("❌ Invalid amount:", amount);
      return res.status(400).json({ 
        ok: false, 
        error: `Invalid amount: ${amount}` 
      });
    }

    // Build product description
    const description = booking.startLocal && booking.endLocal
      ? `${booking.startLocal} to ${booking.endLocal}`
      : booking.notes || "Pet care service";

    const productName = booking.service + (booking.dogName ? ` for ${booking.dogName}` : "");

    console.log("🏷️  Product name:", productName);
    console.log("📝 Description:", description);
    console.log("💵 Amount in pence:", amount * 100);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    console.log("🌐 Base URL:", baseUrl);

    console.log("\n🔄 Creating Stripe checkout session...");

    const sessionData: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: productName,
              description: description,
            },
            unit_amount: amount * 100, // Convert to pence
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}?payment=cancelled`,
      metadata: {
        service: String(booking.service || ""),
        dogName: String(booking.dogName || ""),
        ownerName: String(booking.ownerName || ""),
        ownerPhone: String(booking.ownerPhone || ""),
        totalPrice: String(booking.totalPrice || ""),
        startLocal: String(booking.startLocal || ""),
        endLocal: String(booking.endLocal || ""),
      },
      expires_at: Math.floor(Date.now() / 1000) + 1800, // 30 minutes
    };

    console.log("📋 Session data prepared");

    const session = await stripe.checkout.sessions.create(sessionData);

    console.log("\n✅ SUCCESS!");
    console.log("🎫 Session ID:", session.id);
    console.log("🔗 Checkout URL:", session.url);
    console.log("⏰ Expires at:", new Date((session.expires_at || 0) * 1000).toISOString());

    return res.status(200).json({
      ok: true,
      sessionId: session.id,
      checkoutUrl: session.url,
      expiresAt: new Date((session.expires_at || 0) * 1000).toISOString(),
    });

  } catch (error: any) {
    console.error("\n❌❌❌ ERROR in create-checkout ❌❌❌");
    console.error("Error type:", error.constructor.name);
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);
    console.error("Error type:", error.type);
    
    if (error.stack) {
      console.error("Stack trace:", error.stack);
    }

    // Stripe-specific error handling
    let errorMessage = "Payment service error";
    
    if (error.type === "StripeInvalidRequestError") {
      errorMessage = "Invalid payment request: " + error.message;
    } else if (error.type === "StripeAPIError") {
      errorMessage = "Payment service is unavailable";
    } else if (error.type === "StripeAuthenticationError") {
      errorMessage = "Payment service authentication failed";
      console.error("❌ Check your STRIPE_SECRET_KEY!");
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return res.status(500).json({
      ok: false,
      error: errorMessage
    });
  }
}