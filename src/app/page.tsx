import Link from 'next/link';
import ImageWithFallback from '@/components/ImageWithFallback';
import { supabase } from '@/lib/supabase/client';

export const revalidate = 0; // Disable static caching so edits display instantly

export default async function Home() {
  // 1. Fetch active campaign
  const { data: campaignData } = await supabase
    .from('campaigns')
    .select('*')
    .eq('is_active', true)
    .single();

  const now = new Date();
  const campaign = campaignData && (!campaignData.end_date || new Date(campaignData.end_date) > now)
    ? campaignData
    : null;

  // 2. Fetch featured menu items
  const { data: featuredItems } = await supabase
    .from('menu_items')
    .select('*')
    .eq('is_featured', true)
    .eq('is_available', true)
    .limit(5);

  // 3. Fetch cafe open/closed settings
  const { data: openSetting } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'open_status')
    .single();
  
  const isOpen = (openSetting?.value as { is_open?: boolean })?.is_open ?? true;

  // Fetch hero image
  const { data: heroSetting } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'hero_image')
    .maybeSingle();

  const heroImageUrl = (heroSetting?.value as { url?: string })?.url || "/images/hero/hero-main.jpg";

  // 4. Fetch contact links
  const { data: contacts } = await supabase
    .from('contact_info')
    .select('*');

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
          <div className="max-w-xl p-8 md:p-12 glass-card rounded-[24px] animate-fade-up text-center md:text-left">
            {isOpen ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold font-body bg-olive/15 text-olive mb-4">
                <span className="w-2 h-2 rounded-full bg-olive animate-pulse" />
                We are open
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold font-body bg-muted-red/15 text-muted-red mb-4">
                <span className="w-2 h-2 rounded-full bg-muted-red" />
                Closed for now
              </span>
            )}
            
            <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl text-espresso leading-tight mb-4">
              cozy vibes, <br/>fresh hotcakes
            </h1>
            <p className="font-body text-mocha text-base md:text-lg mb-8 max-w-md">
              Welcome to Lalitpur&apos;s premium coffee and hotcake boutique. Hand-drip brews, fluffy stacks, and quiet corners.
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <Link
                href="/menu"
                className="px-8 py-3 bg-roasted hover:bg-dark-roast text-white text-sm font-medium rounded-full transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 shadow-sm"
              >
                View Menu
              </Link>
              <Link
                href="/order"
                className="px-8 py-3 border border-roasted text-roasted hover:bg-roasted/5 text-sm font-medium rounded-full transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Order Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Brew Streak Campaign Strip */}
      {campaign && (
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
      )}

      {/* 3. Featured Menu Items */}
      <section className="py-24 max-w-[1280px] mx-auto px-4 md:px-6">
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-espresso mb-4">
            highlights
          </h2>
          <p className="font-body text-mocha text-sm md:text-base">
            Hand-picked customer favorites prepared fresh every single morning.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredItems && featuredItems.length > 0 ? (
            featuredItems.map((item) => (
              <div
                key={item.id}
                className="group flex flex-col bg-warm-white rounded-[20px] overflow-hidden border border-latte hover:-translate-y-1 transition-all duration-300 hover:shadow-lg"
              >
                <div className="relative h-64 w-full bg-latte/30 overflow-hidden">
                  <ImageWithFallback
                    src={item.image_url || '/images/menu/placeholder.jpg'}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    fallbackEmoji="🥞"
                  />
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-baseline justify-between gap-2 mb-2">
                    <h3 className="font-heading font-bold text-xl text-espresso">
                      {item.name}
                    </h3>
                    <span className="font-heading text-roasted font-semibold">
                      Rs. {item.price}
                    </span>
                  </div>
                  <p className="font-body text-mocha text-sm leading-relaxed mb-6 flex-grow">
                    {item.description || 'Prepared fresh with premium ingredients.'}
                  </p>
                  <Link
                    href="/order"
                    className="w-full text-center py-2.5 bg-roasted hover:bg-dark-roast text-white text-xs font-semibold rounded-full transition-colors duration-200"
                  >
                    Order Now
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-mocha font-body">
              No featured items available right now. View our menu below.
            </div>
          )}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 px-8 py-3 border border-roasted text-roasted hover:bg-roasted/5 text-sm font-medium rounded-full transition-all duration-200"
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
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-espresso mb-6">
              find us
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
              className="px-8 py-3 bg-roasted hover:bg-dark-roast text-white text-sm font-medium rounded-full transition-colors duration-200"
            >
              Get Directions
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Contact Strip */}
      <section className="py-24 max-w-[1280px] mx-auto px-4 md:px-6 text-center">
        <h2 className="font-heading font-bold text-3xl text-espresso mb-4">
          let&apos;s connect
        </h2>
        <p className="font-body text-mocha text-sm md:text-base mb-8 max-w-md mx-auto">
          Reach out for large group reservations, ordering queries, or just to say hi.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          {getContact('whatsapp') && (
            <Link
              href="/api/contact-info?redirect=whatsapp"
              target="_blank"
              className="px-6 py-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-semibold rounded-full transition-colors"
            >
              WhatsApp
            </Link>
          )}
          {getContact('instagram') && (
            <Link
              href="/api/contact-info?redirect=instagram"
              target="_blank"
              className="px-6 py-2.5 bg-[#E1306C] hover:bg-[#c9265c] text-white text-xs font-semibold rounded-full transition-colors"
            >
              Instagram
            </Link>
          )}
          <Link
            href="/contact"
            className="px-6 py-2.5 border border-roasted text-roasted hover:bg-roasted/5 text-xs font-semibold rounded-full transition-colors"
          >
            All Contact Info
          </Link>
        </div>
      </section>
    </div>
  );
}
