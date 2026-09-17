import { NextResponse } from 'next/server';
import { getAdminClient } from '../../../lib/supabase/admin.js';
import { calculateServerPrice } from '../../../lib/pricing.js';
import { sendEmail, ADMIN_NOTIFICATION_RECIPIENTS, ADMIN_NOTIFICATION_EMAIL } from '../../../utils/brevo.js';

/**
 * GET /api/bookings
 * Retrieves bookings from Supabase PostgreSQL.
 * Filters by customerPhone, customerEmail, status, or booking_number if provided.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');
    const email = searchParams.get('email');
    const status = searchParams.get('status');
    const bookingNumber = searchParams.get('bookingNumber');

    const supabaseAdmin = getAdminClient();

    if (!supabaseAdmin) {
      // Graceful fallback if Supabase env is not configured yet
      return NextResponse.json({
        success: true,
        source: 'local_fallback',
        bookings: []
      });
    }

    let query = supabaseAdmin
      .from('bookings')
      .select(`
        *,
        items:booking_items(*),
        invoices(*),
        payments(*)
      `)
      .order('created_at', { ascending: false });

    if (bookingNumber) {
      query = query.eq('booking_number', bookingNumber);
    }
    if (phone) {
      query = query.eq('customer_phone', phone);
    }
    if (email) {
      query = query.eq('customer_email', email);
    }
    if (status && status !== 'ALL') {
      if (status === 'PAID') {
        query = query.eq('payment_status', 'Paid');
      } else if (status === 'PENDING') {
        query = query.neq('payment_status', 'Paid');
      } else {
        query = query.eq('status', status);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase fetch bookings error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      source: 'supabase',
      bookings: data || []
    });

  } catch (err) {
    console.error('Server error in GET /api/bookings:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/bookings
 * Creates a new doorstep booking record in Supabase.
 * Strictly calculates and validates prices server-side.
 */
import { checkRateLimit, sanitizeString, validateIndianPhone, validateEmail, validatePincode, getClientIp } from '../../../lib/security.js';
import { IS_BOOKING_ENABLED, SERVICE_UNAVAILABLE_MESSAGE } from '../../../config/serviceArea.js';


/**
 * Auto-Dispatches certified field technicians based on Indore operational zones.
 * - Zone 1: Rau, Mhow, Bhawarkua, Bijalpur, Rajendra Nagar, Sudama Nagar, Tejaji Nagar, Nimbodi
 *   -> Ajay Mahajan (+91 84595 59141)
 * - Zone 2: Bicholi Mardana
 *   -> Pankaj Sharma (+91 98267 43299)
 * - Default / Fallback: Central / Core Indore
 *   -> Ajay Mahajan (+91 84595 59141)
 */
