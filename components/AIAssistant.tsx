import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Sparkles, Dog, ShoppingBag, Calendar } from 'lucide-react';
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
      text: "Hi! I'm Maria's Expert AI Assistant. With 20 years of care experience behind me, I can help you with dog tips, choosing the best natural snacks, or booking a premium stay. How can I help your pup today?" 
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

  const handleQuickAction = (view: PageView) => {
    setView(view);
    setIsOpen(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[350px] max-w-[90vw] bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col h-[550px] animate-fade-in-up">
          {/* Header */}
          <div className="bg-brand-teal p-5 flex justify-between items-center text-white">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight">Maria's Expert AI</h3>
                <p className="text-[10px] text-teal-100 font-medium">Care & Sales Advisor</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-2 rounded-full transition">
              <X size={20} />
            </button>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex gap-2 p-3 bg-teal-50/50 border-b border-gray-100 overflow-x-auto no-scrollbar">
            <button 
              onClick={() => handleQuickAction(PageView.SHOP)}
              className="flex items-center gap-1.5 bg-white text-brand-teal px-3 py-1.5 rounded-full text-[10px] font-bold shadow-sm border border-brand-teal/20 whitespace-nowrap hover:bg-brand-teal hover:text-white transition-colors"
            >
              <ShoppingBag size={12} /> Buy Natural Snacks
            </button>
            <button 
              onClick={() => handleQuickAction(PageView.SERVICES)}
              className="flex items-center gap-1.5 bg-white text-brand-orange px-3 py-1.5 rounded-full text-[10px] font-bold shadow-sm border border-brand-orange/20 whitespace-nowrap hover:bg-brand-orange hover:text-white transition-colors"
            >
              <Calendar size={12} /> Book Sitting
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === ChatRole.USER ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[85%] rounded-2xl p-3.5 text-sm leading-relaxed ${
                    msg.role === ChatRole.USER 
                      ? 'bg-brand-teal text-white rounded-tr-none shadow-md shadow-brand-teal/20' 
                      : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-400 p-3 rounded-2xl rounded-tl-none text-xs shadow-sm border border-gray-100 flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-brand-teal rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-brand-teal rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-brand-teal rounded-full animate-bounce"></span>
                  </div>
                  <span className="font-medium italic">Maria's AI is typing...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask for advice or products..."
                className="flex-1 border border-gray-200 rounded-full px-5 py-2.5 text-sm focus:outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 transition-all"
              />
              <button 
                onClick={handleSend}
                disabled={isTyping || !input.trim()}
                className="bg-brand-orange text-white p-3 rounded-full hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-brand-orange/20 active:scale-95"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${isOpen ? 'scale-0' : 'scale-100'} transition-all duration-300 bg-brand-teal hover:bg-teal-700 text-white p-5 rounded-full shadow-2xl flex items-center justify-center group relative`}
      >
        <div className="absolute -top-1 -right-1 bg-brand-orange w-4 h-4 rounded-full border-2 border-white animate-ping"></div>
        <MessageCircle size={32} className="group-hover:rotate-12 transition-transform" />
      </button>
    </div>
  );
};