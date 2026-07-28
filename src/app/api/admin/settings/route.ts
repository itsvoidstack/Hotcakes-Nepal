import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/client';

function isAuthorized(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  return authHeader === 'Bearer authenticated-session-token-hc';
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const supabase = getSupabaseAdmin();

    if (type) {
      if (type === 'order_links') {
        const { data, error } = await supabase.from('order_links').select('*');
        if (error) {
          console.error('ROUTE ERROR:', {
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
          });
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ data });
      }

      if (type === 'vacancies') {
        const { data, error } = await supabase.from('vacancies').select('*');
        if (error) {
          console.error('ROUTE ERROR:', {
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
          });
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ data });
      }

      if (type === 'contact_info') {
        const { data, error } = await supabase.from('contact_info').select('*');
        if (error) {
          console.error('ROUTE ERROR:', {
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
          });
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ data });
      }

      if (type === 'campaigns') {
        const { data, error } = await supabase.from('campaigns').select('*');
        if (error) {
          console.error('ROUTE ERROR:', {
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
          });
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ data });
      }

      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    // If no type specified, return all settings in a single object
    const { data: orderLinks, error: orderLinksError } = await supabase.from('order_links').select('*');
    if (orderLinksError) throw orderLinksError;

    const { data: vacancies, error: vacanciesError } = await supabase.from('vacancies').select('*');
    if (vacanciesError) throw vacanciesError;

    const { data: contactInfo, error: contactInfoError } = await supabase.from('contact_info').select('*');
    if (contactInfoError) throw contactInfoError;

    const { data: campaigns, error: campaignsError } = await supabase.from('campaigns').select('*');
    if (campaignsError) throw campaignsError;

    const { data: siteSettings, error: siteSettingsError } = await supabase.from('site_settings').select('*');
    if (siteSettingsError) throw siteSettingsError;

    return NextResponse.json({
      orderLinks,
      vacancies,
      contactInfo,
      campaigns,
      siteSettings,
    });
  } catch (err) {
    console.error('ROUTE ERROR:', {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined
    });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
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
      
      if (error) {
        console.error('ROUTE ERROR:', {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        });
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true });
    }

    if (type === 'opening_hours') {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ key: 'opening_hours', value: data, updated_at: new Date().toISOString() });
      
      if (error) {
        console.error('ROUTE ERROR:', {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        });
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true });
    }

    if (type === 'google_maps') {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ key: 'google_maps', value: { url: data.url }, updated_at: new Date().toISOString() });
      
      if (error) {
        console.error('ROUTE ERROR:', {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        });
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
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
      // data is expected to be an array of { platform, display_name, url, is_active, metadata }
      for (const item of data) {
        const { error } = await supabase
          .from('order_links')
          .upsert({
            platform: item.platform,
            display_name: item.display_name || null,
            url: item.url || null,
            is_active: !!item.is_active,
            metadata: item.metadata || {},
            updated_at: new Date().toISOString()
          });
        if (error) {
          console.error('ROUTE ERROR:', {
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
          });
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
      }
      return NextResponse.json({ success: true });
    }

    if (type === 'order_link_delete') {
      if (!data.platform) {
        return NextResponse.json({ error: 'Platform ID is required to delete' }, { status: 400 });
      }
      const { error } = await supabase
        .from('order_links')
        .delete()
        .eq('platform', data.platform);

      if (error) {
        console.error('ROUTE ERROR:', {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        });
        return NextResponse.json({ error: error.message }, { status: 500 });
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

      if (error) {
        console.error('ROUTE ERROR:', {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        });
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true });
    }

    if (type === 'location_photos') {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ key: 'location_photos', value: data.photos, updated_at: new Date().toISOString() });

      if (error) {
        console.error('ROUTE ERROR:', {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        });
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true });
    }

    if (type === 'hero_image') {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ key: 'hero_image', value: { url: data.url }, updated_at: new Date().toISOString() });

      if (error) {
        console.error('ROUTE ERROR:', {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        });
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true });
    }

    if (type === 'logo_image') {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ key: 'logo_image', value: { url: data.url }, updated_at: new Date().toISOString() });

      if (error) {
        console.error('ROUTE ERROR:', {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        });
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true });
    }

    if (type === 'site_description') {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ key: 'site_description', value: { text: data.text }, updated_at: new Date().toISOString() });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    if (type === 'menu_description') {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ key: 'menu_description', value: { text: data.text }, updated_at: new Date().toISOString() });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    if (type === 'contact_description') {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ key: 'contact_description', value: { text: data.text }, updated_at: new Date().toISOString() });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    if (type === 'order_description') {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ key: 'order_description', value: { text: data.text }, updated_at: new Date().toISOString() });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    if (type === 'vacancies_description') {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ key: 'vacancies_description', value: { text: data.text }, updated_at: new Date().toISOString() });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    if (type === 'location_description') {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ key: 'location_description', value: { text: data.text }, updated_at: new Date().toISOString() });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    if (type === 'amenities_description') {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ key: 'amenities_description', value: { text: data.text }, updated_at: new Date().toISOString() });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    if (type === 'contact_showcase_images') {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ key: 'contact_showcase_images', value: data.images, updated_at: new Date().toISOString() });

      if (error) {
        console.error('ROUTE ERROR:', {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        });
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true });
    }

    if (type === 'vacancy') {
      const payload: Record<string, any> = {
        title: data.title,
        description: data.description ?? null,
        google_form_link: data.google_form_link,
        google_sheet_url: data.google_sheet_url ?? null,
        image_url: data.image_url ?? null,
        is_active: !!data.is_active,
        updated_at: new Date().toISOString(),
      };

      if (data.id) {
        payload.id = data.id;
      }

      if (typeof data.application_count === 'number') payload.application_count = data.application_count;
      if (typeof data.unread_count === 'number') payload.unread_count = data.unread_count;
      if (data.last_checked_at) payload.last_checked_at = data.last_checked_at;
      if (data.last_application_at) payload.last_application_at = data.last_application_at;
      if (data.latest_applicant_name) payload.latest_applicant_name = data.latest_applicant_name;

      const { data: upsertedVacancy, error } = await supabase
        .from('vacancies')
        .upsert(payload)
        .select()
        .single();

      if (error) {
        console.error('ROUTE ERROR:', {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        });
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, vacancy: upsertedVacancy });
    }

    if (type === 'vacancy_notifications_settings') {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ key: 'vacancy_notifications_settings', value: data, updated_at: new Date().toISOString() });
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

      if (error) {
        console.error('ROUTE ERROR:', {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        });
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid settings type' }, { status: 400 });
  } catch (err) {
    console.error('ROUTE ERROR:', {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined
    });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
