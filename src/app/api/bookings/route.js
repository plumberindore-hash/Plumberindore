import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getAdminClient } from '@/lib/supabase/admin.js';
import { calculateServerPrice } from '../../../lib/pricingEngine.js';
import { getPlatformSettings, getFleet, dispatchJob } from '@/lib/partner-engine/store.js';

export const dynamic = 'force-dynamic';

// Strict IP & User-Agent Rate Limiting Configuration
// Maximum 5 booking attempts per IP per 10 minutes to prevent automated spam and abuse
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const MAX_BOOKING_ATTEMPTS = 5;
const ipRateLimitStore = new Map();

function cleanUpRateLimitStore() {
  const now = Date.now();
  for (const [ip, data] of ipRateLimitStore.entries()) {
    if (now - data.resetTime > RATE_LIMIT_WINDOW_MS) {
      ipRateLimitStore.delete(ip);
    }
  }
}

function checkRateLimit(ip) {
  cleanUpRateLimitStore();
  const now = Date.now();
  const record = ipRateLimitStore.get(ip) || { count: 0, resetTime: now };

  if (now - record.resetTime > RATE_LIMIT_WINDOW_MS) {
    record.count = 1;
    record.resetTime = now;
    ipRateLimitStore.set(ip, record);
    return { allowed: true, remaining: MAX_BOOKING_ATTEMPTS - 1 };
  }

  if (record.count >= MAX_BOOKING_ATTEMPTS) {
    const retryAfterSeconds = Math.ceil((record.resetTime + RATE_LIMIT_WINDOW_MS - now) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  record.count += 1;
  ipRateLimitStore.set(ip, record);
  return { allowed: true, remaining: MAX_BOOKING_ATTEMPTS - record.count };
}

// Brevo API Configuration
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const ADMIN_NOTIFICATION_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || 'support@plumberindore.in';

async function sendBrevoEmail({ to, subject, htmlContent, replyTo, emailType = 'general' }) {
  if (!BREVO_API_KEY) {
    console.warn(`[Brevo Email Warning] BREVO_API_KEY is not configured in environment variables. Email of type "${emailType}" was not dispatched.`);
    return { skipped: true, reason: 'BREVO_API_KEY missing' };
  }

  const payload = {
    sender: { name: 'PlumberIndore Operations', email: 'support@plumberindore.in' },
    to: Array.isArray(to) ? to : [{ email: to }],
    subject,
    htmlContent
  };

  if (replyTo) {
    payload.replyTo = { email: replyTo };
  }

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': BREVO_API_KEY,
      'content-type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Brevo API Error (${response.status}): ${errText}`);
  }

  return response.json();
}

import { IS_BOOKING_ENABLED, SERVICE_UNAVAILABLE_MESSAGE } from '../../../config/serviceArea.js';

/**
 * Auto-Dispatches certified field technicians based on Indore operational zones & trade categories.
 * - Electrical Services:
 *   -> Saurabh Electrician (+91 78697 09526)
 * - Zone 1: Rau, Mhow, Bhawarkua, Bijalpur, Rajendra Nagar, Sudama Nagar, Tejaji Nagar, Nimbodi
 *   -> Ajay Mahajan (+91 84595 59141)
 * - Zone 2: Bicholi Mardana
 *   -> Pankaj Sharma (+91 98267 43299)
 * - Default / Fallback: Central / Core Indore
 *   -> Ajay Mahajan (+91 84595 59141)
 */
export function resolveAutoDispatchTechnician(address = '', pincode = '', serviceCategory = 'Plumber') {
  const normAddress = (address || '').toLowerCase();
  const normPincode = (pincode || '').toString().trim();
  const normCategory = (serviceCategory || '').toLowerCase();

  // Trade Rule: Electrical specialization takes priority for electrical bookings
  if (normCategory.includes('electric')) {
    return {
      name: 'Saurabh Electrician',
      phone: '+91 78697 09526',
      zone: 'Indore Metro Electrical Sector',
      localityMatch: 'VIJAY NAGAR / METRO SECTOR',
      vehicle: 'Service Bike (MP 09 SE 9526)'
    };
  }

  // Zone 1: Rau, Mhow, Bhawarkua, Bijalpur, Rajendra Nagar, Sudama Nagar, Tejaji Nagar, Nimbodi
  const zone1Keywords = [
    'rau',
    'mhow',
    'bhawarkua',
    'bhanwarkua',
    'bhanwarkuan',
    'bijalpur',
    'rajendra nagar',
    'sudama nagar',
    'tejaji nagar',
    'nimbodi'
  ];

  const zone1Pincodes = [
    '453331', // Rau
    '453441', // Mhow
    '452014', // Bhawarkua
    '452012', // Rajendra Nagar / Bijalpur
    '452009', // Sudama Nagar
    '452020'  // Tejaji Nagar / Nimbodi
  ];

  const matchedZone1 = zone1Keywords.find(keyword => normAddress.includes(keyword));
  const isZone1 = Boolean(matchedZone1) || zone1Pincodes.includes(normPincode);

  if (isZone1) {
    return {
      name: 'Ajay Mahajan',
      phone: '+91 84595 59141',
      zone: 'South Indore & Mhow Corridor',
      localityMatch: matchedZone1 ? matchedZone1.toUpperCase() : 'Rau / Bhawarkua Sector',
      vehicle: 'Service Bike (MP 09 MD 8821)'
    };
  }

  // Zone 2: Bicholi Mardana
  const zone2Keywords = [
    'bicholi mardana',
    'bicholi',
    'bicholi hapsi',
    'mardana'
  ];

  const matchedZone2 = zone2Keywords.find(keyword => normAddress.includes(keyword));
  const isZone2 = Boolean(matchedZone2) || normPincode === '452016';

  if (isZone2) {
    return {
      name: 'Pankaj Sharma',
      phone: '+91 98267 43299',
      zone: 'Bicholi Mardana & Bypass Corridor',
      localityMatch: 'BICHOLI MARDANA',
      vehicle: 'Service Bike (MP 09 BM 4329)'
    };
  }

  // Fallback default technician for Central & Other Indore Localities (Lead Technician)
  return {
    name: 'Ajay Mahajan',
    phone: '+91 84595 59141',
    zone: 'Indore Central & Core Sector',
    localityMatch: 'INDORE CENTRAL',
    vehicle: 'Service Bike (MP 09 MD 8821)'
  };
}

export const getAssignedTechnicianByZone = resolveAutoDispatchTechnician;

export async function POST(request) {
  try {
    // 0. Global Emergency Suspension / Availability Check
    if (!IS_BOOKING_ENABLED) {
      return NextResponse.json(
        { 
          success: false, 
          error: SERVICE_UNAVAILABLE_MESSAGE,
          code: 'SERVICE_TEMPORARILY_SUSPENDED' 
        }, 
        { status: 503 }
      );
    }

    // 1. Extract IP for rate limiting and auditing
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
               request.headers.get('x-real-ip') ||
               '127.0.0.1';

    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json({
        success: false,
        error: `Too many booking requests from your IP. Please try again in ${rateLimit.retryAfterSeconds} seconds.`
      }, {
        status: 429,
        headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) }
      });
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ success: false, error: 'Invalid or missing JSON payload' }, { status: 400 });
    }

    const {
      name,
      phone,
      email,
      address,
      pincode,
      date,
      timeSlot,
      services,
      service, // Legacy fallback
      description
    } = body;

    // 2. Strict Input Validations
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ success: false, error: 'Full Name must be at least 2 characters long' }, { status: 400 });
    }

    if (!phone || typeof phone !== 'string') {
      return NextResponse.json({ success: false, error: 'A valid Indian mobile number is required' }, { status: 400 });
    }

    // Sanitize and validate 10-digit Indian phone number
    const cleanedPhone = phone.replace(/\D/g, '').slice(-10);
    if (cleanedPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanedPhone)) {
      return NextResponse.json({
        success: false,
        error: 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9'
      }, { status: 400 });
    }

    if (!address || typeof address !== 'string' || address.trim().length < 5) {
      return NextResponse.json({ success: false, error: 'Please enter a complete service address (at least 5 characters)' }, { status: 400 });
    }

    // Validate Pincode: Must be standard Indore 6-digit PIN (starting with 45)
    if (pincode) {
      const pinStr = pincode.toString().trim();
      if (!/^\d{6}$/.test(pinStr) || !pinStr.startsWith('45')) {
        return NextResponse.json({
          success: false,
          error: 'Please provide a valid 6-digit Indore district postal pincode (starts with 45)'
        }, { status: 400 });
      }
    }

    // Validate Date: Cannot book past dates
    if (date) {
      const bookingDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (bookingDate < today) {
        return NextResponse.json({
          success: false,
          error: 'Cannot schedule service in the past. Please select today or a future date.'
        }, { status: 400 });
      }
    }

    // 3. Multi-item pricing calculation and validation
    let requestedServices = [];
    if (Array.isArray(services) && services.length > 0) {
      requestedServices = services;
    } else if (service) {
      requestedServices = [{
        serviceSlug: 'general-plumbing',
        packageId: typeof service === 'string' ? service : 'general-plumbing',
        quantity: 1
      }];
    } else {
      return NextResponse.json({
        success: false,
        error: 'Please select at least one repair or installation service'
      }, { status: 400 });
    }

    const pricing = calculateServerPrice(requestedServices);
    const totalAmount = pricing.totalAmount;
    const subtotal = pricing.subtotal;
    const validatedItems = pricing.validatedItems;

    const randomBookingNumber = `IND-${Math.floor(10000 + Math.random() * 90000)}`;
    const scheduledDate = date || new Date().toISOString().split('T')[0];
    const slot = timeSlot || '2:00 PM - 4:00 PM';
    const primaryServiceName = validatedItems.map(i => i.serviceName).filter((v, i, a) => a.indexOf(v) === i).join(' + ');
    const primaryPackageTitle = validatedItems.map(i => i.packageTitle).join(' | ');

    // Manual Dispatch Mode: All new bookings default to 'Pending' without auto-assignment
    const rawNotes = description ? description.trim() : '';

    const supabaseAdmin = getAdminClient();

    let createdBookingRecord = {
      id: randomBookingNumber,
      booking_number: randomBookingNumber,
      customer_name: name.trim(),
      customer_phone: cleanedPhone,
      customer_email: (email || '').trim() || null,
      service_address: address.trim(),
      pincode: pincode || '452010',
      scheduled_date: scheduledDate,
      time_slot: slot,
      service_name: primaryServiceName,
      package_title: primaryPackageTitle,
      status: 'Pending',
      payment_status: 'Pending (Pay on Completion)',
      payment_method: 'Cash / UPI on Doorstep',
      subtotal: subtotal,
      parts_cost: 0,
      total_amount: totalAmount,
      price: totalAmount,
      assignedTechnician: null,
      technician: null,
      technicianPhone: null,
      notes: rawNotes,
      created_at: new Date().toISOString()
    };

    // 3. Insert into Supabase with strict validation
    if (supabaseAdmin) {
      try {
        // Insert main booking record
        const { data: dbBooking, error: bookingErr } = await supabaseAdmin
          .from('bookings')
          .insert({
            booking_number: randomBookingNumber,
            customer_name: name.trim(),
            customer_phone: cleanedPhone,
            customer_email: (email || '').trim() || null,
            service_address: address.trim(),
            pincode: pincode || '452010',
            scheduled_date: scheduledDate,
            time_slot: slot,
            service_name: primaryServiceName,
            package_title: primaryPackageTitle,
            status: 'Pending',
            payment_status: 'Pending (Pay on Completion)',
            payment_method: 'Cash / UPI on Doorstep',
            subtotal: subtotal,
            parts_cost: 0,
            total_amount: totalAmount,
            notes: rawNotes
          })
          .select()
          .single();

        if (bookingErr) {
          console.error('Supabase booking insert error:', bookingErr.message);
          return NextResponse.json({
            success: false,
            error: `Failed to record booking in database: ${bookingErr.message}`
          }, { status: 500 });
        }

        if (dbBooking) {
          createdBookingRecord = {
            ...dbBooking,
            id: dbBooking.booking_number || dbBooking.id,
            price: Number(dbBooking.total_amount || dbBooking.price || totalAmount),
            customerName: dbBooking.customer_name,
            customerPhone: dbBooking.customer_phone,
            customerEmail: dbBooking.customer_email,
            serviceName: dbBooking.service_name,
            packageTitle: dbBooking.package_title,
            address: dbBooking.service_address,
            date: dbBooking.scheduled_date,
            timeSlot: dbBooking.time_slot,
            paymentStatus: dbBooking.payment_status,
            paymentMethod: dbBooking.payment_method
          };

          // Log Booking Creation in Supabase audit_logs
          try {
            await supabaseAdmin.from('audit_logs').insert({
              action: 'booking_created',
              entity_type: 'booking',
              entity_id: dbBooking.id,
              new_values: {
                booking_number: randomBookingNumber,
                customer_name: name.trim(),
                customer_phone: cleanedPhone,
                service_address: address.trim(),
                pincode: pincode || '452010',
                status: 'Pending',
                assigned_technician: null,
                scheduled_date: scheduledDate,
                time_slot: slot,
                total_amount: totalAmount,
                created_at: new Date().toISOString()
              },
              ip_address: ip
            });
            console.log(`[Booking Created - Pending Manual Dispatch] #${randomBookingNumber}`);
          } catch (logErr) {
            console.warn('[Booking Audit Notice] Could not log booking to audit_logs:', logErr.message);
          }

          // Insert itemized booking records
          if (validatedItems.length > 0) {
            const itemsToInsert = validatedItems.map(item => ({
              booking_id: dbBooking.id,
              service_name: item.serviceName,
              package_title: item.packageTitle,
              unit_price: item.unitPrice,
              quantity: item.quantity,
              total_price: item.totalPrice
            }));

            const { error: itemsErr } = await supabaseAdmin
              .from('booking_items')
              .insert(itemsToInsert);

            if (itemsErr) {
              console.warn('[Booking Notice] Itemized details could not be logged:', itemsErr.message);
            }
          }
        }
      } catch (dbEx) {
        console.error('Database connection exception in POST /api/bookings:', dbEx);
        return NextResponse.json({
          success: false,
          error: 'Database communication error. Please try again shortly.'
        }, { status: 500 });
      }
    }

    // 4. Dispatch Email Notifications via Brevo (Non-blocking on error)
    let adminEmailResult = null;
    let customerEmailResult = null;
    const bookingNo = createdBookingRecord?.booking_number || randomBookingNumber;

    try {
      const itemsListHtml = validatedItems.map(i => `
        <li style="margin-bottom: 6px;">
          <strong>${i.packageTitle}</strong> (${i.serviceName}) x ${i.quantity} — ₹${i.totalPrice}
        </li>
      `).join('');

      // Formulate Admin Notification
      const adminHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
          <div style="background-color: #0F172A; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: #F8FAFC; margin: 0; font-size: 20px;">?? New Booking Dispatched: #${bookingNo}</h1>
            <p style="font-size: 13px; color: #64748b; margin: 0;">Instant notification dispatched via PlumberIndore Operations</p>
          </div>
          <div style="padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px; background-color: #ffffff;">
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; width: 140px; color: #64748b;">Customer Name:</td>
                <td style="padding: 8px 0; font-weight: bold; color: #0F172A;">${name.trim()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Phone Number:</td>
                <td style="padding: 8px 0;"><a href="tel:+91${cleanedPhone}" style="color: #2563eb; text-decoration: none; font-weight: bold;">+91 ${cleanedPhone}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Service Address:</td>
                <td style="padding: 8px 0; color: #0F172A;">${address.trim()} (PIN: ${pincode || '452010'})</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Scheduled Time:</td>
                <td style="padding: 8px 0; font-weight: bold; color: #0F172A;">${scheduledDate} | Slot: ${slot}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Total Amount:</td>
                <td style="padding: 8px 0; font-weight: bold; color: #16a34a; font-size: 16px;">?${totalAmount} (Doorstep Payment)</td>
              </tr>
            </table>

            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; margin-bottom: 20px;">
              <h3 style="margin-top: 0; margin-bottom: 10px; font-size: 14px; color: #334155;">Selected Services & Packages:</h3>
              <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #334155;">
                ${itemsListHtml}
              </ul>
            </div>

            <!-- Manual Dispatch Status & Ops Console Link -->
            <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
              <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #1e3a5f;">
                    ?? Pending Dispatch (Manual Allocation from Ops Portal)
                  </td>
                </tr>
              </table>
              <div style="text-align: center; margin-top: 14px;">
                <a href="https://plumberindore.in/portal-indore-ops-9821" 
                   style="display: inline-block; background-color: #0F172A; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-size: 13px; font-weight: bold; letter-spacing: 0.3px;">
                  Open Indore Ops Console to Assign Technician ?
                </a>
              </div>
            </div>

            <p style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 24px; margin-bottom: 0;">
              PlumberIndore Operations Platform ? Automated Real-Time Dispatch System
            </p>
          </div>
        </div>
      `;

      // Customer Confirmation Email
      const customerEmailAddress = (email || '').trim();
      let customerHtml = null;
      if (customerEmailAddress && customerEmailAddress.includes('@')) {
        customerHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
            <div style="background-color: #0F172A; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
              <h1 style="color: #F8FAFC; margin: 0; font-size: 20px;">Booking Confirmed! #${bookingNo}</h1>
              <p style="color: #94A3B8; margin: 6px 0 0; font-size: 14px;">Thank you for choosing PlumberIndore</p>
            </div>
            <div style="padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px; background-color: #ffffff;">
              <p style="font-size: 15px; margin-top: 0;">Hello <strong>${name.trim()}</strong>,</p>
              <p style="font-size: 14px; color: #475569;">Your doorstep service booking has been received. Our certified field technician will visit you on schedule.</p>
              
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #f8fafc; border-radius: 6px; padding: 12px;">
                <tr>
                  <td style="padding: 8px 12px; font-weight: bold; color: #64748b;">Scheduled Date:</td>
                  <td style="padding: 8px 12px; font-weight: bold; color: #0F172A;">${scheduledDate}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 12px; font-weight: bold; color: #64748b;">Preferred Slot:</td>
                  <td style="padding: 8px 12px; font-weight: bold; color: #0F172A;">${slot}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 12px; font-weight: bold; color: #64748b;">Service Address:</td>
                  <td style="padding: 8px 12px; color: #0F172A;">${address.trim()}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 12px; font-weight: bold; color: #64748b;">Amount Payable:</td>
                  <td style="padding: 8px 12px; font-weight: bold; color: #16a34a;">?${totalAmount} (Pay after service)</td>
                </tr>
                <tr>
                  <td style="padding: 8px 12px; font-weight: bold; color: #64748b;">Assigned Expert:</td>
                  <td style="padding: 8px 12px; color: #0F172A;">
                    ?? Verified field professional will be dispatched shortly by our ops team
                  </td>
                </tr>
              </table>

              <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 12px; margin-bottom: 20px;">
                <p style="margin: 0; font-size: 13px; color: #1e40af;">
                  <strong>Need immediate support or rescheduling?</strong><br/>
                  Call or WhatsApp our Central Indore Helpline: <a href="tel:+919229959827" style="color: #1d4ed8; font-weight: bold;">+91 92299 59827</a>
                </p>
              </div>

              <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-bottom: 0;">
                PlumberIndore ? 100% Satisfaction Guaranteed ? 30-Day Service Warranty
              </p>
            </div>
          </div>
        `;
      }

      // 1. Dispatch Admin Alert to configured admin recipients
      console.log(`[POST /api/bookings] Dispatching Brevo Admin Alert for #${bookingNo}...`);
      adminEmailResult = await sendBrevoEmail({
        to: ADMIN_NOTIFICATION_EMAIL,
        subject: `?? [NEW BOOKING] #${bookingNo} - ${primaryServiceName} (${name.trim()})`,
        htmlContent: adminHtml,
        replyTo: customerEmailAddress || ADMIN_NOTIFICATION_EMAIL,
        emailType: 'booking_admin_alert'
      });

      // 2. Dispatch Customer Confirmation if customer email is provided
      if (customerHtml && customerEmailAddress) {
        console.log(`[POST /api/bookings] Dispatching Brevo Customer Confirmation to ${customerEmailAddress} for #${bookingNo}...`);
        customerEmailResult = await sendBrevoEmail({
          to: customerEmailAddress,
          subject: `? Booking Confirmed: #${bookingNo} - PlumberIndore`,
          htmlContent: customerHtml,
          replyTo: ADMIN_NOTIFICATION_EMAIL,
          emailType: 'booking_customer_confirmation'
        });
      }
    } catch (emailErr) {
      console.error(`[POST /api/bookings EXCEPTION] Brevo dispatch exception for #${bookingNo}:`, emailErr);
    }

    // 5. Automated Partner Engine Dispatch & WhatsApp Broadcast
    let autoDispatchResult = null;
    let assignedWorkerRecord = null;
    try {
      const platformSettings = await getPlatformSettings();
      const isAutoDispatch = platformSettings?.auto_dispatch_broadcast !== false;

      if (isAutoDispatch) {
        const fleet = await getFleet();
        const isElectrical = primaryServiceName.toLowerCase().includes('electric');
        const determinedCategory = isElectrical ? 'Electrician' : 'Plumber';
        const zoneMatch = resolveAutoDispatchTechnician(address, pincode, determinedCategory);

        // Attempt to match zone/trade-preferred technician if online and free
        if (zoneMatch && zoneMatch.name) {
          const preferred = fleet.find(w => 
            w.name?.toLowerCase().includes(zoneMatch.name.toLowerCase()) || 
            zoneMatch.name?.toLowerCase().includes(w.name?.toLowerCase())
          );
          if (preferred && preferred.status === 'ONLINE_FREE' && !preferred.is_suspended && (Number(preferred.wallet_balance_paise || 0) >= 10000 || Number(preferred.wallet_balance_paise || 0) === 0)) {
            assignedWorkerRecord = preferred;
          }
        }

        // Fallback to any online and free technician if preferred is busy
        if (!assignedWorkerRecord) {
          if (isElectrical) {
            assignedWorkerRecord = fleet.find(w => w.status === 'ONLINE_FREE' && !w.is_suspended && (w.name?.toLowerCase().includes('electric') || (w.trade && w.trade.toLowerCase().includes('electric')))) || null;
          }
          if (!assignedWorkerRecord) {
            assignedWorkerRecord = fleet.find(w => w.status === 'ONLINE_FREE' && !w.is_suspended) || null;
          }
        }

        // Execute Partner Engine Dispatch
        const dispatchPayload = {
          customerName: name.trim(),
          customerPhone: cleanedPhone,
          customerWhatsapp: cleanedPhone,
          locality: zoneMatch?.localityMatch || 'Vijay Nagar',
          address: address.trim(),
          issue: `${primaryServiceName}: ${primaryPackageTitle}`,
          serviceCategory: determinedCategory,
          priority: 'Normal',
          preferredTime: `${scheduledDate} (${slot})`,
          preferredWorkerId: assignedWorkerRecord?.id || null,
          notes: rawNotes
        };

        autoDispatchResult = await dispatchJob(dispatchPayload, 'Auto-Dispatch');

        if (autoDispatchResult?.job) {
          const job = autoDispatchResult.job;
          // Update Supabase booking record with dispatch status and tracking link
          if (supabaseAdmin && createdBookingRecord?.id) {
            await supabaseAdmin.from('bookings').update({
              status: assignedWorkerRecord ? 'Assigned' : 'Pending',
              assigned_technician: assignedWorkerRecord?.name || null,
              technician_phone: assignedWorkerRecord?.phone || null
            }).or(`id.eq.${createdBookingRecord.id},booking_number.eq.${createdBookingRecord.booking_number || createdBookingRecord.id}`).catch(() => null);
          }

          createdBookingRecord.status = assignedWorkerRecord ? 'Assigned' : 'Pending';
          createdBookingRecord.assignedTechnician = assignedWorkerRecord ? {
            name: assignedWorkerRecord.name,
            phone: assignedWorkerRecord.phone,
            vehicle: assignedWorkerRecord.vehicle || zoneMatch?.vehicle
          } : null;
          createdBookingRecord.trackingUrl = job.tracking_token ? `/track/${job.tracking_token}` : null;
          createdBookingRecord.jobNumber = job.job_number;
        }
      }
    } catch (dispatchErr) {
      console.warn('[POST /api/bookings] Partner engine auto-dispatch notice:', dispatchErr.message);
    }

    return NextResponse.json({
      success: true,
      booking: createdBookingRecord,
      validatedPricing: pricing,
      status: createdBookingRecord.status || 'Pending',
      assignedTechnician: createdBookingRecord.assignedTechnician || null,
      trackingUrl: createdBookingRecord.trackingUrl || null,
      jobNumber: createdBookingRecord.jobNumber || null,
      autoDispatch: {
        enabled: true,
        dispatched: !!autoDispatchResult?.success,
        workerAssigned: assignedWorkerRecord?.name || null
      },
      emailDispatch: {
        adminAlert: adminEmailResult,
        customerConfirmation: customerEmailResult
      },
      message: assignedWorkerRecord 
        ? `Booking created & assigned to ${assignedWorkerRecord.name}. WhatsApp alert dispatched.`
        : 'Booking created and broadcast to partner engine.'
    });

  } catch (err) {
    console.error('Server error in POST /api/bookings:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
