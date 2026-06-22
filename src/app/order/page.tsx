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
      <div className="max-w-md w-full glass-card p-8 md:p-10 rounded-[24px] text-center animate-fade-up">
        <h1 className="font-heading font-bold text-3xl md:text-4xl text-espresso mb-4">
          order online
        </h1>
        <p className="font-body text-mocha text-sm md:text-base mb-8">
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
                  className={`w-full py-3 ${bgColor} text-white font-semibold rounded-full transition-all duration-200 transform hover:-translate-y-0.5 shadow-sm text-sm`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="py-6 border border-dashed border-latte rounded-xl">
            <span className="text-4xl block mb-2">🚚</span>
            <h3 className="font-heading font-semibold text-lg text-espresso mb-1">
              Online Ordering Coming Soon
            </h3>
            <p className="font-body text-mocha text-xs px-4">
              We are currently setting up our delivery integrations. In the meantime, you can visit us directly or call to order!
            </p>
          </div>
        )}

        <div className="mt-8">
          <Link
            href="/contact"
            className="text-xs font-semibold text-roasted hover:underline"
          >
            Call Us Directly to Place an Order
          </Link>
        </div>
      </div>
    </div>
  );
}
