import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, ShieldCheck, Heart, Sparkles, Phone } from 'lucide-react';
import { generateDogAdvice } from '../services/geminiService';
import { ChatMessage, ChatRole, PageView } from '../types';

interface AIAssistantProps {
  setView: (view: PageView) => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ setView }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      role: ChatRole.MODEL, 
      text: "¡Hola! Soy Maria. 🐾 ¿Buscas a alguien en Bristol que cuide a tu perro con el mismo amor que tú? Aquí los trato como familia, sin jaulas y con licencia oficial APHA. ¿Qué servicio necesitas para tu pequeño hoy?" 
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { role: ChatRole.USER, text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const responseText = await generateDogAdvice(userMsg.text);

    setMessages(prev => [...prev, { role: ChatRole.MODEL, text: responseText }]);
    setIsTyping(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-[360px] max-w-[90vw] bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden flex flex-col h-[580px] animate-fade-in-up">
          {/* Header con estilo femenino y profesional */}
          <div className="bg-brand-teal p-6 flex justify-between items-center text-white">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-2xl">
                <Heart size={24} fill="white" />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">Maria's Corner</h3>
                <p className="text-[10px] text-teal-100 font-bold uppercase tracking-widest flex items-center gap-1">
                  <ShieldCheck size={10} /> Licencia APHA U1596090
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-2 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Barra de precios rápida */}
          <div className="bg-brand-light/50 px-4 py-2 border-b border-gray-100 overflow-x-auto no-scrollbar flex gap-2">
            <span className="text-[10px] font-bold text-brand-teal bg-white px-3 py-1 rounded-full shadow-sm whitespace-nowrap">Daycare £35</span>
            <span className="text-[10px] font-bold text-brand-pink bg-white px-3 py-1 rounded-full shadow-sm whitespace-nowrap">Boarding £45</span>
            <span className="text-[10px] font-bold text-brand-orange bg-white px-3 py-1 rounded-full shadow-sm whitespace-nowrap">Walks £15</span>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === ChatRole.USER ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                    msg.role === ChatRole.USER 
                      ? 'bg-brand-teal text-white rounded-tr-none shadow-lg shadow-brand-teal/10' 
                      : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-none font-medium'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white text-brand-teal p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-brand-teal rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-brand-teal rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-brand-teal rounded-full animate-bounce"></span>
                  </div>
                  <span className="text-xs font-bold italic">Maria está respondiendo...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Pregúntame sobre el cuidado..."
                className="flex-1 border border-gray-200 rounded-full px-5 py-3 text-sm focus:outline-none focus:border-brand-teal focus:ring-4 focus:ring-brand-teal/10 transition-all font-medium"
              />
              <button 
                onClick={handleSend}
                disabled={isTyping || !input.trim()}
                className="bg-brand-orange text-white p-3.5 rounded-full hover:bg-orange-600 disabled:opacity-50 transition-all shadow-lg active:scale-90"
              >
                <Send size={20} />
              </button>
            </div>
            <div className="flex justify-center items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
              <Phone size={10} className="text-brand-teal" />
              WhatsApp directo: 07594 562 006
            </div>
          </div>
        </div>
      )}

      {/* Botón flotante principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${isOpen ? 'scale-0' : 'scale-100'} transition-all duration-500 bg-brand-teal hover:bg-teal-700 text-white p-5 rounded-full shadow-[0_15px_35px_rgba(0,194,203,0.4)] flex items-center justify-center group relative border-4 border-white`}
      >
        <div className="absolute -top-1 -right-1 bg-brand-pink w-5 h-5 rounded-full border-2 border-white flex items-center justify-center">
            <Sparkles size={10} className="text-white animate-pulse" />
        </div>
        <MessageCircle size={32} className="group-hover:scale-110 transition-transform" />
      </button>
    </div>
  );
};