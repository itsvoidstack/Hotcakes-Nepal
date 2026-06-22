import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get('featured') === 'true'
    const supabase = getSupabaseAdmin()
    
    let query = supabase.from('menu_items').select('*').eq('is_available', true)
    
    if (featured) {
      query = query.eq('is_featured', true)
    }
    
    const { data, error } = await query.order('category', { ascending: true })
    
    if (error) {
      console.error('Menu fetch error:', error)
      throw error
    }
    
    return NextResponse.json({
      items: data || []
    })
  } catch (error) {
    console.error('Menu route error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch menu', items: [] },
      { status: 500 }
    )
  }
}
