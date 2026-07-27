/**
 * /api/admin/campaigns
 *
 * Manages GENERAL campaigns (offers, promotions, announcements, banners, etc.)
 * Streak campaigns are NOT managed here — they stay in /api/admin/streak.
 *
 * The existing `campaigns` table is reused. Extended fields are stored in a
 * `metadata` JSONB column. If that column does not exist yet in your Supabase
 * project, run this migration once:
 *
 *   ALTER TABLE campaigns
 *     ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb,
 *     ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft',
 *     ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'promotion',
 *     ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0,
 *     ADD COLUMN IF NOT EXISTS placement TEXT DEFAULT 'home_banner',
 *     ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
 *
 * Campaign visibility rules (evaluated server-side on page render):
 *   1. status must be 'active'
 *   2. start_date <= now <= end_date  (nulls = unbounded)
 *   3. type must NOT be 'streak'  (streak is handled separately)
 *   4. placement must match the requested slot
 *   5. If multiple match → highest priority wins
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/client';

function isAuthorized(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  return (
    authHeader === 'Bearer authenticated-session-token-hc' ||
    authHeader === 'Bearer authenticated-dev-session-token-hc'
  );
}

// ── GET — return all non-streak campaigns ────────────────────────────────────
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .neq('name', 'Brew Streak Rewards')   // exclude the protected streak row
      .order('priority', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ campaigns: data || [] });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal Server Error' }, { status: 500 });
  }
}

// ── POST — create a new general campaign ────────────────────────────────────
export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      name, tagline, status = 'draft', type = 'promotion', priority = 0,
      placement = 'home_banner', start_date = null, end_date = null,
      metadata = {}
    } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Campaign name is required' }, { status: 400 });
    }
    if (name.trim() === 'Brew Streak Rewards') {
      return NextResponse.json({ error: 'That name is reserved for the streak campaign' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('campaigns')
      .insert({
        name: name.trim(),
        tagline: tagline || null,
        is_active: status === 'active',
        status,
        type,
        priority: Number(priority) || 0,
        placement,
        start_date: start_date || null,
        end_date: end_date || null,
        metadata,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, campaign: data });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal Server Error' }, { status: 500 });
  }
}

// ── PUT — update a general campaign by id ───────────────────────────────────
export async function PUT(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      id, name, tagline, status, type, priority, placement,
      start_date, end_date, metadata
    } = body;

    if (!id) return NextResponse.json({ error: 'Campaign id is required' }, { status: 400 });

    const supabase = getSupabaseAdmin();

    // Safety: never touch the streak row via this endpoint
    const { data: existing } = await supabase
      .from('campaigns')
      .select('name')
      .eq('id', id)
      .single();

    if (existing?.name === 'Brew Streak Rewards') {
      return NextResponse.json({ error: 'Streak campaign cannot be edited here' }, { status: 403 });
    }

    const updatePayload: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (name !== undefined)      updatePayload.name      = name;
    if (tagline !== undefined)   updatePayload.tagline   = tagline;
    if (status !== undefined)    { updatePayload.status = status; updatePayload.is_active = status === 'active'; }
    if (type !== undefined)      updatePayload.type      = type;
    if (priority !== undefined)  updatePayload.priority  = Number(priority);
    if (placement !== undefined) updatePayload.placement = placement;
    if (start_date !== undefined) updatePayload.start_date = start_date || null;
    if (end_date !== undefined)   updatePayload.end_date   = end_date || null;
    if (metadata !== undefined)   updatePayload.metadata   = metadata;

    const { data, error } = await supabase
      .from('campaigns')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, campaign: data });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal Server Error' }, { status: 500 });
  }
}

// ── DELETE — remove a general campaign by id ────────────────────────────────
export async function DELETE(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Campaign id is required' }, { status: 400 });

    const supabase = getSupabaseAdmin();

    const { data: existing } = await supabase
      .from('campaigns')
      .select('name')
      .eq('id', id)
      .single();

    if (existing?.name === 'Brew Streak Rewards') {
      return NextResponse.json({ error: 'Streak campaign cannot be deleted here' }, { status: 403 });
    }

    const { error } = await supabase.from('campaigns').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal Server Error' }, { status: 500 });
  }
}
