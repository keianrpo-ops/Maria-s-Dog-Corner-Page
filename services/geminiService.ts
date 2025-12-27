export type HistoryTurn = {
  role: "user" | "model";
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

  dates?: string;
  location?: string;
  temperament?: string;
  notes?: string;

  ownerName?: string;
  phoneOrEmail?: string;

  stage?:
    | "DISCOVERY"
    | "SERVICE_PICK"
    | "DATES"
    | "DETAILS"
    | "QUOTE_CONFIRM"
    | "CONTACT"
    | "DONE";
};

export type AssistantResult = {
  ok: boolean;
  reply: string;
  stage?: Lead["stage"];
  lead?: Lead;
};

export async function generateDogAdvice(history: HistoryTurn[], lead?: Lead): Promise<AssistantResult> {
  try {
    const res = await fetch("/api/geminiService", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history, lead }),
    });

    const data = (await res.json()) as any;

    // Backward compatibility if server returns {text: "..."}
    const reply = data.reply ?? data.text ?? "";

    return {
      ok: Boolean(data.ok),
      reply,
      stage: data.stage,
      lead: data.lead,
    };
  } catch (e) {
    return {
      ok: false,
      reply:
        "Sorry — there was a technical issue. Please try again in a moment.",
    };
  }
}