export function resolveAutoDispatchTechnician(address = '', pincode = '') {
  const normAddress = (address || '').toLowerCase();
  const normPincode = (pincode || '').toString().trim();

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

export async function POST(request) {
  try {
    // 0. Global Emergency Suspension / Availability Check
    if (!IS_BOOKING_ENABLED) {
      return NextResponse.json(
        { 
          success: false, 
          error: SERVICE_UNAVAILABLE_MESSAGE,
          suspended: true 
        }, 
        { status: 503 }
      );
    }

    // 1. Rate Limiting (Max 10 bookings per minute per IP)
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`booking_${ip}`, 10, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many booking attempts. Please wait a minute.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const rawName = body?.name;
    const rawPhone = body?.phone;
    const rawEmail = body?.email;
    const rawAddress = body?.address;
    const rawPincode = body?.pincode;
    const rawDate = body?.date;
    const rawTimeSlot = body?.timeSlot;
    const services = Array.isArray(body?.services) ? body.services : [];
    const description = sanitizeString(body?.description);
    const serviceId = sanitizeString(body?.serviceId);
    const serviceName = sanitizeString(body?.serviceName);
    const packageTitle = sanitizeString(body?.packageTitle);

    const name = sanitizeString(rawName);
    const address = sanitizeString(rawAddress);
    const cleanedPhone = validateIndianPhone(rawPhone);
    const email = validateEmail(rawEmail);
    const pincode = validatePincode(rawPincode);
    const date = sanitizeString(rawDate);
    const timeSlot = sanitizeString(rawTimeSlot);

    // 1. Mandatory field validations
    if (!name || name.length < 2) {
      return NextResponse.json({ success: false, error: 'Full name is required.' }, { status: 400 });
    }

    if (!cleanedPhone) {
      return NextResponse.json({ success: false, error: 'A valid 10-digit Indian mobile number is required.' }, { status: 400 });
    }

    if (!address || address.length < 5) {
      return NextResponse.json({ success: false, error: 'Doorstep service address is required (min 5 characters).' }, { status: 400 });
    }

    // 2. Server-side price calculation
    const requestedServices = services.length > 0 ? services : [{
      serviceId: serviceId || 'plumbing',
      serviceName: serviceName || 'Plumbing',
      packageTitle: packageTitle || 'Standard Inspection & Diagnostics',
      quantity: 1
    }];

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

            const { error: itemsErr } = await supabaseAdmin.from('booking_items').insert(itemsToInsert);
            if (itemsErr) {
              console.warn('Booking items line insert notice:', itemsErr.message);
            }
          }
        }
      } catch (dbEx) {
        console.error('Supabase booking transaction exception:', dbEx.message);
        return NextResponse.json({
          success: false,
          error: `Database connection error: ${dbEx.message}`
        }, { status: 500 });
      }
    }

    // 4. Dispatch Email Notifications via Brevo (Non-blocking on error)
    let adminEmailResult = null;
    let customerEmailResult = null;
    const bookingNo = createdBookingRecord.booking_number || randomBookingNumber;
    const customerEmailAddress = (email || '').trim();

    try {
      // Admin Alert HTML
      const adminEmailSubject = `[NEW PLUMBER BOOKING] #${bookingNo} - ${primaryServiceName} (${name.trim()})`;
      const adminEmailHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #0f172a;">
          <div style="background-color: #0f172a; padding: 20px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: #fbbf24; margin: 0; font-size: 22px; font-weight: 800;">Plumber<span style="color: #ffffff;">Indore</span></h1>
            <p style="color: #94a3b8; font-size: 12px; margin: 4px 0 0 0;">Real-time Doorstep Booking Alert</p>
          </div>
          <div style="padding: 24px 16px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <span style="background-color: #fef3c7; color: #92400e; font-size: 12px; font-weight: 800; padding: 6px 14px; border-radius: 9999px; border: 1px solid #fde68a;">
                ⚡ NEW BOOKING RECEIVED (#${bookingNo})
              </span>
              <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 12px 0 4px 0;">New Appointment Created</h2>
              <p style="font-size: 13px; color: #64748b; margin: 0;">Instant notification dispatched via Brevo</p>
            </div>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; background-color: #f8fafc; border-radius: 12px; font-size: 13px;">
              <tr>
                <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #64748b; width: 35%;">Customer Name:</td>
                <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #0f172a;">${name.trim()}</td>
              </tr>
              <tr>
                <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #64748b;">Phone:</td>
                <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #2563eb;">
                  <a href="tel:${cleanedPhone}" style="color: #2563eb; text-decoration: none;">${cleanedPhone}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #64748b;">Customer Email:</td>
                <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #0f172a;">${customerEmailAddress || 'Not provided'}</td>
              </tr>
              <tr>
                <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #64748b;">Service Booked:</td>
                <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #0f172a;">${primaryServiceName} (${primaryPackageTitle})</td>
              </tr>
              <tr>
                <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #64748b;">Scheduled Slot:</td>
                <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #d97706;">${scheduledDate}, ${slot}</td>
              </tr>
              <tr>
                <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #64748b;">Service Address:</td>
                <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #0f172a;">${address.trim()} (Pincode: ${pincode || '452010'})</td>
              </tr>
              <tr>
                <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #64748b;">Dispatch Status:</td>
                <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #d97706;">
                  ⚠️ Pending Dispatch (Manual Allocation from Ops Portal)
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #64748b;">Issue Notes:</td>
                <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #0f172a;">${description || 'Standard doorstep appointment'}</td>
              </tr>
              <tr>
                <td style="padding: 12px 16px; font-weight: bold; color: #64748b;">Total Price:</td>
                <td style="padding: 12px 16px; font-weight: 800; font-size: 16px; color: #059669;">₹${totalAmount} <span style="font-size: 11px; font-weight: normal; color: #64748b;">(Cash / UPI on Doorstep)</span></td>
              </tr>
            </table>
            <div style="text-align: center; margin-top: 16px;">
              <a href="https://www.plumberindore.in/portal-indore-ops-9821" style="background-color: #0f172a; color: #ffffff; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 13px; display: inline-block;">
                Open Indore Ops Console to Assign Technician →
              </a>
            </div>
          </div>
        </div>
      `;

      // Customer Confirmation HTML
      const customerEmailSubject = `[PlumberIndore Booking Received] #${bookingNo} - ${primaryServiceName}`;
      const customerEmailHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #0f172a;">
          <div style="background-color: #0f172a; padding: 20px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: #fbbf24; margin: 0; font-size: 22px; font-weight: 800;">Plumber<span style="color: #ffffff;">Indore</span></h1>
            <p style="color: #94a3b8; font-size: 12px; margin: 4px 0 0 0;">Doorstep Plumbing & Home Services</p>
          </div>
          <div style="padding: 24px 16px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <span style="background-color: #ecfdf5; color: #047857; font-size: 12px; font-weight: 800; padding: 6px 14px; border-radius: 9999px; border: 1px solid #a7f3d0;">
                ✓ BOOKING RECEIVED (#${bookingNo})
              </span>
              <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 12px 0 4px 0;">Appointment Confirmed!</h2>
              <p style="font-size: 13px; color: #64748b; margin: 0;">Hello ${name.trim()}, your doorstep appointment request has been scheduled.</p>
            </div>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; background-color: #f8fafc; border-radius: 12px; font-size: 13px;">
              <tr>
                <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #64748b; width: 35%;">Service(s):</td>
                <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #0f172a;">${primaryServiceName} (${primaryPackageTitle})</td>
              </tr>
              <tr>
                <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #64748b;">Scheduled Slot:</td>
                <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #d97706;">${scheduledDate}, ${slot}</td>
              </tr>
              <tr>
                <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #64748b;">Doorstep Address:</td>
                <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #0f172a;">${address.trim()} (${pincode || 'Indore'})</td>
              </tr>
              <tr>
                <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #64748b;">Technician Allocation:</td>
                <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #0f172a;">
                  👷 Verified field professional will be dispatched shortly by our ops team
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 16px; font-weight: bold; color: #64748b;">Total Amount Due:</td>
                <td style="padding: 12px 16px; font-weight: 800; font-size: 16px; color: #059669;">₹${totalAmount} <span style="font-size: 11px; font-weight: normal; color: #64748b;">(Pay on Doorstep Completion)</span></td>
              </tr>
            </table>
            <div style="background-color: #fef3c7; border: 1px solid #fde68a; border-radius: 12px; padding: 14px; text-align: center; font-size: 12px; color: #92400e;">
              <strong>Doorstep Guarantee:</strong> Prompt Doorstep Arrival • Transparent Fixed Rates • 30-Day Service Warranty
            </div>
          </div>
        </div>
      `;

      // 1. Dispatch Admin Alert to configured admin recipients
      console.log(`[POST /api/bookings] Dispatching Brevo Admin Alert for #${bookingNo}...`);
      adminEmailResult = await sendEmail({
        to: ADMIN_NOTIFICATION_RECIPIENTS,
        subject: adminEmailSubject,
        html: adminEmailHtml,
        replyTo: customerEmailAddress || ADMIN_NOTIFICATION_EMAIL,
        emailType: 'booking_admin_alert'
      });

      // 2. Dispatch Customer Confirmation if customer email is provided
      if (customerEmailAddress && !ADMIN_NOTIFICATION_RECIPIENTS.includes(customerEmailAddress.toLowerCase())) {
        console.log(`[POST /api/bookings] Dispatching Brevo Customer Confirmation to ${customerEmailAddress} for #${bookingNo}...`);
        customerEmailResult = await sendEmail({
          to: customerEmailAddress,
          subject: customerEmailSubject,
          html: customerEmailHtml,
          replyTo: ADMIN_NOTIFICATION_EMAIL,
          emailType: 'booking_customer_confirmation'
        });
      }
    } catch (emailErr) {
      console.error(`[POST /api/bookings EXCEPTION] Brevo dispatch exception for #${bookingNo}:`, emailErr);
    }

    return NextResponse.json({
      success: true,
      booking: createdBookingRecord,
      validatedPricing: pricing,
      status: 'Pending',
      assignedTechnician: null,
      emailDispatch: {
        adminAlert: adminEmailResult,
        customerConfirmation: customerEmailResult
      },
      message: 'Booking created successfully. Defaulted to Pending for manual dispatch.'
    });

  } catch (err) {
    console.error('Server error in POST /api/bookings:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
