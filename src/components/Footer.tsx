import Link from 'next/link';
import Image from 'next/image';
import { getSupabaseAdmin } from '@/lib/supabase/client';
import { getOpeningHoursStatus, OpeningHours } from '@/lib/openingHours';

const quickLinks = [
  { href: '/', label: 'Home' },
  { href: '/menu', label: 'Menu' },
  { href: '/order', label: 'Order' },
  { href: '/location', label: 'Location' },
  { href: '/contact', label: 'Contact' },
  { href: '/vacancies', label: 'Vacancies' },
  { href: '/streak', label: 'Campaigns' },
];

export default async function Footer() {
  let contacts: { key: string; value: string }[] = [];
  let openingHours: OpeningHours | null = null;
  let isOpen = true;
  let hasTiktok = false;
  let address = 'Hattiban, Lalitpur';
  let phone = '+977 976-3687532';
  let siteDescription = 'Cozy breakfast café and specialty coffee shop in Hattiban, Lalitpur. Fluffy pancakes, hand-drip brews, fresh baked desserts — open daily near Little Angels School.';

  try {
    const supabase = getSupabaseAdmin();
    const [contactRes, hoursRes, openRes, descRes] = await Promise.all([
      supabase.from('contact_info').select('*'),
      supabase.from('site_settings').select('value').eq('key', 'opening_hours').maybeSingle(),
      supabase.from('site_settings').select('value').eq('key', 'open_status').maybeSingle(),
      supabase.from('site_settings').select('value').eq('key', 'site_description').maybeSingle(),
    ]);

    contacts = contactRes.data || [];
    openingHours = hoursRes.data?.value ? (hoursRes.data.value as OpeningHours) : null;
    isOpen = (openRes.data?.value as { is_open?: boolean })?.is_open ?? true;

    const tiktokVal = contacts.find(c => c.key === 'tiktok')?.value;
    hasTiktok = Boolean(tiktokVal?.trim());

    address = contacts.find(c => c.key === 'address')?.value || address;
    phone = contacts.find(c => c.key === 'phone')?.value || phone;
    siteDescription = (descRes.data?.value as { text?: string })?.text || siteDescription;
  } catch (err) {
    console.error('Error loading footer settings:', err);
  }

  const statusInfo = getOpeningHoursStatus(openingHours, isOpen);

  return (
    <footer className="bg-espresso text-cream relative overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 pt-14 md:pt-16 pb-10 md:pb-12 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8 pb-10 border-b border-white/10">

          {/* Column 1: Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-roasted rounded-md">
              <Image
                src="/logo.png"
                alt="Hotcakes Nepal Logo"
                width={120}
                height={36}
                className="h-8 w-auto object-contain max-h-[36px]"
              />
              <span className="font-heading font-semibold text-base text-cream tracking-wide group-hover:text-roasted transition-colors">
                Hotcakes <span className="font-medium text-roasted">Nepal</span>
              </span>
            </Link>
            <p className="font-body text-xs text-cream/60 leading-relaxed max-w-[200px]">
              {siteDescription}
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3 mt-5">
              <a
                href="/api/contact-info?redirect=instagram"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-cream/70 hover:text-cream hover:border-white/50 transition-all duration-200"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              <a
                href="/api/contact-info?redirect=whatsapp"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-cream/70 hover:text-cream hover:border-white/50 transition-all duration-200"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.456h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
              {hasTiktok && (
                <a
                  href="/api/contact-info?redirect=tiktok"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-cream/70 hover:text-cream hover:border-white/50 transition-all duration-200"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.03 2.61-.01 3.91-.02.08 1.53.63 3.05 1.62 4.2 1.12 1.27 2.7 2.06 4.36 2.29v3.83c-1.35-.09-2.69-.58-3.79-1.39-.77-.57-1.39-1.33-1.83-2.2v8.9c-.06 2.05-.85 4.09-2.29 5.53-1.78 1.78-4.4 2.5-6.87 1.94-2.47-.56-4.52-2.38-5.37-4.76-.92-2.58-.45-5.6 1.25-7.75 1.56-1.99 4.13-2.99 6.64-2.6v3.8c-1.42-.32-2.96.08-3.99 1.1-.96.95-1.36 2.37-1.07 3.7.28 1.28 1.21 2.36 2.45 2.78 1.41.49 3.09.07 4.06-1.04.53-.61.8-1.39.79-2.19V.02z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="font-body text-[10px] font-bold text-cream/40 mb-4 uppercase tracking-[0.15em]">
              Quick Links
            </h3>
            <nav aria-label="Footer quick links">
              <ul className="space-y-2">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="font-body text-xs text-cream/70 hover:text-cream transition-colors duration-200 inline-block py-0.5"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Column 3: Location */}
          <div>
            <h3 className="font-body text-[10px] font-bold text-cream/40 mb-4 uppercase tracking-[0.15em]">
              Location
            </h3>
            <p className="font-body text-xs text-cream/80 leading-relaxed">
              {address}
            </p>
            <div className="mt-3">
              <Link
                href="/location"
                className="font-body text-xs text-roasted hover:text-cream transition-colors duration-200"
              >
                Get Directions &rarr;
              </Link>
            </div>
          </div>

          {/* Column 4: Hours */}
          <div>
            <h3 className="font-body text-[10px] font-bold text-cream/40 mb-4 uppercase tracking-[0.15em]">
              Hours
            </h3>
            <p className="font-body text-xs text-cream/80 font-medium">
              {statusInfo.todayHoursText}
            </p>
            <p className="font-body text-[10px] text-cream/50 mt-0.5">
              {statusInfo.statusText}
            </p>
            <p className="font-body text-[10px] text-cream/40 mt-1 leading-relaxed">
              Open daily &mdash; breakfast caf&eacute; &amp; specialty coffee in Lalitpur
            </p>
            <div className="mt-3">
              <a href={`tel:${phone.replace(/\s+/g, '')}`} className="font-body text-xs text-cream/70 hover:text-cream transition-colors duration-200">
                {phone}
              </a>
            </div>
          </div>

        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-2">
        <p className="font-body text-[10px] text-cream/30">
          &copy; {new Date().getFullYear()} Hot Cakes Nepal. All rights reserved.
        </p>
        <Link
          href="/hc-dashboard"
          className="font-body text-[10px] text-cream/20 hover:text-cream/50 transition-colors duration-200"
        >
          Staff Login
        </Link>
      </div>
    </footer>
  );
}
