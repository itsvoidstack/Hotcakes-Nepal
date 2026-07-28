import Link from 'next/link';
import Image from 'next/image';
import { getSupabaseAdmin } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: "Order Online — Hotcakes Nepal | Delivery to Lalitpur & Kathmandu",
  description: "Order Hotcakes Nepal online via Bhoj, Foodmandu, or custom order — pancakes, coffee & handcrafted desserts delivered to Lalitpur and Kathmandu.",
  alternates: {
    canonical: "https://hotcakes-nepal.vercel.app/order"
  },
};

interface OrderLinkItem {
  platform: string;
  display_name?: string | null;
  url?: string | null;
  is_active: boolean;
  metadata?: {
    button_text?: string;
    logo_url?: string;
    custom_icon?: string;
    bg_color?: string;
  } | null;
}

export default async function OrderPage() {
  const supabase = getSupabaseAdmin();
  
  // Fetch active order links
  const { data: dbLinks } = await supabase
    .from('order_links')
    .select('*');

  const linksList: OrderLinkItem[] = (dbLinks as OrderLinkItem[]) || [];

  const getLink = (platformKey: string) => linksList.find(l => l.platform === platformKey);

  const bhojLink = getLink('bhoj');
  const foodmanduLink = getLink('foodmandu');
  const customLink = getLink('custom');

  // Secondary platforms for "MORE WAYS TO ORDER"
  // Only include active links that have a non-empty target URL
  const secondaryPlatforms = linksList.filter(
    l => l.platform !== 'bhoj' && l.platform !== 'foodmandu' && l.platform !== 'custom'
  );

  const activeMoreWays = secondaryPlatforms.filter(
    l => l.is_active && l.url && l.url.trim() !== '' && l.url.trim() !== '#'
  );

  // Helper to render secondary platform logos
  const renderPlatformLogo = (item: OrderLinkItem) => {
    if (item.metadata?.logo_url) {
      return (
        <img
          src={item.metadata.logo_url}
          alt={item.display_name || item.platform}
          className="w-12 h-12 rounded-full object-cover shadow-sm border border-latte shrink-0"
        />
      );
    }
    const key = item.platform.toLowerCase();
    if (key.includes('pathao')) {
      return (
        <div className="w-12 h-12 rounded-full bg-[#00B14F] text-white font-black text-xl flex items-center justify-center shadow-sm shrink-0">
          P
        </div>
      );
    }
    if (key.includes('daraz')) {
      return (
        <div className="w-12 h-12 rounded-full bg-[#F57224] text-white font-black text-xl flex items-center justify-center shadow-sm shrink-0">
          d
        </div>
      );
    }
    if (key.includes('khalti')) {
      return (
        <div className="w-12 h-12 rounded-full bg-[#5C2D91] text-white font-black text-base flex flex-col items-center justify-center shadow-sm shrink-0 p-1">
          <span className="font-extrabold text-xs leading-none">K</span>
          <span className="text-[7px] leading-none opacity-80">khalti</span>
        </div>
      );
    }
    return (
      <div className="w-12 h-12 rounded-full bg-roasted text-white font-bold text-base flex items-center justify-center shadow-sm shrink-0 uppercase">
        {(item.display_name || item.platform).charAt(0)}
      </div>
    );
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-10 md:py-20 px-4 flex flex-col items-center">
      <div className="max-w-[1240px] w-full mx-auto space-y-12 md:space-y-16">

        {/* ── 1. HEADER TITLE ── */}
        <div className="text-center space-y-2">
          <h1 className="font-heading font-medium text-xs md:text-sm uppercase tracking-[0.25em] text-[#2D2118] leading-none">
            CHOOSE HOW YOU&apos;D LIKE TO ORDER
          </h1>
          <div className="flex items-center justify-center gap-2 text-roasted opacity-60 pt-1">
            <div className="w-8 h-px bg-latte/70" />
            <span className="text-xs">❦</span>
            <div className="w-8 h-px bg-latte/70" />
          </div>
        </div>

        {/* ── 2. FEATURED 3 ORDER CARDS GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          
          {/* Card 1: ORDER ON BHOJ */}
          <div className="bg-white border border-latte/60 rounded-[28px] p-8 md:p-10 text-center shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
            <div>
              <div className="relative w-28 h-28 mx-auto mb-6 flex items-center justify-center">
                <div className="absolute inset-0 bg-[#FAF7F3] rounded-full scale-[1.1] opacity-50 border border-dashed border-latte" />
                {bhojLink?.metadata?.logo_url ? (
                  <img
                    src={bhojLink.metadata.logo_url}
                    alt={bhojLink.display_name || 'Bhoj'}
                    className="w-24 h-24 rounded-full object-cover shadow-sm border border-latte/50 relative z-10"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-white shadow-sm border border-latte/50 flex flex-col items-center justify-center relative z-10">
                    <span className="text-[#F25C22] font-sans font-bold text-[28px] tracking-tight leading-none">bhoj</span>
                    <svg className="w-12 h-3 text-[#F25C22] mt-1" viewBox="0 0 40 10" fill="none">
                      <path d="M3 2C10 7.5 30 7.5 37 2" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                )}
              </div>
              
              <h3 className="font-heading font-bold text-base text-[#2D2118] uppercase tracking-wider mb-2">
                {bhojLink?.display_name || 'ORDER ON BHOJ'}
              </h3>
              <p className="font-body text-mocha/90 text-xs md:text-sm leading-relaxed mb-6">
                Order your favorite Hotcakes items instantly on the Bhoj app.
              </p>
            </div>
            
            <div>
              {bhojLink && bhojLink.is_active && bhojLink.url && bhojLink.url !== '#' ? (
                <a
                  href={bhojLink.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-1.5 px-6 py-3.5 bg-[#8C5835] hover:bg-[#724426] text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-sm transition-all"
                >
                  {bhojLink.metadata?.button_text || 'ORDER NOW >'}
                </a>
              ) : (
                <span className="w-full inline-flex items-center justify-center px-6 py-3.5 bg-[#EFECE6] text-[#A0958D] text-xs font-bold uppercase tracking-widest rounded-full cursor-default">
                  COMING SOON
                </span>
              )}
            </div>
          </div>

          {/* Card 2: ORDER ON FOODMANDU */}
          <div className="bg-white border border-latte/60 rounded-[28px] p-8 md:p-10 text-center shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
            <div>
              <div className="relative w-28 h-28 mx-auto mb-6 flex items-center justify-center">
                <div className="absolute inset-0 bg-[#FAF7F3] rounded-full scale-[1.1] opacity-50 border border-dashed border-latte" />
                {foodmanduLink?.metadata?.logo_url ? (
                  <img
                    src={foodmanduLink.metadata.logo_url}
                    alt={foodmanduLink.display_name || 'Foodmandu'}
                    className="w-24 h-24 rounded-full object-cover shadow-sm border border-latte/50 relative z-10"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-[#FFEB00] shadow-sm flex flex-col items-center justify-center relative z-10 p-2">
                    <svg className="w-10 h-10 text-black mb-1" viewBox="0 0 100 100" fill="currentColor">
                      <circle cx="28" cy="28" r="14" />
                      <circle cx="72" cy="28" r="14" />
                      <circle cx="50" cy="56" r="38" fill="white" />
                      <circle cx="50" cy="56" r="38" fill="none" stroke="black" strokeWidth="6" />
                      <ellipse cx="38" cy="52" rx="10" ry="12" transform="rotate(-15 38 52)" fill="black" />
                      <ellipse cx="62" cy="52" rx="10" ry="12" transform="rotate(15 62 52)" fill="black" />
                      <circle cx="39" cy="50" r="3.5" fill="white" />
                      <circle cx="61" cy="50" r="3.5" fill="white" />
                      <path d="M46 64 C46 62 54 62 54 64 C54 67 46 67 46 64 Z" fill="black" />
                    </svg>
                    <span className="text-black font-sans font-extrabold text-[9px] uppercase tracking-wider leading-none">foodmandu</span>
                  </div>
                )}
              </div>
              
              <h3 className="font-heading font-bold text-base text-[#2D2118] uppercase tracking-wider mb-2">
                {foodmanduLink?.display_name || 'ORDER ON FOODMANDU'}
              </h3>
              <p className="font-body text-mocha/90 text-xs md:text-sm leading-relaxed mb-6">
                Get Hotcakes delivered to your doorstep through Foodmandu.
              </p>
            </div>
            
            <div>
              {foodmanduLink && foodmanduLink.is_active && foodmanduLink.url && foodmanduLink.url !== '#' ? (
                <a
                  href={foodmanduLink.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-1.5 px-6 py-3.5 bg-[#8C5835] hover:bg-[#724426] text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-sm transition-all"
                >
                  {foodmanduLink.metadata?.button_text || 'ORDER NOW >'}
                </a>
              ) : (
                <span className="w-full inline-flex items-center justify-center px-6 py-3.5 bg-[#EFECE6] text-[#A0958D] text-xs font-bold uppercase tracking-widest rounded-full cursor-default">
                  COMING SOON
                </span>
              )}
            </div>
          </div>

          {/* Card 3: CUSTOM ORDER */}
          <div className="bg-white border border-latte/60 rounded-[28px] p-8 md:p-10 text-center shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
            <div>
              <div className="relative w-28 h-28 mx-auto mb-6 flex items-center justify-center">
                <div className="absolute inset-0 bg-[#FAF7F3] rounded-full scale-[1.1] opacity-50 border border-dashed border-latte" />
                {customLink?.metadata?.logo_url ? (
                  <img
                    src={customLink.metadata.logo_url}
                    alt={customLink.display_name || 'Custom Order'}
                    className="w-24 h-24 rounded-full object-cover shadow-sm border border-latte/50 relative z-10"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-white shadow-sm border border-latte/50 flex items-center justify-center relative z-10">
                    <svg className="w-10 h-10 text-[#8C5835]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 15h6" />
                    </svg>
                  </div>
                )}
              </div>
              
              <h3 className="font-heading font-bold text-base text-[#2D2118] uppercase tracking-wider mb-2">
                {customLink?.display_name || 'CUSTOM ORDER'}
              </h3>
              <p className="font-body text-mocha/90 text-xs md:text-sm leading-relaxed mb-6">
                Have a special request? We&apos;re here to make it happen.
              </p>
            </div>
            
            <div>
              <Link
                href={customLink?.url || '/contact'}
                className="w-full inline-flex items-center justify-center gap-1.5 px-6 py-3.5 bg-[#8C5835] hover:bg-[#724426] text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-sm transition-all"
              >
                {customLink?.metadata?.button_text || 'PLACE A CUSTOM ORDER >'}
              </Link>
            </div>
          </div>

        </div>

        {/* ── 3. MORE WAYS TO ORDER SECTION (Dashed Container) ── */}
        {/* Hidden completely if no active secondary links exist! */}
        {activeMoreWays.length > 0 && (
          <div className="p-6 md:p-8 rounded-[28px] border-2 border-dashed border-[#E5D7C8] bg-[#FDFBFA] space-y-6 text-center animate-fade-up">
            <div>
              <h3 className="font-heading font-bold text-sm md:text-base uppercase tracking-[0.2em] text-[#2D2118]">
                MORE WAYS TO ORDER
              </h3>
              <p className="font-body text-xs text-mocha/80 mt-1">
                Explore more platforms to get your favorites delivered.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeMoreWays.map((item, idx) => {
                const displayName = item.display_name || item.platform.toUpperCase();
                const btnText = item.metadata?.button_text || 'ORDER NOW >';
                const url = item.url || '#';

                return (
                  <div key={idx} className="bg-white border border-latte/70 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      {renderPlatformLogo(item)}
                      <span className="font-heading font-bold text-xs uppercase tracking-wider text-[#2D2118]">
                        {displayName}
                      </span>
                    </div>

                    <a
                      href={url}
                      target={url.startsWith('http') ? '_blank' : '_self'}
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-[#8C5835] hover:bg-[#724426] text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm transition-transform active:scale-95 shrink-0"
                    >
                      {btnText}
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── 4. CUSTOM ORDER HERO SECTION (Bottom Banner) ── */}
        <div className="bg-white border border-latte/70 rounded-[32px] p-8 md:p-12 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column Text */}
            <div className="lg:col-span-7 space-y-4 text-left">
              <span className="font-serif italic text-roasted text-xs md:text-sm block">
                Made Just for You <span className="not-italic">♥</span>
              </span>
              <h2 className="font-heading font-bold text-3xl md:text-4xl text-[#2D2118] tracking-tight">
                CUSTOM ORDER
              </h2>
              <p className="font-body text-xs md:text-sm text-mocha leading-relaxed max-w-xl">
                Planning a celebration, event, or something special? Tell us what you need — custom cakes, desserts, or pancake platters — and we&apos;ll create it with love.
              </p>
              
              {/* Feature Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#2D2118]">
                  <span>🎂</span>
                  <span>Custom cakes &amp; desserts</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#2D2118]">
                  <span>🎁</span>
                  <span>Events &amp; celebrations</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#2D2118]">
                  <span>💬</span>
                  <span>Special dietary requests</span>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  href={customLink?.url || '/contact'}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#8C5835] hover:bg-[#724426] text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-sm transition-all"
                >
                  {customLink?.metadata?.button_text || 'PLACE A CUSTOM ORDER >'}
                </Link>
              </div>
            </div>

            {/* Right Column Photo */}
            <div className="lg:col-span-5 w-full flex justify-center">
              <div className="relative aspect-[4/3] rounded-[24px] overflow-hidden bg-latte/10 shadow-sm border border-latte/40 max-w-md w-full">
                <Image
                  src="/images/custom_order_banner.png"
                  alt="Custom cake and dessert order at Hotcakes Nepal — handcrafted for events and celebrations in Lalitpur"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 480px"
                />
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
