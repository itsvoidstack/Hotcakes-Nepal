import Link from 'next/link';
import Image from 'next/image';
import { getSupabaseAdmin } from '@/lib/supabase/client';
import { getOpeningHoursStatus, OpeningHours } from '@/lib/openingHours';
import type { Metadata } from 'next';

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Order Online — Pancakes, Coffee & Desserts Delivered to Lalitpur & Kathmandu",
  description: "Order Hotcakes Nepal online via Bhoj or Foodmandu — fluffy pancakes, specialty coffee, fresh baked muffins, cookies, and handcrafted desserts delivered to Lalitpur, Kathmandu, and nearby areas. Custom orders available for events and celebrations.",
  alternates: {
    canonical: "https://hotcakes-nepal.vercel.app/order"
  },
  openGraph: {
    title: "Order Online — Hotcakes Nepal | Delivery to Lalitpur & Kathmandu",
    description: "Order fluffy pancakes, hand-drip specialty coffee, and fresh baked desserts via Bhoj or Foodmandu. Fast delivery to Lalitpur, Kathmandu, and nearby areas. Custom orders also available.",
    url: "https://hotcakes-nepal.vercel.app/order",
    images: [
      {
        url: "https://hotcakes-nepal.vercel.app/images/order_hero.png",
        width: 1200,
        height: 630,
        alt: "Order Hotcakes Nepal online — pancakes, coffee and desserts delivered to Lalitpur and Kathmandu",
      },
    ],
  },
};

