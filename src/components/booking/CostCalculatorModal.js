'use client';

import React, { useState } from 'react';
import { X, Calculator, ShieldCheck, ArrowRight, CheckCircle2, Wrench } from 'lucide-react';
import { useBooking } from '../../context/BookingContext';

export default function CostCalculatorModal({ isOpen, onClose }) {
  const { openBookingModal } = useBooking();

  const [category, setCategory] = useState('ac-repair');
  const [brand, setBrand] = useState('Daikin');
  const [modelType, setModelType] = useState('Inverter Split AC (1.5 Ton)');
  const [issue, setIssue] = useState('Low Cooling / Gas Leak');

  if (!isOpen) return null;

  const brands = ['Daikin', 'Voltas', 'LG', 'Samsung', 'Blue Star', 'Whirlpool', 'Hitachi', 'Haier', 'Kent'];

  const modelTypes = {
    'ac-repair': ['Inverter Split AC (1.5 Ton)', 'Non-Inverter Split AC', 'Window AC (1.5 Ton)', 'Cassette AC'],
    'refrigerator': ['Double Door Frost Free (250L+)', 'Single Door Direct Cool', 'Side by Side Inverter'],
    'washing-machine': ['Front Load Fully Automatic', 'Top Load Fully Automatic', 'Semi Automatic'],
    'ro-purifier': ['Multi-Stage RO + UV + UF', 'Under-Sink RO System'],
    'plumber': ['Bathroom Sanitary & Fittings', 'Underground PVC Pipeline'],
    'electrician': ['Modular Switchboard Wiring', '3-Phase MCB Distribution Box']
  };

  const issuesList = {
    'ac-repair': [
      { title: 'Low Cooling / Gas Leak', min: 1499, max: 1899 },
      { title: 'Power Jet Deep Foam Servicing', min: 499, max: 699 },
      { title: 'PCB Board Diagnostic & Repair', min: 799, max: 1299 },
      { title: 'Water Dripping Indoors', min: 299, max: 499 }
    ],
    'refrigerator': [
      { title: 'Gas Refill & Compressor Relay', min: 1299, max: 1699 },
      { title: 'Defrost Heater / Thermostat Replacement', min: 499, max: 699 }
    ],
    'washing-machine': [
      { title: 'Loud Drum Vibration / Bearing Fix', min: 799, max: 1099 },
      { title: 'Drainage Pump Replacement', min: 349, max: 599 }
    ],
    'ro-purifier': [
      { title: 'Complete Filter Kit & Membrane Change', min: 799, max: 1199 }
    ],
    'plumber': [
      { title: 'Tap & Flush Tank Leak Repair', min: 199, max: 299 }
    ],
    'electrician': [
      { title: 'MCB Short Circuit & Wiring Fix', min: 199, max: 399 }
    ]
  };

  const currentIssues = issuesList[category] || issuesList['ac-repair'];
  const selectedIssueObj = currentIssues.find(i => i.title === issue) || currentIssues[0];

  const handleBookEstimate = async () => {
    // Send quote notification
    try {
      fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          brand,
          modelType,
          issue: selectedIssueObj.title,
          estimatedPrice: `${selectedIssueObj.min} - ${selectedIssueObj.max}`
        })
      }).catch(err => console.error('Background quote notification error:', err));
    } catch (e) {
      console.error(e);
    }

    onClose();
    openBookingModal(category, {
      title: `${brand} ${modelType} - ${selectedIssueObj.title}`,
      price: selectedIssueObj.min,
      duration: '45 mins'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <Calculator className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-bold text-lg font-heading">Repair Cost Estimator</h3>
              <p className="text-xs text-amber-400 font-semibold">Select Brand & Model for Accurate Indore Quote</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
          
          {/* 1. Appliance Category */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              1. Select Appliance Service
            </label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setModelType(modelTypes[e.target.value]?.[0] || '');
                setIssue(issuesList[e.target.value]?.[0]?.title || '');
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              <option value="ac-repair">Air Conditioner (AC)</option>
              <option value="refrigerator">Refrigerator / Fridge</option>
              <option value="washing-machine">Washing Machine</option>
              <option value="ro-purifier">RO Water Purifier</option>
              <option value="plumber">Plumbing Services</option>
              <option value="electrician">Electrical Services</option>
            </select>
          </div>

          {/* 2. Appliance Brand */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              2. Select Brand
            </label>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {brands.map((b) => (
                <button
                  type="button"
                  key={b}
                  onClick={() => setBrand(b)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shrink-0 ${
                    brand === b
                      ? 'border-amber-500 bg-amber-50 text-amber-950 ring-2 ring-amber-500/20'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50/50'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Model Type */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              3. Select Model Type
            </label>
            <select
              value={modelType}
              onChange={(e) => setModelType(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              {(modelTypes[category] || modelTypes['ac-repair']).map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* 4. Issue Reported */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              4. Reported Problem / Requirement
            </label>
            <div className="space-y-2">
              {currentIssues.map((iss) => (
                <div
                  key={iss.title}
                  onClick={() => setIssue(iss.title)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    issue === iss.title
                      ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-900">{iss.title}</span>
                  <span className="text-xs font-extrabold text-amber-600">₹{iss.min} - ₹{iss.max}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Estimated Output Box */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Estimated Total (Parts & Labor):</span>
              <span className="text-xs font-bold text-emerald-400">100% Price Lock</span>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-extrabold text-amber-400 font-heading">
                ₹{selectedIssueObj.min} – ₹{selectedIssueObj.max}
              </div>
              <div className="text-[11px] text-slate-400">Includes 30-Day Warranty</div>
            </div>
          </div>

          <button
            onClick={handleBookEstimate}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-3.5 rounded-xl shadow-md text-xs transition-all flex items-center justify-center gap-2"
          >
            <span>Book Service at Estimated Rate</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </div>

      </div>
    </div>
  );
}
