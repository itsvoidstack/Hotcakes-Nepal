import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/client';

function isAuthorized(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  return authHeader === 'Bearer authenticated-session-token-hc';
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { type, data } = body;

    if (!type || !data) {
      return NextResponse.json({ error: 'Missing type or data' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (type === 'open_status') {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ key: 'open_status', value: { is_open: !!data.is_open }, updated_at: new Date().toISOString() });
      
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    if (type === 'google_maps') {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ key: 'google_maps', value: { url: data.url }, updated_at: new Date().toISOString() });
      
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    if (type === 'contact_info') {
      // data is expected to be an array of { key, value }
      for (const item of data) {
        await supabase
          .from('contact_info')
          .upsert({ key: item.key, value: item.value, updated_at: new Date().toISOString() });
      }
      return NextResponse.json({ success: true });
    }

    if (type === 'order_links') {
      // data is expected to be an array of { platform, url, is_active }
      for (const item of data) {
        await supabase
          .from('order_links')
          .upsert({ platform: item.platform, url: item.url, is_active: !!item.is_active, updated_at: new Date().toISOString() });
      }
      return NextResponse.json({ success: true });
    }

    if (type === 'campaign') {
      const { error } = await supabase
        .from('campaigns')
        .update({
          tagline: data.tagline,
          is_active: !!data.is_active,
          start_date: data.start_date,
          end_date: data.end_date
        })
        .eq('name', 'Brew Streak Rewards');

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    if (type === 'location_photos') {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ key: 'location_photos', value: data.photos, updated_at: new Date().toISOString() });

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    if (type === 'hero_image') {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ key: 'hero_image', value: { url: data.url }, updated_at: new Date().toISOString() });

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    if (type === 'vacancy') {
      const { error } = await supabase
        .from('vacancies')
        .upsert({
          id: data.id || undefined,
          title: data.title,
          description: data.description,
          google_form_link: data.google_form_link,
          image_url: data.image_url,
          is_active: !!data.is_active
        });

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    if (type === 'vacancy_delete') {
      if (!data.id) {
        return NextResponse.json({ error: 'Vacancy ID is required to delete' }, { status: 400 });
      }
      const { error } = await supabase
        .from('vacancies')
        .delete()
        .eq('id', data.id);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid settings type' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
