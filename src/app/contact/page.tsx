import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';

export const revalidate = 0;

export default async function ContactPage() {
  // Fetch contact details from database
  const { data: contacts } = await supabase
    .from('contact_info')
    .select('*');

  const getContact = (key: string) => contacts?.find(c => c.key === key)?.value ?? '';

  const hasWhatsapp = !!getContact('whatsapp');
  const hasInstagram = !!getContact('instagram');
  const hasTiktok = !!getContact('tiktok');
  const phoneNumber = getContact('phone') || '+977 976-3687532';
  const address = getContact('address') || 'Patan, Lalitpur, Nepal';

  return (
    <div className="bg-cream min-h-screen flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full glass-card p-8 md:p-10 rounded-[24px] text-center animate-fade-up border border-latte shadow-sm">
        <span className="text-4xl block mb-4">📞</span>
        <h1 className="font-heading font-bold text-3xl md:text-4xl text-espresso mb-4">
          get in touch
        </h1>
        <p className="font-body text-mocha text-sm md:text-base mb-8">
          Have a question or want to make a group reservation? Reach out on any of our channels.
        </p>

        <div className="space-y-4">
          {phoneNumber && (
            <div className="p-4 bg-warm-white rounded-xl border border-latte flex flex-col items-center">
              <span className="text-xs font-semibold text-mocha uppercase tracking-wider block mb-1">
                Phone Number
              </span>
              <Link
                href={`tel:${phoneNumber}`}
                className="font-heading font-bold text-lg text-espresso hover:text-roasted transition-colors"
              >
                {phoneNumber}
              </Link>
            </div>
          )}

          {hasWhatsapp && (
            <Link
              href="/api/contact-info?redirect=whatsapp"
              target="_blank"
              className="flex items-center justify-center gap-2 w-full py-3 bg-[#25D366] hover:bg-[#20ba59] text-white font-semibold rounded-full transition-all duration-200 transform hover:-translate-y-0.5 shadow-sm text-sm"
            >
              Chat on WhatsApp
            </Link>
          )}

          {hasInstagram && (
            <Link
              href="/api/contact-info?redirect=instagram"
              target="_blank"
              className="flex items-center justify-center gap-2 w-full py-3 bg-[#E1306C] hover:bg-[#c9265c] text-white font-semibold rounded-full transition-all duration-200 transform hover:-translate-y-0.5 shadow-sm text-sm"
            >
              Follow on Instagram
            </Link>
          )}

          {hasTiktok && (
            <Link
              href="/api/contact-info?redirect=tiktok"
              target="_blank"
              className="flex items-center justify-center gap-2 w-full py-3 bg-black hover:bg-neutral-800 text-white font-semibold rounded-full transition-all duration-200 transform hover:-translate-y-0.5 shadow-sm text-sm"
            >
              Follow on TikTok
            </Link>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-latte text-xs text-mocha">
          <p className="font-body">
            **Address:** {address}
          </p>
          <p className="font-body mt-1">
            **Hours:** 8:00 AM – 8:00 PM (Daily)
          </p>
        </div>
      </div>
    </div>
  );
}
