import ImageWithFallback from '@/components/ImageWithFallback';
import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';
import { getOpeningHoursStatus, OpeningHours, DAY_NAMES, formatDayHours } from '@/lib/openingHours';
import type { Metadata } from 'next';

type ContactInfo = Database['public']['Tables']['contact_info']['Row'];

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Visit Us — Location, Directions & Opening Hours | Hattiban, Lalitpur",
  description: "Find Hotcakes Nepal at Hattiban, Lalitpur — one of the best cafés near Little Angels School and Jawalakhel. Get directions, opening hours, and explore our cozy café space.",
  alternates: {
    canonical: "https://hotcakes-nepal.vercel.app/location"
  },
  openGraph: {
    title: "Visit Hotcakes Nepal — Best Café in Hattiban, Lalitpur",
    description: "Find us at Hattiban, Lalitpur — near Little Angels School, Ekantakuna, and Jawalakhel. Open daily 8 AM–8 PM. Get directions and explore our cozy café space.",
    url: "https://hotcakes-nepal.vercel.app/location",
    images: [
      {
        url: "https://hotcakes-nepal.vercel.app/images/location/location-interior-1.jpg",
        width: 1200,
        height: 630,
        alt: "Hotcakes Nepal café interior — cozy seating in Hattiban, Lalitpur",
      },
    ],
  },
};

