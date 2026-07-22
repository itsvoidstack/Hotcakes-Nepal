import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/client';

export const revalidate = 0;

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('order_links')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.error('Order links route error:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      links: data || []
    });
  } catch (error) {
    console.error('Order links route error:', error);
    return NextResponse.json(
      { success: false, links: [] },
      { status: 500 }
    );
  }
}
