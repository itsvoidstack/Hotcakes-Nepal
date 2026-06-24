import Link from 'next/link';
import ImageWithFallback from '@/components/ImageWithFallback';
import FeaturedCarousel from '@/components/FeaturedCarousel';
import { getSupabaseAdmin } from '@/lib/supabase/client';

export const revalidate = 60;

export default async function Home() {
  const supabase = getSupabaseAdmin();
  
  // Parallelize all data fetching
  const [
    campaignResult,
    menuResult,
    openSettingResult,
    heroImageResult,
    contactsResult,
    locPhotosResult
  ] = await Promise.all([
    // 1. Fetch active campaign
    supabase.from('campaigns').select('*').eq('is_active', true).single(),
    // 2. Fetch featured menu items
    supabase.from('menu_items').select('*').eq('is_available', true).eq('is_featured', true).order('category', { ascending: true }),
    // 3. Fetch cafe open/closed settings
    supabase.from('site_settings').select('value').eq('key', 'open_status').single(),
    // 4. Fetch hero image
    supabase.from('site_settings').select('value').eq('key', 'hero_image').maybeSingle(),
    // 5. Fetch contact info
    supabase.from('contact_info').select('*'),
    // 6. Fetch location photos for Visit Us section
    supabase.from('site_settings').select('value').eq('key', 'location_photos').maybeSingle()
  ]);

  const campaignData = campaignResult.data;
  const now = new Date();
  const campaign = campaignData && (!campaignData.end_date || new Date(campaignData.end_date) > now)
    ? campaignData
    : null;

  const featuredItems = menuResult.data || [];
  const openSetting = openSettingResult.data;
  const isOpen = (openSetting?.value as { is_open?: boolean })?.is_open ?? true;

  const heroImageUrl = (heroImageResult?.data?.value as { url?: string })?.url || "/images/hero/hero-main.jpg";

  const contacts = contactsResult.data;
  const getContact = (key: string) => contacts?.find(c => c.key === key)?.value ?? '';
  
  const savedLocPhotos = Array.isArray(locPhotosResult?.data?.value) ? (locPhotosResult.data.value as string[]) : [];
  const visitUsImage = savedLocPhotos[0] || "/images/location/location-exterior.jpg";

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero Section */}
      <section className="relative h-[75vh] min-h-[480px] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <ImageWithFallback
            src={heroImageUrl}
            alt="Hotcakes Nepal Hero"
            fill
            className="object-cover brightness-[0.47] scale-105"
            priority
            fallbackEmoji="🥞"
          />
          {/* Fallback solid color background */}
          <div className="absolute inset-0 bg-gradient-to-tr from-espresso to-dark-roast opacity-90 -z-10" />
        </div>

        <div className="max-w-[1280px] w-full mx-auto px-4 md:px-6 z-10 flex justify-center md:justify-start">
          <div className="max-w-lg p-7 md:p-10 glass-card rounded-[32px] animate-fade-up text-center md:text-left">
            {isOpen ? (
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium tracking-wide font-body bg-olive/15 text-olive mb-7">
                <span className="w-1.5 h-1.5 rounded-full bg-olive animate-pulse" />
                We are open
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium tracking-wide font-body bg-muted-red/15 text-muted-red mb-7">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-red" />
                Closed for now
              </span>
            )}
            
            <h1 className="font-heading font-medium text-3xl md:text-4xl lg:text-5xl text-espresso leading-[1.2] mb-6 tracking-tight">
              Fresh Coffee.<br/>
              Fluffy Hotcakes.<br/>
              Warm Moments.
            </h1>
            <p className="font-body text-mocha/85 text-sm md:text-base leading-relaxed mb-9 max-w-md">
              Welcome to Lalitpur&apos;s premium coffee and hotcake boutique. Hand-drip brews, fluffy stacks, and quiet corners.
            </p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <Link
                href="/menu"
                className="group inline-flex items-center justify-center gap-2 px-7 py-3 bg-roasted hover:bg-dark-roast text-white text-xs uppercase tracking-widest font-semibold rounded-full transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 hover:shadow-lg shadow-sm"
              >
                View Menu
                <svg className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </svg>
              </Link>
              <Link
                href="/order"
                className="inline-flex items-center justify-center gap-2 px-7 py-3 border border-roasted/80 text-roasted hover:bg-roasted hover:text-white text-xs uppercase tracking-widest font-semibold rounded-full transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
              >
                Order Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Brew Streak Campaign Strip */}
      {campaign ? (
        <section className="bg-roasted py-3.5 px-4 text-center z-10 shadow-sm">
          <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-center gap-3">
            <span className="text-white font-body text-sm md:text-base font-medium">
              ☕ <span className="font-semibold">{campaign.name}</span>: {campaign.tagline}
            </span>
            <Link
              href="/streak"
              className="px-4.5 py-1.5 bg-white text-roasted hover:bg-cream text-xs font-semibold tracking-wider rounded-full transition-colors duration-200"
            >
              Start Streak
            </Link>
          </div>
        </section>
      ) : (
        <section className="bg-warm-white py-4 px-4 text-center z-10 border-b border-latte/40 shadow-sm">
          <div className="max-w-[1280px] mx-auto flex items-center justify-center gap-2.5">
            <svg className="w-4 h-4 text-roasted" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-mocha/80 font-body text-xs md:text-sm font-medium tracking-wide">
              Check back soon for our next seasonal reward events & specials!
            </span>
          </div>
        </section>
      )}

      {/* 3. Most Loved (Featured Menu Carousel) */}
      <section className="py-24 max-w-[1280px] mx-auto px-4 md:px-6">
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-roasted mb-2 block">Customer Favorites</span>
          <h2 className="font-heading font-medium text-2xl md:text-3xl text-espresso mb-4">
            Most Loved
          </h2>
          <p className="font-body text-mocha/80 text-sm md:text-base">
            Hand-picked customer favorites prepared fresh every single morning.
          </p>
        </div>

        <FeaturedCarousel items={featuredItems} />

        <div className="text-center mt-11">
          <Link
            href="/menu"
            className="inline-flex items-center justify-center gap-2 px-7 py-3 border border-roasted/80 text-roasted hover:bg-roasted hover:text-white text-xs uppercase tracking-widest font-semibold rounded-full transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
          >
            Explore Full Menu
            <svg className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
            </svg>
          </Link>
        </div>
      </section>

      {/* 4. Location Teaser */}
      <section className="py-16 bg-warm-white border-y border-latte/40">
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="relative aspect-[4/3] md:aspect-[3/2] rounded-3xl overflow-hidden bg-latte/30 group order-2 md:order-1">
            <ImageWithFallback
              src={visitUsImage}
              alt="Hotcakes Nepal Front Door"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 768px) 100vw, 50vw"
              fallbackEmoji="📍"
            />
          </div>
          <div className="flex flex-col items-center md:items-start text-center md:text-left order-1 md:order-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-roasted mb-2 block">Visit Our Space</span>
            <h2 className="font-heading font-medium text-xl md:text-2xl text-espresso mb-4 leading-tight">
              Find Us
            </h2>
            <p className="font-body text-mocha/80 text-sm md:text-base leading-relaxed mb-6 max-w-md">
              Located in the heart of Hattiban, Lalitpur. Tucked away from the main streets, offering a quiet, rustic atmosphere for reading, meetings, or a morning stack.
            </p>
            <div className="space-y-2 mb-6">
              <p className="font-body text-espresso text-sm">
                <span className="font-semibold">Address:</span> {getContact('address') || 'Hattiban, Lalitpur'}
              </p>
              <p className="font-body text-espresso text-sm">
                <span className="font-semibold">Hours:</span> 8:00 AM – 8:00 PM (Daily)
              </p>
            </div>
            <Link
              href="/location"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-roasted hover:bg-dark-roast text-white text-xs uppercase tracking-widest font-semibold rounded-full transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 hover:shadow-lg shadow-sm"
            >
              Get Directions
              <svg className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Follow Our Journey Section */}
      <section className="py-24 max-w-[1280px] mx-auto px-4 md:px-6 text-center">
        <div className="max-w-xl mx-auto">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-roasted mb-3 block">Connect</span>
          <h2 className="font-heading font-medium text-3xl md:text-4xl text-espresso mb-4">
            Follow Our Journey
          </h2>
          <p className="font-body text-mocha/75 text-sm md:text-base mb-10 max-w-md mx-auto">
            Get updates on seasonal recipes, community events, and fresh stacks.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            {getContact('instagram') && (
              <Link
                href="/api/contact-info?redirect=instagram"
                target="_blank"
                className="group inline-flex items-center justify-center gap-2.5 px-8 py-3 border border-espresso/20 text-espresso hover:bg-espresso hover:text-white text-[11px] uppercase tracking-[0.18em] font-semibold rounded-full transition-all duration-400 hover:-translate-y-0.5 active:translate-y-0"
              >
                Instagram
              </Link>
            )}
            {getContact('whatsapp') && (
              <Link
                href="/api/contact-info?redirect=whatsapp"
                target="_blank"
                className="group inline-flex items-center justify-center gap-2.5 px-8 py-3 border border-espresso/20 text-espresso hover:bg-espresso hover:text-white text-[11px] uppercase tracking-[0.18em] font-semibold rounded-full transition-all duration-400 hover:-translate-y-0.5 active:translate-y-0"
              >
                WhatsApp
              </Link>
            )}
            {getContact('tiktok') && (
              <Link
                href="/api/contact-info?redirect=tiktok"
                target="_blank"
                className="group inline-flex items-center justify-center gap-2.5 px-8 py-3 border border-espresso/20 text-espresso hover:bg-espresso hover:text-white text-[11px] uppercase tracking-[0.18em] font-semibold rounded-full transition-all duration-400 hover:-translate-y-0.5 active:translate-y-0"
              >
                TikTok
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
