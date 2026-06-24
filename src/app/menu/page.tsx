import MenuClient from '@/components/MenuClient';
import { getSupabaseAdmin } from '@/lib/supabase/client';

export const revalidate = 60;

export default async function MenuPage() {
  const supabase = getSupabaseAdmin();
  // Fetch all available menu items
  const { data: items } = await supabase
    .from('menu_items')
    .select('*')
    .eq('is_available', true)
    .order('category', { ascending: true });

  return (
    <div className="bg-cream min-h-screen pt-6 pb-16">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 text-center mb-6">
        <h1 className="font-heading font-medium uppercase tracking-[0.1em] leading-tight text-espresso text-[32px] md:text-[42px] lg:text-[48px] mb-3.5">
          OUR MENU
        </h1>
        <p className="font-body text-[#6B5B52] text-[14px] md:text-[15px] lg:text-[16px] leading-[1.6] max-w-[540px] mx-auto">
          Fresh fluffy hotcakes, house-blend drip coffee, and wholesome treats baked fresh daily.
        </p>
      </div>

      <MenuClient initialItems={items || []} />
    </div>
  );
}
