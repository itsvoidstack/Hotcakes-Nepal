import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/client';

export const revalidate = 0;

const DEFAULT_MENU_ITEMS = [
  { category: 'Hotcakes', name: 'Classic Hotcakes', slug: 'classic-hotcakes', description: 'Served with butter and maple syrup.', price: 220, image_url: '/images/menu/menu-classic-hotcakes.jpg', is_featured: true, is_available: true, display_order: 1 },
  { category: 'Hotcakes', name: 'Blueberry Hotcakes', slug: 'blueberry-hotcakes', description: 'Fresh blueberry compote, whipped cream.', price: 280, image_url: '/images/menu/menu-blueberry-hotcakes.jpg', is_featured: true, is_available: true, display_order: 2 },
  { category: 'Hotcakes', name: 'Chocolate Chip Hotcakes', slug: 'chocolate-chip-hotcakes', description: 'Chocolate chips, chocolate drizzle, whipped cream.', price: 260, image_url: '/images/menu/menu-chocolate-chip-hotcakes.jpg', is_featured: false, is_available: true, display_order: 3 },
  { category: 'Hotcakes', name: 'Nutella Banana Hotcakes', slug: 'nutella-banana-hotcakes', description: 'Nutella spread, fresh banana slices, whipped cream.', price: 320, image_url: '/images/menu/menu-nutella-banana-hotcakes.jpg', is_featured: true, is_available: true, display_order: 4 },
  { category: 'Hotcakes', name: 'Savory Hotcakes', slug: 'savory-hotcakes', description: 'Served with scrambled eggs, chicken bacon, maple syrup.', price: 380, image_url: '/images/menu/menu-savory-hotcakes.jpg', is_featured: false, is_available: true, display_order: 5 },

  { category: 'Hot Coffee', name: 'Espresso (Single)', slug: 'espresso-single', description: 'Single shot of rich espresso.', price: 90, image_url: '/images/menu/menu-espresso.jpg', is_featured: false, is_available: true, display_order: 6 },
  { category: 'Hot Coffee', name: 'Espresso (Double)', slug: 'espresso-double', description: 'Double shot of rich espresso.', price: 120, image_url: '/images/menu/menu-espresso-double.jpg', is_featured: false, is_available: true, display_order: 7 },
  { category: 'Hot Coffee', name: 'Americano', slug: 'americano', description: 'Espresso diluted with hot water.', price: 140, image_url: '/images/menu/menu-americano.jpg', is_featured: false, is_available: true, display_order: 8 },
  { category: 'Hot Coffee', name: 'Cafe Latte', slug: 'cafe-latte', description: 'Espresso with steamed milk and a thin layer of foam.', price: 180, image_url: '/images/menu/menu-cafe-latte.jpg', is_featured: false, is_available: true, display_order: 9 },
  { category: 'Hot Coffee', name: 'Cappuccino', slug: 'cappuccino', description: 'Espresso with equal parts steamed milk and foam.', price: 180, image_url: '/images/menu/menu-cappuccino.jpg', is_featured: true, is_available: true, display_order: 10 },
  { category: 'Hot Coffee', name: 'Flat White', slug: 'flat-white', description: 'Espresso with microfoam milk.', price: 190, image_url: '/images/menu/menu-flat-white.jpg', is_featured: false, is_available: true, display_order: 11 },
  { category: 'Hot Coffee', name: 'Cafe Mocha', slug: 'cafe-mocha', description: 'Espresso with chocolate sauce and steamed milk.', price: 210, image_url: '/images/menu/menu-cafe-mocha.jpg', is_featured: false, is_available: true, display_order: 12 },
  { category: 'Hot Coffee', name: 'Caramel Macchiato', slug: 'caramel-macchiato', description: 'Espresso with vanilla syrup, steamed milk, and caramel drizzle.', price: 220, image_url: '/images/menu/menu-caramel-macchiato.jpg', is_featured: true, is_available: true, display_order: 13 },

  { category: 'Cold Coffee', name: 'Iced Americano', slug: 'iced-americano', description: 'Espresso over ice with water.', price: 150, image_url: '/images/menu/menu-iced-americano.jpg', is_featured: false, is_available: true, display_order: 14 },
  { category: 'Cold Coffee', name: 'Iced Latte', slug: 'iced-latte', description: 'Espresso and cold milk over ice.', price: 190, image_url: '/images/menu/menu-iced-latte.jpg', is_featured: false, is_available: true, display_order: 15 },
  { category: 'Cold Coffee', name: 'Iced Mocha', slug: 'iced-mocha', description: 'Espresso, chocolate, and milk over ice.', price: 220, image_url: '/images/menu/menu-iced-mocha.jpg', is_featured: false, is_available: true, display_order: 16 },
  { category: 'Cold Coffee', name: 'Cold Brew', slug: 'cold-brew', description: 'Slow-steeped cold coffee served over ice.', price: 180, image_url: '/images/menu/menu-cold-brew.jpg', is_featured: true, is_available: true, display_order: 17 },
  { category: 'Cold Coffee', name: 'Affogato', slug: 'affogato', description: 'Espresso poured over a scoop of vanilla ice cream.', price: 170, image_url: '/images/menu/menu-affogato.jpg', is_featured: false, is_available: true, display_order: 18 },
  { category: 'Cold Coffee', name: 'Blended Frappe', slug: 'blended-frappe', description: 'Blended coffee with ice, milk, and syrup (Classic, Mocha, or Caramel).', price: 240, image_url: '/images/menu/menu-blended-frappe.jpg', is_featured: false, is_available: true, display_order: 19 },

  { category: 'Tea & Hot Beverages', name: 'Organic Green Tea', slug: 'organic-green-tea', description: 'Freshly brewed green tea.', price: 100, image_url: '/images/menu/menu-organic-green-tea.jpg', is_featured: false, is_available: true, display_order: 20 },
  { category: 'Tea & Hot Beverages', name: 'Masala Chia', slug: 'masala-chia', description: 'Traditional spiced milk tea.', price: 125, image_url: '/images/menu/menu-masala-chia.jpg', is_featured: false, is_available: true, display_order: 21 },
  { category: 'Tea & Hot Beverages', name: 'Hot Chocolate', slug: 'hot-chocolate', description: 'Creamy steamed milk and rich chocolate.', price: 190, image_url: '/images/menu/menu-hot-chocolate.jpg', is_featured: false, is_available: true, display_order: 22 },
  { category: 'Tea & Hot Beverages', name: 'Matcha Latte', slug: 'matcha-latte', description: 'Ground green tea leaves with steamed milk.', price: 240, image_url: '/images/menu/menu-matcha-latte.jpg', is_featured: false, is_available: true, display_order: 23 },

  { category: 'Beverages & Shakes', name: 'Classic Milkshake', slug: 'classic-milkshake', description: 'Thick blended milkshake (Vanilla, Chocolate, or Strawberry).', price: 210, image_url: '/images/menu/menu-classic-milkshake.jpg', is_featured: false, is_available: true, display_order: 24 },
  { category: 'Beverages & Shakes', name: 'Oreo Milkshake', slug: 'oreo-milkshake', description: 'Blended shake with Oreo cookies and whipped cream.', price: 240, image_url: '/images/menu/menu-oreo-milkshake.jpg', is_featured: true, is_available: true, display_order: 25 },
  { category: 'Beverages & Shakes', name: 'Fresh Lemonade', slug: 'fresh-lemonade', description: 'Squeezed lemons over ice with sugar syrup.', price: 130, image_url: '/images/menu/menu-fresh-lemonade.jpg', is_featured: false, is_available: true, display_order: 26 },
  { category: 'Beverages & Shakes', name: 'Peach Iced Tea', slug: 'peach-iced-tea', description: 'Brewed tea chilled with sweet peach flavor.', price: 150, image_url: '/images/menu/menu-peach-iced-tea.jpg', is_featured: false, is_available: true, display_order: 27 },

  { category: 'Sandwiches & Savories', name: 'Grilled Cheese Sandwich', slug: 'grilled-cheese-sandwich', description: 'Toasted bread with cheddar and mozzarella cheese.', price: 240, image_url: '/images/menu/menu-grilled-cheese-sandwich.jpg', is_featured: false, is_available: true, display_order: 28 },
  { category: 'Sandwiches & Savories', name: 'Chicken Club Sandwich', slug: 'chicken-club-sandwich', description: 'Grilled chicken, chicken bacon, lettuce, tomato, mayo, egg.', price: 350, image_url: '/images/menu/menu-chicken-club-sandwich.jpg', is_featured: true, is_available: true, display_order: 29 },
  { category: 'Sandwiches & Savories', name: 'Veggie Wrap', slug: 'veggie-wrap', description: 'Seasoned vegetables and hummus wrapped in flatbread.', price: 220, image_url: '/images/menu/menu-veggie-wrap.jpg', is_featured: false, is_available: true, display_order: 30 },
  { category: 'Sandwiches & Savories', name: 'French Fries', slug: 'french-fries', description: 'Crispy golden fries served with ketchup.', price: 150, image_url: '/images/menu/menu-french-fries.jpg', is_featured: false, is_available: true, display_order: 31 },

  { category: 'Desserts & Bakery', name: 'Butter Croissant', slug: 'butter-croissant', description: 'Flaky, buttery baked croissant.', price: 130, image_url: '/images/menu/menu-butter-croissant.jpg', is_featured: false, is_available: true, display_order: 32 },
  { category: 'Desserts & Bakery', name: 'Chocolate Croissant', slug: 'chocolate-croissant', description: 'Croissant filled with rich chocolate.', price: 160, image_url: '/images/menu/menu-chocolate-croissant.jpg', is_featured: false, is_available: true, display_order: 33 },
  { category: 'Desserts & Bakery', name: 'Chocolate Brownie', slug: 'chocolate-brownie', description: 'Warm chocolate brownie served with vanilla ice cream.', price: 220, image_url: '/images/menu/menu-chocolate-brownie.jpg', is_featured: false, is_available: true, display_order: 34 },
  { category: 'Desserts & Bakery', name: 'Cheesecake (Slice)', slug: 'cheesecake-slice', description: 'Delicious cheesecake slice (Blueberry or Caramel).', price: 280, image_url: '/images/menu/menu-cheesecake-slice.jpg', is_featured: true, is_available: true, display_order: 35 }
];

