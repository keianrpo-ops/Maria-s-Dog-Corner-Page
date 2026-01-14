import React, { useEffect, useMemo, useRef, useState } from "react";
import { chatWithMaria, type ChatMessage, type Lead } from "../services/aiAssistant";

const WHATSAPP_NUMBER_E164 = "447594562006";

function waLink(text: string) {
  return `https://wa.me/${WHATSAPP_NUMBER_E164}?text=${encodeURIComponent(text)}`;
}

type ServiceCard = {
  key: string;
  title: string;
  color: string;
  payload: string;
};

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState("");
  const [lead, setLead] = useState<Lead>({});
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Welcome! 🐾 Please choose a service below to connect with us. Note: Our services are based in the UK (English), but we're happy to assist you in Spanish if you prefer!\n\n¡Bienvenidos! Elija un servicio para contactarnos. Estamos en Reino Unido, pero podemos atenderle en español si lo desea.",
    },
  ]);

  // refs para evitar estados stale (y reducir bugs cuando envías rápido)
  const messagesRef = useRef<ChatMessage[]>(messages);
  const leadRef = useRef<Lead>(lead);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    leadRef.current = lead;
  }, [lead]);

  const listRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Colores corporativos para identificar servicios (NO se tocan)
  const services: ServiceCard[] = useMemo(
    () => [
      { key: "daycare", title: "Daycare", color: "bg-blue-100 text-blue-700 border-blue-200", payload: "I’d like to book Daycare." },
      { key: "boarding", title: "Boarding", color: "bg-purple-100 text-purple-700 border-purple-200", payload: "I’d like to book Boarding." },
      { key: "petsitting", title: "Pet Sitting", color: "bg-green-100 text-green-700 border-green-200", payload: "I’d like to book Pet Sitting." },
      { key: "dogwalk", title: "Dog Walk", color: "bg-yellow-100 text-yellow-700 border-yellow-200", payload: "I’d like to book a Dog Walk." },
      { key: "grooming", title: "Grooming", color: "bg-pink-100 text-pink-700 border-pink-200", payload: "I’d like to book Grooming." },
    ],
    []
  );

  // ✅ Scroll robusto (solución real)
  useEffect(() => {
    if (!open) return;

    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    });
  }, [open, messages.length, busy]);

  // ✅ Enfocar input al abrir
  useEffect(() => {
    if (!open) return;
    setTimeout(() => inputRef.current?.focus(), 120);
  }, [open]);

  async function send(text: string, leadOverride?: Lead) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    const leadToUse = leadOverride ?? leadRef.current;

    const nextMessages: ChatMessage[] = [...messagesRef.current, { role: "user", content: trimmed }];

    setMessages(nextMessages);
    setDraft("");
    setBusy(true);

    try {
      const ai = await chatWithMaria(nextMessages, leadToUse);

      // merge seguro del lead (no pierde service)
      setLead((prev) => ({ ...prev, ...(leadOverride ?? {}), ...(ai.lead ?? {}) }));

      setMessages((prev) => [...prev, { role: "assistant", content: ai.reply }]);
      setTimeout(() => inputRef.current?.focus(), 50);
    } catch {
      const fallback = "Sorry — I had a connection hiccup. Tap WhatsApp for direct help!";
      setMessages((prev) => [...prev, { role: "assistant", content: fallback }]);
    } finally {
      setBusy(false);
    }
  }

  function selectService(s: ServiceCard) {
    // ✅ Guardamos el servicio de inmediato (para que el chat se “active”)
    const nextLead = { ...leadRef.current, service: s.title };
    setLead(nextLead);

    // enviamos payload con el lead actualizado
    send(s.payload, nextLead);

    // enfoque inmediato para que escriba después de escoger
    setTimeout(() => inputRef.current?.focus(), 80);
  }

  const inputPlaceholder = lead.service ? "Type your message here..." : "Choose a service above to start…";

  return (
    <>
      {/* Botón Flotante Principal */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-16 w-16 rounded-full shadow-2xl bg-teal-700 text-white flex items-center justify-center hover:scale-110 transition-transform text-2xl"
      >
        🐾
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />

          {/* ✅ min-h-0 es clave para que overflow-y funcione dentro de flex */}
          <div className="relative w-full max-w-[450px] h-full sm:h-[85vh] flex flex-col sm:rounded-3xl overflow-hidden shadow-2xl bg-white min-h-0">
            {/* Cabecera */}
            <div className="bg-teal-800 text-white px-5 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-xl">🐶</div>
                <div>
                  <div className="text-base font-bold leading-tight">Maria’s Dog Corner</div>
                  <div className="text-xs opacity-80">Bristol, UK • English & Español</div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-xl p-2 hover:bg-white/10 rounded-full transition-colors">
                ✕
              </button>
            </div>

            {/* Barra de acciones rápidas con WhatsApp Corporativo */}
            <div className="px-4 py-3 border-b bg-gray-50 shrink-0">
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                <button
                  onClick={() => window.open(waLink("Hi Maria! I'm interested in your services."), "_blank")}
                  className="flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-full bg-[#25D366] text-white text-sm font-bold shadow-sm hover:bg-[#20ba5a] transition-colors"
                >
                  <span className="text-lg">WhatsApp</span>
                </button>
                <button
                  onClick={() => send("I'd like to see the snacks menu.")}
                  className="whitespace-nowrap px-4 py-2 rounded-full border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50"
                >
                  🛍️ Shop Snacks
                </button>
              </div>

              {/* Botones de Servicios Mini-Color */}
              <div className="flex gap-2 overflow-x-auto mt-3 pb-2 no-scrollbar">
                {services.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => selectService(s)}
                    className={`min-w-[100px] text-center rounded-lg py-2 px-1 border ${s.color} transition-all active:scale-95 shadow-sm`}
                  >
                    <div className="font-bold text-[11px] uppercase tracking-wider">{s.title}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Área de Chat */}
            <div ref={listRef} className="flex-1 min-h-0 overflow-y-auto px-4 py-6 space-y-4 bg-[#f8f9fa]">
              {messages.map((m, idx) => (
                <div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-[14px] leading-relaxed shadow-sm ${
                      m.role === "user"
                        ? "bg-brand-orange text-white rounded-tr-none"
                        : "bg-white text-gray-800 border border-gray-100 rounded-tl-none"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}

              {busy && (
                <div className="flex gap-2 items-center text-gray-400 text-xs animate-pulse">
                  <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  Maria is typing...
                </div>
              )}

              {/* ✅ Ancla para scroll */}
              <div ref={bottomRef} />
            </div>

            {/* Formulario de Entrada */}
            <form
              className="px-4 py-4 border-t bg-white flex items-center gap-2 shrink-0"
              onSubmit={(e) => {
                e.preventDefault();
                send(draft);
              }}
            >
              <input
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="flex-1 h-12 rounded-xl border border-gray-200 px-4 text-sm focus:outline-none focus:border-teal-500 bg-gray-50"
                placeholder={inputPlaceholder}
                disabled={busy}
              />
              <button
                type="submit"
                disabled={busy || !draft.trim()}
                className="h-12 w-12 rounded-xl bg-teal-700 text-white flex items-center justify-center shadow-lg disabled:bg-gray-300 transition-all hover:bg-teal-800"
              >
                ➔
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
