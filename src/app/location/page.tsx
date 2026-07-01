import ImageWithFallback from '@/components/ImageWithFallback';
import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';
import { getOpeningHoursStatus, OpeningHours, DAY_NAMES, formatDayHours } from '@/lib/openingHours';
import type { Metadata } from 'next';

type ContactInfo = Database['public']['Tables']['contact_info']['Row'];

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Visit Us | Hotcakes Nepal",
  alternates: {
    canonical: "https://hotcakes-nepal.vercel.app/location"
  }
};

export default async function LocationPage() {
  const supabase = getSupabaseAdmin();
  
  // Parallelize all data fetching
  const [
    contactResult,
    mapsResult,
    locPhotosResult,
    openingHoursResult,
    openStatusResult
  ] = await Promise.all([
    supabase.from('contact_info').select('*'),
    supabase.from('site_settings').select('value').eq('key', 'google_maps').maybeSingle(),
    supabase.from('site_settings').select('value').eq('key', 'location_photos').maybeSingle(),
    supabase.from('site_settings').select('value').eq('key', 'opening_hours').maybeSingle(),
    supabase.from('site_settings').select('value').eq('key', 'open_status').maybeSingle()
  ]);

  const isOpen = (openStatusResult?.data?.value as { is_open?: boolean })?.is_open ?? true;
  const hoursSetting = openingHoursResult?.data;
  const openingHours = hoursSetting?.value ? (hoursSetting.value as OpeningHours) : null;
  const statusInfo = getOpeningHoursStatus(openingHours, isOpen);

  const contacts = contactResult.data;
  const getContact = (key: string) => {
    const contact = contacts?.find((c: ContactInfo) => c.key === key);
    if (contact) {
      return contact.value;
    }
    return '';
  };
  
  const address = getContact('address') || 'Hattiban, Lalitpur, Nepal';
  const mapsValue = mapsResult?.data?.value as { url?: string } | null;
  // Fallback maps link updated to user's provided Google Maps URL
  const mapsLink = mapsValue?.url ?? 'https://maps.app.goo.gl/Akbsp1cgDmTLDPy18';
  const phoneNumber = getContact('phone') || '+977 976-3687532';
  const email = getContact('email');

  const instagram = getContact('instagram');
  const whatsapp = getContact('whatsapp');
  const tiktok = getContact('tiktok');

  const savedPhotos = Array.isArray(locPhotosResult?.data?.value) ? (locPhotosResult.data.value as string[]) : [];

  const locationPhotos = savedPhotos.length > 0
    ? savedPhotos.map((url, idx) => ({ src: url, alt: `Location View ${idx + 1}` }))
    : [
        { src: '/images/location/location-exterior.jpg', alt: 'Exterior View' },
        { src: '/images/location/location-interior-1.jpg', alt: 'Cozy Seating Area' },
        { src: '/images/location/location-interior-2.jpg', alt: 'Coffee Bar Counter' },
        { src: '/images/location/location-seating.jpg', alt: 'Quiet Corner Desk' },
      ];

  // Fill/pad photos array up to exactly 4 items to ensure our asymmetric layout works perfectly
  const finalPhotos = [...locationPhotos];
  while (finalPhotos.length < 4) {
    const fallbacks = [
      '/images/location/location-exterior.jpg',
      '/images/location/location-interior-1.jpg',
      '/images/location/location-interior-2.jpg',
      '/images/location/location-seating.jpg'
    ];
    finalPhotos.push({
      src: fallbacks[finalPhotos.length % 4],
      alt: `Fallback Location View ${finalPhotos.length + 1}`
    });
  }

  return (
    <div className="bg-cream text-espresso min-h-screen">
      {/* 1. Location Hero Section */}
      <section className="max-w-[1280px] mx-auto px-4 md:px-6 py-14 md:py-18 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        {/* Left column: Visit info card */}
        <div className="lg:col-span-5 space-y-6 text-left">
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-roasted block">Welcome</span>
            <h1 className="font-heading font-bold text-4xl md:text-5xl text-espresso tracking-tight leading-none uppercase">
              Visit Us
            </h1>
            <p className="font-body text-mocha/90 text-sm md:text-base leading-relaxed max-w-md">
              We welcome you to our peaceful boutique space in Hattiban. Come enjoy slow mornings, quiet coffee corners, and freshly prepared hotcakes.
            </p>
          </div>

          <div className="border-t border-latte/60 pt-6 space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-mocha/60 block mb-0.5">Our Café</span>
              <p className="font-heading font-bold text-lg text-espresso">Hotcakes Nepal</p>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-mocha/60 block mb-0.5">Address</span>
              <p className="font-body text-sm md:text-base text-espresso font-medium">{address}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-mocha/60 block mb-0.5">Opening Hours</span>
                <p className="font-body text-sm md:text-base text-espresso font-medium">{statusInfo.todayHoursText}</p>
                <p className="text-xs text-mocha">{statusInfo.statusText}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-mocha/60 block mb-0.5">Phone Number</span>
                <p className="font-body text-sm md:text-base text-espresso font-medium">{phoneNumber}</p>
              </div>
            </div>

            {email && (
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-mocha/60 block mb-0.5">Email</span>
                <p className="font-body text-sm md:text-base text-espresso font-medium">{email}</p>
              </div>
            )}
          </div>

          {/* Section 5: Get Directions CTA */}
          <div className="pt-2">
            <Link
              href={mapsLink}
              target="_blank"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-roasted hover:bg-dark-roast text-white text-xs uppercase tracking-wider font-semibold rounded-full transition-all duration-300 hover:-translate-y-0.5 shadow-sm hover:shadow-md"
            >
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0z" />
              </svg>
              📍 Get Directions
            </Link>
          </div>
        </div>

        {/* Right column: Visually dominant map card */}
        <div className="lg:col-span-7 w-full animate-fade-up">
          {/* Reduced desktop map container height to 400px */}
          <div className="relative w-full aspect-[4/3] md:aspect-[16/10] lg:aspect-auto lg:h-[400px] rounded-[24px] overflow-hidden bg-latte/30 shadow-sm border border-latte/50">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3531.97382605196!2d85.3363342!3d27.647707!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb170066805b63%3A0x49daabdd55ed2655!2sHOT%20CAKES!5e0!3m2!1sen!2snp!4v1719112000000!5m2!1sen!2snp"
              className="w-full h-full border-0 absolute inset-0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {/* 2. Detailed Info Grid Section */}
      <section className="bg-warm-white border-y border-latte/40 py-16 md:py-20 px-4 md:px-6">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest text-roasted mb-1 block">Details</span>
            <h2 className="font-heading font-bold text-3xl text-espresso mb-3">
              Visit Details
            </h2>
            <p className="font-body text-mocha/80 text-sm">
              A meticulously designed space to offer calm, warmth, and the perfect cup of coffee.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* Address Info */}
            <div className="bg-cream rounded-[24px] border border-latte/50 p-7 space-y-3.5 shadow-sm">
              <div className="w-9 h-9 rounded-full bg-latte/40 flex items-center justify-center text-espresso text-base">
                📍
              </div>
              <h3 className="font-heading font-bold text-lg text-espresso">Address</h3>
              <p className="font-body text-mocha/90 text-sm leading-relaxed">
                {address}. Located away from the main streets, offering a quiet, rustic atmosphere for reading, study, or morning stacks.
              </p>
            </div>

            {/* Hours Info */}
            <div className="bg-cream rounded-[24px] border border-latte/50 p-7 space-y-3.5 shadow-sm">
              <div className="w-9 h-9 rounded-full bg-latte/40 flex items-center justify-center text-espresso text-base">
                ⏰
              </div>
              <h3 className="font-heading font-bold text-lg text-espresso">Opening Hours</h3>
              <div className="space-y-1.5 pt-1">
                {DAY_NAMES.map((day) => {
                  const dayHours = openingHours?.[day] || { isClosed: false, openTime: '08:00', closeTime: '20:00' };
                  const formatted = formatDayHours(dayHours);
                  return (
                    <div key={day} className="flex justify-between font-body text-xs text-mocha/90">
                      <span className="capitalize font-semibold">{day}:</span>
                      <span>{formatted}</span>
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-mocha font-body mt-2 leading-relaxed">
                Serving hot cakes, fresh brews, and signature desserts all day. Kitchen closes 15 mins prior to closing.
              </p>
            </div>

            {/* Directions & Ambiance */}
            <div className="bg-cream rounded-[24px] border border-latte/50 p-7 space-y-3.5 shadow-sm">
              <div className="w-9 h-9 rounded-full bg-latte/40 flex items-center justify-center text-espresso text-base">
                ✨
              </div>
              <h3 className="font-heading font-bold text-lg text-espresso">Amenities</h3>
              <ul className="list-disc list-inside font-body text-sm text-mocha/90 space-y-1 mt-0.5">
                <li>High-speed complimentary Wi-Fi</li>
                <li>Dedicated quiet zones for study/work</li>
                <li>Power outlets at seating corners</li>
                <li>Freshly baked desserts daily</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Elegant Boutique Gallery Section */}
      <section className="max-w-[1280px] mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-semibold uppercase tracking-widest text-roasted mb-1 block">Moments</span>
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-espresso mb-3">
            Boutique Gallery
          </h2>
          <p className="font-body text-mocha/80 text-sm">
            Take a look inside our cozy corners, coffee counters, and fresh preparations.
          </p>
        </div>

        {/* Clean 2x2 Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {finalPhotos.map((photo, index) => (
            <div
              key={index}
              className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-latte/30 group shadow-sm border border-latte/30"
            >
              <ImageWithFallback
                src={photo.src}
                alt={photo.alt}
                fill
                className="group-hover:scale-[1.03] transition-transform duration-500"
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                fallbackEmoji="📸"
              />
            </div>
          ))}
        </div>
      </section>

      {/* 4. Brand Story Block */}
      <section className="bg-warm-white border-y border-latte/40 py-20 md:py-24 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="font-heading font-medium italic text-3xl md:text-4xl text-roasted/95 leading-relaxed tracking-tight">
            &ldquo;Fresh coffee,<br className="sm:hidden" /> fluffy hotcakes,<br className="sm:hidden" /> and warm moments.&rdquo;
          </h2>
          <div className="w-12 h-0.5 bg-roasted/30 mx-auto" />
          <p className="font-heading font-light text-espresso text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
            Designed for slow mornings, friendly conversations, and memorable afternoons.
          </p>
        </div>
      </section>

      {/* 6. Social Connection Section */}
      <section className="max-w-[1280px] mx-auto px-4 md:px-6 py-16 md:py-20 text-center space-y-6">
        <div className="space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-widest text-roasted block">Connect</span>
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-espresso">Follow Our Journey</h2>
          <p className="font-body text-mocha/80 text-sm max-w-xs mx-auto">
            Get updates on seasonal recipes, community events, and fresh stacks.
          </p>
        </div>

        <div className="flex justify-center gap-8 md:gap-12 pt-2">
          {instagram && (
            <Link
              href="/api/contact-info?redirect=instagram"
              target="_blank"
              className="font-body text-sm font-semibold tracking-wider uppercase text-espresso hover:text-roasted transition-all duration-300 hover:-translate-y-0.5"
            >
              Instagram
            </Link>
          )}
          {whatsapp && (
            <Link
              href="/api/contact-info?redirect=whatsapp"
              target="_blank"
              className="font-body text-sm font-semibold tracking-wider uppercase text-espresso hover:text-roasted transition-all duration-300 hover:-translate-y-0.5"
            >
              WhatsApp
            </Link>
          )}
          {tiktok && (
            <Link
              href="/api/contact-info?redirect=tiktok"
              target="_blank"
              className="font-body text-sm font-semibold tracking-wider uppercase text-espresso hover:text-roasted transition-all duration-300 hover:-translate-y-0.5"
            >
              TikTok
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
