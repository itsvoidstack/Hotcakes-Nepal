import MenuClient from '@/components/MenuClient';
import { getSupabaseAdmin } from '@/lib/supabase/client';
import type { Metadata } from 'next';

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Menu | Hotcakes Nepal",
  alternates: {
    canonical: "https://hotcakes-nepal.vercel.app/menu"
  }
};

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
        <h1 className="font-heading font-medium uppercase tracking-[0.1em] leading-tight text-espresso text-[32px] md:text-[42px] lg:text-[48px]">
          OUR MENU
        </h1>
      </div>

      <MenuClient initialItems={items || []} />
    </div>
  );
}
