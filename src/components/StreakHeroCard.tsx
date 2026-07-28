'use client';

import { useState } from 'react';

export interface StreakCampaignData {
  id?: string;
  name?: string;
  tagline?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  metadata?: {
    badge_text?: string;
    sub_tagline?: string;
    image_url?: string;
    how_it_works?: {
      steps?: string[];
      footnote?: string;
    };
  } | null;
}

interface StreakHeroCardProps {
  streakCampaign?: StreakCampaignData | null;
  onOpenStampSearch?: () => void;
}

export default function StreakHeroCard({ streakCampaign, onOpenStampSearch }: StreakHeroCardProps) {
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  const title = streakCampaign?.name || 'Brew Streak Rewards';
  const subTagline = streakCampaign?.metadata?.sub_tagline || '10% upto 11am';
  const tagline = streakCampaign?.tagline || 'Keep your streak alive and earn amazing rewards!';
  const badgeText = streakCampaign?.metadata?.badge_text || 'STREAK REWARD';

  const formatDateRange = () => {
    if (!streakCampaign?.start_date && !streakCampaign?.end_date) return '21 Jun 2026 - 21 Aug 2026';
    const fmt = (d: string) => new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    if (streakCampaign?.start_date && streakCampaign?.end_date) {
      return `${fmt(streakCampaign.start_date)} - ${fmt(streakCampaign.end_date)}`;
    }
    if (streakCampaign?.start_date) return `Starts: ${fmt(streakCampaign.start_date)}`;
    if (streakCampaign?.end_date) return `Ends: ${fmt(streakCampaign.end_date)}`;
    return 'Active Loyalty Program';
  };

  const steps = streakCampaign?.metadata?.how_it_works?.steps || [
    'Give your phone number to our barista on checkout',
    'Earn 1 stamp per day upon coffee purchase',
    'Collect 10 stamps to earn 1 free coffee of choice',
    'Show your completed card to redeem rewards'
  ];

  return (
    <div className="relative w-full rounded-[28px] overflow-hidden bg-gradient-to-r from-[#FCE8D5] via-[#FDF2E6] to-[#F8DAC4] border border-[#EAC4A8] shadow-[0_6px_24px_rgba(194,125,56,0.08)] p-6 md:p-9">
      {/* Subtle Confetti Decorative Shapes */}
      <div className="absolute inset-0 pointer-events-none opacity-40 overflow-hidden">
        <div className="absolute top-4 left-1/4 w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
        <div className="absolute top-12 left-1/3 w-3 h-3 rotate-45 bg-amber-400" />
        <div className="absolute bottom-6 left-1/2 w-2 h-2 rounded-full bg-rose-400" />
        <div className="absolute top-8 right-1/4 w-3 h-3 rotate-12 bg-orange-500" />
        <div className="absolute bottom-10 right-1/3 w-2 h-2 rounded-full bg-amber-500" />
      </div>

      {/* Top Right "STREAK REWARD" Badge */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6 z-20">
        <span className="px-3.5 py-1.5 bg-[#EE6C4D] text-white font-heading font-extrabold text-[11px] uppercase tracking-widest rounded-full shadow-sm">
          {badgeText}
        </span>
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 md:gap-8">
        {/* Left Side Info */}
        <div className="flex-1 space-y-3 text-left">
          <div className="flex items-center gap-3">
            {/* Flame Icon Badge */}
            <div className="w-12 h-12 rounded-full bg-white/90 shadow-sm border border-orange-200/50 flex items-center justify-center text-2xl shrink-0">
              🔥
            </div>
            <div>
              <h2 className="font-heading font-black text-2xl md:text-3xl text-espresso tracking-tight">
                {title}
              </h2>
              {subTagline && (
                <p className="font-heading font-extrabold text-sm md:text-base text-roasted">
                  {subTagline}
                </p>
              )}
            </div>
          </div>

          <p className="font-body text-xs md:text-sm text-[#5C4D44] max-w-lg leading-relaxed">
            {tagline}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 backdrop-blur-sm border border-amber-900/10 text-xs font-semibold text-roasted">
              <svg className="w-4 h-4 text-roasted" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>{formatDateRange()}</span>
            </div>

            {onOpenStampSearch && (
              <button
                onClick={onOpenStampSearch}
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-roasted hover:bg-dark-roast text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-sm transition-transform active:scale-95"
              >
                Check My Stamps 💳
              </button>
            )}

            <button
              onClick={() => setShowHowItWorks(!showHowItWorks)}
              className="text-xs font-semibold text-espresso hover:text-roasted underline underline-offset-4"
            >
              {showHowItWorks ? 'Hide Rules' : 'How Streak Works'}
            </button>
          </div>

          {/* Expanded Streak How it Works */}
          {showHowItWorks && (
            <div className="mt-4 p-4 bg-white/80 backdrop-blur-md rounded-2xl border border-amber-900/10 space-y-2 animate-fade-up">
              <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-espresso">
                Streak Loyalty Rules
              </h4>
              <ol className="list-decimal list-inside space-y-1.5 text-xs text-[#52443C] font-body">
                {steps.map((st, i) => (
                  <li key={i}>{st}</li>
                ))}
              </ol>
            </div>
          )}
        </div>

        {/* Right Side Artwork (Coffee Cup + Stamp Overlay) */}
        <div className="relative shrink-0 flex items-center justify-center mt-2 lg:mt-0">
          <div className="relative w-44 h-44 md:w-52 md:h-52 flex items-center justify-center">
            {/* Coffee Cup Graphic Container */}
            <div className="w-36 h-40 md:w-40 md:h-44 bg-white rounded-t-3xl rounded-b-2xl shadow-xl border-2 border-amber-900/10 relative flex flex-col items-center justify-center p-3">
              {/* Cup Lid */}
              <div className="absolute -top-3 w-32 md:w-36 h-5 bg-[#3D261C] rounded-full shadow-md" />
              {/* Cup Sleeve with Logo */}
              <div className="w-full h-20 bg-[#C27D38] rounded-xl flex items-center justify-center text-white shadow-inner">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold">
                  🔥
                </div>
              </div>
            </div>

            {/* Stamp Circle Overlay Badge (10% OFF UPTO 11AM) */}
            <div className="absolute bottom-2 right-0 md:bottom-3 md:-right-2 w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#3D261C] text-white border-2 border-amber-200 shadow-xl flex flex-col items-center justify-center p-2 text-center transform rotate-12 hover:rotate-0 transition-transform">
              <span className="font-heading font-black text-xs md:text-sm text-amber-300 leading-tight">
                10% OFF
              </span>
              <span className="font-body text-[9px] md:text-[10px] uppercase font-bold text-white/90 leading-tight">
                UPTO 11AM
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
