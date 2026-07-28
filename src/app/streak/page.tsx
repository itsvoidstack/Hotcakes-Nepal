import { getSupabaseAdmin } from '@/lib/supabase/client';
import StreakSearch from '@/components/StreakSearch';
import CampaignCard, { CampaignCardData } from '@/components/CampaignCard';
import StreakHeroCard, { StreakCampaignData } from '@/components/StreakHeroCard';
import Link from 'next/link';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Rewards & Campaigns",
  description: "Collect stamps and earn free coffee at Hotcakes Nepal. Join our loyalty campaign and explore active promotions and rewards.",
  alternates: {
    canonical: "https://hotcakes-nepal.vercel.app/streak"
  },
  openGraph: {
    title: "Rewards & Campaigns — Hotcakes Nepal",
    description: "Collect stamps and earn free coffee. Explore active promotional campaigns and rewards.",
    url: "https://hotcakes-nepal.vercel.app/streak",
  },
};

export default async function StreakPage() {
  const supabase = getSupabaseAdmin();

  // Fetch all campaigns sorted by priority DESC
  const { data: rawCampaigns } = await supabase
    .from('campaigns')
    .select('*')
    .order('priority', { ascending: false });

  const now = new Date();
  const allActive = (rawCampaigns || []).filter(c => {
    // Must be explicitly enabled (is_active === true and not paused/draft/ended)
    const isExplicitlyActive = c.is_active === true && c.status !== 'paused' && c.status !== 'draft' && c.status !== 'ended';
    if (!isExplicitlyActive) return false;
    if (c.start_date && new Date(c.start_date) > now) return false;
    if (c.end_date && new Date(c.end_date) < now) return false;
    return true;
  });

  // Separate active streak campaign from active promotional campaigns
  const streakCampaign: StreakCampaignData | null = (allActive.find(
    c => c.type === 'streak' || c.name === 'Brew Streak Rewards'
  ) as StreakCampaignData) || null;

  const promotionalCampaigns: CampaignCardData[] = (allActive.filter(
    c => c.type !== 'streak' && c.name !== 'Brew Streak Rewards'
  ) as unknown as CampaignCardData[]) || [];

  const hasAnyActiveCampaign = Boolean(streakCampaign || promotionalCampaigns.length > 0);

  return (
    <div className="bg-cream min-h-screen py-10 md:py-20 px-4 flex flex-col items-center">
      {/* Page Header */}
      <div className="max-w-[1240px] w-full text-center mb-8">
        <h1 className="font-heading font-extrabold uppercase tracking-[0.12em] text-espresso text-3xl md:text-4xl lg:text-5xl mb-2 leading-none">
          CAMPAIGNS 🎉
        </h1>
        <p className="font-body text-xs md:text-sm text-mocha/80 max-w-md mx-auto">
          Exciting offers and rewards just for you. Check back often!
        </p>
        <div className="flex items-center justify-center gap-2 text-roasted opacity-60 mt-3">
          <div className="w-8 h-px bg-latte/70" />
          <span className="text-xs">❦</span>
          <div className="w-8 h-px bg-latte/70" />
        </div>
      </div>

      {/* ── CASE 1: EVERYTHING IS OFF (NO ACTIVE CAMPAIGNS) ── */}
      {!hasAnyActiveCampaign ? (
        <div className="w-full max-w-[680px] mx-auto bg-warm-white border border-latte rounded-[24px] p-8 md:p-14 text-center shadow-sm animate-fade-up">
          {/* Gift Icon Wreath Illustration */}
          <div className="relative w-36 h-36 mx-auto mb-6 flex items-center justify-center">
            <div className="absolute w-24 h-24 rounded-full bg-cream/70" />
            <svg viewBox="0 0 200 200" className="w-full h-full relative z-10">
              <g className="text-roasted/40" fill="currentColor">
                <path d="M65,145 C55,135 50,115 52,95 C53,85 58,75 65,68" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M52,95 C45,95 40,98 42,103 C44,108 50,105 52,101 Z" />
                <path d="M55,115 C47,118 43,123 46,127 C49,131 54,125 56,121 Z" />
                <path d="M61,132 C54,138 52,144 56,147 C60,150 63,142 64,137 Z" />
                <path d="M51,80 C44,78 39,81 40,86 C41,91 47,90 49,86 Z" />
              </g>
              <g className="text-roasted/40" fill="currentColor">
                <path d="M135,145 C145,135 150,115 148,95 C147,85 142,75 135,68" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M148,95 C155,95 160,98 158,103 C156,108 150,105 148,101 Z" />
                <path d="M145,115 C153,118 157,123 154,127 C151,131 146,125 144,121 Z" />
                <path d="M139,132 C146,138 148,144 144,147 C140,150 137,142 136,137 Z" />
                <path d="M149,80 C156,78 161,81 160,86 C159,91 153,90 151,86 Z" />
              </g>
              <g className="text-roasted/70" fill="currentColor">
                <path d="M58,60 L60,56 L62,60 L66,62 L62,64 L60,68 L58,64 L54,62 Z" />
                <path d="M138,62 L140,58 L142,62 L146,64 L142,66 L140,70 L138,66 L134,64 Z" opacity="0.8" />
              </g>
              <g transform="translate(68, 64)" className="text-roasted" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M32,22 C22,10 8,14 18,26 C28,38 32,22 32,22" fill="currentColor" fillOpacity="0.15" />
                <path d="M32,22 C42,10 56,14 46,26 C36,38 32,22 32,22" fill="currentColor" fillOpacity="0.15" />
                <circle cx="32" cy="22" r="3.5" fill="currentColor" className="stroke-roasted" />
                <rect x="6" y="27" width="52" height="11" rx="2" fill="currentColor" fillOpacity="0.1" />
                <rect x="11" y="38" width="42" height="26" rx="1.5" fill="currentColor" fillOpacity="0.05" />
                <path d="M32,27 L32,64" strokeWidth="4.5" />
                <path d="M11,51 L53,51" strokeWidth="4.5" />
              </g>
            </svg>
          </div>

          <h2 className="font-heading font-medium text-2xl md:text-3xl text-espresso tracking-[0.06em] mb-4 uppercase">
            NO ACTIVE CAMPAIGNS
          </h2>
          
          <p className="font-body text-[#6B5B52] text-sm md:text-[15px] leading-[1.6] max-w-md mx-auto mb-8">
            {"We're currently preparing our next rewards campaign. Follow us on social media or check back soon for exciting offers and rewards."}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/menu"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-7 py-3.5 bg-roasted hover:bg-dark-roast text-cream text-[11px] uppercase tracking-widest font-semibold rounded-full shadow-sm hover:shadow-md transition-all duration-300"
            >
              ☕ Browse Menu
            </Link>
            <Link
              href="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-7 py-3.5 border border-espresso/25 text-espresso hover:bg-espresso hover:text-cream text-[11px] uppercase tracking-widest font-semibold rounded-full transition-all duration-300"
            >
              📞 Contact Us
            </Link>
          </div>
        </div>
      ) : (
        /* ── CASE 2: AT LEAST ONE CAMPAIGN IS ACTIVE ── */
        <div className="max-w-[1240px] w-full mx-auto space-y-10 md:space-y-12">
          
          {/* FEATURED STREAK HERO BANNER (Only rendered if streak is active!) */}
          {streakCampaign && (
            <div className="animate-fade-up">
              <StreakHeroCard streakCampaign={streakCampaign} />
            </div>
          )}

          {/* PROMOTIONAL CAMPAIGNS SECTION (Only rendered if promotional campaigns are active!) */}
          {promotionalCampaigns.length > 0 && (
            <div className="space-y-6 pt-2 animate-fade-up" style={{ animationDelay: '100ms' }}>
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
                  href="/campaigns"
                  className="text-xs font-bold text-roasted hover:text-dark-roast flex items-center gap-1 transition-colors"
                >
                  View All &gt;
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {promotionalCampaigns.map((camp, idx) => (
                  <CampaignCard key={camp.id} campaign={camp} index={idx} />
                ))}
              </div>
            </div>
          )}

          {/* STREAK SEARCH & STAMP STATION (Only rendered if streak is active!) */}
          {streakCampaign && (
            <div id="streak-lookup" className="pt-6 animate-fade-up" style={{ animationDelay: '150ms' }}>
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
          )}
        </div>
      )}
    </div>
  );
}
