import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { checkRateLimit } from '@/lib/rateLimit';

export const revalidate = 0; // Disable server-side caching for real-time toggle

export async function GET(request: NextRequest) {
  try {
    const clientIp = request.headers.get('x-forwarded-for') || '127.0.0.1';

    // General Rate Limit: 100 requests/minute
    const limit = await checkRateLimit(clientIp, 'general', 100, 60 * 1000);
    if (!limit.success) {
      return NextResponse.json({ error: 'Rate limit exceeded.' }, { status: 429 });
    }
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'maintenance_mode')
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message, maintenance: false }, { status: 500 });
    }

    const maintenanceValue = data?.value as { enabled?: boolean } | null;
    const enabled = maintenanceValue?.enabled ?? false;

    return NextResponse.json({ maintenance: enabled });
  } catch {
    return NextResponse.json({ maintenance: false });
  }
}
