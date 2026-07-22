import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json(
        { success: false, error: 'Missing key parameter' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', key)
      .maybeSingle();

    if (error) {
      console.error('Settings route error:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      value: data?.value || null
    });
  } catch (error) {
    console.error('Settings route error:', error);
    return NextResponse.json(
      { success: false, value: null },
      { status: 500 }
    );
  }
}
