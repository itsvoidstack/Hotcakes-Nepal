import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/client';
import { sendVacancyNotificationEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim().replace(/^"|"$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim().replace(/^"|"$/g, ''));
  return result;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await req.json().catch(() => ({}));
    const vacancyId = body.vacancyId;

    let query = supabase.from('vacancies').select('*');
    if (vacancyId) {
      query = query.eq('id', vacancyId);
    }

    const { data: vacancies, error } = await query;
    if (error) throw error;

    if (!vacancies || vacancies.length === 0) {
      return NextResponse.json({ success: true, updated: 0, message: 'No vacancies found to sync.' });
    }

    // Fetch stored notification email
    let notifEmail = '';
    const { data: settingsData } = await supabase.from('site_settings').select('value').eq('key', 'vacancy_notifications_settings').single();
    if (settingsData && settingsData.value) {
      const parsed = typeof settingsData.value === 'string' ? JSON.parse(settingsData.value) : settingsData.value;
      notifEmail = parsed.notification_email || '';
    }

    let updatedCount = 0;
    let totalNewApplications = 0;
    const diagnostics: string[] = [];

    for (const vac of vacancies) {
      if (!vac.google_sheet_url || !vac.google_sheet_url.trim().startsWith('http')) {
        diagnostics.push(`Vacancy "${vac.title}": No Google Sheet URL configured.`);
        continue;
      }

      try {
        let csvUrl = vac.google_sheet_url.trim();
        if (csvUrl.includes('docs.google.com/spreadsheets/d/')) {
          const match = csvUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
          if (match && match[1]) {
            const sheetId = match[1];
            const gidMatch = csvUrl.match(/[?&#]gid=([0-9]+)/);
            const gid = gidMatch ? gidMatch[1] : null;
            csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv${gid ? `&gid=${gid}` : ''}`;
          }
        }

        const res = await fetch(csvUrl, {
          method: 'GET',
          headers: { 'User-Agent': 'Mozilla/5.0' },
          cache: 'no-store',
          redirect: 'follow',
        });

        if (res.ok) {
          const text = await res.text();

          // Check if Google Sheet is private or requires authentication
          if (text.toLowerCase().includes('<html') || text.toLowerCase().includes('<!doctype')) {
            diagnostics.push(`Vacancy "${vac.title}": Google Sheet link returned HTML preview. Make sure Google Sheet sharing is set to "Anyone with the link can view".`);
            continue;
          }

          const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
          const rowCount = Math.max(0, lines.length - 1); // Exclude header row

          let latestApplicantName = vac.latest_applicant_name;
          let lastAppAt = vac.last_application_at;
          let applicantEmail = '';

          if (lines.length > 1) {
            const lastRowCols = parseCsvLine(lines[lines.length - 1]);
            if (lastRowCols.length >= 2) {
              const nameCandidate = lastRowCols[1];
              if (nameCandidate && nameCandidate.length < 100) {
                latestApplicantName = nameCandidate;
              }
            }
            if (lastRowCols.length >= 3) {
              const emailCandidate = lastRowCols[2];
              if (emailCandidate && emailCandidate.includes('@')) {
                applicantEmail = emailCandidate;
              }
            }
          }

          const currentCount = vac.application_count || 0;
          const diff = rowCount - currentCount;
          const newUnread = diff > 0 ? (vac.unread_count || 0) + diff : (vac.unread_count || 0);

          if (diff > 0) {
            lastAppAt = new Date().toISOString();
            totalNewApplications += diff;

            if (notifEmail) {
              await sendVacancyNotificationEmail({
                to: notifEmail,
                vacancyTitle: vac.title,
                applicantName: latestApplicantName || 'New Applicant',
                applicantEmail,
                submittedAt: new Date().toLocaleString(),
                totalApplications: rowCount,
                isTest: false,
              });
            }
          }

          await supabase
            .from('vacancies')
            .update({
              application_count: rowCount,
              unread_count: newUnread,
              last_checked_at: new Date().toISOString(),
              last_application_at: lastAppAt,
              latest_applicant_name: latestApplicantName,
              updated_at: new Date().toISOString()
            })
            .eq('id', vac.id);

          updatedCount++;
          diagnostics.push(`Vacancy "${vac.title}": Synced ${rowCount} entries (${diff > 0 ? `${diff} new` : 'no new'}).`);
        } else {
          diagnostics.push(`Vacancy "${vac.title}": HTTP status ${res.status} when fetching spreadsheet CSV.`);
        }
      } catch (e) {
        console.warn(`Sync error for vacancy ${vac.id}:`, e);
        diagnostics.push(`Vacancy "${vac.title}": Error - ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    return NextResponse.json({
      success: true,
      updated: updatedCount,
      new_applications_detected: totalNewApplications,
      notification_email: notifEmail,
      diagnostics,
      message: `Synced ${updatedCount} vacancy logs. Detected ${totalNewApplications} new applications.`,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Sync failed';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
