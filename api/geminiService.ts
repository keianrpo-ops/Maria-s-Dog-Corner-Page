import type { VercelRequest, VercelResponse } from "@vercel/node";
import OpenAI from "openai";

type HistoryTurn = {
  role: "user" | "model" | "assistant";
  parts: { text: string }[];
};

export type Lead = {
  language?: "es" | "en";

  dogName?: string;
  dogAge?: string;
  breed?: string;

  serviceInterest?:
    | "Dog Walking"
    | "Pet Sitting"
    | "Pet Minding"
    | "Grooming"
    | "Pet Training"
    | "Snacks"
    | "Unknown";

  dates?: string; // free text
  location?: string; // area/postcode
  temperament?: string; // friendly, reactive, etc.
  notes?: string; // medical, routines, etc.

  ownerName?: string;
  phoneOrEmail?: string;

  // internal stage to stop repeating
  stage?:
    | "DISCOVERY"
    | "SERVICE_PICK"
    | "DATES"
    | "DETAILS"
    | "QUOTE_CONFIRM"
    | "CONTACT"
    | "DONE";
};

type AssistantPayload = {
  messages: HistoryTurn[];
  lead?: Lead;
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

const BUSINESS_CONTEXT = {
  brand: "Maria’s Dog Corner",
  location: "Bristol, UK",
  whatsapp: "+44 7594 562006",
  services: [
    {
      name: "Dog Walking",
      price: "Solo Walk (1 dog, 1 hour): £20 | Group Walk (max 3 dogs, 1 hour): £50",
      focus: "Safe, happy walks + photo updates when possible",
    },
    {
      name: "Pet Sitting",
      price: "12 hours: £35 | 24 hours: £45",
      focus: "Home-style care, routines, calm handling",
    },
    { name: "Pet Minding", price: "Quote after details", focus: "Day support / flexible care" },
    { name: "Grooming", price: "Quote after coat details", focus: "Bath/trim depending on dog" },
    { name: "Pet Training", price: "Quote after goals", focus: "Basic guidance / behavior goals" },
  ],
  snacks: [
    { name: "Salmon Delight", price: "£6.00", size: "100g" },
    { name: "Liver Luxury", price: "£5.00", size: "100g" },
    { name: "Beef Bonanza", price: "£5.00", size: "100g" },
    { name: "Chicken & Veggie", price: "£5.00", size: "100g" },
    { name: "Lamb Love", price: "£5.50", size: "100g" },
    { name: "Garden Veggies", price: "£4.50", size: "100g" },
  ],
};

function safeText(turn: HistoryTurn) {
  return (turn.parts || []).map((p) => p.text || "").join(" ").trim();
}

function detectLanguage(text: string): "es" | "en" {
  const t = (text || "").toLowerCase();
  const spanishHints = ["hola", "perro", "años", "necesito", "servicio", "guardería", "paseo", "corte", "precio", "fechas"];
  const hit = spanishHints.some((w) => t.includes(w));
  return hit ? "es" : "en";
}

function toOpenAIRole(role: HistoryTurn["role"]): "user" | "assistant" {
  if (role === "user") return "user";
  return "assistant";
}

function compact(obj: any) {
  return JSON.stringify(obj, null, 2);
}

const SYSTEM_PROMPT = `
You are "Maria", the booking assistant for ${BUSINESS_CONTEXT.brand} in ${BUSINESS_CONTEXT.location}.
Your job: convert website visitors into bookings, with warm charisma + professional tone, and close the reservation inside the chat.

LANGUAGE RULE:
- Reply in the user's language (English or Spanish). If mixed, pick the language of the last user message.

BUSINESS OFFER (must be consistent):
Services (prioritize bookings):
${BUSINESS_CONTEXT.services.map((s) => `- ${s.name}: ${s.price}. ${s.focus}`).join("\n")}

Snacks:
- Only sold in 100g presentations.
- If the user asks "which snack is best" / allergies / diet / custom advice, do NOT do long nutrition. Instead: give a short helpful suggestion and ask them to message WhatsApp (${BUSINESS_CONTEXT.whatsapp}) for a tailored recommendation.
Snacks list:
${BUSINESS_CONTEXT.snacks.map((x) => `- ${x.name} (${x.size}) ${x.price}`).join("\n")}

SALES & FLOW RULES:
- Be friendly and persuasive, but not pushy. Aim to close.
- Ask only ONE clear question per turn.
- Always keep momentum: confirm what you understood + ask the next missing detail.
- Never loop asking the same question if the user already gave the info.
- If user asks for grooming/haircut: treat as Grooming and ask coat/size + preferred day/time.
- If user asks for "daycare": map it to Pet Minding unless they specify overnight (then Pet Sitting).
- If user asks for pricing: provide the relevant price confidently, then ask the next step to book.
- When ready, produce a booking summary and request contact details to confirm.

LEAD STATE:
You will receive a JSON lead object. Update it based on the conversation.
Stages:
DISCOVERY -> SERVICE_PICK -> DATES -> DETAILS -> QUOTE_CONFIRM -> CONTACT -> DONE

OUTPUT FORMAT (MUST be valid JSON):
{
  "reply": string,
  "stage": one of the stages,
  "lead": { ...updated lead fields... }
}

Do not include extra keys. Do not include markdown.
`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") return res.status(405).json({ ok: false, reply: "Method Not Allowed" });

    const body = (req.body || {}) as AssistantPayload;
    const messages = body.messages || [];
    const incomingLead: Lead = body.lead || {};

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        ok: false,
        reply: "Missing OPENAI_API_KEY on server. Add it in Vercel Environment Variables and restart.",
        stage: incomingLead.stage || "DISCOVERY",
        lead: incomingLead,
      });
    }

    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    const lastUserText = lastUser ? safeText(lastUser) : "";
    const lang = incomingLead.language || detectLanguage(lastUserText);

    // Build OpenAI messages
    const chat = [
      { role: "system" as const, content: SYSTEM_PROMPT },
      {
        role: "system" as const,
        content: `Current lead JSON (update this):\n${compact({
          ...incomingLead,
          language: lang,
        })}`,
      },
      ...messages.map((m) => ({
        role: toOpenAIRole(m.role),
        content: safeText(m),
      })),
    ];

    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: chat,
      temperature: 0.55,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices?.[0]?.message?.content || "";
    let parsed: { reply?: string; stage?: Lead["stage"]; lead?: Lead } | null = null;

    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = null;
    }

    if (!parsed?.reply || !parsed?.lead || !parsed?.stage) {
      // Safe fallback (no blank UI)
      const fallbackReply =
        lang === "es"
          ? "Perfecto. Para ayudarte a reservar, dime: ¿qué servicio necesitas (paseo, pet sitting, grooming, training o pet minding) y para qué fecha?"
          : "Perfect — to book you in, which service do you need (walks, pet sitting, grooming, training or pet minding) and what date(s)?";
      return res.status(200).json({
        ok: true,
        reply: fallbackReply,
        stage: incomingLead.stage || "DISCOVERY",
        lead: { ...incomingLead, language: lang },
      });
    }

    // ensure language persisted
    parsed.lead.language = lang;

    return res.status(200).json({
      ok: true,
      reply: parsed.reply,
      stage: parsed.stage,
      lead: parsed.lead,
    });
  } catch (err: any) {
    console.error("api/geminiService error:", err?.message || err);
    return res.status(200).json({
      ok: false,
      reply:
        "I had a technical hiccup. Please try again in a moment. If it keeps happening, refresh the page and try once more.",
    });
  }
}
