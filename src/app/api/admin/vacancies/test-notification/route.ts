import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/client';
import { sendVacancyNotificationEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const testEmail = body.email || '';

    let storedEmail = testEmail;
    try {
      const supabaseAdmin = getSupabaseAdmin();
      if (!storedEmail) {
        const { data } = await supabaseAdmin.from('site_settings').select('value').eq('key', 'vacancy_notifications_settings').single();
        if (data && data.value) {
          const parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
          storedEmail = parsed.notification_email || '';
        }
      }
    } catch (e) {
      console.warn('Warning getting stored email:', e);
    }

    if (!storedEmail) {
      return NextResponse.json({
        success: false,
        error: 'Please enter and save a valid notification email address first.',
      }, { status: 400 });
    }

    const emailResult = await sendVacancyNotificationEmail({
      to: storedEmail,
      vacancyTitle: 'Senior Barista (Test)',
      applicantName: 'Test Applicant',
      applicantEmail: 'applicant.test@example.com',
      submittedAt: new Date().toLocaleString(),
      totalApplications: 1,
      isTest: true,
    });

    return NextResponse.json({
      success: emailResult.success,
      message: emailResult.message,
      email_destination: storedEmail,
      email_result: emailResult,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Test notification error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
