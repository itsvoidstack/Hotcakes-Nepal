import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabase/client';

const quickLinks = [
  { href: '/', label: 'Home' },
  { href: '/menu', label: 'Menu' },
  { href: '/order', label: 'Order' },
  { href: '/location', label: 'Location' },
  { href: '/contact', label: 'Contact' },
  { href: '/vacancies', label: 'Vacancies' },
  { href: '/streak', label: 'Brew Streak Rewards' },
];

export default async function Footer() {
  let hasTiktok = false
  try {
    const supabase = getSupabaseAdmin();
    const { data: tiktokRecord } = await supabase
      .from('contact_info')
      .select('value')
      .eq('key', 'tiktok')
      .maybeSingle();

    hasTiktok = Boolean(tiktokRecord?.value?.trim());
  } catch {
    hasTiktok = false
  }

  return (
    <footer className="bg-[#2C1810] text-[#FAF7F2]">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
          {/* Brand */}
          <div>
            <h3 className="font-heading font-bold text-xl text-[#FAF7F2] mb-4">
              Hot Cakes Nepal
            </h3>
            <p className="font-body text-sm text-[#FAF7F2]/80 leading-relaxed">
              Coffee &amp; Bakery
            </p>
            <p className="font-body text-sm text-[#FAF7F2]/80 leading-relaxed mt-2">
              Hattiban, Lalitpur
            </p>
            <p className="font-body text-sm text-[#FAF7F2]/80 leading-relaxed mt-1">
              Open Daily 7:00 AM - 8:30 PM
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading font-bold text-lg text-[#FAF7F2] mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-body text-sm text-[#FAF7F2]/80 hover:text-[#FAF7F2] transition-all duration-300 hover:translate-x-1 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="font-heading font-bold text-lg text-[#FAF7F2] mb-4">
              Connect
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/api/contact-info?redirect=whatsapp"
                  className="font-body text-sm text-[#FAF7F2]/80 hover:text-[#FAF7F2] transition-all duration-300 hover:translate-x-1 inline-block"
                >
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href="/api/contact-info?redirect=instagram"
                  className="font-body text-sm text-[#FAF7F2]/80 hover:text-[#FAF7F2] transition-all duration-300 hover:translate-x-1 inline-block"
                >
                  Instagram
                </a>
              </li>
              {hasTiktok && (
                <li>
                  <a
                    href="/api/contact-info?redirect=tiktok"
                    className="font-body text-sm text-[#FAF7F2]/80 hover:text-[#FAF7F2] transition-all duration-300 hover:translate-x-1 inline-block"
                  >
                    TikTok
                  </a>
                </li>
              )}
              <li>
                <a
                  href="tel:+9779763687532"
                  className="font-body text-sm text-[#FAF7F2]/80 hover:text-[#FAF7F2] transition-all duration-300 hover:translate-x-1 inline-block"
                >
                  Phone: +977 976-3687532
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-[#C9A84C]">
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="font-body text-xs text-[#FAF7F2]/60 text-center sm:text-left">
            © 2025 Hot Cakes Nepal
          </p>
          <Link
            href="/hc-dashboard"
            className="font-body text-[10px] text-[#FAF7F2]/30 hover:text-[#FAF7F2]/60 transition-colors duration-200"
          >
            Staff Login
          </Link>
        </div>
      </div>
    </footer>
  );
}

