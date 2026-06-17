import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    const clientIp = request.headers.get('x-forwarded-for') || '127.0.0.1';

    // General Rate Limit: 100 requests/minute
    const limit = await checkRateLimit(clientIp, 'general', 100, 60 * 1000);
    if (!limit.success) {
      return NextResponse.json({ error: 'Rate limit exceeded. Max 100 requests per minute.' }, { status: 429 });
    }

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    // 1. Check for lockout in rate_limits
    const { data: limitData } = await supabase
      .from('rate_limits')
      .select('*')
      .eq('ip_address', `dev_login_lock_${clientIp}`)
      .maybeSingle();

    if (limitData) {
      const lastAttempt = new Date(limitData.last_request_at).getTime();
      const now = Date.now();
      const lockoutDuration = 15 * 60 * 1000; // 15 minutes

      if (limitData.request_count >= 5 && now - lastAttempt < lockoutDuration) {
        const remainingMinutes = Math.ceil((lockoutDuration - (now - lastAttempt)) / 60000);
        return NextResponse.json({
          error: `Too many failed developer login attempts. Locked out. Try again in ${remainingMinutes} minutes.`
        }, { status: 429 });
      }
    }

    // 2. Validate developer credentials
    const correctUser = process.env.DEV_ADMIN_USERNAME || 'admin-nitro';
    const correctPass = process.env.DEV_ADMIN_PASSWORD || '#5050-165$';

    const isValidUser = username.toLowerCase().trim() === correctUser.toLowerCase().trim();
    const isValidPass = password === correctPass;

    if (isValidUser && isValidPass) {
      // Clear login attempts on success
      if (limitData) {
        await supabase
          .from('rate_limits')
          .delete()
          .eq('ip_address', `dev_login_lock_${clientIp}`);
      }

      // Log audit action
      await supabase.from('audit_logs').insert({
        action: 'Developer Login',
        performed_by: username,
        details: { ip: clientIp }
      });

      return NextResponse.json({
        success: true,
        token: 'authenticated-dev-session-token-hc',
        username: username
      });
    } else {
      // Increment failed attempts
      const currentCount = limitData ? limitData.request_count + 1 : 1;
      
      await supabase
        .from('rate_limits')
        .upsert({
          ip_address: `dev_login_lock_${clientIp}`,
          request_count: currentCount,
          last_request_at: new Date().toISOString()
        });

      // Log failed attempt audit
      await supabase.from('audit_logs').insert({
        action: 'Failed Developer Login Attempt',
        performed_by: username || 'unknown',
        details: { ip: clientIp, attempt_count: currentCount }
      });

      const remainingAttempts = Math.max(0, 5 - currentCount);
      return NextResponse.json({
        error: `Invalid credentials. ${remainingAttempts} attempts remaining before a 15-minute lockout.`
      }, { status: 401 });
    }
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