export default async function OrderPage() {
  const supabase = getSupabaseAdmin();
  // Fetch active order links, contact details, opening hours, and open status in parallel
  const [linksResult, contactResult, openingHoursResult, openStatusResult, siteDescResult] = await Promise.all([
    supabase.from('order_links').select('*').eq('is_active', true),
    supabase.from('contact_info').select('*'),
    supabase.from('site_settings').select('value').eq('key', 'opening_hours').maybeSingle(),
    supabase.from('site_settings').select('value').eq('key', 'open_status').maybeSingle(),
    supabase.from('site_settings').select('value').eq('key', 'order_description').maybeSingle()
  ]);

  const activeLinks = linksResult.data || [];
  const contacts = contactResult.data || [];
  const getContact = (key: string) => contacts.find(c => c.key === key)?.value || '';

  const isOpen = (openStatusResult?.data?.value as { is_open?: boolean })?.is_open ?? true;
  const hoursSetting = openingHoursResult?.data;
  const openingHours = hoursSetting?.value ? (hoursSetting.value as OpeningHours) : null;
  const statusInfo = getOpeningHoursStatus(openingHours, isOpen);

  const phoneNumber = getContact('phone') || '01-5432100';
  const displayAddress = getContact('address') || 'Lalitpur, Kathmandu & Nearby';
  const siteDescription = (siteDescResult?.data?.value as { text?: string })?.text ||
    'Get your favourite Hotcakes Nepal items delivered — fluffy pancakes, hand-drip specialty coffee, fresh baked desserts, and more.';

  const isBhojActive = activeLinks.some(l => l.platform === 'bhoj');
  const bhojUrl = activeLinks.find(l => l.platform === 'bhoj')?.url || '#';

  const isFoodmanduActive = activeLinks.some(l => l.platform === 'foodmandu');
  const foodmanduUrl = activeLinks.find(l => l.platform === 'foodmandu')?.url || '#';

  return (
    <div className="bg-warm-white min-h-screen py-12 md:py-24 px-4 flex flex-col items-center relative overflow-hidden">
      {/* Subtle Floating Decorative Elements */}
      {/* Floating Coffee Bean Top Left */}
      <div className="absolute top-20 left-6 lg:left-24 text-roasted opacity-[0.07] pointer-events-none hidden sm:block animate-pulse duration-[4s]">
        <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.5 4.5c-2.4-2.4-6.3-2.4-8.7 0L4.5 10.8c-2.4 2.4-2.4 6.3 0 8.7s6.3 2.4 8.7 0l6.3-6.3c2.4-2.4 2.4-6.3 0-8.7zm-2.2 2.2c1.2 1.2 1.2 3.1 0 4.3L11 17.3c-.6.6-1.4.9-2.2.9-1.2 0-2.3-.6-2.9-1.6.8-.4 1.7-.6 2.6-.6 1.9 0 3.7.8 5.1 2.2.3-.3.6-.6.8-.9-1.2-1.2-1.2-3.1 0-4.3l6.3-6.3c.3-.3.5-.6.6-.9-.8.4-1.7.6-2.6.6-1.9 0-3.7-.8-5.1-2.2z" />
        </svg>
      </div>

      {/* Floating Latte Art Wave Right Margins */}
      <div className="absolute top-[35%] right-6 lg:right-20 text-roasted opacity-[0.06] pointer-events-none hidden lg:block">
        <svg className="w-20 h-10" viewBox="0 0 48 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 12 C10 4, 14 20, 20 12 C26 4, 30 20, 36 12 C42 4, 44 20, 48 12" strokeLinecap="round" />
        </svg>
      </div>

      {/* Floating Coffee Cup Bottom Left Margins */}
      <div className="absolute bottom-[20%] left-6 lg:left-20 text-roasted opacity-[0.06] pointer-events-none hidden lg:block">
        <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
          <path d="M6 3v2M10 3v2M14 3v2" strokeLinecap="round" />
        </svg>
      </div>

      {/* 1. Hero Section */}
      <section className="max-w-[1240px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center mb-12 md:mb-20 px-4 animate-fade-up">
        {/* Left Column (Content) */}
        <div className="lg:col-span-7 flex flex-col text-left items-start">
          <span className="font-body text-[#A97A4C] text-[11px] font-semibold uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
            <span>Good food. Great moments.</span>
            <span className="text-xs">❦</span>
          </span>
          <h1 className="font-heading font-medium text-3xl sm:text-5xl lg:text-[56px] text-[#2D2118] leading-[1.1] mb-4 tracking-tight">
            ORDER YOUR FAVORITES
          </h1>
          <p className="font-body text-mocha text-sm md:text-base leading-relaxed mb-6 max-w-xl">
            {siteDescription}
          </p>
          
          {/* Highlights */}
          <div className="grid grid-cols-3 gap-4 w-full pt-5 border-t border-latte/60">
            <div className="flex flex-col items-start">
              <span className="text-lg mb-1.5">☕</span>
              <h4 className="font-heading font-bold text-[10px] sm:text-xs text-[#2D2118] uppercase tracking-wider mb-0.5">Freshly Prepared</h4>
              <p className="font-body text-mocha/80 text-[10px] leading-snug hidden sm:block">Made with quality ingredients</p>
            </div>
            <div className="flex flex-col items-start">
              <span className="text-lg mb-1.5">🛵</span>
              <h4 className="font-heading font-bold text-[10px] sm:text-xs text-[#2D2118] uppercase tracking-wider mb-0.5">Fast Delivery</h4>
              <p className="font-body text-mocha/80 text-[10px] leading-snug hidden sm:block">Quick delivery to your doorstep</p>
            </div>
            <div className="flex flex-col items-start">
              <span className="text-lg mb-1.5">🤎</span>
              <h4 className="font-heading font-bold text-[10px] sm:text-xs text-[#2D2118] uppercase tracking-wider mb-0.5">Made with Love</h4>
              <p className="font-body text-mocha/80 text-[10px] leading-snug hidden sm:block">Every order is made just for you</p>
            </div>
          </div>
        </div>

        {/* Right Column (Hero Image) */}
        <div className="lg:col-span-5 w-full flex justify-center">
          <div className="relative aspect-[4/3] rounded-[24px] sm:rounded-[32px] overflow-hidden bg-latte/10 shadow-sm border border-latte/40 max-w-sm sm:max-w-md w-full">
            <Image
              src="/images/order_hero.png"
              alt="Hotcakes Nepal order — fluffy pancakes, specialty coffee, and handcrafted desserts delivered to Lalitpur and Kathmandu"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 480px"
              priority
            />
          </div>
        </div>
      </section>

      {/* 2. Divider Header */}
      <div className="max-w-[1240px] w-full text-center mb-10 md:mb-14 animate-fade-up">
        <h2 className="font-heading font-medium text-xs md:text-sm uppercase tracking-[0.2em] text-[#2D2118] mb-3 leading-none">
          CHOOSE HOW YOU&apos;D LIKE TO ORDER
        </h2>
        <div className="flex items-center justify-center gap-2 text-roasted opacity-60">
          <div className="w-8 h-px bg-latte/70" />
          <span className="text-xs">❦</span>
          <div className="w-8 h-px bg-latte/70" />
        </div>
      </div>

      {/* 3. Ordering Options Cards */}
      <div className="max-w-[1240px] w-full mx-auto grid grid-cols-1 sm:grid-cols-3 gap-5 md:gap-8 mb-14 md:mb-24 px-4 animate-fade-up">
        {/* Bhoj Card */}
        <div className="bg-white border border-latte rounded-[24px] p-6 md:p-10 text-center shadow-sm flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all duration-300 h-full">
          <div>
            {/* Custom Bhoj Logo with Splash */}
            <div className="relative w-28 h-28 mx-auto mb-6 flex items-center justify-center">
              <div className="absolute inset-0 bg-[#FAF7F3] rounded-full scale-[1.1] opacity-50 border border-dashed border-latte" />
              <div className="w-24 h-24 rounded-full bg-white shadow-sm border border-latte/50 flex flex-col items-center justify-center relative z-10">
                <span className="text-[#F25C22] font-sans font-bold text-[28px] tracking-tight leading-none">bhoj</span>
                <svg className="w-12 h-3 text-[#F25C22] mt-1" viewBox="0 0 40 10" fill="none">
                  <path d="M3 2C10 7.5 30 7.5 37 2" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
            
            <h3 className="font-heading font-medium text-lg text-[#2D2118] uppercase tracking-wider mb-2">
              ORDER ON BHOJ
            </h3>
            <p className="font-body text-mocha text-sm leading-relaxed mb-6">
              Order your favorite Hotcakes items instantly on the Bhoj app.
            </p>
          </div>
          
          <div className="mt-auto">
            {isBhojActive ? (
              <Link
                href={bhojUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-1 px-6 py-3 bg-roasted hover:bg-dark-roast text-cream text-[11px] uppercase tracking-widest font-semibold rounded-full shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
              >
                Order on Bhoj <span className="text-xs ml-1">›</span>
              </Link>
            ) : (
              <span className="w-full inline-flex items-center justify-center px-6 py-3 bg-mocha/10 text-mocha/60 text-[11px] uppercase tracking-widest font-semibold rounded-full cursor-not-allowed">
                Coming Soon
              </span>
            )}
          </div>
        </div>

        {/* Foodmandu Card */}
        <div className="bg-white border border-latte rounded-[24px] p-6 md:p-10 text-center shadow-sm flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all duration-300 h-full">
          <div>
            {/* Custom Foodmandu Logo with Splash */}
            <div className="relative w-28 h-28 mx-auto mb-6 flex items-center justify-center">
              <div className="absolute inset-0 bg-[#FAF7F3] rounded-full scale-[1.1] opacity-50 border border-dashed border-latte" />
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
            </div>
            
            <h3 className="font-heading font-medium text-lg text-[#2D2118] uppercase tracking-wider mb-2">
              ORDER ON FOODMANDU
            </h3>
            <p className="font-body text-mocha text-sm leading-relaxed mb-6">
              Get Hotcakes delivered to your doorstep through Foodmandu.
            </p>
          </div>
          
          <div className="mt-auto">
            {isFoodmanduActive ? (
              <Link
                href={foodmanduUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-1 px-6 py-3 bg-roasted hover:bg-dark-roast text-cream text-[11px] uppercase tracking-widest font-semibold rounded-full shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
              >
                Order on Foodmandu <span className="text-xs ml-1">›</span>
              </Link>
            ) : (
              <span className="w-full inline-flex items-center justify-center px-6 py-3 bg-mocha/10 text-mocha/60 text-[11px] uppercase tracking-widest font-semibold rounded-full cursor-not-allowed">
                Coming Soon
              </span>
            )}
          </div>
        </div>

        {/* Custom Order Card */}
        <div className="bg-white border border-latte rounded-[24px] p-6 md:p-10 text-center shadow-sm flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all duration-300 h-full">
          <div>
            {/* Custom Order Icon with Splash */}
            <div className="relative w-28 h-28 mx-auto mb-6 flex items-center justify-center">
              <div className="absolute inset-0 bg-[#FAF7F3] rounded-full scale-[1.1] opacity-50 border border-dashed border-latte" />
              <div className="w-24 h-24 rounded-full bg-white shadow-sm border border-latte/50 flex items-center justify-center relative z-10">
                <svg className="w-10 h-10 text-roasted" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 15h6M10 18h4" strokeWidth="1.5" />
                </svg>
              </div>
            </div>
            
            <h3 className="font-heading font-medium text-lg text-[#2D2118] uppercase tracking-wider mb-2">
              CUSTOM ORDER
            </h3>
            <p className="font-body text-mocha text-sm leading-relaxed mb-6">
              Have a special request? We&apos;re here to make it happen.
            </p>
          </div>
          
          <div className="mt-auto">
            <Link
              href="/contact"
              className="w-full inline-flex items-center justify-center gap-1 px-6 py-3 bg-roasted hover:bg-dark-roast text-cream text-[11px] uppercase tracking-widest font-semibold rounded-full shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
            >
              Place a Custom Order <span className="text-xs ml-1">›</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Custom Order Banner Section */}
      <div className="max-w-[1240px] w-full mx-auto bg-white border border-latte rounded-[28px] p-8 md:p-12 mb-16 md:mb-20 shadow-sm animate-fade-up">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Banner Left */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <span className="font-serif italic text-roasted text-sm mb-2 block">
              Made Just for You <span className="not-italic text-xs">❦</span>
            </span>
            <h2 className="font-heading font-medium text-3xl md:text-4xl text-[#2D2118] mb-4">
              CUSTOM ORDER
            </h2>
            <p className="font-body text-mocha text-sm leading-relaxed mb-6">
              Planning a celebration, event, or something special? Tell us what you need — custom cakes, desserts, or pancake platters — and we&apos;ll create it with love.
            </p>
            
            {/* 3 bullet highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mb-8">
              <div className="flex items-center gap-2">
                <span className="text-lg">🎂</span>
                <span className="font-body text-[#2D2118] text-xs font-semibold">Custom cakes & desserts</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">🎁</span>
                <span className="font-body text-[#2D2118] text-xs font-semibold">Events & celebrations</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">💬</span>
                <span className="font-body text-[#2D2118] text-xs font-semibold">Special dietary requests</span>
              </div>
            </div>
            
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-1.5 px-8 py-3.5 bg-roasted hover:bg-dark-roast text-cream text-[11px] uppercase tracking-widest font-semibold rounded-full shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
            >
              Place a Custom Order <span className="text-xs">›</span>
            </Link>
          </div>
          
          {/* Banner Right */}
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

      {/* 5. Quick Info Cards Grid */}
      <div className="max-w-[1240px] w-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 md:mb-20 px-4 animate-fade-up">
        {/* Open Daily */}
        <div className="bg-white border border-latte rounded-[20px] p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow duration-300">
          <div className="w-12 h-12 rounded-full bg-cream flex items-center justify-center text-roasted text-xl flex-shrink-0">
            🕒
          </div>
          <div>
            <h4 className="font-heading font-bold text-xs text-[#2D2118] uppercase tracking-wider mb-0.5">OPEN DAILY</h4>
            <p className="font-body text-mocha text-sm font-semibold">{statusInfo.todayHoursText}</p>
            <p className="text-[10px] text-mocha">{statusInfo.statusText}</p>
          </div>
        </div>

        {/* Delivery Area */}
        <div className="bg-white border border-latte rounded-[20px] p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow duration-300">
          <div className="w-12 h-12 rounded-full bg-cream flex items-center justify-center text-roasted text-xl flex-shrink-0">
            📍
          </div>
          <div>
            <h4 className="font-heading font-bold text-xs text-[#2D2118] uppercase tracking-wider mb-0.5">DELIVERY AREA</h4>
            <p className="font-body text-mocha text-sm font-semibold leading-tight">{displayAddress.split(',').slice(0, 2).join(',') || 'Lalitpur, Kathmandu & Nearby'}</p>
          </div>
        </div>

        {/* Need Help */}
        <div className="bg-white border border-latte rounded-[20px] p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow duration-300">
          <div className="w-12 h-12 rounded-full bg-cream flex items-center justify-center text-roasted text-xl flex-shrink-0">
            📞
          </div>
          <div>
            <h4 className="font-heading font-bold text-xs text-[#2D2118] uppercase tracking-wider mb-0.5">NEED HELP?</h4>
            <p className="font-body text-mocha text-sm font-semibold">{phoneNumber}</p>
          </div>
        </div>
      </div>

      {/* 6. Thank You Footer Note */}
      <div className="max-w-[1240px] w-full text-center border-t border-latte/60 pt-8 mt-4 px-4 animate-fade-up">
        <p className="font-serif italic text-roasted text-sm flex items-center justify-center gap-2">
          <span>🤎</span>
          <span>Thank you for supporting local &amp; choosing Hotcakes Nepal.</span>
          <span>🌿</span>
        </p>
        <div className="flex justify-center gap-4 mt-4 font-body text-xs text-mocha/60">
          <Link href="/menu" className="hover:text-roasted transition-colors">View Full Menu →</Link>
          <span>·</span>
          <Link href="/location" className="hover:text-roasted transition-colors">Visit Us in Hattiban →</Link>
          <span>·</span>
          <Link href="/contact" className="hover:text-roasted transition-colors">Contact Us →</Link>
        </div>
      </div>
    </div>
  );
}

