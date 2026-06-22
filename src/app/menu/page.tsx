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
    <div className="bg-cream min-h-screen py-16">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 text-center mb-12">
        <h1 className="font-heading font-bold text-4xl md:text-5xl text-espresso mb-4">
          our menu
        </h1>
        <p className="font-body text-mocha text-base max-w-md mx-auto">
          Fresh fluffly hotcakes, house-blend drip coffee, and wholesome treats baked fresh daily.
        </p>
      </div>

      <MenuClient initialItems={items || []} />
    </div>
  );
}
