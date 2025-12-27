// services/geminiService.ts
// Frontend helper: calls the Vercel function at /api/geminiService
// IMPORTANT: No API keys here.

export type ChatHistoryItem = {
  role: "user" | "model" | "assistant";
  parts: { text: string }[];
};

const fallback =
  "Sorry — there was a technical issue. Please share your dog’s name & age, the service (daycare/boarding/walks) and the dates you need.";

function normalizeHistory(history: any[]): ChatHistoryItem[] {
  if (!Array.isArray(history)) return [];
  return history
    .map((h) => {
      const role = (h?.role || "user") as "user" | "model" | "assistant";
      const text =
        (h?.parts?.[0]?.text ?? h?.text ?? h?.content ?? "").toString().trim();
      return { role, parts: [{ text }] };
    })
    .filter((h) => h.parts[0].text.length > 0);
}

export const generateDogAdvice = async (
  history: ChatHistoryItem[]
): Promise<string> => {
  try {
    const safeHistory = normalizeHistory(history);

    const r = await fetch("/api/geminiService", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ history: safeHistory }),
    });

    const data = await r.json().catch(() => null);

    // Always return text to keep your UI unchanged
    const text = (data?.text || "").toString().trim();
    return text || fallback;
  } catch (e) {
    console.error("generateDogAdvice error:", e);
    return fallback;
  }
};
