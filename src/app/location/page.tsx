import ImageWithFallback from '@/components/ImageWithFallback';
import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';

type ContactInfo = Database['public']['Tables']['contact_info']['Row'];

export const revalidate = 60;

export default async function LocationPage() {
  const supabase = getSupabaseAdmin();
  
  // Parallelize all data fetching
  const [
    contactResult,
    mapsResult,
    locPhotosResult
  ] = await Promise.all([
    supabase.from('contact_info').select('*'),
    supabase.from('site_settings').select('value').eq('key', 'google_maps').maybeSingle(),
    supabase.from('site_settings').select('value').eq('key', 'location_photos').maybeSingle()
  ]);

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
  const mapsLink = mapsValue?.url ?? 'https://maps.app.goo.gl/y2qh1TqYovxSpzDL9';

  const savedPhotos = Array.isArray(locPhotosResult?.data?.value) ? (locPhotosResult.data.value as string[]) : [];

  const locationPhotos = savedPhotos.length > 0
    ? savedPhotos.map((url, idx) => ({ src: url, alt: `Location View ${idx + 1}` }))
    : [
        { src: '/images/location/location-exterior.jpg', alt: 'Exterior View' },
        { src: '/images/location/location-interior-1.jpg', alt: 'Cozy Seating Area' },
        { src: '/images/location/location-interior-2.jpg', alt: 'Coffee Bar Counter' },
        { src: '/images/location/location-seating.jpg', alt: 'Quiet Corner Desk' },
      ];

  return (
    <div className="bg-cream min-h-screen py-16 px-4">
      <div className="max-w-[1280px] mx-auto text-center mb-16">
        <span className="text-4xl block mb-4">📍</span>
        <h1 className="font-heading font-bold text-4xl md:text-5xl text-espresso mb-4">
          our location
        </h1>
        <p className="font-body text-mocha text-base max-w-md mx-auto">
          Nestled in Lalitpur, offering a quiet escape with a rustic atmosphere, warm lighting, and fresh coffee.
        </p>
      </div>

      <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Photos Grid */}
        <div className="lg:col-span-7 grid grid-cols-2 gap-4">
          {locationPhotos.map((photo, index) => (
            <div
              key={index}
              className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-latte/30 shadow-sm group"
            >
              <ImageWithFallback
                src={photo.src}
                alt={photo.alt}
                fill
                className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                sizes="(max-width: 768px) 50vw, 33vw"
                fallbackEmoji="📸"
              />
            </div>
          ))}
        </div>

        {/* Right: Details Card */}
        <div className="lg:col-span-5 glass-card p-8 md:p-10 rounded-[24px] border border-latte shadow-sm animate-fade-up">
          <h2 className="font-heading font-bold text-2xl text-espresso mb-6">
            visit details
          </h2>

          <div className="space-y-6 mb-8 text-left">
            <div>
              <span className="text-xs font-semibold text-mocha uppercase tracking-wider block mb-1">
                Address
              </span>
              <p className="font-body text-base text-espresso font-medium">
                {address}
              </p>
            </div>

            <div>
              <span className="text-xs font-semibold text-mocha uppercase tracking-wider block mb-1">
                Opening Hours
              </span>
              <p className="font-body text-base text-espresso font-medium">
                Every Day: 8:00 AM – 8:00 PM
              </p>
            </div>

            <div>
              <span className="text-xs font-semibold text-mocha uppercase tracking-wider block mb-1">
                Atmosphere & Amenities
              </span>
              <ul className="list-disc list-inside font-body text-sm text-mocha space-y-1.5 mt-1">
                <li>High-speed complimentary Wi-Fi</li>
                <li>Quiet zones for study and work</li>
                <li>Power outlets at seating corners</li>
                <li>Freshly baked desserts daily</li>
              </ul>
            </div>
          </div>

          <Link
            href={mapsLink}
            target="_blank"
            className="block w-full text-center py-3 bg-roasted hover:bg-dark-roast text-white font-semibold rounded-full transition-all duration-200 transform hover:-translate-y-0.5 shadow-sm text-sm"
          >
            Find Us on Google Maps
          </Link>
        </div>
      </div>
    </div>
  );
}
