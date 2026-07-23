import MenuClient from '@/components/MenuClient';
import { getSupabaseAdmin } from '@/lib/supabase/client';
import type { Metadata } from 'next';

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Menu — Pancakes, Coffee & Desserts",
  description: "Browse the full Hotcakes Nepal menu. Fluffy pancakes, specialty coffee, handcrafted desserts, fresh breakfast items, and more — all made fresh daily in Hattiban, Lalitpur.",
  alternates: {
    canonical: "https://hotcakes-nepal.vercel.app/menu"
  },
  openGraph: {
    title: "Menu — Hotcakes Nepal",
    description: "Fluffy pancakes, specialty coffee, handcrafted desserts, and fresh breakfast items. All made fresh daily at our café in Hattiban, Lalitpur.",
    url: "https://hotcakes-nepal.vercel.app/menu",
  },
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
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 text-center mb-8 md:mb-10">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-roasted mb-2 block">Our Offerings</span>
        <h1 className="font-heading font-medium uppercase tracking-[0.08em] leading-tight text-espresso text-[32px] md:text-[44px] lg:text-[52px]">
          Our Menu
        </h1>
      </div>

      <MenuClient initialItems={items || []} />
    </div>
  );
}
