'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wrench, Lock, ArrowRight, ShieldCheck, KeyRound, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [usePin, setUsePin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: usePin ? pin : undefined,
          email: !usePin ? email : undefined,
          password: !usePin ? password : pin
        })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Authentication failed');
      }

      router.push('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1B33] flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl border border-[#16233D] animate-in fade-in duration-300">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <img
            src="/logo.png"
            alt="PlumberIndore Logo"
            className="w-14 h-14 object-contain mx-auto mb-3 drop-shadow-md"
          />
          <h1 className="text-2xl font-black text-[#0F1B33] tracking-tight">
            Plumber<span className="text-[#FFB21A]">Indore</span>
          </h1>
          <div className="text-xs font-black uppercase tracking-widest text-slate-500 mt-0.5">
            Partner Engine • Owner Portal
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {usePin ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>Owner Master PIN</span>
              </label>
              <input
                type="password"
                maxLength={6}
                required
                autoFocus
                placeholder="Enter 4-digit PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl text-center text-xl font-mono tracking-widest font-black focus:ring-2 focus:ring-[#FFB21A] focus:outline-none"
              />
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#E2E8F0] rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#FFB21A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 border border-[#E2E8F0] rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#FFB21A] focus:outline-none"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FFB21A] to-[#F59E0B] text-[#0F1B33] font-black text-sm shadow-md shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-2"
          >
            <span>{loading ? 'Authenticating...' : 'Access Owner Engine'}</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <button
            type="button"
            onClick={() => setUsePin(!usePin)}
            className="hover:text-slate-800 font-semibold"
          >
            {usePin ? 'Login with Email / Password' : 'Login with Owner PIN'}
          </button>
          <span className="flex items-center gap-1 text-emerald-600 font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Encrypted Session</span>
          </span>
        </div>

      </div>
    </div>
  );
}
