import { NextRequest, NextResponse } from 'next/server';

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

      try {
        let csvUrl = google_sheet_url.trim();
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
          if (text.toLowerCase().includes('<html') || text.toLowerCase().includes('<!doctype')) {
            return NextResponse.json({
              success: false,
              form_valid: true,
              sheet_valid: false,
              error: 'Google Sheet returned HTML. Please open Google Sheets -> Share -> set Link Access to "Anyone with the link can view".',
            }, { status: 400 });
          }

          const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
          if (lines.length > 1) {
            application_count = lines.length - 1; // Subtract header row
            const lastRowCols = parseCsvLine(lines[lines.length - 1]);
            if (lastRowCols.length >= 2) {
              latest_applicant = lastRowCols[1] || null;
            }
          }
          message = `Connection verified! Found ${application_count} application response(s).`;
        } else {
          return NextResponse.json({
            success: false,
            form_valid: true,
            sheet_valid: false,
            error: `Could not fetch Google Sheet CSV (HTTP ${res.status}). Ensure link sharing is public.`,
          }, { status: 400 });
        }
      } catch (e) {
        console.warn('Sheet CSV fetch test warning:', e);
        return NextResponse.json({
          success: false,
          form_valid: true,
          sheet_valid: false,
          error: `Error connecting to Google Sheet: ${e instanceof Error ? e.message : String(e)}`,
        }, { status: 400 });
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
