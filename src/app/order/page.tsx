import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';

type OrderLink = Database['public']['Tables']['order_links']['Row'];

export const revalidate = 60;

export default async function OrderPage() {
  const supabase = getSupabaseAdmin();
  // Fetch active order links
  const { data: links } = await supabase
    .from('order_links')
    .select('*')
    .eq('is_active', true);

  const activeLinks = links || [];

  return (
    <div className="bg-cream min-h-screen flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full glass-card p-8 md:p-10 rounded-[28px] text-center animate-fade-up border border-latte/80 shadow-sm">
        <span className="text-xs font-semibold uppercase tracking-widest text-roasted mb-2 block">Delivery</span>
        <h1 className="font-heading font-bold text-3xl md:text-4xl text-espresso mb-4">
          Order Online
        </h1>
        <p className="font-body text-mocha/90 text-sm md:text-base mb-8">
          Get fresh hotcakes and coffee delivered straight to your doorstep.
        </p>

        {activeLinks.length > 0 ? (
          <div className="flex flex-col gap-4">
            {activeLinks.map((link: OrderLink) => {
              // Standard platforms
              let label = 'Order Now';
              let bgColor = 'bg-roasted hover:bg-dark-roast';
              if (link.platform === 'bhoj') {
                label = 'Order via Bhoj';
                bgColor = 'bg-[#F25C22] hover:bg-[#d64a18]';
              } else if (link.platform === 'foodmandu') {
                label = 'Order via Foodmandu';
                bgColor = 'bg-[#ED1C24] hover:bg-[#d11018]';
              }
              
              return (
                <Link
                  key={link.platform}
                  href={link.url || '#'}
                  target="_blank"
                  className={`w-full py-3.5 ${bgColor} text-white text-xs uppercase tracking-wider font-semibold rounded-full transition-all duration-300 hover:-translate-y-0.5 shadow-sm`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="py-10 bg-warm-white/50 border border-dashed border-latte/60 rounded-[24px] p-6 max-w-sm mx-auto">
            <svg className="w-12 h-12 mx-auto text-mocha/40 mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <rect x="1" y="3" width="15" height="13" rx="2" />
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
            <h3 className="font-heading font-semibold text-base text-espresso mb-1">
              Online Delivery Coming Soon
            </h3>
            <p className="font-body text-mocha/80 text-xs px-4">
              We are currently setting up our delivery integrations. In the meantime, you can visit us directly or call to order!
            </p>
          </div>
        )}

        <div className="mt-8">
          <Link
            href="/contact"
            className="text-xs font-semibold text-roasted hover:underline transition-colors duration-200"
          >
            Call Us Directly to Place an Order
          </Link>
        </div>
      </div>
    </div>
  );
}
