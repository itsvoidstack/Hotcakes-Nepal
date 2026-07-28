'use client';

import { useState } from 'react';

export interface HowItWorksData {
  steps?: string[];
  footnote?: string;
}

export interface CampaignCardData {
  id: string;
  name: string;
  tagline?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  status?: string;
  type?: string;
  priority?: number;
  metadata?: {
    description?: string;
    image_url?: string;
    badge_text?: string;
    cta_text?: string;
    cta_link?: string;
    promo_code?: string;
    tags?: string;
    how_it_works?: HowItWorksData;
  } | null;
}

interface CampaignCardProps {
  campaign: CampaignCardData;
  index?: number;
}

export default function CampaignCard({ campaign, index = 0 }: CampaignCardProps) {
  const [isExpandedMobile, setIsExpandedMobile] = useState(false);

  const meta = campaign.metadata || {};
  const badgeText = meta.badge_text || 'ACTIVE OFFER';
  const description = meta.description || campaign.tagline || '';
  const imageUrl = meta.image_url;
  const promoCode = meta.promo_code;
  const ctaText = meta.cta_text;
  const ctaLink = meta.cta_link;

  const howItWorks = meta.how_it_works || {};
  const steps = howItWorks.steps && howItWorks.steps.length > 0
    ? howItWorks.steps
    : [
        'Select eligible items from our menu',
        'Apply offer or promo code at checkout',
        'Enjoy your promotional reward!'
      ];
  const footnote = howItWorks.footnote || '* Valid during campaign period only';

  const formatDateRange = () => {
    if (!campaign.start_date && !campaign.end_date) return null;
    const format = (dStr: string) => {
      const d = new Date(dStr);
      return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    };
    if (campaign.start_date && campaign.end_date) {
      return `${format(campaign.start_date)} - ${format(campaign.end_date)}`;
    }
    if (campaign.start_date) return `From ${format(campaign.start_date)}`;
    if (campaign.end_date) return `Until ${format(campaign.end_date)}`;
    return null;
  };

  const dateRangeStr = formatDateRange();

  // Gradients for fallback card banners if no image uploaded
  const fallbackGradients = [
    'from-[#2E1F18] via-[#4A3225] to-[#1E120C]', // Dark BOGO roast
    'from-[#F7E1D7] via-[#EDC4B3] to-[#DEAB90]', // Summer Chill peach
    'from-[#0F3B2E] via-[#1B5240] to-[#0A261D]', // Weekend Special forest green
    'from-[#3D2645] via-[#834973] to-[#241729]', // Velvet Berry
  ];
  const fallbackGradient = fallbackGradients[index % fallbackGradients.length];

  // Header background theme text colors for fallback
  const isDarkFallback = index % 2 === 0 || index % 3 === 2;

  return (
    <div className="bg-warm-white border border-latte/70 rounded-[24px] overflow-hidden flex flex-col shadow-[0_4px_20px_rgba(46,34,27,0.03)] hover:shadow-lg transition-all duration-300 group">
      {/* ── CARD BANNER IMAGE / GRAPHIC ── */}
      <div className={`relative h-48 md:h-52 w-full overflow-hidden flex items-center justify-center p-6 ${!imageUrl ? `bg-gradient-to-br ${fallbackGradient}` : 'bg-mocha/10'}`}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={campaign.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="text-center space-y-2 relative z-10">
            <span className={`text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full border backdrop-blur-md ${isDarkFallback ? 'text-amber-200 border-amber-200/30 bg-black/20' : 'text-espresso border-espresso/20 bg-white/40'}`}>
              Special Offer
            </span>
            <h3 className={`font-heading font-black text-2xl md:text-3xl uppercase tracking-tight leading-tight drop-shadow-sm ${isDarkFallback ? 'text-cream' : 'text-espresso'}`}>
              {campaign.name}
            </h3>
            {promoCode && (
              <p className={`font-mono text-xs font-bold tracking-widest uppercase ${isDarkFallback ? 'text-amber-300' : 'text-roasted'}`}>
                Code: {promoCode}
              </p>
            )}
          </div>
        )}

        {/* Claimed / Badge Tag (Top or Bottom Right overlay) */}
        {badgeText && (
          <div className="absolute bottom-3 right-3 z-10">
            <span className="px-3 py-1 bg-white/95 backdrop-blur-sm border border-latte/40 text-roasted font-heading font-bold text-[11px] uppercase tracking-wider rounded-full shadow-sm">
              {badgeText}
            </span>
          </div>
        )}
      </div>

      {/* ── CARD CONTENT BODY ── */}
      <div className="p-5 md:p-6 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-heading font-bold text-xl text-espresso mb-1.5 group-hover:text-roasted transition-colors">
            {campaign.name}
          </h3>
          {description && (
            <p className="font-body text-xs md:text-sm text-[#6B5B52] leading-relaxed mb-4">
              {description}
            </p>
          )}
        </div>

        {/* Dates & Quick Metadata */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-latte/40 text-xs font-body text-mocha/80 mb-4">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-roasted">
            <svg className="w-3.5 h-3.5 text-roasted shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>{dateRangeStr || 'Limited Time Offer'}</span>
          </div>
          {promoCode && (
            <span className="px-2.5 py-0.5 bg-roasted/10 text-roasted font-mono text-[10px] font-bold rounded-md">
              {promoCode}
            </span>
          )}
        </div>

        {/* Optional CTA Button */}
        {ctaText && ctaLink && (
          <div className="mb-4">
            <a
              href={ctaLink}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-roasted hover:bg-dark-roast text-cream text-xs font-semibold uppercase tracking-wider rounded-xl shadow-sm transition-all duration-200"
            >
              {ctaText} &rarr;
            </a>
          </div>
        )}
      </div>

      {/* ── EXPANDABLE "HOW IT WORKS" SECTION INSIDE CARD ── */}
      <div className="bg-[#FAF7F2] border-t border-latte/50 p-4 md:p-5">
        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 font-heading font-bold text-xs uppercase tracking-wider text-espresso">
            <svg className="w-4 h-4 text-roasted" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
            </svg>
            <span>How it works?</span>
          </div>
        </div>

        {/* Mobile Expand Accordion Trigger Button */}
        <button
          onClick={() => setIsExpandedMobile(!isExpandedMobile)}
          className="md:hidden w-full flex items-center justify-between font-heading font-bold text-xs uppercase tracking-wider text-espresso focus:outline-none"
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-roasted" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
            </svg>
            <span>How it works?</span>
          </div>
          <svg
            className={`w-4 h-4 text-mocha transition-transform duration-300 ${isExpandedMobile ? 'rotate-180' : 'rotate-0'}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        {/* Steps Content (Visible by default on Desktop, Accordion toggle on Mobile) */}
        <div className={`mt-3 space-y-2.5 transition-all duration-300 ${isExpandedMobile ? 'block' : 'hidden md:block'}`}>
          {steps.map((step, sIdx) => (
            <div key={sIdx} className="flex items-start gap-2.5 font-body text-xs text-[#52443C]">
              <span className="w-5 h-5 rounded-full bg-[#C27D38] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                {sIdx + 1}
              </span>
              <span className="leading-snug pt-0.5">{step}</span>
            </div>
          ))}
          {footnote && (
            <p className="text-[10px] text-mocha/70 font-body italic pt-1 border-t border-latte/30">
              {footnote}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
