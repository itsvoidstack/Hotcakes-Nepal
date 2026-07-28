import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { google_form_link, google_sheet_url } = await req.json();

    if (!google_form_link || typeof google_form_link !== 'string' || !google_form_link.trim().startsWith('http')) {
      return NextResponse.json({ success: false, error: 'Please enter a valid Google Form URL (e.g. https://forms.gle/...)' }, { status: 400 });
    }

    let sheet_valid = false;
    let application_count = 0;
    let latest_applicant: string | null = null;
    let message = 'Form link is valid.';

    if (google_sheet_url && typeof google_sheet_url === 'string' && google_sheet_url.trim().startsWith('http')) {
      sheet_valid = true;
      message = 'Form link and Google Sheet URL are valid.';

      // Attempt to fetch published CSV or inspect URL structure
      try {
        let csvUrl = google_sheet_url.trim();
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
          if (lines.length > 1) {
            application_count = lines.length - 1; // Subtract header row
            const lastLine = lines[lines.length - 1].split(',');
            if (lastLine.length >= 2) {
              latest_applicant = lastLine[1]?.replace(/^"|"$/g, '').trim() || null;
            }
          }
        }
      } catch (e) {
        console.warn('Sheet CSV fetch test warning:', e);
      }
    }

    return NextResponse.json({
      success: true,
      form_valid: true,
      sheet_valid,
      application_count,
      latest_applicant,
      message,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Validation failed';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
