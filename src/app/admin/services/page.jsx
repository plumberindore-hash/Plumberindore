'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Wrench, 
  Plus, 
  Search, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  PlusCircle, 
  DollarSign, 
  Tag, 
  X,
  AlertCircle
} from 'lucide-react';
import { formatPaise } from '@/lib/partner-engine/money.js';

export default function ServiceCatalogAdminPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Plumbing',
    priceRupees: '149',
    isPart: false
  });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/services');
      const data = await res.json();
      if (data.success && data.services) {
        setServices(data.services);
      }
    } catch (err) {
      console.warn('Failed to load services:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        setFeedback({ type: 'success', text: `Service "${formData.name}" added to catalog.` });
        setFormData({ name: '', category: 'Plumbing', priceRupees: '149', isPart: false });
        fetchServices();
      } else {
        setFeedback({ type: 'error', text: data.error || 'Failed to create service' });
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (service) => {
    const newState = service.is_active === false ? true : false;
    try {
      const res = await fetch('/api/admin/services', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: service.id, isActive: newState })
      });
      const data = await res.json();
      if (data.success) {
        fetchServices();
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const filtered = services.filter(s => {
    if (!searchQuery.trim()) return true;
    return s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.category.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            <Wrench className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Authoritative Rate Card</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F1B33] tracking-tight">
            Service Catalog & Pricing
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Standardized labor services and replacement parts across Indore.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchServices}
            className="p-2.5 rounded-xl border border-[#E2E8F0] text-slate-600 hover:text-slate-900 hover:bg-[#F5F8FC] transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FFB21A] to-[#F59E0B] text-[#0F1B33] font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Catalog Item</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 ${feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Search */}
      <div className="bg-white p-3 rounded-2xl border border-[#E2E8F0] shadow-xs flex items-center gap-2">
        <Search className="w-4 h-4 text-slate-400 ml-2" />
        <input
          type="text"
          placeholder="Search by service name or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs bg-transparent focus:outline-none"
        />
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F8FC] border-b border-[#E2E8F0] text-slate-500 uppercase font-black tracking-wider">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Service / Part</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Standard Price</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Toggle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400 font-bold">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#FFB21A]" />
                    Loading catalog items...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500 font-bold">
                    No catalog items found.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => {
                  const isActive = s.is_active !== false;
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="font-extrabold text-slate-900">{s.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">ID: {s.id}</div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-700">
                        {s.category}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-black text-slate-900">
                        {formatPaise(s.price_paise)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          s.is_part ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {s.is_part ? 'Hardware Part' : 'Labor Service'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {isActive ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                            Deactivated
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <button
                          onClick={() => handleToggleActive(s)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                            isActive ? 'bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-700' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD ITEM MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-[#0F1B33]">Add Catalog Service / Part</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Item Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tap Spindle Replacement"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  >
                    <option value="Plumbing">Plumbing</option>
                    <option value="Plumbing Parts">Plumbing Parts</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Electrical Parts">Electrical Parts</option>
                    <option value="AC Repair">AC Repair</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Rate (INR) *</label>
                  <input
                    type="number"
                    min="49"
                    required
                    value={formData.priceRupees}
                    onChange={(e) => setFormData({ ...formData, priceRupees: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isPart"
                  checked={formData.isPart}
                  onChange={(e) => setFormData({ ...formData, isPart: e.target.checked })}
                  className="rounded text-[#FFB21A]"
                />
                <label htmlFor="isPart" className="text-xs font-medium text-slate-700 cursor-pointer">
                  This item is a replacement physical hardware part
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#0F1B33] text-white font-bold text-xs rounded-xl shadow-xs disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
