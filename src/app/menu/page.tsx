import { supabase } from '@/lib/supabase/client';
import MenuClient from '@/components/MenuClient';

export const revalidate = 0;

export default async function MenuPage() {
  // Fetch all menu items from Supabase
  const { data: menuItems } = await supabase
    .from('menu_items')
    .select('*')
    .order('display_order', { ascending: true });

  const items = menuItems || [];

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

      <MenuClient initialItems={items} />
    </div>
  );
}
