'use client';

import React, { useState } from 'react';
import { 
  Sparkles, ShieldCheck, Clock, Check, ArrowRight, 
  Droplets, Wrench, Filter, Disc, Waves, HelpCircle, 
  Zap, Layers, Cylinder, Activity, Plus
} from 'lucide-react';
import { useBooking } from '../../context/BookingContext';

export const PLUMBING_SUB_CATEGORIES = [
  {
    id: 'bath-fittings',
    name: 'Bath fittings',
    icon: Droplets,
    color: 'from-blue-500/10 to-indigo-500/10 text-blue-600',
    items: [
      { id: 'bf-1', title: 'Bath accessory installation (Towel rod, hook, soap tray)', price: 69, duration: '30 mins', desc: 'Secure drill mounting of towel rails, mirror brackets, soap holders, and corner shelves.' },
      { id: 'bf-2', title: 'Overhead shower arm & head installation', price: 129, duration: '30 mins', desc: 'Rain shower / overhead arm fitting with leak-proof teflon thread seal.' },
      { id: 'bf-3', title: 'Health faucet & jet spray installation', price: 99, duration: '20 mins', desc: 'New braided hose fitting, brass angle valve connection, and high-pressure jet nozzle test.' }
    ]
  },
  {
    id: 'basin-sink',
    name: 'Basin & sink',
    icon: Waves,
    color: 'from-cyan-500/10 to-blue-500/10 text-cyan-600',
    items: [
      { id: 'bs-1', title: 'Wash basin repair & waste coupling replacement', price: 149, duration: '30 mins', desc: 'Fixing loose basins, leaking bottle traps, and brass waste coupling replacement.' },
      { id: 'bs-2', title: 'Kitchen sink installation & silicone waterproofing', price: 299, duration: '45 mins', desc: 'Granite counter sink placement, leak-proof silicone sealing, and drain line link.' },
      { id: 'bs-3', title: 'Single lever basin mixer repair & cartridge change', price: 199, duration: '30 mins', desc: 'Hot & cold mixer cartridge replacement, handle tightening, and water flow tuning.' }
    ]
  },
  {
    id: 'grouting',
    name: 'Grouting',
    icon: Layers,
    color: 'from-amber-500/10 to-orange-500/10 text-amber-600',
    items: [
      { id: 'gr-1', title: 'Bathroom floor tile epoxy grouting (Anti-Leak)', price: 299, duration: '45 mins', desc: 'Waterproof epoxy grouting of floor tile joints to stop water seepage into lower ceilings.' },
      { id: 'gr-2', title: 'Sink & commode edge silicone seal rejuvenation', price: 199, duration: '30 mins', desc: 'Removal of old moldy seal and application of anti-fungal waterproof silicone.' }
    ]
  },
  {
    id: 'water-filter',
    name: 'Water filter',
    icon: Filter,
    color: 'from-teal-500/10 to-emerald-500/10 text-teal-600',
    items: [
      { id: 'wf-1', title: 'RO water purifier inlet connection & tap fitting', price: 149, duration: '30 mins', desc: 'Brass diverter valve fitting, Teflon seal, and food-grade PE pipe connection.' },
      { id: 'wf-2', title: 'Pre-filter bowl & spun candle replacement', price: 199, duration: '25 mins', desc: 'External spun sediment candle replacement and leak inspection.' }
    ]
  },
  {
    id: 'drainage',
    name: 'Drainage',
    icon: Disc,
    color: 'from-slate-500/10 to-zinc-500/10 text-slate-700',
    items: [
      { id: 'dr-1', title: 'Kitchen sink & bathroom floor trap blockage clearing', price: 349, duration: '45 mins', desc: 'Heavy-duty steel drain snake clearing of grease, hair, and hard water residue.' },
      { id: 'dr-2', title: 'Main sanitary sewer chamber line clearing', price: 499, duration: '60 mins', desc: 'High-torque blockage removal and deep cleaning of domestic sewer pipeline.' }
    ]
  },
  {
    id: 'toilet',
    name: 'Toilet',
    icon: Wrench,
    color: 'from-indigo-500/10 to-purple-500/10 text-indigo-600',
    items: [
      { id: 'tl-1', title: 'Toilet flush tank syphon & push button repair', price: 199, duration: '30 mins', desc: 'Fixing continuous water overflow, flush button jamming, and ball valve leakage.' },
      { id: 'tl-2', title: 'Commode seat cover & floor seal fix', price: 149, duration: '25 mins', desc: 'Hydraulic soft-close seat cover fitting and wax ring floor leakage fix.' },
      { id: 'tl-3', title: 'Western commode uninstallation & new installation', price: 599, duration: '60 mins', desc: 'Precision bowl mounting, waste pipe alignment, and cement/silicone floor anchor.' }
    ]
  },
  {
    id: 'tap-mixer',
    name: 'Tap & mixer',
    icon: Droplets,
    color: 'from-sky-500/10 to-blue-500/10 text-sky-600',
    items: [
      { id: 'tm-1', title: 'Dripping tap repair & ceramic spindle replacement', price: 149, duration: '20 mins', desc: 'Fixing dripping bib taps, angle cocks, and ceramic disc spindle replacement.' },
      { id: 'tm-2', title: 'Wall mixer repair & hot-cold diverter fix', price: 249, duration: '35 mins', desc: 'Repairing brass wall mixer, overhead telephonic shower diverter, and O-ring seals.' }
    ]
  },
  {
    id: 'water-tank',
    name: 'Water tank',
    icon: Cylinder,
    color: 'from-emerald-500/10 to-green-500/10 text-emerald-600',
    items: [
      { id: 'wt-1', title: 'Overhead water tank deep cleaning (Up to 1000L)', price: 499, duration: '60 mins', desc: 'High pressure wash, sludge extraction, anti-bacterial scrub & UV sanitization.' },
      { id: 'wt-2', title: 'Automatic water level controller sensor fitting', price: 599, duration: '60 mins', desc: 'Magnetic float sensor installation with automatic overhead tank overflow cutoff.' }
    ]
  },
  {
    id: 'motor',
    name: 'Motor',
    icon: Zap,
    color: 'from-violet-500/10 to-purple-500/10 text-violet-600',
    items: [
      { id: 'mo-1', title: 'Water motor pump connection & pipe priming', price: 399, duration: '45 mins', desc: 'Suction and delivery pipe coupling, foot valve check, and motor start capacitor test.' },
      { id: 'mo-2', title: 'Motor foot valve replacement & airlock fix', price: 299, duration: '35 mins', desc: 'Removal of pipeline airlock, brass foot valve fitting, and pressure priming.' }
    ]
  },
  {
    id: 'water-pipes',
    name: 'Water pipes',
    icon: Activity,
    color: 'from-blue-600/10 to-sky-600/10 text-blue-700',
    items: [
      { id: 'wp-1', title: 'Concealed CPVC/PVC pipe leakage detection & repair', price: 499, duration: '60 mins', desc: 'Wall seepage spot pinpointing, pipe sleeve cutting, and solvent weld joint sealing.' },
      { id: 'wp-2', title: 'New open CPVC/GI waterline bypass fitting (Per Meter)', price: 199, duration: '45 mins', desc: 'High-grade Astral/Supreme CPVC pipe line laying with brass clamp support.' }
    ]
  },
  {
    id: 'consultation',
    name: 'Book a consultation',
    icon: HelpCircle,
    color: 'from-amber-500/10 to-yellow-500/10 text-amber-700',
    items: [
      { id: 'co-1', title: 'Comprehensive doorstep plumbing inspection', price: 99, duration: '30 mins', desc: 'Complete home pipeline, pressure, drainage & fitting health diagnostic. Fee waived on repair approval.' },
      { id: 'co-2', title: 'Full home bathroom renovation plumbing consultation', price: 199, duration: '45 mins', desc: 'Blueprint estimation, sanitary brand recommendations (Jaquar, Hindware, Kohler) & layout plan.' }
    ]
  }
];

