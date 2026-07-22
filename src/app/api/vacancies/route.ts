import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/client';

export const revalidate = 0;

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data: vacancies, error } = await supabase
      .from('vacancies')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.error('VACANCIES ROUTE ERROR:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }

    return NextResponse.json({
      success: true,
      vacancies: vacancies || []
    });
  } catch (err) {
    console.error('VACANCIES ROUTE ERROR:', {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined
    });
    return NextResponse.json({
      success: false,
      vacancies: []
    }, { status: 500 });
  }
}
