import Link from 'next/link';
import ImageWithFallback from '@/components/ImageWithFallback';
import { getSupabaseAdmin } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';

type ContactInfo = Database['public']['Tables']['contact_info']['Row'];

export const revalidate = 60;

// Coordinates for responsive floating image layout
const imagePositions = [
  // Image 0
  {
    className: "left-[3%] top-[12%] w-[90px] h-[90px] md:left-[4%] md:top-[10%] md:w-[110px] md:h-[110px] lg:left-[5%] lg:top-[10%] lg:w-[140px] lg:h-[140px] xl:w-[155px] xl:h-[155px]"
  },
  // Image 1
  {
    className: "left-[5%] top-[65%] w-[90px] h-[90px] md:left-[15%] md:top-[30%] md:w-[110px] md:h-[110px] lg:left-[18%] lg:top-[28%] lg:w-[140px] lg:h-[140px] xl:w-[155px] xl:h-[155px]"
  },
  // Image 2
  {
    className: "right-[3%] top-[12%] w-[90px] h-[90px] md:left-[3%] md:top-[65%] md:w-[110px] md:h-[110px] lg:left-[4%] lg:top-[58%] lg:w-[140px] lg:h-[140px] xl:w-[155px] xl:h-[155px]"
  },
  // Image 3
  {
    className: "right-[5%] top-[65%] w-[90px] h-[90px] md:right-[4%] md:top-[10%] md:w-[110px] md:h-[110px] lg:left-[16%] lg:top-[68%] lg:w-[140px] lg:h-[140px] xl:w-[155px] xl:h-[155px]"
  },
  // Image 4
  {
    className: "hidden md:block md:right-[15%] md:top-[30%] md:w-[110px] md:h-[110px] lg:right-[18%] lg:top-[8%] lg:w-[140px] lg:h-[140px] xl:w-[155px] xl:h-[155px]"
  },
  // Image 5
  {
    className: "hidden md:block md:right-[3%] md:top-[65%] md:w-[110px] md:h-[110px] lg:right-[5%] lg:top-[24%] lg:w-[140px] lg:h-[140px] xl:w-[155px] xl:h-[155px]"
  },
  // Image 6
  {
    className: "hidden lg:block lg:right-[16%] lg:top-[68%] lg:w-[140px] lg:h-[140px] xl:w-[155px] xl:h-[155px]"
  },
  // Image 7
  {
    className: "hidden lg:block lg:right-[3%] lg:top-[52%] lg:w-[140px] lg:h-[140px] xl:w-[155px] xl:h-[155px]"
  }
];

