import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/client';

// Helper to validate session (simple demo session verification)
function isAuthorized(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  return authHeader === 'Bearer authenticated-session-token-hc';
}

// 0. Get All Menu Items (GET)
export async function GET(request: NextRequest) {
  console.log('=== [GET /api/admin/menu] Starting ===');
  
  if (!isAuthorized(request)) {
    console.log('=== [GET /api/admin/menu] Unauthorized ===');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('category', { ascending: true });

    if (error) {
      console.error('=== [GET /api/admin/menu] Supabase error ===', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('=== [GET /api/admin/menu] Success, returning items ===', data?.length);
    return NextResponse.json({ items: data || [] });
  } catch (err) {
    console.error('=== [GET /api/admin/menu] Unhandled exception ===', err);
    return NextResponse.json({ error: 'Internal Server Error', details: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

// 1. Create Menu Item (POST)
export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { category, name, slug, description, price, image_url, is_featured, is_available, display_order } = body;

    if (!category || !name || !slug || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('menu_items')
      .insert({
        category,
        name,
        slug,
        description,
        price: parseInt(price),
        image_url,
        is_featured: !!is_featured,
        is_available: is_available !== false,
        display_order: parseInt(display_order) || 0
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, item: data });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// 2. Update Menu Item (PUT)
export async function PUT(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, category, name, slug, description, price, image_url, is_featured, is_available, display_order } = body;

    if (!id || !category || !name || !slug || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('menu_items')
      .update({
        category,
        name,
        slug,
        description,
        price: parseInt(price),
        image_url,
        is_featured: !!is_featured,
        is_available: !!is_available,
        display_order: parseInt(display_order) || 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, item: data });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// 3. Delete Menu Item (DELETE)
export async function DELETE(request: NextRequest) {
  console.log('=== [DELETE /api/admin/menu] Starting ===');
  
  if (!isAuthorized(request)) {
    console.log('=== [DELETE /api/admin/menu] Unauthorized ===');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const idsParam = searchParams.get('ids');
    
    console.log('=== [DELETE /api/admin/menu] URL params ===', { id, idsParam });

    const supabase = getSupabaseAdmin();
    
    if (idsParam) {
      // Handle bulk delete
      const ids = idsParam.split(',').map(s => s.trim()).filter(Boolean);
      console.log('=== [DELETE /api/admin/menu] Bulk delete IDs (array) ===', ids);
      console.log('=== [DELETE /api/admin/menu] IDs type check ===', typeof ids[0], ids.map(id => typeof id));
      
      if (ids.length === 0) {
        console.log('=== [DELETE /api/admin/menu] No IDs provided ===');
        return NextResponse.json({ error: 'No menu item IDs provided' }, { status: 400 });
      }
      
      console.log('=== [DELETE /api/admin/menu] Executing Supabase bulk delete ===');
      
      // First, let's try to fetch the items to make sure they exist!
      const { data: preFetchData, error: preFetchError } = await supabase
        .from('menu_items')
        .select('id')
        .in('id', ids);
        
      console.log('=== [DELETE /api/admin/menu] Pre-fetch check ===', { preFetchData, preFetchError });
      
      const { data, error, count } = await supabase
        .from('menu_items')
        .delete()
        .in('id', ids)
        .select('*');

      console.log('=== [DELETE /api/admin/menu] Supabase delete response ===', { data, error, count, deletedCount: data?.length });
      
      if (error) {
        console.error('=== [DELETE /api/admin/menu] Supabase error ===', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      
      return NextResponse.json({ success: true, deletedCount: data?.length || 0, data });
    }
    
    if (!id) {
      console.log('=== [DELETE /api/admin/menu] No single ID provided ===');
      return NextResponse.json({ error: 'Menu Item ID is required' }, { status: 400 });
    }

    console.log('=== [DELETE /api/admin/menu] Single delete ID ===', id);
    const { data, error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id)
      .select('*');
    
    console.log('=== [DELETE /api/admin/menu] Single delete response ===', { data, error });

    if (error) {
      console.error('=== [DELETE /api/admin/menu] Single delete Supabase error ===', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('=== [DELETE /api/admin/menu] Unhandled exception ===', err);
    return NextResponse.json({ error: 'Internal Server Error', details: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
