import React, { useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, Send, X, ShieldCheck, Heart, Sparkles, Phone, ShoppingCart, Dog, Calendar } from "lucide-react";
import { generateDogAdvice, type Lead } from "../services/geminiService";
import { ChatMessage, ChatRole, PageView } from "../types";

interface AIAssistantProps {
  setView: (view: PageView) => void;
}

function buildHistory(messages: ChatMessage[]) {
  return messages.map((msg) => ({
    role: msg.role === ChatRole.USER ? ("user" as const) : ("model" as const),
    parts: [{ text: msg.text }],
  }));
}

function smartPlaceholder(lead?: Lead) {
  const stage = lead?.stage || "DISCOVERY";
  if (stage === "DISCOVERY") return "Dog’s name & age (e.g., Luna, 2 years)… / Nombre y edad…";
  if (stage === "SERVICE_PICK") return "Which service do you need? / ¿Qué servicio necesitas?";
  if (stage === "DATES") return "Dates needed (e.g., 26 Dec–3 Jan)… / Fechas…";
  if (stage === "DETAILS") return "Any notes (temperament, routine, address)… / Detalles…";
  if (stage === "CONTACT") return "Your name + phone/email to confirm… / Tu nombre + contacto…";
  return "Type here… / Escribe aquí…";
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ setView }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const [lead, setLead] = useState<Lead>({
    stage: "DISCOVERY",
  });

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: ChatRole.MODEL,
      text:
        "Hi! I’m Maria 🐾 I can help you book the right service quickly. What’s your dog’s name and age? \n\n¡Hola! Soy Maria 🐾 Te ayudo a reservar rápido. ¿Cómo se llama tu perrito y qué edad tiene?",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const quickActions = useMemo(
    () => [
      {
        label: "🍪 Shop Snacks",
        icon: <ShoppingCart size={14} />,
        onClick: () => {
          setView(PageView.SHOP);
          setIsOpen(false);
        },
      },
      {
        label: "🐶 Services & Prices",
        icon: <Dog size={14} />,
        onClick: () => {
          // Ask in chat instead of only navigating
          handleSend("Show me your services and prices / Muéstrame servicios y precios");
        },
      },
      {
        label: "📅 Book Now",
        icon: <Calendar size={14} />,
        onClick: () => {
          handleSend("I want to book a service / Quiero reservar un servicio");
        },
      },
      {
        label: "WhatsApp (Snacks)",
        icon: <Phone size={14} />,
        onClick: () => window.open("https://wa.me/447594562006", "_blank"),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setView, lead, messages]
  );

  const handleSend = async (customText?: string) => {
    const textToSend = (customText ?? input).trim();
    if (!textToSend || isTyping) return;

    const userMsg: ChatMessage = { role: ChatRole.USER, text: textToSend };
    const newMessages = [...messages, userMsg];

    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    try {
      const history = buildHistory(newMessages);
      const result = await generateDogAdvice(history, lead);

      // If API fails, do not spam repeated "technical issue" — show one helpful line.
      const reply =
        result.ok && result.reply
          ? result.reply
          : "I couldn’t connect for a moment. Please try again now. / Tuve un fallo rápido. Intenta enviar tu mensaje otra vez.";

      setMessages((prev) => [...prev, { role: ChatRole.MODEL, text: reply }]);

      if (result.lead) setLead(result.lead);
      else setLead((prev) => ({ ...prev }));

    } finally {
      setIsTyping(false);
    }
  };

  return (
    // SUPER HIGH Z-INDEX to avoid any floating heart/banner overlaying the widget
    <div className="fixed bottom-6 right-6 z-[2147483647] flex flex-col items-end pointer-events-none">
      {isOpen && (
        <div className="pointer-events-auto mb-4 w-[400px] max-w-[95vw] bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden flex flex-col h-[650px] animate-fade-in-up">
          {/* Header */}
          <div className="bg-brand-teal p-5 flex justify-between items-center text-white relative">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <Heart size={20} fill="white" />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">Maria AI Assistant</h3>
                <p className="text-[10px] text-teal-100 font-bold uppercase tracking-widest flex items-center gap-1">
                  <ShieldCheck size={10} /> Licencia APHA Activa
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-2 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Top sales buttons */}
          <div className="bg-white border-b border-gray-100 px-3 py-2">
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {quickActions.map((a, i) => (
                <button
                  key={i}
                  onClick={a.onClick}
                  className="flex items-center gap-1.5 whitespace-nowrap bg-gray-50 border border-gray-200 text-brand-dark px-3 py-2 rounded-full text-xs font-bold hover:border-brand-teal hover:text-brand-teal hover:bg-white transition-all shadow-sm active:scale-[0.98]"
                >
                  {a.icon}
                  {a.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[10px] text-gray-500 font-semibold">
              Focus: bookings for walking & sitting • Snacks: 100g packs
            </p>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50/30">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === ChatRole.USER ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
                    msg.role === ChatRole.USER
                      ? "bg-brand-teal text-white rounded-tr-none"
                      : "bg-white text-gray-800 rounded-tl-none border border-gray-100 font-medium"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-brand-teal rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-brand-teal rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-brand-teal rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={smartPlaceholder(lead)}
                className="flex-1 border border-gray-200 rounded-full px-5 py-3.5 text-sm focus:outline-none focus:border-brand-teal focus:ring-4 focus:ring-brand-teal/5 transition-all"
              />
              <button
                onClick={() => handleSend()}
                disabled={isTyping || !input.trim()}
                className="bg-brand-orange text-white p-3.5 rounded-full hover:bg-orange-600 disabled:opacity-50 transition-all shadow-lg active:scale-95"
              >
                <Send size={20} />
              </button>
            </div>
            <p className="text-[9px] text-center text-gray-400 mt-3 uppercase tracking-tighter font-bold">
              Bristol Local Pet Care • 07594 562 006
            </p>
          </div>
        </div>
      )}

      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${isOpen ? "scale-0" : "scale-100"} pointer-events-auto transition-all duration-300 bg-brand-teal hover:bg-teal-700 text-white p-5 rounded-full shadow-2xl flex items-center justify-center group relative border-4 border-white`}
      >
        <div className="absolute -top-1 -right-1 bg-brand-pink w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
          <Sparkles size={12} className="text-white animate-pulse" />
        </div>
        <MessageCircle size={32} className="group-hover:scale-110 transition-transform" />
      </button>
    </div>
  );
};
