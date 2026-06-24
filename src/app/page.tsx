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
    locPhotosResult,
    showcaseResult
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
    supabase.from('site_settings').select('value').eq('key', 'location_photos').maybeSingle(),
    // 7. Fetch contact showcase images
    supabase.from('site_settings').select('value').eq('key', 'contact_showcase_images').maybeSingle()
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
    <div className="flex flex-col min-h-screen bg-cream">
      {/* 1. Hero Section */}
      <section className="relative w-full flex items-center justify-center pt-24 pb-16 md:pt-32 md:pb-20">
        <div className="max-w-[1240px] w-full mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-6 flex flex-col text-center lg:text-left items-center lg:items-start animate-fade-up">
            {isOpen ? (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-semibold tracking-wider font-body bg-olive/10 text-olive mb-6 uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-olive animate-pulse" />
                We are open
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-semibold tracking-wider font-body bg-muted-red/10 text-muted-red mb-6 uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-red" />
                Closed for now
              </span>
            )}
            
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-roasted mb-2.5 block">
              Welcome to
            </span>
            <h1 className="font-heading font-medium text-4xl sm:text-5xl lg:text-6xl text-espresso leading-[1.1] mb-6 tracking-tight">
              Hotcakes Nepal
            </h1>
            <p className="font-body text-mocha/80 text-sm md:text-base lg:text-lg leading-relaxed mb-8 max-w-md">
              Good coffee, warm atmosphere, and moments that feel like home. Hand-drip brews, fluffy stacks, and quiet corners.
            </p>
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              <Link
                href="/menu"
                className="inline-flex items-center justify-center px-6 py-2.5 bg-roasted hover:bg-dark-roast text-cream text-[11px] uppercase tracking-widest font-semibold rounded-full shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
              >
                Explore Menu
              </Link>
              <Link
                href="/location"
                className="inline-flex items-center justify-center px-6 py-2.5 border border-espresso/20 text-espresso hover:bg-espresso hover:text-white text-[11px] uppercase tracking-widest font-semibold rounded-full hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
              >
                Visit Us
              </Link>
            </div>
          </div>

          {/* Hero Right Image Card */}
          <div className="lg:col-span-6 w-full animate-fade-up" style={{ animationDelay: '150ms' }}>
            <div className="relative aspect-[4/3] sm:aspect-[1.5/1] lg:aspect-[4/3] rounded-[32px] overflow-hidden bg-latte/30 shadow-md border border-latte/40 max-w-2xl mx-auto w-full">
              <ImageWithFallback
                src={heroImageUrl}
                alt="Hotcakes Nepal Hero"
                fill
                className="object-cover"
                priority
                fallbackEmoji="🥞"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Brew Streak Campaign Strip */}
      {campaign ? (
        <section className="px-4 z-10">
          <div className="max-w-[1240px] mx-auto px-6 py-4 bg-[#FCFBF8] border border-latte/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm text-center sm:text-left">
            <span className="text-espresso font-body text-sm font-medium">
              ☕ <span className="font-semibold text-roasted">{campaign.name}</span>: {campaign.tagline}
            </span>
            <Link
              href="/streak"
              className="inline-flex items-center justify-center px-5 py-2 bg-roasted hover:bg-dark-roast text-cream text-[10px] uppercase tracking-wider font-semibold rounded-full shadow-sm transition-all active:scale-[0.98]"
            >
              Start Streak
            </Link>
          </div>
        </section>
      ) : (
        <section className="px-4 z-10">
          <div className="max-w-[1240px] mx-auto px-6 py-3.5 bg-[#FCFBF8] border border-latte/20 rounded-2xl flex items-center justify-center gap-2.5 shadow-sm text-center">
            <svg className="w-4 h-4 text-roasted flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-mocha/80 font-body text-xs md:text-sm font-medium tracking-wide">
              Check back soon for our next seasonal reward events & specials!
            </span>
          </div>
        </section>
      )}

      {/* 3. Most Loved (Featured Menu Carousel) */}
      <section className="py-24 md:py-32 max-w-[1200px] mx-auto px-4 md:px-6">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-roasted mb-2.5 block">
            Customer Favorites
          </span>
          <h2 className="font-heading font-medium text-3xl md:text-4xl text-espresso mb-4 leading-tight">
            Most Loved
          </h2>
          <p className="font-body text-mocha/80 text-sm md:text-base leading-relaxed">
            Hand-picked customer favorites prepared fresh every single morning.
          </p>
        </div>

        <FeaturedCarousel items={featuredItems} />

        <div className="text-center mt-12">
          <Link
            href="/menu"
            className="inline-flex items-center justify-center px-6 py-2.5 border border-espresso/20 text-espresso hover:bg-espresso hover:text-cream text-[11px] uppercase tracking-widest font-semibold rounded-full transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 shadow-sm"
          >
            Explore Full Menu
          </Link>
        </div>
      </section>

      {/* 4. Location Teaser (Visit Our Space) */}
      <section className="py-24 md:py-32 border-y border-latte/30 bg-warm-white">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14 items-center">
          {/* Location Content (Left) */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left max-w-md mx-auto md:mx-0 order-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-roasted mb-2.5 block">
              Visit Us
            </span>
            <h2 className="font-heading font-medium text-3xl md:text-4xl text-espresso mb-4 leading-tight">
              Find Our Locations
            </h2>
            <p className="font-body text-mocha/80 text-sm md:text-base leading-relaxed mb-6">
              {"We'd love to welcome you to one of our cafes. Tucked away from the main streets, offering a quiet, rustic atmosphere for reading, study, or slow mornings."}
            </p>
            
            <div className="text-sm space-y-1.5 mb-8 text-espresso/90 font-body">
              <p>
                <span className="font-semibold text-roasted">Address:</span> {getContact('address') || 'Hattiban, Lalitpur'}
              </p>
              <p>
                <span className="font-semibold text-roasted">Hours:</span> 8:00 AM – 8:00 PM (Daily)
              </p>
            </div>
            
            <Link
              href="/location"
              className="inline-flex items-center justify-center gap-1.5 px-6 py-2.5 bg-roasted hover:bg-dark-roast text-cream text-[11px] uppercase tracking-widest font-semibold rounded-full shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
            >
              View Locations
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
              </svg>
            </Link>
          </div>
          
          {/* Location Image (Right) */}
          <div className="relative aspect-[4/3] md:h-[300px] lg:h-[340px] rounded-[24px] overflow-hidden bg-latte/10 group border border-latte/30 w-full max-w-md mx-auto order-2 shadow-sm">
            <ImageWithFallback
              src={visitUsImage}
              alt="Hotcakes Nepal Locations"
              fill
              className="object-cover group-hover:scale-[1.02] transition-transform duration-700"
              sizes="(max-width: 768px) 100vw, 400px"
              fallbackEmoji="📍"
            />
          </div>
        </div>
      </section>

      {/* 5. Follow Our Journey Section */}
      <section className="py-24 md:py-32 bg-cream text-espresso">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Image Grid (2x2) */}
            <div className="lg:col-span-4 grid grid-cols-2 gap-4 order-2 lg:order-none">
              {showcaseImages.slice(0, 4).map((imageUrl, idx) => (
                <div key={idx} className="relative aspect-square w-full rounded-[24px] overflow-hidden bg-latte/20 shadow-sm border border-latte/30 group">
                  <ImageWithFallback
                    src={imageUrl}
                    alt={`Gallery Left ${idx + 1}`}
                    fill
                    className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    sizes="(max-width: 768px) 150px, 200px"
                    fallbackEmoji="☕"
                  />
                </div>
              ))}
            </div>
            
            {/* Center Content */}
            <div className="lg:col-span-4 text-center px-4 max-w-sm mx-auto flex flex-col items-center order-1 lg:order-none mb-8 lg:mb-0">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-roasted mb-3 block">
                FOLLOW OUR JOURNEY
              </span>
              <h2 className="font-heading font-medium text-3xl md:text-4xl text-espresso mb-4 leading-tight">
                Stay Connected With Hotcakes
              </h2>
              <p className="font-body text-mocha/80 text-xs md:text-sm leading-relaxed mb-8">
                Get updates on seasonal specials, menu launches, community events and cafe stories.
              </p>
              
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-1.5 px-7 py-3 bg-roasted hover:bg-dark-roast text-cream text-[11px] uppercase tracking-widest font-semibold rounded-full shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
              >
                Contact Us
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </svg>
              </Link>
            </div>
            
            {/* Right Image Grid (2x2) */}
            <div className="lg:col-span-4 grid grid-cols-2 gap-4 order-3 lg:order-none">
              {showcaseImages.slice(4, 8).map((imageUrl, idx) => (
                <div key={idx} className="relative aspect-square w-full rounded-[24px] overflow-hidden bg-latte/20 shadow-sm border border-latte/30 group">
                  <ImageWithFallback
                    src={imageUrl}
                    alt={`Gallery Right ${idx + 1}`}
                    fill
                    className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    sizes="(max-width: 768px) 150px, 200px"
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
