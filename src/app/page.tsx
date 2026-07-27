import Link from 'next/link';
import ImageWithFallback from '@/components/ImageWithFallback';
import FeaturedCarousel from '@/components/FeaturedCarousel';
import { getSupabaseAdmin } from '@/lib/supabase/client';
import { getOpeningHoursStatus, OpeningHours } from '@/lib/openingHours';
import type { Metadata } from 'next';

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Hotcakes Nepal | Best Café in Hattiban, Lalitpur — Pancakes, Specialty Coffee & Desserts",
  description: "Hotcakes Nepal is a cozy café in Hattiban, Lalitpur near Little Angels School. Fluffy pancakes, hand-drip specialty coffee, fresh baked muffins, peanut butter cookies, and handcrafted desserts. Open daily 8 AM–8 PM — perfect for slow mornings, brunch, study sessions, and date spots in Lalitpur.",
  alternates: {
    canonical: "https://hotcakes-nepal.vercel.app"
  },
  openGraph: {
    title: "Hotcakes Nepal | Best Café in Hattiban, Lalitpur — Pancakes, Specialty Coffee & Desserts",
    description: "Cozy café in Hattiban, Lalitpur near Little Angels School. Fluffy pancakes, hand-drip specialty coffee, fresh baked muffins and cookies. Open daily 8 AM–8 PM.",
    url: "https://hotcakes-nepal.vercel.app",
    images: [
      {
        url: "https://hotcakes-nepal.vercel.app/images/hero/hero-main.jpg",
        width: 1200,
        height: 630,
        alt: "Hotcakes Nepal — cozy café in Hattiban, Lalitpur serving fluffy pancakes and specialty coffee",
      },
    ],
  },
};

