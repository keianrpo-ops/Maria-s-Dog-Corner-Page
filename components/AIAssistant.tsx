import React, { useEffect, useMemo, useRef, useState } from "react";
import { askAssistant, type ChatMessage, type Lead, type Booking } from "../services/aiAssistant";

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

type PaymentSession = {
  sessionId: string;
  checkoutUrl: string;
  expiresAt: string;
  booking: any;
};

function renderMessageContent(content: string) {
  return content.split('\n').map((line, index, array) => (
    <React.Fragment key={index}>
      {line}
      {index < array.length - 1 && <br />}
    </React.Fragment>
  ));
}

function isMobileDevice() {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

async function createPaymentSession(booking: Booking) {
  console.log("💳 Creating payment session...");
  console.log("📦 Booking data:", booking);
  
  if (!booking.service || !booking.totalPrice) {
    throw new Error("Missing required booking information");
  }

  try {
    const response = await fetch("/api/payment/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ booking }),
    });

    console.log("💳 Payment API response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Payment API error (${response.status})`);
    }

    const data = await response.json();
    console.log("✅ Payment session created:", data);

    return {
      sessionId: data.sessionId,
      checkoutUrl: data.checkoutUrl,
      expiresAt: data.expiresAt,
    };
  } catch (error: any) {
    console.error("❌ Payment creation error:", error);
    throw new Error(error.message || "Failed to create payment session");
  }
}

