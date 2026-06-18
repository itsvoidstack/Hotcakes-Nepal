import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { checkRateLimit } from '@/lib/rateLimit';

export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const clientIp = request.headers.get('x-forwarded-for') || '127.0.0.1';

    // 1. General Rate Limit: 100 requests/minute
    const limit = await checkRateLimit(clientIp, 'general', 100, 60 * 1000);
    if (!limit.success) {
      return NextResponse.json({ error: 'Rate limit exceeded.' }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const redirectPlatform = searchParams.get('redirect');

    if (redirectPlatform) {
      // Fetch specifically for the redirect platform
      const { data: record, error } = await supabase
        .from('contact_info')
        .select('value')
        .eq('key', redirectPlatform)
        .maybeSingle();

      if (error || !record || !record.value) {
        return NextResponse.json({ error: 'Contact link not configured' }, { status: 404 });
      }

      let url = record.value;
      if (redirectPlatform === 'whatsapp') {
        url = `https://wa.me/${record.value.replace(/[^0-9]/g, '')}`;
      }

      // Perform server-side redirect to hide raw destination link from source inspect
      return NextResponse.redirect(url, 307);
    }

    // Otherwise return contact details
    const { data: contacts, error } = await supabase
      .from('contact_info')
      .select('key, value');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Mask phone/details for initial render
    const maskedContacts = (contacts || []).map(item => {
      if (item.key === 'phone') {
        return {
          key: item.key,
          value: item.value // Public display phone
        };
      }
      return {
        key: item.key,
        value: `/api/contact-info?redirect=${item.key}` // Return the hidden redirect endpoint
      };
    });

    return NextResponse.json({ contacts: maskedContacts });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
