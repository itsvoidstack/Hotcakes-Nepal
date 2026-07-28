import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

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

    let updatedCount = 0;

    for (const vac of vacancies) {
      if (!vac.google_sheet_url || !vac.google_sheet_url.trim().startsWith('http')) {
        continue;
      }

      try {
        let csvUrl = vac.google_sheet_url.trim();
        if (csvUrl.includes('docs.google.com/spreadsheets/d/')) {
          const match = csvUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
          if (match && match[1]) {
            const sheetId = match[1];
            csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
          }
        }

        const res = await fetch(csvUrl, { method: 'GET', headers: { 'User-Agent': 'Mozilla/5.0' }, cache: 'no-store' });
        if (res.ok) {
          const text = await res.text();
          const lines = text.split('\n').filter(l => l.trim().length > 0);
          const rowCount = Math.max(0, lines.length - 1); // Exclude header row

          let latestApplicantName = vac.latest_applicant_name;
          let lastAppAt = vac.last_application_at;

          if (lines.length > 1) {
            const lastLine = lines[lines.length - 1].split(',');
            if (lastLine.length >= 2) {
              const nameCandidate = lastLine[1]?.replace(/^"|"$/g, '').trim();
              if (nameCandidate && nameCandidate.length < 100) {
                latestApplicantName = nameCandidate;
              }
            }
          }

          const currentCount = vac.application_count || 0;
          const diff = rowCount - currentCount;
          const newUnread = diff > 0 ? (vac.unread_count || 0) + diff : (vac.unread_count || 0);

          if (diff > 0) {
            lastAppAt = new Date().toISOString();
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
        }
      } catch (e) {
        console.warn(`Sync error for vacancy ${vac.id}:`, e);
      }
    }

    return NextResponse.json({
      success: true,
      updated: updatedCount,
      message: `Successfully synced ${updatedCount} vacancy application logs.`,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Sync failed';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
