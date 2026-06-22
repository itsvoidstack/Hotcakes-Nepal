import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/client'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'maintenance_mode')
      .single()
    
    if (error && error.code !== 'PGRST116') {
      throw error
    }
    
    return NextResponse.json({
      maintenance: data?.value === 'true'
    })
  } catch (error) {
    console.error('Maintenance route error:', error)
    return NextResponse.json(
      { maintenance: false },
      { status: 200 }
    )
  }
}