export default async function ContactPage() {
  const supabase = getSupabaseAdmin();
  
  // Fetch contact info and showcase images in parallel
  const [
    contactResult, 
    showcaseResult
  ] = await Promise.all([
    supabase.from('contact_info').select('*'),
    supabase.from('site_settings').select('value').eq('key', 'contact_showcase_images').maybeSingle()
  ]);

  const contacts = contactResult.data;
  const getContact = (key: string) => contacts?.find((c: ContactInfo) => c.key === key)?.value ?? '';

  const hasWhatsapp = !!getContact('whatsapp');
  const hasInstagram = !!getContact('instagram');
  const hasTiktok = !!getContact('tiktok');
  const phoneNumber = getContact('phone') || '+977 976-3687532';
  const address = getContact('address') || 'Hattiban, Lalitpur, Nepal';

  const savedShowcaseImages = Array.isArray(showcaseResult?.data?.value) ? (showcaseResult.data.value as string[]) : [];
  
  // Clean fallback images that exist on disk
  const fallbackImages = [
    '/images/menu/Cappuccino.jpeg',
    '/images/hero/hero-main.jpg',
    '/images/location/location-interior-1.jpg'
  ];
  
  // Pad with fallback images to ensure we have at least 8 images
  const showcaseImages: string[] = [...savedShowcaseImages];
  let fallbackIndex = 0;
  while (showcaseImages.length < 8) {
    showcaseImages.push(fallbackImages[fallbackIndex % fallbackImages.length]);
    fallbackIndex++;
  }

  return (
    <div className="bg-cream min-h-screen flex items-center justify-center py-10 px-4 md:py-16">
      <div className="w-full max-w-7xl relative h-[580px] md:h-[600px] bg-warm-white rounded-[32px] border border-latte/80 shadow-sm overflow-hidden flex flex-col items-center justify-center animate-fade-up">
        {/* Background Grid Pattern (9 vertical dotted lines) */}
        <div className="absolute inset-0 flex justify-between pointer-events-none opacity-20 px-8 md:px-16">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="w-px border-l border-dashed border-mocha/30 h-full" />
          ))}
        </div>

        {/* Floating Image Mosaic */}
        {showcaseImages.map((imageUrl, index) => {
          if (index >= 8) return null;
          return (
            <div
              key={index}
              className={`absolute overflow-hidden bg-latte/30 shadow-md hover:shadow-xl rounded-[20px] md:rounded-[24px] border border-latte/40 transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.04] cursor-pointer ${imagePositions[index].className}`}
            >
              <ImageWithFallback
                src={imageUrl}
                alt={`Café Showcase ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 90px, (max-width: 1024px) 110px, 160px"
                fallbackEmoji="☕"
              />
            </div>
          );
        })}

        {/* Center Content Block */}
        <div className="relative z-10 w-full max-w-[280px] xs:max-w-[320px] sm:max-w-[360px] md:max-w-[420px] text-center px-4 py-8 bg-warm-white/80 backdrop-blur-md rounded-3xl border border-latte/30 shadow-sm md:shadow-none md:border-none md:bg-transparent md:backdrop-blur-none">
          <span className="inline-block px-3 py-1 bg-latte/40 text-roasted text-[10px] md:text-xs font-semibold tracking-[0.2em] uppercase rounded-full mb-3 md:mb-5">
            Connect
          </span>
          <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl text-espresso tracking-tight mb-4 font-semibold">
            Follow Our Journey
          </h1>
          <p className="font-body text-mocha text-xs md:text-sm lg:text-base leading-relaxed mb-6 md:mb-8 max-w-sm mx-auto">
            Get updates on seasonal specials, new menu items, community events, and fresh bakery releases.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {hasInstagram && (
              <Link
                href="/api/contact-info?redirect=instagram"
                target="_blank"
                className="flex items-center gap-2 px-5 py-2.5 bg-roasted hover:bg-dark-roast text-cream text-[10px] md:text-xs uppercase tracking-wider font-semibold rounded-full shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
                Instagram
              </Link>
            )}

            {hasWhatsapp && (
              <Link
                href="/api/contact-info?redirect=whatsapp"
                target="_blank"
                className="flex items-center gap-2 px-5 py-2.5 bg-olive hover:bg-opacity-90 text-cream text-[10px] md:text-xs uppercase tracking-wider font-semibold rounded-full shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.456h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </Link>
            )}

            {hasTiktok && (
              <Link
                href="/api/contact-info?redirect=tiktok"
                target="_blank"
                className="flex items-center gap-2 px-5 py-2.5 bg-espresso hover:bg-black text-cream text-[10px] md:text-xs uppercase tracking-wider font-semibold rounded-full shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.03 2.61-.01 3.91-.02.08 1.53.63 3.05 1.62 4.2 1.12 1.27 2.7 2.06 4.36 2.29v3.83c-1.35-.09-2.69-.58-3.79-1.39-.77-.57-1.39-1.33-1.83-2.2v8.9c-.06 2.05-.85 4.09-2.29 5.53-1.78 1.78-4.4 2.5-6.87 1.94-2.47-.56-4.52-2.38-5.37-4.76-.92-2.58-.45-5.6 1.25-7.75 1.56-1.99 4.13-2.99 6.64-2.6v3.8c-1.42-.32-2.96.08-3.99 1.1-.96.95-1.36 2.37-1.07 3.7.28 1.28 1.21 2.36 2.45 2.78 1.41.49 3.09.07 4.06-1.04.53-.61.8-1.39.79-2.19V.02z"/>
                </svg>
                TikTok
              </Link>
            )}
          </div>

          {/* Minimal details block inside the card */}
          <div className="mt-8 pt-5 border-t border-latte/40 text-[10px] md:text-xs text-mocha/70 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-body">
            {phoneNumber && (
              <Link
                href={`tel:${phoneNumber}`}
                className="hover:text-roasted transition-colors font-semibold"
              >
                {phoneNumber}
              </Link>
            )}
            {phoneNumber && <span className="opacity-40">•</span>}
            <span className="font-medium">{address}</span>
            <span className="opacity-40">•</span>
            <span className="font-medium">8:00 AM – 8:00 PM (Daily)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

