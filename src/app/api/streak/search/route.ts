import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { checkRateLimit } from '@/lib/rateLimit';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim();
    const clientIp = request.headers.get('x-forwarded-for') || '127.0.0.1';

    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    // 1. General Rate Limit: 100 requests/minute
    const generalLimit = await checkRateLimit(clientIp, 'general', 100, 60 * 1000);
    if (!generalLimit.success) {
      return NextResponse.json({ error: 'Rate limit exceeded. Max 100 requests per minute.' }, { status: 429 });
    }

    // 2. Search Rate Limit: 10 requests/hour
    const searchLimit = await checkRateLimit(clientIp, 'streak_search', 10, 60 * 60 * 1000);
    if (!searchLimit.success) {
      const minsRemaining = Math.ceil((searchLimit.resetTime.getTime() - Date.now()) / (60 * 1000));
      return NextResponse.json({
        error: `Too many lookup attempts. Streak search is rate limited to 10 requests per hour. Try again in ${minsRemaining} minutes.`
      }, { status: 429 });
    }

    // Lookup by phone number OR customer code using parameterized queries
    const isCode = /^HC-[0-9]{4}$/i.test(query);
    let queryBuilder = supabase
      .from('streak_records')
      .select('customer_code, phone_number, streak_count, last_stamp_at');

    if (isCode) {
      queryBuilder = queryBuilder.eq('customer_code', query);
    } else {
      queryBuilder = queryBuilder.eq('phone_number', query);
    }

    const { data: record, error } = await queryBuilder.maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!record) {
      return NextResponse.json({ found: false });
    }

    // Mask phone number (e.g. 98*****532) for privacy
    const rawPhone = record.phone_number;
    let maskedPhone = rawPhone;
    if (rawPhone.length > 5) {
      maskedPhone = rawPhone.substring(0, 2) + '*'.repeat(rawPhone.length - 5) + rawPhone.substring(rawPhone.length - 3);
    }

    return NextResponse.json({
      found: true,
      customer_code: record.customer_code,
      phone_number: maskedPhone,
      streak_count: record.streak_count,
      last_stamp_at: record.last_stamp_at,
    });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
