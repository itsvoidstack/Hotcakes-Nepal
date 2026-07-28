import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/client';

export const revalidate = 60;

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('priority', { ascending: false });

    if (error) {
      console.error('Error fetching campaigns:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const now = new Date();
    const activeCampaigns = (campaigns || []).filter(c => {
      // Must be active
      const isActive = c.is_active || c.status === 'active';
      if (!isActive) return false;
      // Start date check
      if (c.start_date && new Date(c.start_date) > now) return false;
      // End date check
      if (c.end_date && new Date(c.end_date) < now) return false;
      return true;
    });

    const streakCampaign = activeCampaigns.find(
      c => c.type === 'streak' || c.name === 'Brew Streak Rewards'
    ) || null;

    const promotionalCampaigns = activeCampaigns.filter(
      c => c.type !== 'streak' && c.name !== 'Brew Streak Rewards'
    );

    return NextResponse.json({
      success: true,
      streakCampaign,
      promotionalCampaigns,
    });
  } catch (err) {
    console.error('Unexpected error in GET /api/campaigns:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
