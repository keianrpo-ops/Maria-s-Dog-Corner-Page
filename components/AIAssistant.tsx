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

  if (!booking.startISO || !booking.endISO) {
    throw new Error("Missing booking dates");
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
      console.error("❌ Payment API error:", errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText || "Payment creation failed" };
      }
      
      throw new Error(errorData.error || `Payment API error (${response.status})`);
    }

    const data = await response.json();
    console.log("✅ Payment session created:", data);

    if (!data.sessionId || !data.checkoutUrl) {
      throw new Error("Invalid payment session response");
    }

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
    
    if (!response.ok) {
      throw new Error("Payment verification failed");
    }

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
      content:
        "Welcome! 🐾 Please choose a service below to connect with us. Note: Our services are based in the UK (English), but we're happy to assist you in Spanish if you prefer!\n\n¡Bienvenidos! Elija un servicio para contactarnos. Estamos en Reino Unido, pero podemos atenderle en español si lo desea.",
    },
  ]);

  const [paymentSession, setPaymentSession] = useState<PaymentSession | null>(null);
  const [paymentVerifying, setPaymentVerifying] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

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

  const services: ServiceCard[] = useMemo(
    () => [
      { key: "daycare", title: "Daycare", color: "bg-blue-100 text-blue-700 border-blue-200", payload: "I'd like to book Daycare." },
      { key: "boarding", title: "Boarding", color: "bg-purple-100 text-purple-700 border-purple-200", payload: "I'd like to book Boarding." },
      { key: "petsitting", title: "Pet Sitting", color: "bg-green-100 text-green-700 border-green-200", payload: "I'd like to book Pet Sitting." },
      { key: "dogwalk", title: "Dog Walk", color: "bg-yellow-100 text-yellow-700 border-yellow-200", payload: "I'd like to book a Dog Walk." },
      { key: "grooming", title: "Grooming", color: "bg-pink-100 text-pink-700 border-pink-200", payload: "I'd like to book Grooming." },
    ],
    []
  );

  useEffect(() => {
    if (!open) return;

    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    });
  }, [open, messages.length, busy, paymentSession, paymentError]);

  useEffect(() => {
    if (!open) return;
    setTimeout(() => inputRef.current?.focus(), 120);
  }, [open]);

  useEffect(() => {
    if (!paymentSession || paymentVerifying) return;

    const interval = setInterval(async () => {
      console.log("🔄 Checking payment status...");
      setPaymentVerifying(true);

      try {
        const result = await verifyPayment(paymentSession.sessionId);
        
        if (result.status === "paid") {
          console.log("✅ Payment confirmed!");
          
          const successMsg = leadRef.current.language === "es"
            ? "¡Pago recibido! ✅ Tu reserva está confirmada.\n\nEn un momento, uno de nuestros agentes te enviará el formulario de autorización a tu WhatsApp para completar el proceso."
            : "Payment received! ✅ Your booking is confirmed.\n\nIn a moment, one of our agents will send you the authorization form via WhatsApp to complete the process.";

          setMessages((prev) => [...prev, { role: "assistant", content: successMsg }]);
          setPaymentSession(null);
          setPaymentError(null);
          clearInterval(interval);
        } else if (result.status === "cancelled") {
          console.log("❌ Payment cancelled");
          
          const cancelMsg = leadRef.current.language === "es"
            ? "Veo que cancelaste el pago. ¿Quieres intentar de nuevo o modificar algo?"
            : "I see you cancelled the payment. Would you like to try again or modify something?";

          setMessages((prev) => [...prev, { role: "assistant", content: cancelMsg }]);
          setPaymentSession(null);
          setPaymentError(null);
          clearInterval(interval);
        }
      } catch (error) {
        console.error("Payment check error:", error);
      } finally {
        setPaymentVerifying(false);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [paymentSession, paymentVerifying]);

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

      setLead((prev) => ({ ...prev, ...(leadOverride ?? {}), ...(ai.lead ?? {}) }));

      setMessages((prev) => [...prev, { role: "assistant", content: ai.reply }]);

      if (ai.action === "create_booking" && ai.booking) {
        console.log("💳 Initiating payment...");
        console.log("📦 Booking to pay:", ai.booking);
        
        try {
          const payment = await createPaymentSession(ai.booking);
          
          setPaymentSession({
            sessionId: payment.sessionId,
            checkoutUrl: payment.checkoutUrl,
            expiresAt: payment.expiresAt,
            booking: ai.booking,
          });

          console.log("✅ Payment session ready");
        } catch (error: any) {
          console.error("Payment creation error:", error);
          
          const errorMsg = leadRef.current.language === "es"
            ? `Hubo un problema al generar el link de pago: ${error.message || "Error desconocido"}. Por favor, intenta de nuevo o contacta por WhatsApp.`
            : `There was a problem generating the payment link: ${error.message || "Unknown error"}. Please try again or contact via WhatsApp.`;

          setMessages((prev) => [...prev, { role: "assistant", content: errorMsg }]);
          setPaymentError(error.message || "Payment creation failed");
        }
      }

      setTimeout(() => inputRef.current?.focus(), 50);
    } catch (err: any) {
      console.error("Error in chat:", err);
      const fallback = err.message || "Sorry — I had a connection hiccup. Tap WhatsApp for direct help!";
      setMessages((prev) => [...prev, { role: "assistant", content: fallback }]);
    } finally {
      setBusy(false);
    }
  }

  function selectService(s: ServiceCard) {
    const nextLead = { ...leadRef.current, service: s.title };
    setLead(nextLead);

    send(s.payload, nextLead);

    setTimeout(() => inputRef.current?.focus(), 80);
  }

  function handleExternalLink(url: string) {
    if (isMobileDevice()) {
      window.location.href = url;
    } else {
      window.open(url, "_blank");
    }
  }

  const inputPlaceholder = lead.service ? "Type your message here..." : "Choose a service above to start…";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-16 w-16 rounded-full shadow-2xl bg-teal-700 text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-transform text-2xl touch-manipulation"
      >
        🐾
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />

          <div className="relative w-full max-w-[450px] h-full sm:h-[85vh] flex flex-col sm:rounded-3xl overflow-hidden shadow-2xl bg-white min-h-0">
            <div className="bg-teal-800 text-white px-5 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-xl">🐶</div>
                <div>
                  <div className="text-base font-bold leading-tight">Maria's Dog Corner</div>
                  <div className="text-xs opacity-80">Bristol, UK • English & Español</div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-xl p-2 hover:bg-white/10 active:bg-white/20 rounded-full transition-colors touch-manipulation">
                ✕
              </button>
            </div>

            <div className="px-4 py-3 border-b bg-gray-50 shrink-0">
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                <button
                  onClick={() => handleExternalLink(waLink("Hi Maria! I'm interested in your services."))}
                  className="flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-full bg-[#25D366] text-white text-sm font-bold shadow-sm active:bg-[#20ba5a] transition-colors touch-manipulation"
                >
                  <span className="text-lg">WhatsApp</span>
                </button>
                <button
                  onClick={() => handleExternalLink(waLink("Hi Maria! I'd like to order some snacks for my dog 🍖"))}
                  className="whitespace-nowrap px-4 py-2 rounded-full border border-gray-300 bg-white text-gray-700 text-sm font-medium active:bg-gray-50 touch-manipulation"
                >
                  🛍️ Shop Snacks
                </button>
              </div>

              <div className="flex gap-2 overflow-x-auto mt-3 pb-2 no-scrollbar">
                {services.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => selectService(s)}
                    className={`min-w-[100px] text-center rounded-lg py-2 px-1 border ${s.color} transition-all active:scale-95 shadow-sm touch-manipulation`}
                  >
                    <div className="font-bold text-[11px] uppercase tracking-wider">{s.title}</div>
                  </button>
                ))}
              </div>
            </div>

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
                    {renderMessageContent(m.content)}
                  </div>
                </div>
              ))}

              {paymentError && (
                <div className="flex justify-center">
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm max-w-[85%]">
                    <div className="font-bold mb-1">⚠️ Payment Error</div>
                    <div>{paymentError}</div>
                  </div>
                </div>
              )}

              {paymentSession && (
                <div className="flex justify-center">
                  <button
                    onClick={() => handleExternalLink(paymentSession.checkoutUrl)}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl active:scale-95 transition-all flex items-center gap-3 touch-manipulation"
                  >
                    <span className="text-2xl">💳</span>
                    <div className="text-left">
                      <div>{lead.language === "es" ? "Pagar" : "Pay"} {paymentSession.booking.totalPrice}</div>
                      <div className="text-xs opacity-90 font-normal">
                        {lead.language === "es" ? "Pago seguro con Stripe" : "Secure payment with Stripe"}
                      </div>
                    </div>
                  </button>
                </div>
              )}

              {busy && (
                <div className="flex gap-2 items-center text-gray-400 text-xs animate-pulse">
                  <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  Maria is typing...
                </div>
              )}

              {paymentVerifying && (
                <div className="flex gap-2 items-center text-gray-400 text-xs animate-pulse justify-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  {lead.language === "es" ? "Verificando pago..." : "Verifying payment..."}
                </div>
              )}

              <div ref={bottomRef} />
            </div>

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
                className="h-12 w-12 rounded-xl bg-teal-700 text-white flex items-center justify-center shadow-lg disabled:bg-gray-300 transition-all hover:bg-teal-800 active:scale-95 touch-manipulation"
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