const DEFAULT_CONTACT_INFO = [
  { key: 'whatsapp', value: '+977 976-3687532' },
  { key: 'instagram', value: 'https://www.instagram.com/hotcakesnepal/' },
  { key: 'tiktok', value: '' },
  { key: 'phone', value: '+977 976-3687532' },
  { key: 'address', value: 'Hattiban, Lalitpur, Nepal' }
];

const DEFAULT_ORDER_LINKS = [
  { platform: 'bhoj', url: '', is_active: false },
  { platform: 'foodmandu', url: '', is_active: false },
  { platform: 'custom', url: '', is_active: false }
];

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    // 1. Seed Menu Items
    const { count: menuCount } = await supabase
      .from('menu_items')
      .select('*', { count: 'exact', head: true });

    if (menuCount === 0) {
      const { error } = await supabase.from('menu_items').insert(DEFAULT_MENU_ITEMS);
      if (error) throw new Error(`menu_items seed error: ${error.message}`);
    }

    // 2. Seed Contact Info
    const { count: contactCount } = await supabase
      .from('contact_info')
      .select('*', { count: 'exact', head: true });

    if (contactCount === 0) {
      const { error } = await supabase.from('contact_info').insert(DEFAULT_CONTACT_INFO);
      if (error) throw new Error(`contact_info seed error: ${error.message}`);
    }

    // 3. Seed Order Links
    const { count: orderCount } = await supabase
      .from('order_links')
      .select('*', { count: 'exact', head: true });

    if (orderCount === 0) {
      const { error } = await supabase.from('order_links').insert(DEFAULT_ORDER_LINKS);
      if (error) throw new Error(`order_links seed error: ${error.message}`);
    }

    // 4. Seed Campaigns
    const { count: campaignCount } = await supabase
      .from('campaigns')
      .select('*', { count: 'exact', head: true });

    if (campaignCount === 0) {
      const { error } = await supabase.from('campaigns').insert({
        name: 'Brew Streak Rewards',
        tagline: '10 visits. 1 free coffee. Start your streak.',
        is_active: true,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });
      if (error) throw new Error(`campaigns seed error: ${error.message}`);
    }

    // 5. Seed Site Settings
    const { count: settingsCount } = await supabase
      .from('site_settings')
      .select('*', { count: 'exact', head: true });

    if (settingsCount === 0) {
      const { error } = await supabase.from('site_settings').insert([
        { key: 'open_status', value: { is_open: true } },
        { key: 'google_maps', value: { url: 'https://maps.app.goo.gl/y2qh1TqYovxSpzDL9' } }
      ]);
      if (error) throw new Error(`site_settings seed error: ${error.message}`);
    }

    // 6. Seed Vacancies
    const { count: vacancyCount } = await supabase
      .from('vacancies')
      .select('*', { count: 'exact', head: true });

    if (vacancyCount === 0) {
      const { error } = await supabase.from('vacancies').insert({
        title: 'Barista Wanted',
        description: 'We are looking for an experienced Barista to join our team. Must know espresso prep, milk frothing, and customer service.',
        google_form_link: 'https://forms.gle/exampleFormLink',
        image_url: '/images/vacancies/vacancy-default.jpg',
        is_active: true
      });
      if (error) throw new Error(`vacancies seed error: ${error.message}`);
    }

    return NextResponse.json({ success: true, message: 'Database seeded successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
