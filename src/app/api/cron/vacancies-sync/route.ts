import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const origin = req.nextUrl.origin;
    const syncRes = await fetch(`${origin}/api/admin/vacancies/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    const data = await syncRes.json();
    return NextResponse.json({
      success: true,
      cron: '3-hour vacancies sync executed',
      result: data,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Cron sync error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
