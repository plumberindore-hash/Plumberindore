'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { 
  MessageCircle, X, Send, Bot, User, Phone, CheckCircle2, 
  ArrowRight, Sparkles, Clock, MapPin, ChevronDown, Minimize2
} from 'lucide-react';

const QUICK_PROMPTS = [
  '🔧 Book a Plumber',
  '💧 Water Pipe Leakage',
  '❄️ AC Repair & Gas Fill',
  '⚡ Electrician Urgent',
  '💰 Check Service Pricing',
  '📞 Request Callback'
];

export default function LiveChatbotWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Suppress customer chatbot on partner, admin, ops portal, and tracking screens
  if (pathname && (pathname.startsWith('/partner') || pathname.startsWith('/admin') || pathname.startsWith('/portal') || pathname.startsWith('/track'))) {
    return null;
  }

  const [isMinimized, setIsMinimized] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Customer Contact Info captured during chat
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [locality, setLocality] = useState('Vijay Nagar');
  const [isInfoSubmitted, setIsInfoSubmitted] = useState(false);

  const messagesEndRef = useRef(null);

  // Initialize unique session ID from localStorage or create new
  useEffect(() => {
    try {
      let storedSession = localStorage.getItem('plumberindore_chat_session');
      if (!storedSession) {
        storedSession = `CHAT-${Math.floor(10000 + Math.random() * 90000)}`;
        localStorage.setItem('plumberindore_chat_session', storedSession);
      }
      setSessionId(storedSession);

      // Initial Bot Welcome Message
      setMessages([
        {
          id: 'welcome-1',
          sender: 'bot',
          text: 'Namaste! 🙏 Welcome to PlumberIndore. How can our certified home service experts help you today?',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (e) {}
  }, []);

  // Auto-scroll chat to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (customText = null) => {
    const textToSend = customText || inputMsg;
    if (!textToSend.trim()) return;

    const userMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!customText) setInputMsg('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: textToSend.trim(),
          customerName,
          customerPhone,
          locality
        })
      });

      const data = await response.json();
      setIsTyping(false);

      if (data.success && data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: data.reply,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            action: data.action || null
          }
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-fallback-${Date.now()}`,
            sender: 'bot',
            text: 'I apologize, but our server is busy. You can call our direct emergency helpline at +91 97525 24398 for instant doorstep booking.',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err) {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: 'bot',
          text: 'Network connection interrupted. Please call us directly at +91 97525 24398.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  return (
    <>
      {/* Floating Chat Trigger Button (hidden when open) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 md:bottom-6 right-4 z-40 p-3.5 rounded-full bg-gradient-to-tr from-slate-950 to-slate-900 text-amber-400 shadow-2xl border-2 border-amber-400 hover:scale-105 active:scale-95 transition-all group flex items-center gap-2"
          aria-label="Open 24/7 AI Assistant"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <MessageCircle className="w-6 h-6 stroke-[2.2]" />
          <span className="hidden sm:inline font-bold text-xs text-white pr-1">
            Doorstep Help
          </span>
        </button>
      )}

      {/* Chat Window Modal */}
      {isOpen && (
        <div className="fixed bottom-0 sm:bottom-6 right-0 sm:right-4 z-50 w-full sm:w-[380px] h-[92vh] sm:h-[560px] max-h-[95vh] bg-white sm:rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-slate-950 p-3.5 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="font-heading font-extrabold text-sm flex items-center gap-1.5">
                  <span>PlumberIndore AI</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-[10px] text-slate-400">Available 24x7 in Indore</p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <a
                href="tel:+919752524398"
                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                title="Call Support"
              >
                <Phone className="w-4 h-4" />
              </a>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Close Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-slate-950 text-white rounded-br-none shadow-sm'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
                <span className="text-[9px] text-slate-400 mt-1 px-1">{msg.time}</span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center space-x-1.5 bg-white p-2.5 rounded-xl border border-slate-200 w-16">
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Chips */}
          <div className="p-2 bg-white border-t border-slate-100 flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 hover:bg-amber-100 hover:text-amber-900 text-slate-700 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2">
            <input
              type="text"
              placeholder="Ask about pricing, services, or areas..."
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all"
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputMsg.trim()}
              className="p-2 rounded-full bg-slate-950 text-amber-400 hover:bg-amber-500 hover:text-slate-950 disabled:opacity-40 transition-all active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
