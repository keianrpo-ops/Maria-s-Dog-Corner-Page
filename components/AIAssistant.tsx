"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { generateDogAdvice, Lead } from "@/services/geminiService";

type Message = { role: "user" | "assistant"; text: string };

function toHistory(messages: Message[]) {
  return messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.text }],
  }));
}

export default function AIAssistant() {
  const [open, setOpen] = useState(true);
  const [busy, setBusy] = useState(false);
  const [lead, setLead] = useState<Lead>({ stage: "DISCOVERY" });

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text:
        "Hi! I’m Maria 🐾 Welcome to Maria’s Dog Corner in Bristol. I can help with dog walking, pet sitting/minding, grooming and training — plus our 100g natural snacks (6 flavours). What’s your dog’s name and age?\n\n" +
        "¡Hola! Soy Maria 🐾 Bienvenida a Maria’s Dog Corner en Bristol. Te ayudo con paseos, pet sitting/pet minding, grooming y training — y nuestros snacks naturales de 100g (6 sabores). ¿Cómo se llama tu perrito y qué edad tiene?",
    },
  ]);

  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);

  const stage = lead.stage ?? "DISCOVERY";

  const quickActions = useMemo(
    () => [
      {
        label: "Services & Prices",
        message:
          "Please show me your services and prices. Include Dog Walking, Pet Sitting, and Grooming.",
        patch: { stage: "SERVICE_PICK" as const },
      },
      {
        label: "Book a service",
        message:
          "I’d like to book a service. Please guide me step by step.",
        patch: { stage: "DISCOVERY" as const },
      },
      {
        label: "Grooming",
        message:
          "I’m interested in Grooming. Can you tell me what you need from me to book?",
        patch: { serviceInterest: "Grooming" as const, stage: "SERVICE_PICK" as const },
      },
      {
        label: "Snack flavours",
        message:
          "Can you show me the 6 snack flavours (100g packs) and help me choose one?",
        patch: { serviceInterest: "Snacks" as const, stage: "SERVICE_PICK" as const },
      },
    ],
    []
  );

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open]);

  async function send(customText?: string, patch?: Partial<Lead>) {
    const text = (customText ?? input).trim();
    if (!text || busy) return;

    setInput("");
    setBusy(true);

    setMessages((prev) => [...prev, { role: "user", text }]);

    const nextLead = { ...lead, ...(patch ?? {}) };
    setLead(nextLead);

    try {
      const history = toHistory([...messages, { role: "user", text }]);
      const result = await generateDogAdvice(history, nextLead);

      setMessages((prev) => [...prev, { role: "assistant", text: result.reply }]);
      if (result.lead) setLead(result.lead);
      else if (result.stage) setLead((l) => ({ ...l, stage: result.stage }));
    } finally {
      setBusy(false);
    }
  }

  const placeholder =
    "Dog’s name & age (e.g., Luna, 2 years)… / Nombre y edad (ej., Luna, 2 años)…";

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {!open && (
        <Button
          onClick={() => setOpen(true)}
          className="rounded-full shadow-lg px-4 py-2"
        >
          Chat with Maria 🐾
        </Button>
      )}

      {open && (
        <Card className="w-[340px] sm:w-[380px] h-[520px] shadow-xl rounded-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-white">
            <div className="flex flex-col">
              <div className="font-semibold leading-tight">Maria’s Dog Corner</div>
              <div className="text-xs text-muted-foreground">
                Bristol • Bookings & Care • +44 7594 562 006
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              className="text-sm"
            >
              ✕
            </Button>
          </div>

          {/* Quick actions */}
          <div className="px-3 py-2 border-b bg-white">
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {quickActions.map((a) => (
                <Button
                  key={a.label}
                  variant="secondary"
                  className="rounded-full whitespace-nowrap"
                  onClick={() => send(a.message, a.patch)}
                  disabled={busy}
                >
                  {a.label}
                </Button>
              ))}
            </div>
            <div className="text-[11px] text-muted-foreground mt-2">
              Focus: bookings for walking/sitting/minding/grooming • Snacks: 100g packs
            </div>
          </div>

          {/* Messages */}
          <div ref={listRef} className="flex-1 overflow-y-auto p-3 bg-white">
            <div className="space-y-3">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-teal-500 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                    style={{ whiteSpace: "pre-wrap" }}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-3 border-t bg-white">
            <div className="flex gap-2 items-center">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={placeholder}
                onKeyDown={(e) => {
                  if (e.key === "Enter") send();
                }}
                disabled={busy}
                className="rounded-full"
              />
              <Button
                onClick={() => send()}
                disabled={busy}
                className="rounded-full px-4"
                aria-label="Send"
              >
                ➤
              </Button>
            </div>
            <div className="text-[10px] text-muted-foreground mt-2 text-center">
              Maria’s Dog Corner • Bristol
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
