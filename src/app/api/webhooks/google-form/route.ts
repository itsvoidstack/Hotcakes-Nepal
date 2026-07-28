import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const vacancy_id = body.vacancy_id;
    const google_form_link = body.google_form_link;
    const google_sheet_url = body.google_sheet_url;
    const applicant_name = body.applicant_name || body.name || 'Anonymous Applicant';
    const applicant_email = body.applicant_email || body.email || '';
    const submitted_at = body.submitted_at || new Date().toISOString();

    const supabaseAdmin = getSupabaseAdmin();

    // 1. Locate matching vacancy
    let vacancy: { id: string; title: string; application_count: number; unread_count: number; google_form_link?: string; google_sheet_url?: string } | null = null;

    if (vacancy_id) {
      const { data } = await supabaseAdmin.from('vacancies').select('*').eq('id', vacancy_id).single();
      if (data) vacancy = data;
    }

    if (!vacancy && google_sheet_url) {
      const { data } = await supabaseAdmin.from('vacancies').select('*').ilike('google_sheet_url', `%${google_sheet_url.trim()}%`).limit(1);
      if (data && data.length > 0) vacancy = data[0];
    }

    if (!vacancy && google_form_link) {
      const { data } = await supabaseAdmin.from('vacancies').select('*').ilike('google_form_link', `%${google_form_link.trim()}%`).limit(1);
      if (data && data.length > 0) vacancy = data[0];
    }

    // Fallback: pick most recently updated active vacancy if no exact link match
    if (!vacancy) {
      const { data } = await supabaseAdmin.from('vacancies').select('*').eq('is_active', true).order('updated_at', { ascending: false }).limit(1);
      if (data && data.length > 0) vacancy = data[0];
    }

    if (!vacancy) {
      return NextResponse.json({ error: 'No matching active vacancy found for webhook' }, { status: 444 });
    }

    // 2. Update vacancy stats in database
    const newCount = (vacancy.application_count || 0) + 1;
    const newUnread = (vacancy.unread_count || 0) + 1;

    const { error: updateError } = await supabaseAdmin
      .from('vacancies')
      .update({
        application_count: newCount,
        unread_count: newUnread,
        latest_applicant_name: applicant_name,
        last_application_at: submitted_at,
        updated_at: new Date().toISOString(),
      })
      .eq('id', vacancy.id);

    if (updateError) {
      console.error('Error updating vacancy stats:', updateError);
    }

    // 3. Fetch Notification Settings
    let notifEmail = '';
    const { data: settingsData } = await supabaseAdmin.from('site_settings').select('value').eq('key', 'vacancy_notifications_settings').single();
    if (settingsData && settingsData.value) {
      const parsed = typeof settingsData.value === 'string' ? JSON.parse(settingsData.value) : settingsData.value;
      notifEmail = parsed.notification_email || '';
    }

    const payloadSummary = {
      vacancy_title: vacancy.title,
      applicant_name,
      applicant_email,
      submitted_at,
      total_applications: newCount,
      notification_email: notifEmail,
    };

    console.log('✅ Webhook processed vacancy application:', payloadSummary);

    return NextResponse.json({
      success: true,
      message: `Application recorded for ${vacancy.title}`,
      vacancy_title: vacancy.title,
      application_count: newCount,
    });
  } catch (err: unknown) {
    console.error('Google form webhook error:', err);
    const msg = err instanceof Error ? err.message : 'Webhook error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
