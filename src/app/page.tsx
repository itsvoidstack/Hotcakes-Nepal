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
    contactsResult
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
    supabase.from('contact_info').select('*')
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

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero Section */}
      <section className="relative h-[80vh] min-h-[500px] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <ImageWithFallback
            src={heroImageUrl}
            alt="Hotcakes Nepal Hero"
            fill
            className="object-cover brightness-[0.45] scale-105"
            priority
            fallbackEmoji="🥞"
          />
          {/* Fallback solid color background */}
          <div className="absolute inset-0 bg-gradient-to-tr from-espresso to-dark-roast opacity-90 -z-10" />
        </div>

        <div className="max-w-[1280px] w-full mx-auto px-4 md:px-6 z-10 flex justify-center md:justify-start">
          <div className="max-w-xl p-8 md:p-12 glass-card rounded-[28px] animate-fade-up text-center md:text-left">
            {isOpen ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold font-body bg-olive/15 text-olive mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-olive animate-pulse" />
                We are open
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold font-body bg-muted-red/15 text-muted-red mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-red" />
                Closed for now
              </span>
            )}
            
            <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl text-espresso leading-[1.1] mb-6 tracking-tight">
              Fresh Coffee.<br/>
              Fluffy Hotcakes.<br/>
              Warm Moments.
            </h1>
            <p className="font-body text-mocha/90 text-sm md:text-base leading-relaxed mb-8 max-w-md">
              Welcome to Lalitpur&apos;s premium coffee and hotcake boutique. Hand-drip brews, fluffy stacks, and quiet corners.
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <Link
                href="/menu"
                className="px-8 py-3.5 bg-roasted hover:bg-dark-roast text-white text-xs uppercase tracking-wider font-semibold rounded-full transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 hover:shadow-md shadow-sm"
              >
                View Menu
              </Link>
              <Link
                href="/order"
                className="px-8 py-3.5 border border-roasted text-roasted hover:bg-roasted hover:text-white text-xs uppercase tracking-wider font-semibold rounded-full transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 hover:shadow-sm"
              >
                Order Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Brew Streak Campaign Strip */}
      {campaign ? (
        <section className="bg-roasted py-4 px-4 text-center z-10 shadow-md">
          <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-center gap-3">
            <span className="text-white font-body text-sm md:text-base font-medium">
              ☕ **{campaign.name}**: {campaign.tagline}
            </span>
            <Link
              href="/streak"
              className="px-4 py-1.5 bg-white text-roasted hover:bg-cream text-xs font-semibold rounded-full transition-colors duration-200"
            >
              Start Streak
            </Link>
          </div>
        </section>
      ) : (
        <section className="bg-warm-white py-4.5 px-4 text-center z-10 border-b border-latte/60 shadow-sm">
          <div className="max-w-[1280px] mx-auto flex items-center justify-center gap-2">
            <svg className="w-4 h-4 text-roasted" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-mocha/90 font-body text-xs md:text-sm font-medium tracking-wide">
              Check back soon for our next seasonal reward events & specials!
            </span>
          </div>
        </section>
      )}

      {/* 3. Featured Today Spotlight */}
      {featuredItems.length > 0 && (
        <section className="py-16 max-w-[1280px] mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest text-roasted mb-2 block">Today&apos;s Highlight</span>
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-espresso">
              Featured Today
            </h2>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="relative w-full md:w-1/2 h-80 rounded-[20px] overflow-hidden bg-latte/30">
              <ImageWithFallback
                src={featuredItems[0].image_url || '/images/menu/placeholder.jpg'}
                alt={featuredItems[0].name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                fallbackEmoji="🥞"
              />
            </div>
            <div className="w-full md:w-1/2 text-center md:text-left">
              <h3 className="font-heading font-bold text-3xl md:text-4xl text-espresso mb-4">
                {featuredItems[0].name}
              </h3>
              <p className="font-body text-mocha text-base leading-relaxed mb-6 max-w-md">
                {featuredItems[0].description || 'Prepared fresh with premium ingredients every morning.'}
              </p>
              <p className="font-heading font-bold text-3xl text-roasted mb-8">
                Rs. {featuredItems[0].price}
              </p>
              <Link
                href="/order"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-roasted hover:bg-dark-roast text-white text-xs uppercase tracking-wider font-semibold rounded-full transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 hover:shadow-md shadow-sm"
              >
                Order Now
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 4. Featured Menu Items Carousel */}
      <section className="py-24 max-w-[1280px] mx-auto px-4 md:px-6">
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-roasted mb-2 block">Customer Favorites</span>
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-espresso mb-4">
            Most Loved
          </h2>
          <p className="font-body text-mocha/90 text-sm md:text-base">
            Hand-picked customer favorites prepared fresh every single morning.
          </p>
        </div>

        <FeaturedCarousel items={featuredItems} />

        <div className="text-center mt-12">
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 px-8 py-3.5 border border-roasted text-roasted hover:bg-roasted hover:text-white text-xs uppercase tracking-wider font-semibold rounded-full transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
          >
            Explore Full Menu
          </Link>
        </div>
      </section>

      {/* 4. Location Teaser */}
      <section className="py-24 bg-warm-white border-y border-latte">
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="relative h-[400px] rounded-[24px] overflow-hidden bg-latte/30">
            <ImageWithFallback
              src="/images/location/location-exterior.jpg"
              alt="Hotcakes Nepal Front Door"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              fallbackEmoji="📍"
            />
          </div>
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <span className="text-xs font-semibold uppercase tracking-widest text-roasted mb-2 block">Visit Our Space</span>
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-espresso mb-6">
              Find Us
            </h2>
            <p className="font-body text-mocha text-base leading-relaxed mb-8 max-w-md">
              Located in the heart of Hattiban, Lalitpur. Tucked away from the main streets, offering a quiet, rustic atmosphere for reading, meetings, or a morning stack.
            </p>
            <div className="space-y-3 mb-8">
              <p className="font-body text-espresso text-sm">
                **Address:** {getContact('address') || 'Hattiban, Lalitpur'}
              </p>
              <p className="font-body text-espresso text-sm">
                **Hours:** 8:00 AM – 8:00 PM (Daily)
              </p>
            </div>
            <Link
              href="/location"
              className="px-8 py-3.5 bg-roasted hover:bg-dark-roast text-white text-xs uppercase tracking-wider font-semibold rounded-full transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 hover:shadow-md shadow-sm"
            >
              Get Directions
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Contact Strip */}
      <section className="py-24 max-w-[1280px] mx-auto px-4 md:px-6 text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-roasted mb-2 block">Get in Touch</span>
        <h2 className="font-heading font-bold text-3xl text-espresso mb-4">
          Let&apos;s Connect
        </h2>
        <p className="font-body text-mocha text-sm md:text-base mb-8 max-w-md mx-auto">
          Reach out for large group reservations, ordering queries, or just to say hi.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          {getContact('whatsapp') && (
            <Link
              href="/api/contact-info?redirect=whatsapp"
              target="_blank"
              className="px-6 py-3 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs uppercase tracking-wider font-semibold rounded-full transition-all duration-300 hover:-translate-y-0.5 shadow-sm"
            >
              WhatsApp
            </Link>
          )}
          {getContact('instagram') && (
            <Link
              href="/api/contact-info?redirect=instagram"
              target="_blank"
              className="px-6 py-3 bg-[#E1306C] hover:bg-[#c9265c] text-white text-xs uppercase tracking-wider font-semibold rounded-full transition-all duration-300 hover:-translate-y-0.5 shadow-sm"
            >
              Instagram
            </Link>
          )}
          <Link
            href="/contact"
            className="px-6 py-3 border border-roasted text-roasted hover:bg-roasted hover:text-white text-xs uppercase tracking-wider font-semibold rounded-full transition-all duration-300 hover:-translate-y-0.5"
          >
            All Contact Info
          </Link>
        </div>
      </section>
    </div>
  );
}
