import MenuClient from '@/components/MenuClient';
import { getSupabaseAdmin } from '@/lib/supabase/client';
import type { Metadata } from 'next';

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Menu — Fluffy Pancakes, Specialty Coffee & Handcrafted Desserts",
  description: "Browse the full Hotcakes Nepal menu. Fluffy pancakes, hand-drip specialty coffee, pour-over coffee, chocolate muffins, peanut butter cookies, handcrafted desserts, and fresh breakfast items — all made daily in Hattiban, Lalitpur.",
  alternates: {
    canonical: "https://hotcakes-nepal.vercel.app/menu"
  },
  openGraph: {
    title: "Menu — Hotcakes Nepal | Pancakes, Coffee & Desserts in Hattiban, Lalitpur",
    description: "Fluffy pancakes, hand-drip specialty coffee, fresh baked muffins, peanut butter cookies, and handcrafted desserts. All made fresh daily at our café in Hattiban, Lalitpur.",
    url: "https://hotcakes-nepal.vercel.app/menu",
    images: [
      {
        url: "https://hotcakes-nepal.vercel.app/images/menu/Cappuccino.jpeg",
        width: 1200,
        height: 630,
        alt: "Specialty coffee and pancakes at Hotcakes Nepal — café menu in Hattiban, Lalitpur",
      },
    ],
  },
};

export default async function MenuPage() {
  const supabase = getSupabaseAdmin();
  const [menuRes, descRes] = await Promise.all([
    supabase.from('menu_items').select('*').eq('is_available', true).order('category', { ascending: true }),
    supabase.from('site_settings').select('value').eq('key', 'site_description').maybeSingle(),
  ]);

  const items = menuRes.data;
  const siteDescription = (descRes?.data?.value as { text?: string })?.text ||
    'Freshly made every day in Hattiban, Lalitpur — fluffy pancakes, hand-drip specialty coffee, pour-over brews, and handcrafted desserts.';

  return (
    <div className="bg-cream min-h-screen pt-6 pb-16">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 text-center mb-8 md:mb-10">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-roasted mb-2 block">Our Offerings</span>
        <h1 className="font-heading font-medium uppercase tracking-[0.08em] leading-tight text-espresso text-[32px] md:text-[44px] lg:text-[52px]">
          Our Menu
        </h1>
        <p className="font-body text-mocha/70 text-sm leading-relaxed mt-3 max-w-xl mx-auto">
          {siteDescription}
        </p>
      </div>

      <MenuClient initialItems={items || []} />
    </div>
  );
}
