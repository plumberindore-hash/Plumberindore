'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Wallet, 
  PlusCircle, 
  AlertTriangle, 
  Search, 
  History, 
  ArrowDownRight, 
  ArrowUpRight, 
  RefreshCw, 
  CheckCircle2, 
  X,
  CreditCard,
  Building2,
  DollarSign
} from 'lucide-react';
import { formatPaise } from '../../../lib/partner-engine/money.js';

import { createClient } from '../../../lib/supabase/client.js';

export default function WalletsLedgerPage() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState('workers'); // 'workers' | 'ledger'
  const [workers, setWorkers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Recharge Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [amountRupees, setAmountRupees] = useState('500');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const fetchWalletsData = useCallback(async () => {
    setLoading(true);
    try {
      const [fleetRes, ledgerRes] = await Promise.all([
        fetch('/api/admin/wallets').then(r => r.json()).catch(() => ({})),
        fetch('/api/admin/wallets/ledger').then(r => r.json()).catch(() => ({}))
      ]);

      if (fleetRes?.workers) setWorkers(fleetRes.workers);
      if (ledgerRes?.transactions) setTransactions(ledgerRes.transactions);
    } catch (err) {
      console.warn('Failed to load wallet data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWalletsData();

    const channel = supabase
      .channel('partner-engine-wallets')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wallet_transactions' }, () => {
        fetchWalletsData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workers' }, () => {
        fetchWalletsData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchWalletsData]);

  const handleOpenRecharge = (worker) => {
    setSelectedWorker(worker);
    setAmountRupees('500');
    setPaymentMethod('Cash');
    setReference('');
    setNotes('');
    setFeedback(null);
    setIsModalOpen(true);
  };

  const handleRechargeSubmit = async (e) => {
    e.preventDefault();
    if (!selectedWorker) return;
    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/admin/wallets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workerId: selectedWorker.id,
          amountRupees: parseFloat(amountRupees),
          paymentMethod,
          reference: reference || notes,
          notes
        })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || data.error || 'Recharge failed');
      }

      setFeedback({ type: 'success', message: `+₹${amountRupees} recharged to ${selectedWorker.name}'s wallet!` });
      setTimeout(() => {
        setIsModalOpen(false);
        fetchWalletsData();
      }, 1000);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredWorkers = workers.filter(w => 
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    w.phone.includes(searchQuery)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            <Wallet className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Prepaid Fleet Financials</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F1B33] tracking-tight">
            Worker Wallets & Ledger
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage technician prepaid balances, commission debits, and immutable transaction history.
          </p>
        </div>

        <button
          onClick={fetchWalletsData}
          className="p-2.5 rounded-xl border border-[#E2E8F0] text-slate-600 hover:text-slate-900 hover:bg-[#F5F8FC] transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-2">
        <button
          onClick={() => setActiveTab('workers')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'workers'
              ? 'bg-[#0F1B33] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Technician Balances ({workers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'ledger'
              ? 'bg-[#0F1B33] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Immutable Ledger ({transactions.length})</span>
        </button>
      </div>

      {/* TAB 1: WORKER WALLETS */}
      {activeTab === 'workers' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] flex items-center justify-between gap-3 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search technician..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#F5F8FC] border border-[#E2E8F0] rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FFB21A]"
              />
            </div>
            <div className="text-xs text-slate-500 hidden sm:block">
              Threshold warning: &lt; ₹100
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#F5F8FC] border-b border-[#E2E8F0] text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4 sm:px-6">Technician</th>
                    <th className="py-3.5 px-4">Locality</th>
                    <th className="py-3.5 px-4">Current Balance</th>
                    <th className="py-3.5 px-4">Status Flag</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {filteredWorkers.map((worker) => {
                    const isLow = Number(worker.wallet_balance_paise || 0) < 10000;
                    const isNegative = Number(worker.wallet_balance_paise || 0) < 0;

                    return (
                      <tr key={worker.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-4 sm:px-6">
                          <div className="font-bold text-slate-900">{worker.name}</div>
                          <div className="text-slate-500 font-mono text-xs">{worker.phone}</div>
                        </td>

                        <td className="py-4 px-4 font-medium text-slate-700">
                          {worker.locality}
                        </td>

                        <td className="py-4 px-4">
                          <div className={`font-mono font-bold text-sm ${
                            isNegative ? 'text-red-700 font-black' : isLow ? 'text-red-600' : 'text-slate-900'
                          }`}>
                            {formatPaise(worker.wallet_balance_paise)}
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          {isNegative ? (
                            <span className="px-2 py-0.5 rounded text-[11px] font-black uppercase bg-red-100 text-red-700 flex items-center gap-1 w-fit">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>AMOUNT DUE</span>
                            </span>
                          ) : isLow ? (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-red-600 border border-red-200 flex items-center gap-1 w-fit">
                              <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                              <span>LOW BALANCE</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-fit">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>HEALTHY</span>
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-4 sm:px-6 text-right">
                          <button
                            onClick={() => handleOpenRecharge(worker)}
                            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#FFB21A] to-[#F59E0B] text-[#0F1B33] font-black text-xs shadow-xs hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1 ml-auto"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>RECHARGE</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: IMMUTABLE TRANSACTION LEDGER */}
      {activeTab === 'ledger' && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#F5F8FC] border-b border-[#E2E8F0] text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Timestamp</th>
                  <th className="py-3.5 px-4">Technician</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Balance After</th>
                  <th className="py-3.5 px-4">Method / Ref</th>
                  <th className="py-3.5 px-4 sm:px-6">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No ledger transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => {
                    const isCredit = tx.direction === 'CREDIT';
                    const worker = workers.find(w => w.id === tx.worker_id);

                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 sm:px-6 font-mono text-xs text-slate-500 whitespace-nowrap">
                          {new Date(tx.created_at).toLocaleString('en-IN', {
                            dateStyle: 'short',
                            timeStyle: 'short'
                          })}
                        </td>

                        <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                          {worker?.name || tx.worker_id?.slice(0, 8) || 'Technician'}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                            tx.type === 'RECHARGE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : tx.type === 'COMMISSION_DEBIT'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {tx.type}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-mono font-bold whitespace-nowrap">
                          <span className={isCredit ? 'text-emerald-600' : 'text-slate-900'}>
                            {isCredit ? '+' : '-'}{formatPaise(tx.amount_paise)}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-slate-700 font-semibold whitespace-nowrap">
                          {formatPaise(tx.balance_after_paise)}
                        </td>

                        <td className="py-3.5 px-4 text-xs text-slate-600 whitespace-nowrap">
                          <span className="font-semibold">{tx.payment_method || 'System'}</span>
                          {tx.reference && <span className="text-slate-400 block text-[10px] font-mono">{tx.reference}</span>}
                        </td>

                        <td className="py-3.5 px-4 sm:px-6 text-xs text-slate-600">
                          {tx.description}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. RECHARGE MODAL */}
      {isModalOpen && selectedWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-base text-[#0F1B33]">Recharge Worker Wallet</h3>
                <p className="text-xs text-slate-500 mt-0.5">Worker: <strong>{selectedWorker.name}</strong></p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRechargeSubmit} className="mt-4 space-y-4">
              {feedback && (
                <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                  feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  <span>{feedback.message}</span>
                </div>
              )}

              <div className="bg-[#F5F8FC] p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Current Balance:</span>
                <span className="font-mono font-black text-sm text-[#0F1B33]">
                  {formatPaise(selectedWorker.wallet_balance_paise)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    min="50"
                    step="50"
                    required
                    value={amountRupees}
                    onChange={(e) => setAmountRupees(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 border border-[#E2E8F0] rounded-xl font-bold text-base focus:ring-2 focus:ring-[#FFB21A] focus:outline-none"
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  {['200', '500', '1000', '2000'].map(amt => (
                    <button
                      type="button"
                      key={amt}
                      onClick={() => setAmountRupees(amt)}
                      className="flex-1 py-1 text-xs font-bold bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700"
                    >
                      +₹{amt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-xl font-medium text-xs sm:text-sm focus:ring-2 focus:ring-[#FFB21A] focus:outline-none bg-white"
                >
                  <option value="Cash">Cash (Received at Office)</option>
                  <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                  <option value="Bank Transfer">Bank Transfer (IMPS / NEFT)</option>
                  <option value="Other">Other Operational Adjustment</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Reference / Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. UTR / Receipt / Reason"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#FFB21A] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#FFB21A] to-[#F59E0B] text-[#0F1B33] font-black text-xs sm:text-sm shadow-md shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  {submitting ? 'Processing...' : 'Confirm Recharge'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
