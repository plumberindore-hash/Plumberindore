'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  X, Wrench, Calendar, MapPin, Phone, User, CheckCircle2, ArrowRight, 
  ShieldCheck, Upload, Plus, Trash2, Tag, QrCode, Copy, Check, Lock, 
  CreditCard, Mail, FileText, ExternalLink, Printer, AlertTriangle
} from 'lucide-react';
import { SERVICES_DATA } from '../../data/servicesData';
import { useBooking } from '../../context/BookingContext';
import { checkPincodeServiceability } from '../../data/pincodesData';
import { IS_BOOKING_ENABLED, SERVICE_UNAVAILABLE_MESSAGE } from '../../config/serviceArea.js';

export default function BookingModal() {
  const { isBookingModalOpen, closeBookingModal, preselectedAppliance, preselectedPackage, userPincode, addBooking } = useBooking();

  const [step, setStep] = useState(1);
  const [selectedAppliance, setSelectedAppliance] = useState('ac-repair');
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  
  const [pincode, setPincode] = useState(userPincode || '452010');
  const [pincodeStatus, setPincodeStatus] = useState(null);

  // Form Fields - Blank inputs with clean placeholders
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [address, setAddress] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [formError, setFormError] = useState('');

  // Date and Time slot picker
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('2:00 PM - 4:00 PM');

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [createdBooking, setCreatedBooking] = useState(null);

  // Calculate dynamic dates starting from today
  const [availableDates, setAvailableDates] = useState([]);

  useEffect(() => {
    const dates = [];
    const daysArr = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthsArr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();

    for (let i = 0; i < 6; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      const isoStr = d.toISOString().split('T')[0];
      const dayName = daysArr[d.getDay()];
      const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : `${d.getDate()} ${monthsArr[d.getMonth()]}`;
      dates.push({ date: isoStr, label, day: dayName });
    }
    setAvailableDates(dates);
    if (dates.length > 0) {
      setSelectedDate(dates[0].date);
    }
  }, [isBookingModalOpen]);

  // Initialize selected services when modal opens
  useEffect(() => {
    if (isBookingModalOpen) {
      const activeApplianceId = preselectedAppliance || 'ac-repair';
      setSelectedAppliance(activeApplianceId);
      
      const serviceObj = SERVICES_DATA.find((s) => s.id === activeApplianceId || s.slug === activeApplianceId) || SERVICES_DATA[0];
      const pkgObj = preselectedPackage || (serviceObj.packages && serviceObj.packages[0]);

      if (pkgObj) {
        setSelectedPackage(pkgObj);
        setSelectedServices([
          {
            id: `${serviceObj.id}-${pkgObj.id || 'std'}`,
            serviceId: serviceObj.id,
            serviceName: serviceObj.name,
            packageId: pkgObj.id || 'std',
            packageTitle: pkgObj.title || 'Standard Service',
            price: pkgObj.price || serviceObj.startingPrice
          }
        ]);
      } else {
        setSelectedServices([
          {
            id: `${serviceObj.id}-std`,
            serviceId: serviceObj.id,
            serviceName: serviceObj.name,
            packageId: 'std',
            packageTitle: 'Standard Doorstep Repair',
            price: serviceObj.startingPrice
          }
        ]);
      }
    }
  }, [preselectedAppliance, preselectedPackage, isBookingModalOpen]);

  useEffect(() => {
    if (userPincode) setPincode(userPincode);
  }, [userPincode]);

  if (!isBookingModalOpen) return null;

  const currentServiceObj = SERVICES_DATA.find((s) => s.id === selectedAppliance || s.slug === selectedAppliance) || SERVICES_DATA[0];

  const handlePincodeValidate = (e) => {
    e.preventDefault();
    const res = checkPincodeServiceability(pincode);
    setPincodeStatus(res);
    if (res.valid && res.serviceable && IS_BOOKING_ENABLED) {
      setStep(2);
    }
  };

  const handleToggleService = (pkg) => {
    const itemUniqueId = `${currentServiceObj.id}-${pkg.id}`;
    const exists = selectedServices.some((s) => s.id === itemUniqueId);

    if (exists) {
      if (selectedServices.length > 1) {
        setSelectedServices(selectedServices.filter((s) => s.id !== itemUniqueId));
      }
    } else {
      setSelectedServices([
        ...selectedServices,
        {
          id: itemUniqueId,
          serviceId: currentServiceObj.id,
          serviceName: currentServiceObj.name,
          packageId: pkg.id,
          packageTitle: pkg.title,
          price: pkg.price
        }
      ]);
    }
  };

  const handleRemoveService = (uniqueId) => {
    if (selectedServices.length > 1) {
      setSelectedServices(selectedServices.filter((s) => s.id !== uniqueId));
    }
  };

  const totalPrice = selectedServices.reduce((sum, item) => sum + (item.price || 0), 0);

  // Validate step 3 form
  const handleProceedToSlot = (e) => {
    e.preventDefault();
    setFormError('');

    if (!customerName.trim()) {
      setFormError('Please enter your full name.');
      return;
    }

    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      setFormError('Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).');
      return;
    }

    if (!address.trim()) {
      setFormError('Please enter your doorstep address.');
      return;
    }

    setStep(4);
  };

  // Finalize Booking (Standard Doorstep Flow)
  const handleFinalizeBooking = () => {
    if (!IS_BOOKING_ENABLED) {
      alert(SERVICE_UNAVAILABLE_MESSAGE);
      return;
    }
    setIsProcessing(true);

    const primaryService = selectedServices[0] || {
      serviceId: currentServiceObj.id,
      serviceName: currentServiceObj.name,
      packageTitle: 'Standard Repair'
    };

    const newBooking = addBooking({
      serviceId: primaryService.serviceId,
      serviceName: selectedServices.map((s) => s.serviceName).filter((v, i, a) => a.indexOf(v) === i).join(' + '),
      packageTitle: selectedServices.map((s) => s.packageTitle).join(' | '),
      services: selectedServices,
      price: totalPrice,
      pincode: pincode,
      address: address,
      date: selectedDate,
      timeSlot: selectedSlot,
      name: customerName.trim(),
      phone: customerPhone.trim(),
      email: customerEmail.trim() || '',
      description: issueDescription
    });

    setTimeout(() => {
      setIsProcessing(false);
      setCreatedBooking({
        ...newBooking,
        services: selectedServices
      });
      setStep(5); // Confirmation screen
    }, 400);
  };

  const timeSlots = [
    '9:00 AM - 11:00 AM',
    '11:00 AM - 1:00 PM',
    '2:00 PM - 4:00 PM',
    '4:00 PM - 6:00 PM',
    '6:00 PM - 8:00 PM'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <Wrench className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-bold text-base font-heading">Book Doorstep Technician</h3>
              <p className="text-[10px] text-slate-400">Prompt Doorstep Service • Transparent Upfront Rates • 30-Day Warranty</p>
            </div>
          </div>

          <button onClick={closeBookingModal} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Service Suspension Notice Banner */}
        {!IS_BOOKING_ENABLED && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-start gap-3 text-amber-900 text-xs shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold text-amber-950 block">Services Temporarily Unavailable</span>
              <p className="text-amber-800 text-[11px] leading-relaxed mt-0.5">
                {SERVICE_UNAVAILABLE_MESSAGE}
              </p>
            </div>
          </div>
        )}

        {/* Step Progress Bar */}
        {step < 5 && (
          <div className="bg-slate-100 px-6 py-2 border-b border-slate-200 flex items-center justify-between text-[11px] font-bold text-slate-500 shrink-0">
            <span className={step >= 1 ? 'text-amber-600 font-extrabold' : ''}>1. Pincode</span>
            <span>→</span>
            <span className={step >= 2 ? 'text-amber-600 font-extrabold' : ''}>2. Services ({selectedServices.length})</span>
            <span>→</span>
            <span className={step >= 3 ? 'text-amber-600 font-extrabold' : ''}>3. Details</span>
            <span>→</span>
            <span className={step >= 4 ? 'text-amber-600 font-extrabold' : ''}>4. Schedule Slot</span>
          </div>
        )}

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* STEP 1: Pincode Check */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <h4 className="text-lg font-bold text-slate-900 font-heading">Verify Indore Location Pincode</h4>
                <p className="text-xs text-slate-500">Enter your 6-digit Indore pincode to check technician availability.</p>
              </div>

              <form onSubmit={handlePincodeValidate} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Indore Pincode</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-amber-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="e.g. 452010"
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {pincodeStatus && (
                  <div className={`p-4 rounded-xl text-xs font-semibold border flex items-start gap-2.5 ${
                    pincodeStatus.valid && pincodeStatus.serviceable && IS_BOOKING_ENABLED
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-amber-50 text-amber-900 border-amber-300'
                  }`}>
                    {pincodeStatus.valid && pincodeStatus.serviceable && IS_BOOKING_ENABLED ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    )}
                    <span className="leading-relaxed">{pincodeStatus.message}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!IS_BOOKING_ENABLED && pincodeStatus?.suspended}
                  className={`w-full font-extrabold py-3 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5 ${
                    !IS_BOOKING_ENABLED && pincodeStatus?.suspended
                      ? 'bg-slate-200 text-slate-500 cursor-not-allowed border border-slate-300'
                      : 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer'
                  }`}
                >
                  <span>
                    {!IS_BOOKING_ENABLED && pincodeStatus?.suspended
                      ? 'Bookings Paused in this Area'
                      : 'Verify Pincode & Continue'}
                  </span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: Multi-Service Selection & Cart */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="text-center space-y-1">
                <h4 className="text-lg font-bold text-slate-900 font-heading">Select Services for Single Checkout</h4>
                <p className="text-xs text-slate-500">Add one or more services. All will be handled in a single doorstep visit.</p>
              </div>

              {/* Selected Services Cart Pills */}
              {selectedServices.length > 0 && (
                <div className="bg-amber-50/70 border border-amber-200 p-3.5 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-amber-950 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-amber-600" />
                      <span>Selected Services ({selectedServices.length}):</span>
                    </span>
                    <span className="font-extrabold text-amber-700 text-sm">₹{totalPrice}</span>
                  </div>

                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {selectedServices.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white p-2.5 rounded-xl border border-amber-200/80 flex items-center justify-between text-xs shadow-2xs"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="font-bold text-slate-900 truncate">{item.serviceName}</div>
                          <div className="text-[11px] text-slate-500 truncate">{item.packageTitle}</div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-extrabold text-slate-900">₹{item.price}</span>
                          {selectedServices.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveService(item.id)}
                              className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors"
                              title="Remove service"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Choose Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Add Another Service Category</label>
                <select
                  value={selectedAppliance}
                  onChange={(e) => {
                    setSelectedAppliance(e.target.value);
                  }}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
                >
                  {SERVICES_DATA.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} (Starts ₹{s.startingPrice})</option>
                  ))}
                </select>
              </div>

              {/* Service Packages Options */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Click to Select / Add {currentServiceObj.name} Packages</label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {currentServiceObj.packages.map((pkg) => {
                    const itemUniqueId = `${currentServiceObj.id}-${pkg.id}`;
                    const isSelected = selectedServices.some((s) => s.id === itemUniqueId);

                    return (
                      <div
                        key={pkg.id}
                        onClick={() => handleToggleService(pkg)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-xs ${
                          isSelected
                            ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-400/30 shadow-sm'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div className="pr-2">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${isSelected ? 'bg-amber-500 text-slate-950 font-extrabold' : 'border border-slate-300'}`}>
                              {isSelected ? '✓' : '+'}
                            </span>
                            <span>{pkg.title}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 ml-5">{pkg.description}</div>
                        </div>
                        <div className="text-right shrink-0 ml-2">
                          <div className="font-extrabold text-amber-600 text-sm">₹{pkg.price}</div>
                          <div className="text-[10px] text-slate-400">{pkg.duration}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={selectedServices.length === 0}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs shadow-md disabled:opacity-50"
                >
                  Continue with {selectedServices.length} {selectedServices.length === 1 ? 'Service' : 'Services'} (₹{totalPrice})
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Customer Details, Address & Contact (Blank inputs, Strict Mobile Validation) */}
          {step === 3 && (
            <form onSubmit={handleProceedToSlot} className="space-y-4 text-xs">
              <div className="text-center space-y-1">
                <h4 className="text-lg font-bold text-slate-900 font-heading">Doorstep Contact & Address Details</h4>
                <p className="text-xs text-slate-500">Enter your details for verified technician arrival & instant dispatch.</p>
              </div>

              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl font-bold text-xs">
                  ✕ {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:bg-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Mobile Number <span className="text-red-500">* (Required)</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      maxLength={10}
                      value={customerPhone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setCustomerPhone(val);
                      }}
                      placeholder="10-digit mobile (e.g. 9876543210)"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:bg-white"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Email Address <span className="text-slate-400 font-normal">(Optional for updates)</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="e.g. rahul.indore@gmail.com"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Doorstep Service Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House/Flat No, Building Name, Street Landmark, Area, Indore"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Describe Issue / Appliance Fault (Optional)</label>
                <input
                  type="text"
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  placeholder="e.g. Water dripping, low cooling, MCB tripping, noisy sound..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
              </div>

              {/* Photo Upload for Issue Reporting */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Attach Issue Photo (Optional)</label>
                <div
                  onClick={() => setPhotoUploaded(!photoUploaded)}
                  className={`p-3 rounded-xl border border-dashed text-center cursor-pointer transition-colors ${
                    photoUploaded ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-slate-50 border-slate-300 text-slate-600'
                  }`}
                >
                  <Upload className="w-4 h-4 mx-auto text-slate-400 mb-1" />
                  <span className="font-bold">
                    {photoUploaded ? '✓ Photo Attached (repair_issue.jpg)' : 'Click to attach photo/video of appliance error code'}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs shadow-md"
                >
                  Proceed to Schedule Slot →
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: Date & Slot Picker + Order Summary (Clean & Direct) */}
          {step === 4 && (
            <div className="space-y-5 text-xs">
              <div className="text-center space-y-1">
                <h4 className="text-lg font-bold text-slate-900 font-heading">Choose Service Appointment Date & Time</h4>
                <p className="text-xs text-slate-500">Select your preferred date and time window for doorstep technician arrival.</p>
              </div>

              {/* Date Picker Grid */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">1. Select Appointment Date</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {availableDates.map((d) => {
                    const isSelected = selectedDate === d.date;
                    return (
                      <button
                        key={d.date}
                        type="button"
                        onClick={() => setSelectedDate(d.date)}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          isSelected
                            ? 'border-amber-500 bg-amber-50 text-amber-900 font-extrabold shadow-sm ring-1 ring-amber-400'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold'
                        }`}
                      >
                        <div className="text-[10px] text-slate-400 uppercase">{d.day}</div>
                        <div className="text-xs font-bold">{d.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots Selection */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">2. Select Arrival Time Window</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {timeSlots.map((slot) => {
                    const isSelected = selectedSlot === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-2 rounded-xl border text-center transition-all font-bold text-[11px] ${
                          isSelected
                            ? 'border-slate-900 bg-slate-900 text-amber-400 shadow-sm'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Itemized Multi-Service Checkout Summary Card */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs font-extrabold text-slate-900 border-b border-slate-200 pb-2">
                  <span>Order Checkout ({selectedServices.length} {selectedServices.length === 1 ? 'Service' : 'Services'})</span>
                  <span className="text-amber-600 text-sm font-heading">Total: ₹{totalPrice}</span>
                </div>

                <div className="space-y-1.5 divide-y divide-slate-100 max-h-32 overflow-y-auto">
                  {selectedServices.map((srv, idx) => (
                    <div key={idx} className="flex justify-between items-center pt-1.5 first:pt-0 text-[11px]">
                      <div>
                        <span className="font-bold text-slate-900">{srv.serviceName}</span>
                        <span className="text-[10px] text-slate-500 block">{srv.packageTitle}</span>
                      </div>
                      <span className="font-bold text-slate-900">₹{srv.price}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-amber-50/80 border border-amber-200 p-2.5 rounded-xl text-[11px] text-amber-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                  <span><strong>Doorstep Payment:</strong> Pay ₹{totalPrice} via Cash or UPI QR to the technician only after service completion & inspection.</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={!IS_BOOKING_ENABLED || isProcessing}
                  onClick={handleFinalizeBooking}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold py-3 rounded-xl text-xs shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                  <span>
                    {!IS_BOOKING_ENABLED 
                      ? 'Bookings Temporarily Paused' 
                      : isProcessing 
                        ? 'Confirming Appointment...' 
                        : `Confirm & Book Appointment (₹${totalPrice}) →`}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Booking Confirmed Screen */}
          {step === 5 && createdBooking && (
            <div className="text-center space-y-5 py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-8 h-8 stroke-[3]" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
                    Booking Confirmed (#{createdBooking.id})
                  </span>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
                    ● Pay on Doorstep
                  </span>
                </div>

                <h4 className="text-xl font-extrabold text-slate-900 font-heading pt-2">
                  Doorstep Technician Assigned!
                </h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Instant booking confirmation dispatched to <strong>{createdBooking.customerPhone}</strong>.
                </p>
              </div>

              {/* Itemized Services Confirmation List */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left text-xs space-y-3 max-w-md mx-auto">
                <div className="border-b border-slate-200 pb-2">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">
                    Booked Services ({createdBooking.services?.length || 1})
                  </span>
                  
                  <div className="space-y-2 divide-y divide-slate-200/60">
                    {createdBooking.services && createdBooking.services.length > 0 ? (
                      createdBooking.services.map((srv, idx) => (
                        <div key={idx} className="flex justify-between items-center pt-1.5 first:pt-0">
                          <div>
                            <div className="font-bold text-slate-900">{srv.serviceName}</div>
                            <div className="text-[11px] text-slate-500">{srv.packageTitle}</div>
                          </div>
                          <div className="font-extrabold text-amber-600">₹{srv.price}</div>
                        </div>
                      ))
                    ) : (
                      <div className="flex justify-between items-center">
                        <div className="font-bold text-slate-900">{createdBooking.serviceName}</div>
                        <div className="font-extrabold text-amber-600">₹{createdBooking.price}</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Scheduled:</span>
                  <span className="font-bold text-slate-900">{createdBooking.date}, {createdBooking.timeSlot}</span>
                </div>
                
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Doorstep Location:</span>
                  <span className="font-bold text-slate-900 text-right">{createdBooking.address} ({createdBooking.pincode})</span>
                </div>

                <div className="flex justify-between font-extrabold text-sm text-slate-900 pt-1">
                  <span>Total Amount Due:</span>
                  <span className="text-amber-600 font-extrabold">₹{createdBooking.price} (Pay on Fix)</span>
                </div>
              </div>

              {/* Automated Notification Dispatch Notice */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 flex items-center justify-center gap-2 max-w-md mx-auto">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Instant SMS & Email confirmation sent to <strong>{createdBooking.customerPhone}</strong></span>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                <button
                  type="button"
                  onClick={() => {
                    setCreatedBooking(null);
                    setSelectedServices([]);
                    setStep(2);
                  }}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold py-3 px-4 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>+ Book Another Service</span>
                </button>

                <a
                  href={`https://wa.me/919174934135?text=${encodeURIComponent(`Hello PlumberIndore, I just booked service #${createdBooking.id} (${createdBooking.serviceName}) for ${createdBooking.customerName} at ${createdBooking.address}. Please confirm technician visit.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-xs text-center flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <span>Chat on WhatsApp</span>
                  <ArrowRight className="w-4 h-4 text-emerald-200" />
                </a>

                <button
                  type="button"
                  onClick={closeBookingModal}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 px-5 rounded-xl text-xs cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

