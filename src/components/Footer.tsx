import Link from 'next/link';
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

  try {
    const supabase = getSupabaseAdmin();
    const [contactRes, hoursRes, openRes] = await Promise.all([
      supabase.from('contact_info').select('*'),
      supabase.from('site_settings').select('value').eq('key', 'opening_hours').maybeSingle(),
      supabase.from('site_settings').select('value').eq('key', 'open_status').maybeSingle()
    ]);

    contacts = contactRes.data || [];
    openingHours = hoursRes.data?.value ? (hoursRes.data.value as OpeningHours) : null;
    isOpen = (openRes.data?.value as { is_open?: boolean })?.is_open ?? true;

    const tiktokVal = contacts.find(c => c.key === 'tiktok')?.value;
    hasTiktok = Boolean(tiktokVal?.trim());

    address = contacts.find(c => c.key === 'address')?.value || address;
    phone = contacts.find(c => c.key === 'phone')?.value || phone;
  } catch (err) {
    console.error('Error loading footer settings:', err);
  }

  const statusInfo = getOpeningHoursStatus(openingHours, isOpen);

  return (
    <footer className="bg-[#F7F2EC] text-espresso relative overflow-hidden border-t border-latte/40">
      {/* Decorative storefront vector line art */}
      <div className="absolute bottom-0 right-0 pointer-events-none opacity-[0.04] select-none z-0 overflow-hidden translate-x-6 translate-y-6">
        <svg viewBox="0 0 200 200" className="w-56 h-56 md:w-72 md:h-72 text-espresso" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          {/* Awning */}
          <path d="M20 60h160v10H20z" />
          <path d="M20 70c0 5 4 8 8 8s8-3 8-8m0 0c0 5 4 8 8 8s8-3 8-8m0 0c0 5 4 8 8 8s8-3 8-8m0 0c0 5 4 8 8 8s8-3 8-8m0 0c0 5 4 8 8 8s8-3 8-8m0 0c0 5 4 8 8 8s8-3 8-8m0 0c0 5 4 8 8 8s8-3 8-8m0 0c0 5 4 8 8 8s8-3 8-8" />
          
          {/* Pillars/Frame */}
          <path d="M25 60v110M175 60v110M35 170h130" />
          
          {/* Door */}
          <path d="M90 170v-65h35v65" />
          <circle cx="97" cy="138" r="1.5" fill="currentColor" />
          <path d="M90 105h35" />
          
          {/* Left Window */}
          <path d="M35 85h45v50H35z" />
          <path d="M57 85v50M35 110h45" />
          
          {/* Right Window */}
          <path d="M135 85h30v50h-30z" />
          <path d="M150 85v50M135 110h30" />
          
          {/* Plants */}
          <path d="M28 170c2-5 8-5 10 0M162 170c2-5 8-5 10 0" />
          <path d="M33 162c0-3 3-5 5-5s5 2 5 5M167 162c0-3 3-5 5-5s5 2 5 5" />
          
          {/* Signboard */}
          <path d="M75 35h50v15H75z" />
          <path d="M85 35v-10M115 35v-10" />
          <path d="M70 25h60" />
          
          {/* Signboard Text Line Art */}
          <path d="M85 42h30M90 45h20" strokeWidth="0.8" />
        </svg>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-12 md:py-16 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">
          {/* Column 1: Brand */}
          <div>
            <h3 className="font-heading font-semibold text-lg text-espresso mb-4 uppercase tracking-wider">
              Hot Cakes Nepal
            </h3>
            <p className="font-body text-xs md:text-sm text-mocha/90 leading-relaxed">
              Good coffee, warm atmosphere, and moments that feel like home. Enjoy our fluffy hotcakes and hand-drip brews.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="font-heading font-semibold text-sm text-espresso mb-4 uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-body text-xs md:text-sm text-mocha/80 hover:text-roasted transition-all duration-300 hover:translate-x-1 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Locations */}
          <div>
            <h3 className="font-heading font-semibold text-sm text-espresso mb-4 uppercase tracking-wider">
              Locations
            </h3>
            <p className="font-body text-xs md:text-sm text-mocha/90 leading-relaxed font-semibold">
              {address}
            </p>
            <p className="font-body text-xs md:text-sm text-mocha/70 leading-relaxed mt-1">
              Tucked away in the quiet street of Hattiban, Lalitpur.
            </p>
            <div className="mt-3">
              <Link
                href="/location"
                className="font-body text-xs font-semibold text-roasted hover:text-dark-roast transition-colors duration-200"
              >
                Get Directions →
              </Link>
            </div>
          </div>

          {/* Column 4: Hours & Connect */}
          <div>
            <h3 className="font-heading font-semibold text-sm text-espresso mb-4 uppercase tracking-wider">
              Hours
            </h3>
            <p className="font-body text-xs md:text-sm text-mocha/95 leading-relaxed font-semibold">
              {statusInfo.todayHoursText}
            </p>
            <p className="font-body text-xs text-mocha/70 mt-0.5">
              {statusInfo.statusText}
            </p>
            <div className="mt-4 space-y-2 pt-2 border-t border-latte/40">
              <p className="font-body text-xs text-mocha/80">
                <a href={`tel:${phone.replace(/\s+/g, '')}`} className="hover:text-roasted transition-colors duration-200">
                  📞 {phone}
                </a>
              </p>
              <div className="flex flex-wrap gap-2.5 items-center mt-3">
                <a
                  href="/api/contact-info?redirect=instagram"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body text-xs font-medium text-mocha/80 hover:text-roasted transition-colors duration-200"
                >
                  Instagram
                </a>
                <span className="text-latte/60">|</span>
                <a
                  href="/api/contact-info?redirect=whatsapp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body text-xs font-medium text-mocha/80 hover:text-roasted transition-colors duration-200"
                >
                  WhatsApp
                </a>
                {hasTiktok && (
                  <>
                    <span className="text-latte/60">|</span>
                    <a
                      href="/api/contact-info?redirect=tiktok"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-body text-xs font-medium text-mocha/80 hover:text-roasted transition-colors duration-200"
                    >
                      TikTok
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-latte/40 bg-cream/10">
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-2 relative z-10">
          <p className="font-body text-xs text-mocha/50 text-center sm:text-left">
            © {new Date().getFullYear()} Hot Cakes Nepal
          </p>
          <Link
            href="/hc-dashboard"
            className="font-body text-[10px] text-mocha/45 hover:text-roasted transition-colors duration-200"
          >
            Staff Login
          </Link>
        </div>
      </div>
    </footer>
  );
}

