'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  const [isOpen, setIsOpen] = useState(false);
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

      const savedName = localStorage.getItem('plumberindore_customer_name') || '';
      const savedPhone = localStorage.getItem('plumberindore_customer_phone') || '';
      if (savedName) setCustomerName(savedName);
      if (savedPhone) setCustomerPhone(savedPhone);

      // Load saved messages if any, else initial greeting
      const savedMsgs = localStorage.getItem(`plumberindore_msgs_${storedSession}`);
      if (savedMsgs) {
        try {
          const parsed = JSON.parse(savedMsgs);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
            return;
          }
        } catch (e) {}
      }

      // Default welcome messages
      const initial = [
        {
          id: 'welcome-1',
          sender: 'bot',
          text: 'Namaste! 🙏 Welcome to PlumberIndore support desk.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        {
          id: 'welcome-2',
          sender: 'bot',
          text: 'Need a certified plumber or technician at your doorstep in Indore? We arrive in 45 minutes with fixed upfront rates!',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];
      setMessages(initial);
      localStorage.setItem(`plumberindore_msgs_${storedSession}`, JSON.stringify(initial));
    } catch (err) {
      console.warn('Chat init notice:', err);
    }
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized, isTyping]);

  // Sync message to backend /api/chat
  const syncMessageToBackend = async (allMsgs, latestText, extraData = {}) => {
    try {
      const activeSession = sessionId || `CHAT-${Date.now().toString().slice(-5)}`;
      const activeName = extraData.name || customerName || 'Website Visitor';
      const activePhone = extraData.phone || customerPhone || '';
      const activeLocality = extraData.locality || locality || 'Indore';

      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: activeSession,
          message: latestText,
          customerName: activeName,
          customerPhone: activePhone,
          locality: activeLocality,
          chatHistory: allMsgs
        })
      });
    } catch (err) {
      console.warn('Chat backend sync notice:', err);
    }
  };

  const handleSend = async (textToSend = null) => {
    const text = (textToSend || inputMsg).trim();
    if (!text) return;

    const userMsg = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMsgs = [...messages, userMsg];
    setMessages(updatedMsgs);
    setInputMsg('');
    setIsTyping(true);

    try {
      localStorage.setItem(`plumberindore_msgs_${sessionId}`, JSON.stringify(updatedMsgs));
    } catch (e) {}

    // Send to backend
    syncMessageToBackend(updatedMsgs, text);

    // AI automated reply simulation
    setTimeout(() => {
      let replyText = '';
      const lower = text.toLowerCase();

      if (lower.includes('price') || lower.includes('rate') || lower.includes('cost') || lower.includes('kitna')) {
        replyText = 'Our standard inspection & diagnosis starts at just ₹99. Taps & minor leaks are ₹199–₹299, and full drain unclogging starts at ₹349. Would you like us to schedule a technician visit today?';
      } else if (lower.includes('leak') || lower.includes('pipe') || lower.includes('tank') || lower.includes('flush')) {
        replyText = 'Understood! Plumbing leaks can cause wall damage if left unattended. Our emergency Indore technicians carry all standard pipes, washers, and sealants. Please share your phone number or locality so we can dispatch the nearest slot.';
      } else if (lower.includes('ac') || lower.includes('cool') || lower.includes('gas')) {
        replyText = 'We provide AC Power Jet Foam cleaning at ₹499 and 100% pure refrigerant gas charging with a 30-day cooling warranty. What is your area in Indore?';
      } else if (lower.includes('call') || lower.includes('number') || lower.includes('phone') || lower.includes('contact')) {
        replyText = 'You can reach our 24/7 Indore helpline directly at +91 91749 34135, or enter your number below and our ops manager will call you back within 5 minutes!';
      } else if (lower.includes('book') || lower.includes('appointment') || lower.includes('urgent')) {
        replyText = 'Great! We have active technician slots open across Vijay Nagar, Palasia, Bhawarkua, and all major Indore pin codes. Please confirm your mobile number below to reserve your 45-minute arrival slot.';
      } else {
        replyText = 'Thank you for reaching out! Our local Indore technician team is online. Please leave your mobile number or locality so our dispatch executive can assist you right away.';
      }

      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const finalMsgs = [...updatedMsgs, botMsg];
      setMessages(finalMsgs);
      setIsTyping(false);

      try {
        localStorage.setItem(`plumberindore_msgs_${sessionId}`, JSON.stringify(finalMsgs));
      } catch (e) {}

      syncMessageToBackend(finalMsgs, replyText);
    }, 1000);
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!customerPhone || customerPhone.replace(/\D/g, '').length < 10) {
      alert('Please enter a valid 10-digit mobile number.');
      return;
    }

    try {
      localStorage.setItem('plumberindore_customer_name', customerName);
      localStorage.setItem('plumberindore_customer_phone', customerPhone);
    } catch (e) {}

    setIsInfoSubmitted(true);

    const leadInfoText = `Contact Info Shared: ${customerName || 'Customer'} (${customerPhone}), Locality: ${locality}`;
    const userMsg = {
      id: `usr-lead-${Date.now()}`,
      sender: 'user',
      text: leadInfoText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const confirmBotMsg = {
      id: `bot-lead-${Date.now() + 1}`,
      sender: 'bot',
      text: `✅ Thank you ${customerName || ''}! Your details have been transmitted directly to our Indore Operations Desk. A certified technician coordinator will call you at ${customerPhone} shortly.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updated = [...messages, userMsg, confirmBotMsg];
    setMessages(updated);

    try {
      localStorage.setItem(`plumberindore_msgs_${sessionId}`, JSON.stringify(updated));
    } catch (e) {}

    syncMessageToBackend(updated, leadInfoText, {
      name: customerName,
      phone: customerPhone,
      locality
    });
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 flex items-center gap-3 animate-fade-in">
          <div className="hidden sm:flex items-center gap-2 bg-white px-3.5 py-2 rounded-2xl shadow-xl border border-slate-200 text-xs font-bold text-slate-800 animate-bounce">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Online | 45-Min Arrival</span>
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
        <div className={`fixed z-50 transition-all duration-300 ${
          isMinimized 
            ? 'bottom-20 sm:bottom-6 right-4 sm:right-6 w-80' 
            : 'bottom-4 sm:bottom-6 right-2 sm:right-6 w-[calc(100vw-16px)] sm:w-[390px] h-[550px] max-h-[85vh]'
        } flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden`}>
          
          {/* Header */}
          <div className="bg-slate-900 text-white px-4 py-3.5 flex items-center justify-between shrink-0 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-md">
                  <Bot className="w-5 h-5 stroke-[2.5]" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm font-heading">Indore Support Bot</h3>
                  <span className="text-[9px] font-extrabold bg-amber-400/20 text-amber-400 px-1.5 py-0.5 rounded border border-amber-400/30">
                    LIVE
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-400" />
                  <span>Replies in ~10 seconds</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-400">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                title={isMinimized ? 'Expand Chat' : 'Minimize Chat'}
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Body */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 text-xs">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col max-w-[84%] ${
                      m.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                    }`}
                  >
                    <div
                      className={`p-3 rounded-2xl leading-relaxed ${
                        m.sender === 'user'
                          ? 'bg-slate-900 text-white rounded-br-none shadow-sm font-medium'
                          : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none shadow-sm'
                      }`}
                    >
                      {m.text}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 px-1">{m.time}</span>
                  </div>
                ))}

                {isTyping && (
                  <div className="mr-auto items-start max-w-[80%]">
                    <div className="p-3 bg-white text-slate-500 border border-slate-200 rounded-2xl rounded-bl-none flex items-center gap-1.5 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce"></span>
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompt Suggestions */}
              <div className="px-3 py-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto text-[11px] shrink-0 no-scrollbar">
                {QUICK_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(prompt)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-300 border border-slate-200 rounded-full text-slate-700 whitespace-nowrap transition-colors font-medium cursor-pointer shrink-0"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Instant Callback / Contact Form inside Chat if not submitted */}
              {!isInfoSubmitted && (
                <div className="px-3 py-2 bg-amber-50/60 border-t border-amber-200/70 text-[11px] shrink-0">
                  <form onSubmit={handleContactSubmit} className="space-y-1.5">
                    <div className="flex items-center justify-between text-amber-950 font-bold">
                      <span>⚡ Need Immediate Doorstep Dispatch?</span>
                      <span className="text-[10px] font-normal text-amber-700">Optional</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <input
                        type="text"
                        placeholder="Your Name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="px-2.5 py-1.5 bg-white border border-amber-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                      <input
                        type="tel"
                        maxLength={10}
                        placeholder="10-digit Phone"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="px-2.5 py-1.5 bg-white border border-amber-200 rounded-lg text-slate-900 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-amber-500"
                        required
                      />
                    </div>
                    <div className="flex gap-1.5">
                      <select
                        value={locality}
                        onChange={(e) => setLocality(e.target.value)}
                        className="flex-1 px-2.5 py-1.5 bg-white border border-amber-200 rounded-lg text-slate-900 text-xs font-medium focus:outline-none"
                      >
                        <option value="Vijay Nagar">Vijay Nagar (452010)</option>
                        <option value="Palasia">Palasia (452001)</option>
                        <option value="Bhawarkua">Bhawarkua (452014)</option>
                        <option value="Rau">Rau (453331)</option>
                        <option value="Bicholi Mardana">Bicholi Mardana</option>
                        <option value="Other Indore Area">Other Indore Area</option>
                      </select>
                      <button
                        type="submit"
                        className="bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                      >
                        <span>Call Me</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Chat Input Form */}
              <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-3 bg-white border-t border-slate-200 flex gap-2 shrink-0">
                <input
                  type="text"
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  placeholder="Type your plumbing or repair issue..."
                  className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!inputMsg.trim()}
                  className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition-all flex items-center justify-center cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

              {/* WhatsApp Quick Link Footer */}
              <div className="px-3 py-1.5 bg-slate-900 text-white text-[10px] flex items-center justify-between shrink-0">
                <span className="text-slate-400">Prefer direct messaging?</span>
                <a
                  href={`https://wa.me/919174934135?text=${encodeURIComponent('Hello PlumberIndore team, I need doorstep service assistance in Indore.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                >
                  <span>Chat on WhatsApp</span>
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </>
          )}

        </div>
      )}
    </>
  );
}