export default async function Home() {
  const supabase = getSupabaseAdmin();
  
  // Parallelize all data fetching
  const [
    campaignResult,
    menuResult,
    openSettingResult,
    heroImageResult,
    contactsResult,
    locPhotosResult,
    showcaseResult,
    openingHoursResult,
    siteDescResult
  ] = await Promise.all([
    // 1. Fetch active general campaigns for home banner (exclude streak, filter by placement + status)
    supabase.from('campaigns')
      .select('*')
      .eq('is_active', true)
      .neq('name', 'Brew Streak Rewards'),
    // 2. Fetch featured menu items
    supabase.from('menu_items').select('*').eq('is_available', true).eq('is_featured', true).order('category', { ascending: true }),
    // 3. Fetch cafe open/closed settings
    supabase.from('site_settings').select('value').eq('key', 'open_status').single(),
    // 4. Fetch hero image
    supabase.from('site_settings').select('value').eq('key', 'hero_image').maybeSingle(),
    // 5. Fetch contact info
    supabase.from('contact_info').select('*'),
    // 6. Fetch location photos for Visit Us section
    supabase.from('site_settings').select('value').eq('key', 'location_photos').maybeSingle(),
    // 7. Fetch contact showcase images
    supabase.from('site_settings').select('value').eq('key', 'contact_showcase_images').maybeSingle(),
    // 8. Fetch opening hours settings
    supabase.from('site_settings').select('value').eq('key', 'opening_hours').maybeSingle(),
    // 9. Fetch site description
    supabase.from('site_settings').select('value').eq('key', 'site_description').maybeSingle()
  ]);

  const now = new Date();

  // Campaign visibility logic:
  // 1. status must be 'active' (is_active=true already filtered above)
  // 2. Must not be expired (end_date null = unbounded)
  // 3. Must not be a streak-type campaign
  // 4. Placement must be home_banner or all_pages (or unset = legacy rows)
  // 5. Highest priority wins
  type CampaignRow = {
    id: string; name: string; tagline: string | null; is_active: boolean;
    start_date: string | null; end_date: string | null; created_at: string;
    status?: string; type?: string; priority?: number; placement?: string;
    metadata?: Record<string, unknown>;
  };
  const allActiveCampaigns: CampaignRow[] = campaignResult.data || [];
  const campaign = allActiveCampaigns
    .filter(c => {
      if (c.type === 'streak') return false;                                          // never show streak on home
      if (c.end_date && new Date(c.end_date) <= now) return false;                   // expired
      if (c.start_date && new Date(c.start_date) > now) return false;                // not started yet
      if (c.status && c.status !== 'active') return false;                           // draft / paused / ended
      const placement = c.placement ?? 'home_banner';
      return placement === 'home_banner' || placement === 'all_pages';               // placement check
    })
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))[0] ?? null;             // highest priority wins

  const featuredItems = menuResult.data || [];
  const openSetting = openSettingResult.data;
  const isOpen = (openSetting?.value as { is_open?: boolean })?.is_open ?? true;

  const hoursSetting = openingHoursResult?.data;
  const openingHours = hoursSetting?.value ? (hoursSetting.value as OpeningHours) : null;
  const statusInfo = getOpeningHoursStatus(openingHours, isOpen);

  const siteDescription = (siteDescResult?.data?.value as { text?: string })?.text ||
    'A cozy café in Hattiban, Lalitpur — hand-drip specialty coffee, fluffy pancakes, and freshly baked desserts. One of the best breakfast cafés near Little Angels School and Jawalakhel.';

  const heroImageUrl = (heroImageResult?.data?.value as { url?: string })?.url || "/images/hero/hero-main.jpg";

  const contacts = contactsResult.data;
  const getContact = (key: string) => contacts?.find(c => c.key === key)?.value ?? '';
  
  const savedLocPhotos = Array.isArray(locPhotosResult?.data?.value) ? (locPhotosResult.data.value as string[]) : [];
  const visitUsImage = savedLocPhotos[0] || "/images/location/location-exterior.jpg";

  const savedShowcaseImages = Array.isArray(showcaseResult?.data?.value) ? (showcaseResult.data.value as string[]) : [];
  const fallbackImages = [
    '/images/menu/Cappuccino.jpeg',
    '/images/hero/hero-main.jpg',
    '/images/location/location-interior-1.jpg',
    '/images/location/location-exterior.jpg',
    '/images/location/location-interior-2.jpg',
    '/images/location/location-seating.jpg'
  ];
  const showcaseImages: string[] = [...savedShowcaseImages];
  let fallbackIndex = 0;
  while (showcaseImages.length < 8) {
    showcaseImages.push(fallbackImages[fallbackIndex % fallbackImages.length]);
    fallbackIndex++;
  }

  return (
    <div className="flex flex-col min-h-screen bg-cream w-full max-w-full overflow-x-hidden">
      {/* 1. Hero Section */}
      <section className="relative w-full max-w-full flex items-center justify-center pt-16 pb-12 md:pt-24 md:pb-16 overflow-x-hidden">
        <div className="max-w-[1240px] w-full mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-6 flex flex-col text-center lg:text-left items-center lg:items-start animate-fade-up">
            {statusInfo.isOpen ? (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-semibold tracking-wider font-body bg-olive/10 text-olive mb-6 uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-olive animate-pulse" />
                {statusInfo.statusText}
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-semibold tracking-wider font-body bg-muted-red/10 text-muted-red mb-6 uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-red" />
                {statusInfo.statusText}
              </span>
            )}
            
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-roasted mb-2.5 block">
              Welcome to
            </span>
            <h1 className="font-heading font-medium text-[42px] sm:text-5xl lg:text-[62px] text-espresso leading-[1.08] mb-5 tracking-tight">
              Hotcakes Nepal
            </h1>
            <p className="font-body text-mocha/75 text-sm md:text-base leading-relaxed mb-7 max-w-[360px]">
              {siteDescription}
            </p>
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              <Link
                href="/menu"
                className="inline-flex items-center justify-center px-6 py-2.5 bg-roasted hover:bg-dark-roast text-cream text-[10px] uppercase tracking-[0.15em] font-semibold rounded-full shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
              >
                Explore Menu
              </Link>
              <Link
                href="/location"
                className="inline-flex items-center justify-center px-6 py-2.5 border border-espresso/25 text-espresso hover:bg-espresso hover:text-white text-[10px] uppercase tracking-[0.15em] font-semibold rounded-full hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
              >
                Visit Us
              </Link>
            </div>
          </div>

          {/* Hero Right Image Card */}
          <div className="lg:col-span-6 w-full animate-fade-up" style={{ animationDelay: '150ms' }}>
            <div className="relative aspect-[4/3] sm:aspect-[3/2] lg:aspect-[4/3] rounded-[28px] overflow-hidden bg-latte/30 shadow-sm border border-latte/30 max-w-2xl mx-auto w-full">
              <ImageWithFallback
                src={heroImageUrl}
                alt="Hotcakes Nepal — best café in Hattiban, Lalitpur serving fluffy pancakes, specialty coffee, and handcrafted desserts near Little Angels School"
                fill
                className="object-cover"
                priority
                fallbackEmoji="🥞"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Campaign Strip */}
      {campaign ? (
        <section className="px-4 z-10 w-full max-w-full overflow-x-hidden mt-2">
          <div className="max-w-[1240px] mx-auto px-5 py-3 bg-warm-white border border-latte/25 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <span className="text-espresso/80 font-body text-xs">
              <span className="font-semibold text-roasted">{campaign.name}:</span> {campaign.tagline}
              {(campaign.metadata as { promo_code?: string } | null)?.promo_code && (
                <span className="ml-2 font-mono font-bold text-roasted bg-roasted/10 px-1.5 py-0.5 rounded text-[10px]">
                  {(campaign.metadata as { promo_code?: string }).promo_code}
                </span>
              )}
            </span>
            <Link
              href={(campaign.metadata as { cta_link?: string } | null)?.cta_link || '/streak'}
              className="shrink-0 inline-flex items-center justify-center px-4 py-1.5 bg-roasted hover:bg-dark-roast text-cream text-[10px] uppercase tracking-wider font-semibold rounded-full transition-all active:scale-[0.98]"
            >
              {(campaign.metadata as { cta_text?: string } | null)?.cta_text || 'View Campaigns'}
            </Link>
          </div>
        </section>
      ) : (
        <section className="px-4 z-10 w-full max-w-full overflow-x-hidden mt-2">
          <div className="max-w-[1240px] mx-auto px-5 py-3 bg-warm-white border border-latte/20 rounded-xl flex items-center justify-center gap-2 text-center">
            <span className="w-1 h-1 rounded-full bg-roasted/50 shrink-0" />
            <span className="text-mocha/60 font-body text-xs">
              Check back soon for our next seasonal reward events &amp; specials.
            </span>
          </div>
        </section>
      )}

      {/* 3. Most Loved (Featured Menu Carousel) */}
      <section className="py-14 md:py-20 lg:py-28 w-full max-w-[1200px] mx-auto px-4 md:px-6 overflow-x-hidden">
        <div className="text-center max-w-xl mx-auto mb-10 px-4">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-roasted mb-2.5 block">
            Customer Favorites
          </span>
          <h2 className="font-heading font-medium text-[32px] md:text-[40px] text-espresso mb-3 leading-tight">
            Most Loved
          </h2>
          <p className="font-body text-mocha/70 text-sm leading-relaxed">
            Hand-picked customer favorites — fluffy pancakes, pour-over coffee, and handcrafted desserts prepared fresh every single morning in our Hattiban kitchen.
          </p>
        </div>

        <FeaturedCarousel items={featuredItems} />

        <div className="flex justify-center px-4 mt-10">
          <Link
            href="/menu"
            className="inline-flex items-center justify-center px-7 py-2.5 border border-espresso/20 text-espresso/80 hover:border-espresso hover:text-espresso text-[10px] uppercase tracking-[0.15em] font-semibold rounded-full transition-all duration-300"
          >
            Explore Full Menu
          </Link>
        </div>
      </section>

      {/* 4. Location Teaser (Visit Our Space) */}
      <section className="py-14 md:py-20 lg:py-28 border-y border-latte/30 bg-warm-white w-full max-w-full overflow-x-hidden">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14 items-center">
          {/* Location Content (Left) */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left max-w-md mx-auto md:mx-0 order-1">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-roasted mb-2.5 block">
              Visit Us
            </span>
            <h2 className="font-heading font-medium text-[32px] md:text-[40px] text-espresso mb-4 leading-tight">
              Find Our Locations
            </h2>
            <p className="font-body text-mocha/70 text-sm leading-relaxed mb-6">
              {"We'd love to welcome you. Tucked away from the main streets in Hattiban, Lalitpur — a quiet, rustic café perfect for slow mornings, study sessions, and brunch near Little Angels School."}
            </p>
            
            <div className="space-y-1 mb-7 font-body text-sm">
              <p className="text-espresso/80">
                <span className="font-semibold text-roasted">Address:</span> {getContact('address') || 'Hattiban, Lalitpur'}
              </p>
              <p className="text-espresso/80">
                <span className="font-semibold text-roasted">Hours:</span> {statusInfo.todayHoursText} <span className="text-xs text-mocha/60">({statusInfo.statusText})</span>
              </p>
            </div>
            
            <Link
              href="/location"
              className="inline-flex items-center justify-center gap-1.5 px-6 py-2.5 bg-roasted hover:bg-dark-roast text-cream text-[10px] uppercase tracking-[0.15em] font-semibold rounded-full transition-colors duration-300"
            >
              View Locations
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
              </svg>
            </Link>
          </div>
          
          {/* Location Image (Right) */}
          <div className="relative aspect-[4/3] md:h-[300px] lg:h-[340px] rounded-[20px] overflow-hidden bg-latte/10 group border border-latte/30 w-full max-w-md mx-auto order-2">
            <ImageWithFallback
              src={visitUsImage}
              alt="Interior of Hotcakes Nepal café in Hattiban, Lalitpur — cozy seating and warm ambiance"
              fill
              className="object-cover group-hover:scale-[1.02] transition-transform duration-700"
              sizes="(max-width: 768px) 100vw, 400px"
              fallbackEmoji="📍"
            />
          </div>
        </div>
      </section>

      {/* 5. Follow Our Journey Section */}
      <section className="py-16 md:py-20 lg:py-28 bg-cream text-espresso w-full max-w-full overflow-x-hidden">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6">
          {/* Mobile: text on top, 4 images below */}
          <div className="text-center max-w-sm mx-auto flex flex-col items-center mb-8 lg:hidden">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-roasted mb-2.5 block">
              Follow Our Journey
            </span>
            <h2 className="font-heading font-medium text-3xl text-espresso mb-3 leading-tight">
              Stay Connected
            </h2>
            <p className="font-body text-mocha/70 text-xs leading-relaxed mb-5">
              Get updates on seasonal specials, menu launches, and cafe stories.
            </p>
            <div className="flex items-center gap-3">
              <a href="/api/contact-info?redirect=instagram" target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                className="w-9 h-9 rounded-full border border-espresso/20 flex items-center justify-center text-espresso/70 hover:border-roasted hover:text-roasted transition-all duration-200">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              <a href="/api/contact-info?redirect=whatsapp" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"
                className="w-9 h-9 rounded-full border border-espresso/20 flex items-center justify-center text-espresso/70 hover:border-roasted hover:text-roasted transition-all duration-200">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26C.158 6.44 4.593 2.006 10.045 2.006c2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26"/>
                </svg>
              </a>
              <a href="/api/contact-info?redirect=tiktok" target="_blank" rel="noopener noreferrer" aria-label="TikTok"
                className="w-9 h-9 rounded-full border border-espresso/20 flex items-center justify-center text-espresso/70 hover:border-roasted hover:text-roasted transition-all duration-200">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.03 2.61-.01 3.91-.02.08 1.53.63 3.05 1.62 4.2 1.12 1.27 2.7 2.06 4.36 2.29v3.83c-1.35-.09-2.69-.58-3.79-1.39-.77-.57-1.39-1.33-1.83-2.2v8.9c-.06 2.05-.85 4.09-2.29 5.53-1.78 1.78-4.4 2.5-6.87 1.94-2.47-.56-4.52-2.38-5.37-4.76-.92-2.58-.45-5.6 1.25-7.75 1.56-1.99 4.13-2.99 6.64-2.6v3.8c-1.42-.32-2.96.08-3.99 1.1-.96.95-1.36 2.37-1.07 3.7.28 1.28 1.21 2.36 2.45 2.78 1.41.49 3.09.07 4.06-1.04.53-.61.8-1.39.79-2.19V.02z"/>
                </svg>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 lg:hidden">
            {showcaseImages.slice(0, 4).map((imageUrl, idx) => (
              <div key={idx} className="relative aspect-square w-full rounded-2xl overflow-hidden bg-latte/20 border border-latte/30">
                <ImageWithFallback src={imageUrl} alt={`Hotcakes Nepal café — food, coffee and desserts gallery image ${idx + 1}`} fill className="object-cover" sizes="25vw" fallbackEmoji="☕" />
              </div>
            ))}
          </div>

          <div className="hidden lg:grid lg:grid-cols-12 gap-10 items-center">
            {/* Left Image Grid (2x2) */}
            <div className="lg:col-span-4 grid grid-cols-2 gap-3">
              {showcaseImages.slice(0, 4).map((imageUrl, idx) => (
                <div key={idx} className="relative aspect-square w-full rounded-[18px] overflow-hidden bg-latte/20 group">
                  <ImageWithFallback
                    src={imageUrl}
                    alt={`Hotcakes Nepal café gallery — pancakes, specialty coffee, and desserts in Hattiban Lalitpur ${idx + 1}`}
                    fill
                    className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    sizes="200px"
                    fallbackEmoji="☕"
                  />
                </div>
              ))}
            </div>
            {/* Center Content */}
            <div className="lg:col-span-4 text-center px-4 max-w-sm mx-auto flex flex-col items-center">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-roasted mb-3 block">
                Follow Our Journey
              </span>
              <h2 className="font-heading font-medium text-4xl text-espresso mb-4 leading-tight">
                Stay Connected With Hotcakes
              </h2>
              <p className="font-body text-mocha/70 text-sm leading-relaxed mb-7">
                Get updates on seasonal specials, menu launches, community events and cafe stories.
              </p>
              <div className="flex items-center gap-3">
                <a href="/api/contact-info?redirect=instagram" target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                  className="w-10 h-10 rounded-full border border-espresso/20 flex items-center justify-center text-espresso/70 hover:border-roasted hover:text-roasted transition-all duration-200">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                </a>
                <a href="/api/contact-info?redirect=whatsapp" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"
                  className="w-10 h-10 rounded-full border border-espresso/20 flex items-center justify-center text-espresso/70 hover:border-roasted hover:text-roasted transition-all duration-200">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.456h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
                <a href="/api/contact-info?redirect=tiktok" target="_blank" rel="noopener noreferrer" aria-label="TikTok"
                  className="w-10 h-10 rounded-full border border-espresso/20 flex items-center justify-center text-espresso/70 hover:border-roasted hover:text-roasted transition-all duration-200">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.03 2.61-.01 3.91-.02.08 1.53.63 3.05 1.62 4.2 1.12 1.27 2.7 2.06 4.36 2.29v3.83c-1.35-.09-2.69-.58-3.79-1.39-.77-.57-1.39-1.33-1.83-2.2v8.9c-.06 2.05-.85 4.09-2.29 5.53-1.78 1.78-4.4 2.5-6.87 1.94-2.47-.56-4.52-2.38-5.37-4.76-.92-2.58-.45-5.6 1.25-7.75 1.56-1.99 4.13-2.99 6.64-2.6v3.8c-1.42-.32-2.96.08-3.99 1.1-.96.95-1.36 2.37-1.07 3.7.28 1.28 1.21 2.36 2.45 2.78 1.41.49 3.09.07 4.06-1.04.53-.61.8-1.39.79-2.19V.02z"/>
                  </svg>
                </a>
              </div>
            </div>
            {/* Right Image Grid (2x2) */}
            <div className="lg:col-span-4 grid grid-cols-2 gap-3">
              {showcaseImages.slice(4, 8).map((imageUrl, idx) => (
                <div key={idx} className="relative aspect-square w-full rounded-[18px] overflow-hidden bg-latte/20 group">
                  <ImageWithFallback
                    src={imageUrl}
                    alt={`Hotcakes Nepal café gallery — aesthetic interiors and fresh baked goods in Lalitpur ${idx + 1}`}
                    fill
                    className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    sizes="200px"
                    fallbackEmoji="🥞"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
