import { getSupabaseAdmin } from '@/lib/supabase/client';

export interface RateLimitResult {
  success: boolean;
  count: number;
  remaining: number;
  resetTime: Date;
}

/**
 * Checks and increments rate limit counter for a given IP address.
 * 
 * @param ip IP address of the client
 * @param limitKey Identifier for the rate limit (e.g. 'general', 'streak_search')
 * @param maxRequests Maximum allowed requests within the window
 * @param windowMs Window duration in milliseconds
 */
export async function checkRateLimit(
  ip: string,
  limitKey: string,
  maxRequests: number,
  windowMs: number
): Promise<RateLimitResult> {
  const adminSupabase = getSupabaseAdmin();
  const dbKey = `${limitKey}_${ip}`;
  
  const { data: record, error } = await adminSupabase
    .from('rate_limits')
    .select('*')
    .eq('ip_address', dbKey)
    .maybeSingle();

  const now = new Date();

  if (record) {
    const lastRequest = new Date(record.last_request_at).getTime();
    const timeDiff = now.getTime() - lastRequest;

    if (timeDiff > windowMs) {
      // Cooldown expired: Reset count to 1 and update timestamp
      await adminSupabase
        .from('rate_limits')
        .update({
          request_count: 1,
          last_request_at: now.toISOString()
        })
        .eq('ip_address', dbKey);

      return {
        success: true,
        count: 1,
        remaining: maxRequests - 1,
        resetTime: new Date(now.getTime() + windowMs)
      };
    } else {
      // Inside active window: Check count
      if (record.request_count >= maxRequests) {
        return {
          success: false,
          count: record.request_count,
          remaining: 0,
          resetTime: new Date(lastRequest + windowMs)
        };
      }

      const newCount = record.request_count + 1;
      await adminSupabase
        .from('rate_limits')
        .update({
          request_count: newCount
        })
        .eq('ip_address', dbKey);

      return {
        success: true,
        count: newCount,
        remaining: maxRequests - newCount,
        resetTime: new Date(lastRequest + windowMs)
      };
    }
  } else {
    // First request: Insert record
    await adminSupabase
      .from('rate_limits')
      .insert({
        ip_address: dbKey,
        request_count: 1,
        last_request_at: now.toISOString()
      });

    return {
      success: true,
      count: 1,
      remaining: maxRequests - 1,
      resetTime: new Date(now.getTime() + windowMs)
    };
  }
}
