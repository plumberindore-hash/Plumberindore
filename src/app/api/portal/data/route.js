import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase/admin';

// Default mock fleet for resilience if Supabase is offline or not configured
const DEFAULT_FLEET = [
  { id: 'TECH-IND-01', name: 'Ansh Patidar', phone: '+91 93435 05454', locality: 'All over Indore', status: 'Online (Free)', activeJob: 'None', todayEarnings: 0, rating: 4.99, token: 'ansh_5454' },
  { id: 'TECH-IND-02', name: 'Ajay Mahajan', phone: '+91 84595 59141', locality: 'Rau / Bhawarkua', status: 'Online (Free)', activeJob: 'None', todayEarnings: 0, rating: 4.96, token: 'ajay_9141' },
  { id: 'TECH-IND-03', name: 'Pankaj Sharma', phone: '+91 98267 43299', locality: 'Bicholi Mardana', status: 'Online (Free)', activeJob: 'None', todayEarnings: 0, rating: 4.94, token: 'pankaj_4329' },
  { id: 'TECH-IND-04', name: 'Saurabh Electrician', phone: '+91 78697 09526', locality: 'Vijay Nagar', status: 'Online (Free)', activeJob: 'None', todayEarnings: 0, rating: 4.98, token: 'saurabh_9526' },
  { id: 'TECH-IND-05', name: 'Saifee Khozema', phone: '+91 98267 27487', locality: 'Khatiwala Tank', status: 'Online (Free)', activeJob: 'None', todayEarnings: 0, rating: 4.97, token: 'saifee_7487' },
  { id: 'TECH-IND-06', name: 'Vansh Budhlani', phone: '+91 95898 18490', locality: 'Sudama Nagar', status: 'Online (Free)', activeJob: 'None', todayEarnings: 0, rating: 4.96, token: 'vansh_8490' },
  { id: 'TECH-IND-07', name: 'Ramiz Electrician', phone: '+91 88894 48805', locality: 'Khajrana', status: 'Online (Free)', activeJob: 'None', todayEarnings: 0, rating: 4.95, token: 'ramiz_8805' },
  { id: 'TECH-IND-08', name: 'Aman Mansuri', phone: '+91 70007 72445', locality: 'Chandan Nagar', status: 'Online (Free)', activeJob: 'None', todayEarnings: 0, rating: 4.95, token: 'aman_2445' },
  { id: 'TECH-IND-09', name: 'Arjun Solanki', phone: '+91 97536 28898', locality: 'Vijay Nagar / All over Indore', status: 'Online (Free)', activeJob: 'None', todayEarnings: 0, rating: 4.98, token: 'arjun_2889', trade: 'Chimney & Gas Stove' },
  { id: 'TECH-IND-10', name: 'Shubham Parmar', phone: '+91 70890 05616', locality: 'Vijay Nagar / Scheme 136', status: 'Online (Free)', activeJob: 'None', todayEarnings: 0, rating: 4.96, token: 'shubham_5616', trade: 'Electrician' },
  { id: 'TECH-IND-11', name: 'Suraj Kevat', phone: '+91 99776 37485', locality: 'Indore / Dewas / Ujjain', status: 'Online (Free)', activeJob: 'None', todayEarnings: 0, rating: 4.95, token: 'suraj_7485', trade: 'Plumbing' },
  { id: 'TECH-IND-12', name: 'Shekhar Parmar', phone: '+91 99933 28634', locality: 'Bijalpur / Rajendra Nagar / Khandwa Road', status: 'Online (Free)', activeJob: 'None', todayEarnings: 0, rating: 4.96, token: 'shekhar_8634', trade: 'Plumbing' },
  { id: 'TECH-IND-13', name: 'Yogesh Mahajan', phone: '+91 76202 88230', locality: 'Bholaram Ustad Marg / Bhawarkua / Palasia / Vijay Nagar', status: 'Online (Free)', activeJob: 'None', todayEarnings: 0, rating: 4.97, token: 'yogesh_8230', trade: 'Plumbing' }
];

export async function GET(request) {
  try {
    // 1. Fetch bookings
    let bookings = [];
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (!error && data) {
        bookings = data;
      }
    }

    // 2. Fetch fleet workers
    let fleet = DEFAULT_FLEET;
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('workers')
        .select('*')
        .order('name');
      if (!error && data && data.length > 0) {
        // Map database workers to portal fleet format
        const dbFleet = data.map((w, idx) => ({
          id: w.id || `TECH-IND-0${idx + 1}`,
          name: w.name,
          phone: w.phone,
          locality: w.locality || 'All over Indore',
          status: w.status === 'ONLINE_FREE' ? 'Online (Free)' : w.status === 'BUSY' ? 'Busy (On Job)' : 'Offline',
          activeJob: w.active_job_id ? `Job #${w.active_job_id.slice(0, 6)}` : 'None',
          todayEarnings: Math.round((w.today_earnings_paise || 0) / 100),
          rating: w.rating || 4.95,
          token: w.token || w.name.toLowerCase().replace(/[^a-z0-9]/g, '_')
        }));

        // Merge DEFAULT_FLEET so newly configured technicians (Arjun, Shubham, Suraj, Shekhar, Yogesh)
        // are never hidden if Supabase workers table only contains the initial subset
        const dbNames = new Set(dbFleet.map(w => w.name.toLowerCase().trim()));
        const unseeded = DEFAULT_FLEET.filter(df => !dbNames.has(df.name.toLowerCase().trim()));
        fleet = [...dbFleet, ...unseeded];
      }
    }

    // 3. Stats calculation
    const totalBookings = bookings.length;
    const completedBookings = bookings.filter(b => b.status === 'COMPLETED').length;
    const inProgressBookings = bookings.filter(b => ['ASSIGNED', 'IN_PROGRESS', 'DISPATCHED'].includes(b.status)).length;
    const pendingBookings = bookings.filter(b => ['PENDING', 'SEARCHING_WORKER'].includes(b.status)).length;

    return NextResponse.json({
      success: true,
      data: {
        bookings,
        fleet,
        stats: {
          totalBookings,
          completedBookings,
          inProgressBookings,
          pendingBookings,
          activeTechnicians: fleet.filter(f => f.status.includes('Online')).length
        }
      }
    });
  } catch (err) {
    console.error('Ops Portal data error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