export default function PlumbingServicesGrid() {
  const [activeCategory, setActiveCategory] = useState('all');
  const { openBookingModal } = useBooking();

  const displayedItems = activeCategory === 'all'
    ? PLUMBING_SUB_CATEGORIES.flatMap((c) => c.items.map((it) => ({ ...it, categoryName: c.name })))
    : (PLUMBING_SUB_CATEGORIES.find((c) => c.id === activeCategory)?.items || []).map((it) => ({
        ...it,
        categoryName: PLUMBING_SUB_CATEGORIES.find((c) => c.id === activeCategory)?.name
      }));

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft-md space-y-8">
      
      {/* 1. TOP DISCOUNT BANNER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 p-4 sm:p-5 text-slate-950 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center font-extrabold shadow-md shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="inline-block text-[10px] font-extrabold uppercase bg-slate-950 text-amber-400 px-2 py-0.5 rounded-full mb-1">
                Limited Time Offer
              </span>
              <h4 className="text-sm sm:text-base font-extrabold font-heading text-slate-950">
                Get visitation fee off on orders above ₹500
              </h4>
              <p className="text-xs font-semibold text-slate-900/90">
                Doorstep inspection fee 100% waived automatically upon service booking.
              </p>
            </div>
          </div>

          <button
            onClick={() => openBookingModal('plumber')}
            className="self-start sm:self-auto bg-slate-950 hover:bg-slate-900 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs shadow-lg transition-all shrink-0 flex items-center gap-1.5"
          >
            <span>Claim Discount</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
          </button>
        </div>
      </div>

      {/* 2. SECTION HEADER */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-3.5 py-1 rounded-full border border-blue-200 inline-block">
          Explore by Category
        </span>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
          Plumbing Services & Repairs
        </h3>
        <p className="text-xs sm:text-sm text-slate-600">
          Select any plumbing sub-category below to view itemized pricing, transparent rate cards, and instant doorstep booking.
        </p>
      </div>

      {/* 3. 4-COLUMN 11-CATEGORY SERVICE GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* All View Tile */}
        <button
          onClick={() => setActiveCategory('all')}
          className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between group ${
            activeCategory === 'all'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-amber-400'
              : 'bg-slate-50 hover:bg-white text-slate-900 border-slate-200 hover:border-amber-400 hover:shadow-sm'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-white/10 text-amber-400 flex items-center justify-center mb-3">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <div className="font-extrabold text-xs sm:text-sm font-heading">All Plumbing</div>
            <div className={`text-[11px] ${activeCategory === 'all' ? 'text-slate-300' : 'text-slate-500'}`}>
              24+ Services
            </div>
          </div>
        </button>

        {PLUMBING_SUB_CATEGORIES.map((cat) => {
          const IconComponent = cat.icon;
          const isSelected = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between group ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-amber-400'
                  : 'bg-slate-50 hover:bg-white text-slate-900 border-slate-200 hover:border-amber-400 hover:shadow-sm'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                isSelected ? 'bg-amber-400 text-slate-950' : 'bg-slate-200/80 text-slate-700 group-hover:bg-amber-100 group-hover:text-amber-900'
              }`}>
                <IconComponent className="w-5 h-5 stroke-[2.2]" />
              </div>

              <div>
                <div className={`font-extrabold text-xs sm:text-sm font-heading ${
                  isSelected ? 'text-white' : 'text-slate-900 group-hover:text-amber-600'
                }`}>
                  {cat.name}
                </div>
                <div className={`text-[11px] ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                  {cat.items.length} options • From ₹{Math.min(...cat.items.map(i => i.price))}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 4. SUB-SERVICES ITEM LIST VIEW */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="text-lg font-extrabold text-slate-900 font-heading">
              {activeCategory === 'all' ? 'All Plumbing Services & Rates' : `${PLUMBING_SUB_CATEGORIES.find(c => c.id === activeCategory)?.name} Price List`}
            </h4>
            <p className="text-xs text-slate-500">
              Includes 30-day post service warranty and certified doorstep service in Indore.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {displayedItems.length} Services
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedItems.map((item) => (
            <div
              key={item.id}
              className="p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-amber-400 bg-slate-50/50 hover:bg-white transition-all flex flex-col justify-between gap-4 shadow-sm"
            >
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <h5 className="font-bold text-slate-900 text-sm font-heading">
                    {item.title}
                  </h5>
                  <span className="text-xs font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md shrink-0 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {item.duration}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200/80">
                <div className="flex items-baseline gap-1">
                  <span className="text-xs text-slate-500 font-semibold">Price:</span>
                  <span className="text-base font-extrabold text-amber-600 font-heading">
                    ₹{item.price}
                  </span>
                </div>

                <button
                  onClick={() => openBookingModal('plumber', { title: item.title, price: item.price })}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs px-4 py-2 rounded-xl shadow-sm transition-all flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Book Now</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
