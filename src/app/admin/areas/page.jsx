'use client';

import React, { useState } from 'react';
import { MapPin, CheckCircle2, XCircle, Plus, Search, Building } from 'lucide-react';
import { SERVICE_AREAS } from '../../../lib/partner-engine/store.js';

export default function AreasManagementPage() {
  const [areas, setAreas] = useState(SERVICE_AREAS);
  const [newAreaName, setNewAreaName] = useState('');
  const [newPincode, setNewPincode] = useState('');

  const toggleArea = (name) => {
    setAreas(prev => prev.map(a => a.name === name ? { ...a, isActive: !a.isActive } : a));
  };

  const handleAddArea = (e) => {
    e.preventDefault();
    if (!newAreaName.trim()) return;
    setAreas(prev => [
      ...prev,
      { name: newAreaName.trim(), pincode: newPincode.trim() || '452001', isActive: true, workerCount: 0, jobsToday: 0 }
    ]);
    setNewAreaName('');
    setNewPincode('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
          <MapPin className="w-3.5 h-3.5 text-[#F59E0B]" />
          <span>Indore Coverage Territory</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F1B33] tracking-tight">
          Service Areas Management
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Activate or pause dispatching in specific Indore sectors and pin codes.
        </p>
      </div>

      {/* Add New Area Form */}
      <form onSubmit={handleAddArea} className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full">
          <input
            type="text"
            required
            placeholder="Area / Locality Name (e.g. Annapurna, Bijalpur)"
            value={newAreaName}
            onChange={(e) => setNewAreaName(e.target.value)}
            className="w-full px-3.5 py-2 border border-[#E2E8F0] rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#FFB21A] focus:outline-none"
          />
        </div>
        <div className="w-full sm:w-44">
          <input
            type="text"
            placeholder="Pincode (e.g. 452009)"
            value={newPincode}
            onChange={(e) => setNewPincode(e.target.value)}
            className="w-full px-3.5 py-2 border border-[#E2E8F0] rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#FFB21A] focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-[#FFB21A] to-[#F59E0B] text-[#0F1B33] font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-xs hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Area</span>
        </button>
      </form>

      {/* Areas Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {areas.map((area) => (
          <div 
            key={area.name} 
            className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs flex items-center justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900">{area.name}</h3>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                  {area.pincode}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                <span>Fleet: <strong>{area.workerCount} tech</strong></span>
                <span>•</span>
                <span>Today: <strong>{area.jobsToday} jobs</strong></span>
              </div>
            </div>

            <button
              onClick={() => toggleArea(area.name)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                area.isActive
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-500 border border-slate-200'
              }`}
            >
              {area.isActive ? 'Active' : 'Paused'}
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