async function verifyPayment(sessionId: string) {
  console.log("🔍 Verifying payment for session:", sessionId);
  try {
    const response = await fetch(`/api/payment/verify?sessionId=${sessionId}`);
    if (!response.ok) throw new Error("Payment verification failed");
    const data = await response.json();
    return {
      status: data.status as "paid" | "pending" | "cancelled",
      booking: data.booking,
    };
  } catch (error) {
    console.error("❌ Payment verification error:", error);
    throw error;
  }
}

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState("");
  const [lead, setLead] = useState<Lead>({});
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Welcome! 🐾 Please choose a service below to connect with us. Note: Our services are based in the UK (English), but we're happy to assist you in Spanish if you prefer!\n\n¡Bienvenidos! Elija un servicio para contactarnos.",
    },
  ]);

  const [paymentSession, setPaymentSession] = useState<PaymentSession | null>(null);
  const [paymentVerifying, setPaymentVerifying] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const messagesRef = useRef<ChatMessage[]>(messages);
  const leadRef = useRef<Lead>(lead);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { leadRef.current = lead; }, [lead]);

  const services: ServiceCard[] = useMemo(() => [
    { key: "boarding", title: "Boarding", color: "bg-purple-100 text-purple-700 border-purple-200", payload: "I'd like to book Boarding." },
    { key: "daycare", title: "Daycare", color: "bg-blue-100 text-blue-700 border-blue-200", payload: "I'd like to book Daycare." },
    { key: "homesitting", title: "Home Sitting", color: "bg-green-100 text-green-700 border-green-200", payload: "I'd like to book Home Sitting." },
    { key: "dogwalking", title: "Dog Walking", color: "bg-yellow-100 text-yellow-700 border-yellow-200", payload: "I'd like to book Dog Walking." },
    { key: "grooming", title: "Grooming", color: "bg-pink-100 text-pink-700 border-pink-200", payload: "I'd like to book Grooming." },
  ], []);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [open, messages.length, busy, paymentSession]);

  // --- FUNCIÓN SEND CORREGIDA PARA MOSTRAR EL PRECIO ---
  async function send(text: string, leadOverride?: Lead) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    const leadToUse = leadOverride ?? leadRef.current;
    const nextMessages: ChatMessage[] = [...messagesRef.current, { role: "user", content: trimmed }];

    setMessages(nextMessages);
    setDraft("");
    setBusy(true);
    setPaymentError(null);

    try {
      const ai = await askAssistant(nextMessages, leadToUse);
      setLead((prev) => ({ ...prev, ...(ai.lead ?? {}) }));

      // LOGICA DE PRECIO EN EL CHAT
      let finalReply = ai.reply;
      if (ai.booking && ai.booking.totalPrice) {
        const priceLabel = leadToUse.language === "es" ? "Precio Total" : "Total Price";
        // Inyectamos el precio en el texto del chat para que el cliente lo vea
        if (!finalReply.includes(ai.booking.totalPrice)) {
          finalReply += `\n\n💰 **${priceLabel}: ${ai.booking.totalPrice}**`;
        }
      }

      setMessages((prev) => [...prev, { role: "assistant", content: finalReply }]);

      if (ai.action === "create_booking" && ai.booking) {
        console.log("💳 Initiating payment for:", ai.booking.totalPrice);
        try {
          const payment = await createPaymentSession(ai.booking);
          setPaymentSession({
            sessionId: payment.sessionId,
            checkoutUrl: payment.checkoutUrl,
            expiresAt: payment.expiresAt,
            booking: ai.booking,
          });
        } catch (error: any) {
          setPaymentError(error.message);
        }
      }
    } catch (err: any) {
      console.error("❌ Chat error:", err);
      setMessages((prev) => [...prev, { role: "assistant", content: "Connection error. Tap WhatsApp!" }]);
    } finally {
      setBusy(false);
    }
  }

  function selectService(s: ServiceCard) {
    const nextLead = { ...leadRef.current, service: s.title };
    setLead(nextLead);
    send(s.payload, nextLead);
  }

  function handleExternalLink(url: string) {
    if (isMobileDevice()) window.location.href = url;
    else window.open(url, "_blank");
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="fixed bottom-6 right-6 z-50 h-16 w-16 rounded-full shadow-2xl bg-teal-700 text-white flex items-center justify-center hover:scale-110 transition-transform text-2xl">🐾</button>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-[450px] h-full sm:h-[85vh] flex flex-col sm:rounded-3xl overflow-hidden shadow-2xl bg-white">
            
            <div className="bg-teal-800 text-white px-5 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-xl">🐶</div>
                <div>
                  <div className="text-base font-bold leading-tight">Maria's Dog Corner</div>
                  <div className="text-xs opacity-80">Bristol, UK • English & Español</div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-xl p-2 hover:bg-white/10 rounded-full transition-colors">✕</button>
            </div>

            <div className="px-4 py-3 border-b bg-gray-50 shrink-0">
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                <button onClick={() => handleExternalLink(waLink("Hi Maria! I'm interested in your services."))} className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#25D366] text-white text-sm font-bold shadow-sm">WhatsApp</button>
                <button onClick={() => handleExternalLink(waLink("Hi Maria! I'd like to order some snacks 🍖"))} className="px-4 py-2 rounded-full border bg-white text-gray-700 text-sm font-medium">🛍️ Shop Snacks</button>
              </div>
              <div className="flex gap-2 overflow-x-auto mt-3 pb-2 no-scrollbar">
                {services.map((s) => (
                  <button key={s.key} onClick={() => selectService(s)} className={`min-w-[110px] text-center rounded-lg py-2 px-1 border ${s.color} transition-all active:scale-95 shadow-sm`}>
                    <div className="font-bold text-[10px] uppercase tracking-wider">{s.title}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-[#f8f9fa]">
              {messages.map((m, idx) => (
                <div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-[14px] leading-relaxed shadow-sm ${m.role === "user" ? "bg-brand-orange text-white" : "bg-white text-gray-800 border"}`}>
                    {renderMessageContent(m.content)}
                  </div>
                </div>
              ))}

              {paymentSession && (
                <div className="flex justify-center">
                  <button onClick={() => handleExternalLink(paymentSession.checkoutUrl)} className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl active:scale-95 transition-all flex items-center gap-3">
                    <span className="text-2xl">💳</span>
                    <div className="text-left">
                      <div>{lead.language === "es" ? "Pagar" : "Pay"} {paymentSession.booking.totalPrice}</div>
                      <div className="text-xs opacity-90 font-normal">Secure payment with Stripe</div>
                    </div>
                  </button>
                </div>
              )}

              {busy && <div className="text-gray-400 text-xs animate-pulse">Maria is typing...</div>}
              <div ref={bottomRef} />
            </div>

            <form className="px-4 py-4 border-t bg-white flex items-center gap-2" onSubmit={(e) => { e.preventDefault(); send(draft); }}>
              <input ref={inputRef} value={draft} onChange={(e) => setDraft(e.target.value)} className="flex-1 h-12 rounded-xl border px-4 text-sm focus:border-teal-500 bg-gray-50" placeholder="Type here..." disabled={busy} />
              <button type="submit" disabled={busy || !draft.trim()} className="h-12 w-12 rounded-xl bg-teal-700 text-white flex items-center justify-center shadow-lg disabled:bg-gray-300 transition-all active:scale-95">➔</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}