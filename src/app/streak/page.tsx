import { getSupabaseAdmin } from '@/lib/supabase/client';
import StreakSearch from '@/components/StreakSearch';
import CampaignCard, { CampaignCardData } from '@/components/CampaignCard';
import StreakHeroCard, { StreakCampaignData } from '@/components/StreakHeroCard';
import Link from 'next/link';
import type { Metadata } from 'next';

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Campaigns & Rewards",
  description: "Check out active promotional campaigns, discounts, BOGO offers, and your Brew Streak loyalty rewards at Hotcakes Nepal.",
  alternates: {
    canonical: "https://hotcakes-nepal.vercel.app/streak"
  },
  openGraph: {
    title: "Campaigns & Rewards — Hotcakes Nepal",
    description: "Check out active promotional campaigns, discounts, BOGO offers, and your Brew Streak loyalty rewards.",
    url: "https://hotcakes-nepal.vercel.app/streak",
  },
};

export default async function StreakPage() {
  const supabase = getSupabaseAdmin();

  // Fetch all active campaigns sorted by priority DESC
  const { data: rawCampaigns } = await supabase
    .from('campaigns')
    .select('*')
    .order('priority', { ascending: false });

  const now = new Date();
  const allActive = (rawCampaigns || []).filter(c => {
    const isActive = c.is_active || c.status === 'active';
    if (!isActive) return false;
    if (c.start_date && new Date(c.start_date) > now) return false;
    if (c.end_date && new Date(c.end_date) < now) return false;
    return true;
  });

  // Separate streak campaign from promotional campaigns
  const streakCampaign: StreakCampaignData | null = (allActive.find(
    c => c.type === 'streak' || c.name === 'Brew Streak Rewards'
  ) as StreakCampaignData) || null;

  const promotionalCampaigns: CampaignCardData[] = (allActive.filter(
    c => c.type !== 'streak' && c.name !== 'Brew Streak Rewards'
  ) as unknown as CampaignCardData[]) || [];

  return (
    <div className="bg-cream min-h-screen py-10 md:py-20 px-4 flex flex-col items-center">
      <div className="max-w-[1240px] w-full mx-auto space-y-10 md:space-y-12">
        
        {/* ── PAGE HEADER ── */}
        <div className="text-left space-y-1">
          <h1 className="font-heading font-extrabold text-3xl md:text-4xl lg:text-5xl text-espresso tracking-tight flex items-center gap-2">
            Campaigns <span className="text-2xl md:text-3xl">🎉</span>
          </h1>
          <p className="font-body text-xs md:text-sm text-mocha/80">
            Exciting offers and rewards just for you. Check back often!
          </p>
        </div>

        {/* ── FEATURED STREAK CAMPAIGN HERO BANNER ── */}
        <div className="animate-fade-up">
          <StreakHeroCard streakCampaign={streakCampaign} />
        </div>

        {/* ── CURRENT OFFERS SECTION ── */}
        <div className="space-y-6 pt-4 animate-fade-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🏷️</span>
              <div>
                <h2 className="font-heading font-bold text-xl md:text-2xl text-espresso">
                  Current Offers
                </h2>
                <p className="font-body text-xs text-mocha/80">
                  Limited time offers you don&apos;t want to miss
                </p>
              </div>
            </div>
            <Link
              href="/menu"
              className="text-xs font-bold text-roasted hover:text-dark-roast flex items-center gap-1 transition-colors"
            >
              View All &gt;
            </Link>
          </div>

          {/* Promotional Campaigns Cards Grid */}
          {promotionalCampaigns.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {promotionalCampaigns.map((camp, idx) => (
                <CampaignCard key={camp.id} campaign={camp} index={idx} />
              ))}
            </div>
          ) : (
            /* Fallback empty state for promotional offers if none active */
            <div className="p-8 text-center bg-warm-white border border-latte/60 rounded-[24px]">
              <p className="font-heading font-bold text-espresso mb-1 text-base">
                No active promotional offers right now
              </p>
              <p className="font-body text-xs text-mocha mb-4">
                Our team is brewing up fresh deals. Stay tuned or check out our full menu!
              </p>
              <Link
                href="/menu"
                className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-roasted hover:bg-dark-roast text-cream text-xs font-semibold uppercase tracking-wider rounded-full shadow-sm"
              >
                ☕ Browse Menu
              </Link>
            </div>
          )}
        </div>

        {/* ── STREAK STAMP CHECKER STATION ── */}
        <div id="streak-lookup" className="pt-8 animate-fade-up" style={{ animationDelay: '150ms' }}>
          <div className="text-center mb-6">
            <span className="text-xs font-semibold uppercase tracking-widest text-roasted mb-1 block">
              Loyalty Stamp Station
            </span>
            <h3 className="font-heading font-bold text-2xl text-espresso">
              Track Your Coffee Stamp Card
            </h3>
            <p className="font-body text-xs text-mocha max-w-md mx-auto mt-1">
              Enter your phone number or customer code below to check your stamps and active rewards.
            </p>
          </div>
          <StreakSearch />
        </div>

      </div>
    </div>
  );
}
