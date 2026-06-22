import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/client';

function isAuthorized(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  return authHeader === 'Bearer authenticated-session-token-hc';
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data: records, error } = await supabase
      .from('streak_records')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Streak GET fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const totalCustomers = records.length;
    const totalStamps = records.reduce((sum, r) => sum + (r.streak_count || 0), 0);
    const totalActiveRewards = records.filter(r => r.streak_count >= 10).length;

    return NextResponse.json({
      success: true,
      metrics: {
        total_customers: totalCustomers,
        total_stamps: totalStamps,
        total_active_rewards: totalActiveRewards
      },
      records
    });
  } catch (err) {
    console.error('Streak API GET unexpected error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, phone_number, customer_code } = body;

    const supabase = getSupabaseAdmin();

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    // Lookup Profile using parameterized queries
    if (action === 'search') {
      let queryBuilder = supabase
        .from('streak_records')
        .select('*');

      const searchVal = (phone_number || customer_code || '').trim();
      const isCode = /^HC-[0-9]{4}$/i.test(searchVal);

      if (isCode) {
        queryBuilder = queryBuilder.eq('customer_code', searchVal);
      } else {
        queryBuilder = queryBuilder.eq('phone_number', searchVal);
      }

      const { data: record, error } = await queryBuilder.maybeSingle();

      if (error) {
        console.error('Streak search error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, record });
    }

    // Add Stamp (+1)
    if (action === 'stamp') {
      if (!phone_number) {
        return NextResponse.json({ error: 'Phone number is required to add stamp' }, { status: 400 });
      }

      // Validate phone number format (at least 10 characters long, containing only digits, spaces, dashes, or leading +)
      const cleanPhone = phone_number.trim();
      const phoneRegex = /^\+?[0-9\s\-]{10,20}$/;
      if (!phoneRegex.test(cleanPhone)) {
        return NextResponse.json({ error: 'Invalid phone number format. Must be at least 10 characters (digits, spaces, or dashes).' }, { status: 400 });
      }

      // Find existing
      const { data: record, error: findError } = await supabase
        .from('streak_records')
        .select('*')
        .eq('phone_number', cleanPhone)
        .maybeSingle();

      if (findError) {
        console.error('Streak find error:', findError);
        return NextResponse.json({ error: findError.message }, { status: 500 });
      }

      const now = new Date();

      if (record) {
        // Enforce 24h restriction
        if (record.last_stamp_at) {
          const lastStamp = new Date(record.last_stamp_at).getTime();
          const timeDiff = now.getTime() - lastStamp;
          const hours24 = 24 * 60 * 60 * 1000;

          if (timeDiff < hours24) {
            const nextStampTime = new Date(lastStamp + hours24);
            const remainingHours = Math.ceil((hours24 - timeDiff) / (60 * 60 * 1000));
            return NextResponse.json({
              error: `Already stamped within the last 24 hours. Next stamp available in ${remainingHours} hours at ${nextStampTime.toLocaleTimeString()}.`
            }, { status: 400 });
          }
        }

        // Increment stamp
        const newCount = record.streak_count >= 10 ? 1 : record.streak_count + 1; // resets/wraps to 1 or caps. Let's make it increment, cap at 10.
        const updatedCount = Math.min(10, newCount);

        const { data: updated, error: updateError } = await supabase
          .from('streak_records')
          .update({
            streak_count: updatedCount,
            last_stamp_at: now.toISOString(),
            updated_at: now.toISOString()
          })
          .eq('id', record.id)
          .select()
          .single();

        if (updateError) {
          console.error('Streak update error:', updateError);
          return NextResponse.json({ error: updateError.message }, { status: 500 });
        }
        return NextResponse.json({ success: true, record: updated });
      } else {
        // Create new profile
        const randomCode = 'HC-' + Math.floor(1000 + Math.random() * 9000);
        
        const { data: created, error: createError } = await supabase
          .from('streak_records')
          .insert({
            phone_number: cleanPhone,
            customer_code: randomCode,
            streak_count: 1,
            last_stamp_at: now.toISOString()
          })
          .select()
          .single();

        if (createError) {
          console.error('Streak create error:', createError);
          return NextResponse.json({ error: createError.message }, { status: 500 });
        }
        return NextResponse.json({ success: true, record: created });
      }
    }

    // Reset Stamp Count to 0
    if (action === 'reset') {
      if (!customer_code) {
        return NextResponse.json({ error: 'Customer code is required to reset' }, { status: 400 });
      }

      const { data: updated, error: resetError } = await supabase
        .from('streak_records')
        .update({
          streak_count: 0,
          updated_at: new Date().toISOString()
        })
        .eq('customer_code', customer_code)
        .select()
        .single();

      if (resetError) {
        console.error('Streak reset error:', resetError);
        return NextResponse.json({ error: resetError.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, record: updated });
    }

    // Delete customer profile
    if (action === 'delete') {
      if (!customer_code) {
        return NextResponse.json({ error: 'Customer code is required to delete' }, { status: 400 });
      }

      const { error: deleteError } = await supabase
        .from('streak_records')
        .delete()
        .eq('customer_code', customer_code);

      if (deleteError) {
        console.error('Streak delete error:', deleteError);
        return NextResponse.json({ error: deleteError.message }, { status: 500 });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid streak action' }, { status: 400 });
  } catch (err) {
    console.error('Streak API unexpected error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
