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

  const currentPath = pathname || (typeof window !== 'undefined' ? window.location.pathname : '');

  // Suppress customer chatbot on partner, admin, ops portal, and tracking screens
  if (currentPath && (currentPath.startsWith('/partner') || currentPath.startsWith('/admin') || currentPath.startsWith('/portal') || currentPath.startsWith('/track'))) {
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

      // Add default welcome message
      setMessages([
        {
          id: 'welcome-1',
          sender: 'bot',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: 'Namaste! 🙏 Welcome to PlumberIndore doorstep support. How can we help you today with plumbing, electrical, or AC appliance repairs in Indore?'
        }
      ]);
    } catch (e) {
      console.warn('Chat local storage init:', e);
    }
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend) => {
    const text = (textToSend || inputMsg).trim();
    if (!text) return;

    const userMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: text
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMsg('');
    setIsTyping(true);

    // AI / Rule-based automated bot intelligence response
    setTimeout(() => {
      let botReply = '';
      const lower = text.toLowerCase();

      if (lower.includes('price') || lower.includes('cost') || lower.includes('rate') || lower.includes('charges')) {
        botReply = '💰 Standard inspection & diagnosis across Indore is just ₹99 (waived upon service completion). Plumbing basic fixes start at ₹149, AC servicing at ₹499, and Electrician fixes at ₹199. All services come with 30-day warranty!';
      } else if (lower.includes('ac') || lower.includes('cool') || lower.includes('gas')) {
        botReply = '❄️ For AC repair & deep chemical servicing: Our verified technicians arrive with copper pipe, R32/R410 gas, and genuine spare parts. Expected arrival: 45–60 mins across Vijay Nagar, Palasia, & Rau.';
      } else if (lower.includes('plumb') || lower.includes('leak') || lower.includes('pipe') || lower.includes('tap') || lower.includes('drain')) {
        botReply = '🔧 Water pipe leakages & drain blockages are treated as emergency calls. Our technician carries motorized drain snake cutters and CPVC solvent fittings.';
      } else if (lower.includes('electric') || lower.includes('light') || lower.includes('fan') || lower.includes('switch') || lower.includes('mcb')) {
        botReply = '⚡ Certified electricians available immediately for MCB tripping, short circuits, concealed wiring, and inverter installations with safety tools.';
      } else if (lower.includes('callback') || lower.includes('call') || lower.includes('phone') || lower.includes('number')) {
        botReply = '📞 You can directly reach our dispatch control room at +91 97525 24398, or share your contact number below and an Indore dispatcher will ring you in 3 minutes.';
      } else {
        botReply = 'Got it! Would you like our certified technician to visit your doorstep for inspection, or would you prefer a quick phone callback from our operations manager?';
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: botReply
        }
      ]);
      setIsTyping(false);
    }, 800);
  };

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    if (!customerPhone || customerPhone.length < 10) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsTyping(true);
    try {
      // Send lead to webhook / API endpoint
      await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CHATBOT_LEAD',
          name: customerName || 'Website Chat Visitor',
          phone: customerPhone,
          locality: locality,
          sessionId: sessionId,
          notes: messages.map((m) => `${m.sender.toUpperCase()}: ${m.text}`).join(' | ')
        })
      }).catch(() => null);

      setIsInfoSubmitted(true);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-lead-${Date.now()}`,
          sender: 'bot',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `🎉 Thank you ${customerName || ''}! Your priority callback request is logged. An Indore service coordinator will call you on ${customerPhone} shortly.`
        }
      ]);
    } catch (err) {
      console.warn('Lead submit:', err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <div data-chat-widget="true" className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 flex items-center gap-3 animate-fade-in">
          <div className="hidden sm:flex items-center gap-2 bg-white px-3.5 py-2 rounded-2xl shadow-xl border border-slate-200 text-xs font-bold text-slate-800 animate-bounce">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Online | Prompt Dispatch</span>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-2xl hover:shadow-amber-500/20 border-2 border-amber-400 transition-all transform hover:scale-105 cursor-pointer"
            aria-label="Open Live Chatbot Support"
          >
            <MessageCircle className="w-6 h-6 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
            </span>
          </button>
        </div>
      )}

      {/* Live Chat Window */}
      {isOpen && (
        <div data-chat-widget="true" className={`fixed z-50 transition-all duration-300 ${
          isMinimized 
            ? 'bottom-20 sm:bottom-6 right-4 sm:right-6 w-80' 
            : 'bottom-4 sm:bottom-6 right-2 sm:right-6 w-[calc(100vw-16px)] sm:w-[390px] h-[550px] max-h-[85vh]'
        } flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden`}>
          
          {/* Header */}
          <div className="bg-slate-900 text-white px-4 py-3.5 flex items-center justify-between shrink-0 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-slate-950 font-bold">
                  <Bot className="w-5 h-5" />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-900"></span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm leading-tight text-white">PlumberIndore AI</h3>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-400 text-slate-950 font-extrabold uppercase">Live</span>
                </div>
                <p className="text-[10px] text-slate-400">Doorstep Booking & Estimate Bot</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button 
                onClick={() => setIsMinimized(!isMinimized)} 
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Close Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                {/* Emergency banner inside chat */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-2.5 text-center text-xs text-amber-900 font-medium">
                  ⚡ <strong>Need immediate help?</strong> Call our dispatch hotline at{' '}
                  <a href="tel:+919752524398" className="font-extrabold underline text-amber-950">+91 97525 24398</a>
                </div>

                {messages.map((m) => {
                  const isUser = m.sender === 'user';
                  return (
                    <div
                      key={m.id}
                      className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isUser && (
                        <div className="w-7 h-7 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 mt-1 shadow-xs">
                          <Bot className="w-4 h-4" />
                        </div>
                      )}

                      <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs ${
                        isUser 
                          ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none shadow-md' 
                          : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-xs'
                      }`}>
                        <p className="leading-relaxed whitespace-pre-line">{m.text}</p>
                        <span className={`block text-[9px] mt-1 text-right ${isUser ? 'text-amber-900' : 'text-slate-400'}`}>
                          {m.time}
                        </span>
                      </div>

                      {isUser && (
                        <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 mt-1">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  );
                })}

                {isTyping && (
                  <div className="flex gap-2 items-center text-slate-400 text-xs pl-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse delay-75"></span>
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse delay-150"></span>
                    <span className="text-[10px] font-medium text-slate-500 ml-1">AI Assistant typing...</span>
                  </div>
                )}

                {/* Inline Lead Capture Form */}
                {!isInfoSubmitted && messages.length >= 3 && (
                  <form onSubmit={handleLeadSubmit} className="bg-white border-2 border-amber-300 rounded-2xl p-3 shadow-md space-y-2 mt-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Request Doorstep Dispatch / Fast Callback</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Your Name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-400"
                        required
                      />
                      <input
                        type="tel"
                        placeholder="10-digit Phone"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-400"
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={locality}
                        onChange={(e) => setLocality(e.target.value)}
                        className="flex-1 px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-400"
                      >
                        <option value="Vijay Nagar">Vijay Nagar</option>
                        <option value="Palasia">Palasia</option>
                        <option value="Bhanwarkuan">Bhanwarkuan</option>
                        <option value="Rau">Rau</option>
                        <option value="Bengali Square">Bengali Square</option>
                        <option value="Other Indore Area">Other Indore Area</option>
                      </select>
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs rounded-xl transition-all shadow-xs"
                      >
                        Submit
                      </button>
                    </div>
                  </form>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompts */}
              <div className="px-3 py-2 bg-slate-100/90 border-t border-slate-200 flex gap-1.5 overflow-x-auto scrollbar-none">
                {QUICK_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(prompt)}
                    className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white hover:bg-amber-100 border border-slate-200 hover:border-amber-300 text-[11px] font-semibold text-slate-700 transition-colors shrink-0 shadow-2xs"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Input Box */}
              <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type your repair question or issue..."
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-amber-400 focus:bg-white transition-all"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputMsg.trim()}
                  className="p-2 rounded-2xl bg-amber-400 hover:bg-amber-500 disabled:opacity-40 text-slate-950 font-bold transition-all shadow-xs shrink-0 cursor-pointer"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

        </div>
      )}
    </>
  );
}
