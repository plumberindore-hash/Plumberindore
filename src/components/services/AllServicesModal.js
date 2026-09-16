'use client';

import React, { useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import { 
  ACIcon, 
  WashingMachineIcon, 
  RefrigeratorIcon, 
  MicrowaveIcon, 
  ROPurifierIcon, 
  GeyserIcon, 
  PlumberIcon, 
  ElectricianIcon, 
  CleaningIcon, 
  CarpenterIcon, 
  PaintingIcon, 
  ChimneyIcon, 
  AirCoolerIcon, 
  InverterIcon, 
  AttaChakkiIcon 
} from '../ui/ApplianceIcons';

export const ALL_SERVICES_CATEGORIZED = [
  {
    category: 'Large appliances',
    services: [
      {
        id: 'ac-repair',
        name: 'AC',
        slug: 'ac-repair',
        icon: ACIcon,
        startingPrice: 399
      },
      {
        id: 'washing-machine',
        name: 'Washing Machine',
        slug: 'washing-machine',
        icon: WashingMachineIcon,
        startingPrice: 349
      },
      {
        id: 'refrigerator',
        name: 'Refrigerator Repair',
        slug: 'refrigerator',
        icon: RefrigeratorIcon,
        startingPrice: 299
      },
      {
        id: 'air-cooler',
        name: 'Air Cooler',
        slug: 'air-cooler',
        icon: AirCoolerIcon,
        startingPrice: 199
      }
    ]
  },
  {
    category: 'Other appliances & Utilities',
    services: [
      {
        id: 'microwave',
        name: 'Microwave',
        slug: 'microwave',
        icon: MicrowaveIcon,
        startingPrice: 299
      },
      {
        id: 'ro-purifier',
        name: 'RO/Water Purifier',
        slug: 'ro-purifier',
        icon: ROPurifierIcon,
        startingPrice: 299
      },
      {
        id: 'geyser',
        name: 'Geyser',
        slug: 'geyser',
        icon: GeyserIcon,
        startingPrice: 299
      },
      {
        id: 'kitchen-chimney',
        name: 'Kitchen Chimney',
        slug: 'kitchen-chimney',
        icon: ChimneyIcon,
        startingPrice: 399
      },
      {
        id: 'inverter',
        name: 'Inverter & Battery',
        slug: 'inverter',
        icon: InverterIcon,
        startingPrice: 299
      },
      {
        id: 'atta-chakki',
        name: 'Atta Chakki',
        slug: 'atta-chakki',
        icon: AttaChakkiIcon,
        startingPrice: 349
      }
    ]
  },
  {
    category: 'Electrician, Plumber & Home Care',
    services: [
      {
        id: 'plumber',
        name: 'Plumber Services',
        slug: 'plumber',
        icon: PlumberIcon,
        startingPrice: 149
      },
      {
        id: 'electrician',
        name: 'Electrician Services',
        slug: 'electrician',
        icon: ElectricianIcon,
        startingPrice: 149
      },
      {
        id: 'carpenter',
        name: 'Carpenter Services',
        slug: 'carpenter',
        icon: CarpenterIcon,
        startingPrice: 199
      },
      {
        id: 'pest-control',
        name: 'Pest Control',
        slug: 'pest-control',
        icon: CleaningIcon,
        startingPrice: 499
      },
      {
        id: 'painting-waterproofing',
        name: 'Painting & Dampness',
        slug: 'painting-waterproofing',
        icon: PaintingIcon,
        startingPrice: 999
      }
    ]
  }
];

export default function AllServicesModal({ isOpen: propIsOpen, onClose: propOnClose, onSelectService }) {
  const bookingCtx = useBooking() || {};
  const { isAllServicesModalOpen, closeAllServicesModal, openBookingModal } = bookingCtx;

  const isOpen = propIsOpen !== undefined ? propIsOpen : isAllServicesModalOpen;
  const onClose = propOnClose || closeAllServicesModal;

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCardClick = (service) => {
    if (onSelectService) {
      onSelectService(service);
    } else if (openBookingModal) {
      openBookingModal(service.id);
    }
    onClose?.();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-all-services-title"
    >
      {/* Modal Container */}
      <div 
        className="bg-white rounded-3xl md:rounded-[32px] max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-5 border-b border-slate-100 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                Doorstep Home Services Indore
              </span>
            </div>
            <h2 
              id="modal-all-services-title" 
              className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading tracking-tight"
            >
              AC & Appliance Repair
            </h2>
          </div>

          {/* Close (X) Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close All Services modal"
            className="w-10 h-10 rounded-full bg-[#F3F4F6] hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Modal Body: Categorized Sections */}
        <div className="overflow-y-auto py-6 space-y-7 pr-1 flex-1 scrollbar-thin scrollbar-thumb-slate-200">
          {ALL_SERVICES_CATEGORIZED.map((section, idx) => (
            <div key={idx} className="space-y-3.5">
              
              {/* Category Title */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 font-heading flex items-center gap-2">
                  <span>{section.category}</span>
                </h3>
                <span className="text-[11px] text-slate-400 font-medium">
                  {section.services.length} {section.services.length === 1 ? 'Service' : 'Services'}
                </span>
              </div>

              {/* Service Cards Responsive Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
                {section.services.map((service) => {
                  const IconComp = service.icon;
                  return (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => handleCardClick(service)}
                      className="flex flex-col items-center group cursor-pointer focus:outline-none text-center"
                    >
                      {/* Gray Container (#F3F4F6) with rounded corners and fixed dimensions */}
                      <div className="w-full aspect-[4/3] max-h-[85px] sm:max-h-[95px] rounded-2xl bg-[#F3F4F6] hover:bg-amber-50/60 border border-transparent hover:border-amber-300/80 flex items-center justify-center p-2.5 transition-all duration-200 group-hover:scale-105 group-hover:shadow-md shrink-0">
                        <IconComp className="w-full h-full max-h-[50px] object-contain drop-shadow-sm transition-transform duration-200 group-hover:scale-110" />
                      </div>

                      {/* Clean Small Sans-Serif Text Label Centered Below */}
                      <span className="text-[11px] sm:text-xs font-medium text-slate-700 group-hover:text-slate-950 group-hover:font-bold text-center mt-2 leading-tight line-clamp-2 max-w-[96px] transition-colors">
                        {service.name}
                      </span>
                    </button>
                  );
                })}
              </div>

            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5 text-slate-600">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Prompt doorstep service across Indore</span>
            <span className="sm:hidden">Prompt doorstep service</span>
          </div>

          <div className="text-[11px] font-semibold text-amber-600">
            Fixed Upfront Rate Cards
          </div>
        </div>

      </div>
    </div>
  );
}