export default async function LocationPage() {
  const supabase = getSupabaseAdmin();
  
  // Parallelize all data fetching
  const [
    contactResult,
    mapsResult,
    locPhotosResult,
    openingHoursResult,
    openStatusResult,
    siteDescResult,
    locDescResult,
    amenitiesDescResult
  ] = await Promise.all([
    supabase.from('contact_info').select('*'),
    supabase.from('site_settings').select('value').eq('key', 'google_maps').maybeSingle(),
    supabase.from('site_settings').select('value').eq('key', 'location_photos').maybeSingle(),
    supabase.from('site_settings').select('value').eq('key', 'opening_hours').maybeSingle(),
    supabase.from('site_settings').select('value').eq('key', 'open_status').maybeSingle(),
    supabase.from('site_settings').select('value').eq('key', 'site_description').maybeSingle(),
    supabase.from('site_settings').select('value').eq('key', 'location_description').maybeSingle(),
    supabase.from('site_settings').select('value').eq('key', 'amenities_description').maybeSingle()
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
  const mapsLink = mapsValue?.url ?? 'https://maps.app.goo.gl/Akbsp1cgDmTLDPy18';
  const phoneNumber = getContact('phone') || '+977 976-3687532';
  const email = getContact('email');
  const siteDescription = (siteDescResult?.data?.value as { text?: string })?.text ||
    'A cozy café in Hattiban, Lalitpur — hard-stop specialty coffee, fluffy pancakes, and freshly baked desserts.';

  const locationDescriptionText = (locDescResult?.data?.value as { text?: string })?.text ||
    'Located in Hattiban, Lalitpur — close to Little Angels School and Ekantakuna. Easily accessible with parking available for bikes and cars.';

  const amenitiesDescriptionText = (amenitiesDescResult?.data?.value as { text?: string })?.text ||
    '• High-speed complimentary Wi-Fi\n• Comfortable seating for individuals\n• Power outlets at all seating areas\n• Friendly barista & warm hospitality';

  const savedPhotos = Array.isArray(locPhotosResult?.data?.value) ? (locPhotosResult.data.value as string[]) : [];

  const locationPhotos = savedPhotos.length > 0
    ? savedPhotos.map((url, idx) => ({ src: url, alt: `Hotcakes Nepal café in Hattiban, Lalitpur — interior view ${idx + 1}` }))
    : [
        { src: '/images/location/location-exterior.jpg', alt: 'Exterior of Hotcakes Nepal café in Hattiban, Lalitpur' },
        { src: '/images/location/location-interior-1.jpg', alt: 'Cozy seating area inside Hotcakes Nepal — aesthetic café in Lalitpur' },
        { src: '/images/location/location-interior-2.jpg', alt: 'Coffee bar counter at Hotcakes Nepal — specialty coffee shop in Hattiban' },
        { src: '/images/location/location-seating.jpg', alt: 'Quiet study corner at Hotcakes Nepal — study café in Lalitpur near Little Angels School' },
      ];

  // Fill/pad photos array up to exactly 4 items
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
      alt: `Hotcakes Nepal café space in Hattiban, Lalitpur — view ${finalPhotos.length + 1}`
    });
  }

  // Parse amenities text into clean list items
  const amenityItems = amenitiesDescriptionText
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);

  return (
    <div className="bg-cream text-espresso min-h-screen">
      {/* 1. Location Hero Section */}
      <section className="max-w-[1280px] mx-auto px-4 md:px-6 py-10 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
        {/* Left column: Visit info card */}
        <div className="lg:col-span-5 space-y-6 text-left">
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-roasted block">Welcome</span>
            <h1 className="font-heading font-bold text-4xl md:text-5xl text-espresso tracking-tight leading-none uppercase">
              Visit Us
            </h1>
            <p className="font-body text-mocha/90 text-sm md:text-base leading-relaxed max-w-md">
              {siteDescription}
            </p>
          </div>

          <div className="border-t border-latte/60 pt-6 space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-mocha/60 block mb-0.5">Location</span>
              <p className="font-heading font-bold text-lg text-espresso">Hotcakes Nepal</p>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-mocha/60 block mb-0.5">Our Address</span>
              <p className="font-body text-sm md:text-base text-espresso font-medium">{address}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-mocha/60 block mb-0.5">Open Daily</span>
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

          {/* Get Directions CTA */}
          <div className="pt-2">
            <Link
              href={mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-roasted hover:bg-dark-roast text-white text-xs uppercase tracking-wider font-semibold rounded-full transition-all duration-300 hover:-translate-y-0.5 shadow-sm hover:shadow-md"
            >
              📍 Get Directions
            </Link>
          </div>
        </div>

        {/* Right column: Visually dominant map card */}
        <div className="lg:col-span-7 w-full animate-fade-up">
          <div className="relative w-full aspect-[4/3] md:aspect-auto md:h-[380px] lg:h-[400px] rounded-[24px] overflow-hidden bg-latte/30 shadow-sm border border-latte/50">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3531.97382605196!2d85.3363342!3d27.647707!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb170066805b63%3A0x49daabdd55ed2655!2sHOT%20CAKES!5e0!3m2!1sen!2snp!4v1719112000000!5m2!1sen!2snp"
              className="w-full h-full border-0 absolute inset-0"
              title="Hotcakes Nepal location on Google Maps — Hattiban, Lalitpur"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {/* 2. Detailed Info Grid Section (Visit Details) */}
      <section className="bg-warm-white border-y border-latte/40 py-16 md:py-20 px-4 md:px-6">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest text-roasted mb-1 block">Details</span>
            <h2 className="font-heading font-bold text-3xl text-espresso mb-3">
              Visit Details
            </h2>
            <p className="font-body text-mocha/80 text-sm">
              A carefully designed space in Hattiban, Lalitpur — offering calm, warmth, and the perfect cup of specialty coffee alongside our famous fluffy pancakes and fresh-baked goods.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 md:gap-8">
            {/* Card 1: Location */}
            <div className="bg-cream rounded-[24px] border border-latte/50 p-7 space-y-3.5 shadow-sm">
              <div className="w-9 h-9 rounded-full bg-latte/40 flex items-center justify-center text-espresso text-base">
                📍
              </div>
              <h3 className="font-heading font-bold text-lg text-espresso">Location</h3>
              <p className="font-body text-mocha/90 text-xs md:text-sm leading-relaxed whitespace-pre-line">
                {locationDescriptionText}
              </p>
            </div>

            {/* Card 2: Opening Hours (Unchanged) */}
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
                Open daily for dine-in, takeaway, and online orders. We recommend arriving early on weekends.
              </p>
            </div>

            {/* Card 3: Amenities */}
            <div className="bg-cream rounded-[24px] border border-latte/50 p-7 space-y-3.5 shadow-sm">
              <div className="w-9 h-9 rounded-full bg-latte/40 flex items-center justify-center text-espresso text-base">
                ✨
              </div>
              <h3 className="font-heading font-bold text-lg text-espresso">Amenities</h3>
              <ul className="space-y-2 font-body text-xs md:text-sm text-mocha/90 pt-1">
                {amenityItems.map((item, idx) => {
                  const cleanItem = item.replace(/^[•\-\*✓]\s*/, '').trim();
                  return (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#8C5835] font-bold shrink-0">✓</span>
                      <span>{cleanItem}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Elegant Boutique Gallery Section (Final Section) */}
      <section className="max-w-[1280px] mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-semibold uppercase tracking-widest text-roasted mb-1 block">Boutique</span>
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-espresso mb-3">
            Boutique Gallery
          </h2>
          <p className="font-body text-mocha/80 text-sm">
            Take a look inside our cozy café — crafted for good coffee and even better moments.
          </p>
        </div>

        {/* Clean 2x2 Card Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
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
    </div>
  );
}
