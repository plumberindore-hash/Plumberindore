import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, phone, email, password } = body;

    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Please enter your full name.' },
        { status: 400 }
      );
    }

    const cleanPhone = (phone || '').replace(/\D/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      return NextResponse.json(
        { error: 'Please enter a valid 10-digit Indian mobile number.' },
        { status: 400 }
      );
    }

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    const userSession = {
      id: `usr_${cleanPhone}`,
      name: name.trim(),
      phone: `+91 ${cleanPhone}`,
      email: email.toLowerCase().trim(),
      role: 'customer',
      authMethod: 'signup',
      authenticatedAt: new Date().toISOString()
    };

    // Synchronize with Supabase profiles
    try {
      const { getAdminClient } = await import('../../../../lib/supabase/admin.js');
      const supabaseAdmin = getAdminClient();
      if (supabaseAdmin) {
        await supabaseAdmin.from('profiles').upsert({
          full_name: name.trim(),
          phone: `+91 ${cleanPhone}`,
          email: email.toLowerCase().trim(),
          role: 'customer'
        }, { onConflict: 'email' });
      }
    } catch (dbEx) {
      console.warn('Supabase profile sync warning:', dbEx.message);
    }

    // Send Welcome Email via Brevo
    try {
      const { sendEmail, ADMIN_NOTIFICATION_EMAIL } = await import('../../../../utils/brevo.js');
      const welcomeHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <div style="background-color: #0f172a; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: #fbbf24; margin: 0; font-size: 22px;">Plumber<span style="color: #ffffff;">Indore</span></h1>
            <p style="color: #94a3b8; font-size: 13px; margin: 4px 0 0 0;">Welcome to Indore's #1 Doorstep Plumbing Network</p>
          </div>
          <div style="padding: 24px 12px;">
            <h2 style="font-size: 18px; color: #0f172a; margin-top: 0;">Welcome aboard, ${name.trim()}!</h2>
            <p style="color: #475569; font-size: 14px; line-height: 1.6;">Thank you for creating an account with Plumber Indore. You can now book verified doorstep plumbers in 60 seconds with 45-minute arrival guarantee and 30-day warranty across all Indore localities.</p>
            <div style="margin: 24px 0; text-align: center;">
              <a href="https://www.plumberindore.in/book" style="background-color: #0f172a; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">
                Book Your First Service →
              </a>
            </div>
            <p style="font-size: 12px; color: #94a3b8; text-align: center;">Need urgent help? Call our 24/7 hotline at <a href="tel:+919174934135" style="color: #2563eb;">+91 91749 34135</a>.</p>
          </div>
        </div>
      `;

      await sendEmail({
        to: email.toLowerCase().trim(),
        subject: 'Welcome to Plumber Indore - Doorstep Plumbing Made Easy!',
        html: welcomeHtml,
        replyTo: ADMIN_NOTIFICATION_EMAIL,
        emailType: 'auth_welcome'
      });
    } catch (mailErr) {
      console.warn('[POST /api/auth/signup] Brevo welcome email notice:', mailErr);
    }

    return NextResponse.json({
      success: true,
      user: userSession,
      message: 'Account created successfully!'
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Server error creating account.' },
      { status: 500 }
    );
  }
}
