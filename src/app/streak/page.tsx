import { getSupabaseAdmin } from '@/lib/supabase/client';
import StreakSearch from '@/components/StreakSearch';
import Link from 'next/link';
import type { Metadata } from 'next';

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Rewards & Campaigns",
  description: "Collect stamps and earn free coffee at Hotcakes Nepal. Join our loyalty campaign — visit us, buy any coffee, and get stamped. 10 stamps earns a free coffee of your choice.",
  alternates: {
    canonical: "https://hotcakes-nepal.vercel.app/streak"
  },
  openGraph: {
    title: "Rewards & Campaigns — Hotcakes Nepal",
    description: "Collect stamps and earn free coffee. Visit us, buy any coffee, and get stamped. 10 stamps earns a free coffee of your choice.",
    url: "https://hotcakes-nepal.vercel.app/streak",
  },
};

export default async function StreakPage() {
  const supabase = getSupabaseAdmin();
  // Fetch active campaign details to display
  const { data: campaignData } = await supabase
    .from('campaigns')
    .select('*')
    .eq('is_active', true)
    .single();

  const now = new Date();
  const campaign = campaignData && (!campaignData.end_date || new Date(campaignData.end_date) > now)
    ? campaignData
    : null;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-cream min-h-screen py-12 md:py-24 px-4 flex flex-col items-center">
      {/* Page Title & Leaf Wreath Ornament */}
      <div className="max-w-[1280px] w-full text-center mb-10">
        <h1 className="font-heading font-medium uppercase tracking-[0.12em] text-espresso text-[32px] md:text-[42px] lg:text-[48px] mb-2 leading-none">
          CAMPAIGNS
        </h1>
        {/* Leaf Ornament */}
        <div className="flex items-center justify-center gap-2 text-roasted opacity-60">
          <div className="w-8 h-px bg-latte/70" />
          <span className="text-xs">❦</span>
          <div className="w-8 h-px bg-latte/70" />
        </div>
      </div>

      {campaign ? (
        <div className="w-full max-w-[1280px] mx-auto">
          <div className="text-center mb-12 animate-fade-up">
            <span className="text-xs font-semibold uppercase tracking-widest text-roasted mb-2.5 block">
              Active Rewards
            </span>
            <h2 className="font-heading font-medium text-2xl md:text-3xl text-espresso mb-3">
              {campaign.name}
            </h2>
            <p className="font-body text-[#6B5B52] text-sm md:text-base max-w-md mx-auto leading-relaxed">
              Visit us, purchase any coffee, and get your stamp card stamped by our barista.{' '}
              <strong>{campaign.tagline}</strong>
            </p>
            {(campaign.start_date || campaign.end_date) && (
              <p className="text-[10px] font-semibold text-roasted tracking-wider uppercase mt-2.5">
                {campaign.start_date && `Starts: ${formatDate(campaign.start_date)}`}
                {campaign.start_date && campaign.end_date && '  •  '}
                {campaign.end_date && `Ends: ${formatDate(campaign.end_date)}`}
              </p>
            )}
          </div>

          <div className="animate-fade-up" style={{ animationDelay: '100ms' }}>
            <StreakSearch />
          </div>

          <div className="max-w-md mx-auto mt-16 text-center text-xs text-[#6B5B52] leading-relaxed animate-fade-up" style={{ animationDelay: '150ms' }}>
            <h3 className="font-heading font-bold text-sm text-espresso mb-3.5">How it works</h3>
            <ol className="list-decimal list-inside space-y-2 text-left max-w-xs mx-auto text-[#6B5B52]/90 font-body">
              <li>Give your phone number to our staff on checkout</li>
              <li>Earn 1 stamp per day upon purchase</li>
              <li>Collect 10 stamps to earn 1 free coffee of choice</li>
              <li>Show your completed card to barista to redeem</li>
            </ol>
          </div>
        </div>
      ) : (
        /* Empty State Card matching design guidelines */
        <div className="w-full max-w-[680px] mx-auto bg-warm-white border border-latte rounded-[24px] p-8 md:p-14 text-center shadow-sm animate-fade-up">
          {/* Symmetrical Gift Icon Illustration */}
          <div className="relative w-36 h-36 mx-auto mb-6 flex items-center justify-center">
            {/* Background circular highlight */}
            <div className="absolute w-24 h-24 rounded-full bg-cream/70" />
            
            {/* Decorative leaf branch wreath and gift box SVG */}
            <svg viewBox="0 0 200 200" className="w-full h-full relative z-10">
              {/* Left Leaf Wreath */}
              <g className="text-roasted/40" fill="currentColor">
                <path d="M65,145 C55,135 50,115 52,95 C53,85 58,75 65,68" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M52,95 C45,95 40,98 42,103 C44,108 50,105 52,101 Z" />
                <path d="M55,115 C47,118 43,123 46,127 C49,131 54,125 56,121 Z" />
                <path d="M61,132 C54,138 52,144 56,147 C60,150 63,142 64,137 Z" />
                <path d="M51,80 C44,78 39,81 40,86 C41,91 47,90 49,86 Z" />
              </g>
              
              {/* Right Leaf Wreath */}
              <g className="text-roasted/40" fill="currentColor">
                <path d="M135,145 C145,135 150,115 148,95 C147,85 142,75 135,68" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M148,95 C155,95 160,98 158,103 C156,108 150,105 148,101 Z" />
                <path d="M145,115 C153,118 157,123 154,127 C151,131 146,125 144,121 Z" />
                <path d="M139,132 C146,138 148,144 144,147 C140,150 137,142 136,137 Z" />
                <path d="M149,80 C156,78 161,81 160,86 C159,91 153,90 151,86 Z" />
              </g>

              {/* Sparkles */}
              <g className="text-roasted/70" fill="currentColor">
                <path d="M58,60 L60,56 L62,60 L66,62 L62,64 L60,68 L58,64 L54,62 Z" />
                <path d="M138,62 L140,58 L142,62 L146,64 L142,66 L140,70 L138,66 L134,64 Z" opacity="0.8" />
              </g>
              
              {/* Gift Box Container (Center) */}
              <g transform="translate(68, 64)" className="text-roasted" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                {/* Bow Ribbons */}
                <path d="M32,22 C22,10 8,14 18,26 C28,38 32,22 32,22" fill="currentColor" fillOpacity="0.15" />
                <path d="M32,22 C42,10 56,14 46,26 C36,38 32,22 32,22" fill="currentColor" fillOpacity="0.15" />
                <circle cx="32" cy="22" r="3.5" fill="currentColor" className="stroke-roasted" />

                {/* Box Cover/Lid */}
                <rect x="6" y="27" width="52" height="11" rx="2" fill="currentColor" fillOpacity="0.1" />
                
                {/* Box Body */}
                <rect x="11" y="38" width="42" height="26" rx="1.5" fill="currentColor" fillOpacity="0.05" />
                
                {/* Ribbon bands */}
                <path d="M32,27 L32,64" strokeWidth="4.5" />
                <path d="M11,51 L53,51" strokeWidth="4.5" />
              </g>
            </svg>
          </div>

          <h2 className="font-heading font-medium text-2xl md:text-3xl text-espresso tracking-[0.06em] mb-4 uppercase">
            NO ACTIVE CAMPAIGNS
          </h2>
          
          <p className="font-body text-[#6B5B52] text-sm md:text-[15px] leading-[1.6] max-w-md mx-auto mb-10">
            {"We're currently preparing our next rewards campaign. Follow us on social media or check back soon for exciting offers and rewards."}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/menu"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-7 py-3.5 bg-roasted hover:bg-dark-roast text-cream text-[11px] uppercase tracking-widest font-semibold rounded-full shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
            >
              ☕ Browse Menu
            </Link>
            <Link
              href="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-7 py-3.5 border border-espresso/25 text-espresso hover:bg-espresso hover:text-cream text-[11px] uppercase tracking-widest font-semibold rounded-full hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
            >
              📞 Contact Us
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
