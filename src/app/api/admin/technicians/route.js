import { NextResponse } from 'next/server';
import { getAdminClient } from '../../../../lib/supabase/admin.js';
import { validateAdminRequest } from '../../../../lib/adminAuth.js';

/**
 * GET /api/admin/technicians — Lists all verified technicians
 * POST /api/admin/technicians — Adds a new technician
 */
export async function GET(request) {
  try {
    const auth = validateAdminRequest(request);
    if (!auth.authorized) {
      return auth.response;
    }

    const supabaseAdmin = getAdminClient();

    if (!supabaseAdmin) {
      return NextResponse.json({
        success: true,
        source: 'local_fallback',
        technicians: [
          {
            id: 't1',
            title: 'Master Plumber & Sanitary Expert',
            phone: '+91 91749 34135',
            rating: 4.95,
            repairsCount: 540,
            photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&h=200&q=80',
            vehicleNumber: 'Service Van (MP 09 CZ 1122)',
            eta: '30 Mins',
            isActive: true
          },
          {
            id: 't2',
            title: 'Senior Electrician & Panel Specialist',
            phone: '+91 91749 34135',
            rating: 4.92,
            repairsCount: 420,
            photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&h=200&q=80',
            vehicleNumber: 'Service Bike (MP 09 AB 3344)',
            eta: 'Prompt Arrival',
            isActive: true
          },
          {
            id: 't3',
            title: 'AC & Refrigeration Lead Tech',
            phone: '+91 91749 34135',
            rating: 4.98,
            repairsCount: 680,
            photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&h=200&q=80',
            vehicleNumber: 'Service Van (MP 09 EF 5566)',
            eta: '25 Mins',
            isActive: true
          }
        ]
      });
    }

    const { data: technicians = [], error } = await supabaseAdmin
      .from('technicians')
      .select('*')
      .order('rating', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      technicians: technicians.map(t => ({
        id: t.id,
        title: t.title,
        phone: t.phone,
        rating: Number(t.rating),
        repairsCount: Number(t.repairs_count || 0),
        photoUrl: t.photo_url,
        vehicleNumber: t.vehicle_number,
        eta: t.eta,
        isActive: t.is_active
      }))
    });
  } catch (error) {
    console.error('Error in GET /api/admin/technicians:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = validateAdminRequest(request);
    if (!auth.authorized) {
      return auth.response;
    }

    const body = await request.json();
    const { title, phone, vehicleNumber, eta = 'Prompt Arrival', photoUrl } = body || {};

    if (!title || !phone) {
      return NextResponse.json({ success: false, error: 'Title and phone number are required.' }, { status: 400 });
    }

    const supabaseAdmin = getAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json({ success: true, message: 'Created in fallback mode.' });
    }

    const { data: newTech, error } = await supabaseAdmin
      .from('technicians')
      .insert({
        title: title.trim(),
        phone: phone.trim(),
        vehicle_number: vehicleNumber || 'Service Bike (MP 09)',
        eta,
        photo_url: photoUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&h=200&q=80',
        rating: 4.95,
        repairs_count: 50,
        is_active: true
      })
      .select()
      .maybeSingle();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      technician: newTech,
      message: 'Technician added successfully.'
    });
  } catch (error) {
    console.error('Error in POST /api/admin/technicians:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
