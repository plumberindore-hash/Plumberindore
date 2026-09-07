'use client';

import React, { useState } from 'react';
import { X, Send, UserCheck, Phone, CheckCheck, MessageSquare } from 'lucide-react';

export default function InAppChatDrawer({ isOpen, onClose, booking }) {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'tech', text: 'Namaste! I am your PlumberIndore technician. I have left the hub and am on my way to your location.', time: '2:15 PM' },
    { id: 2, sender: 'tech', text: 'Please keep the main door open or share any landmark near Vijay Nagar if needed.', time: '2:16 PM' }
  ]);

  const [inputMsg, setInputMsg] = useState('');

  if (!isOpen) return null;

  const handleSend = (e) => {
    e.preventDefault();
    const messageText = inputMsg.trim();
    if (!messageText) return;

    const newMsg = {
      id: Date.now(),
      sender: 'user',
      text: messageText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputMsg('');

    // Asynchronously notify backend via chat API
    try {
      fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          orderId: booking?.id || 'Direct',
          customerName: booking?.customerName || 'Customer',
          customerPhone: booking?.customerPhone || '+91 91749 34135',
          chatHistory: [...messages, newMsg]
        })
      }).catch(err => console.error('Background chat notification error:', err));
    } catch (err) {
      console.error(err);
    }

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'tech',
          text: 'Got it! Reaching your doorstep shortly. Thank you!',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl border-l border-slate-200">
        
        {/* Chat Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm font-heading">Doorstep Technician</h4>
              <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                ● Online & En Route {booking?.id ? `(Order #${booking.id})` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="tel:+919174934135"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400"
              title="Call Helpline"
            >
              <Phone className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col max-w-[80%] ${
                m.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
              }`}
            >
              <div
                className={`p-3 rounded-2xl text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-slate-900 text-white rounded-br-none shadow-sm'
                    : 'bg-white text-slate-900 border border-slate-200 rounded-bl-none shadow-sm'
                }`}
              >
                {m.text}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1 px-1">
                <span>{m.time}</span>
                {m.sender === 'user' && <CheckCheck className="w-3 h-3 text-emerald-600" />}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-2 bg-white border-t border-slate-200 flex gap-2 overflow-x-auto text-[11px]">
          <button
            type="button"
            onClick={() => setInputMsg('Please call when you arrive at the gate.')}
            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 whitespace-nowrap"
          >
            Please call at gate
          </button>
          <button
            type="button"
            onClick={() => setInputMsg('What is your estimated arrival time?')}
            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 whitespace-nowrap"
          >
            What is ETA?
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex gap-2">
          <input
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            placeholder="Type message to technician..."
            className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
          <button
            type="submit"
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs shadow-sm flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}
