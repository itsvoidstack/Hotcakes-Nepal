-- Hotcakes Nepal Initial Seed SQL Script
-- Run this in your Supabase SQL Editor after running schema.sql

-- Clear existing data (optional, only for fresh seed)
TRUNCATE TABLE menu_items CASCADE;
TRUNCATE TABLE site_settings CASCADE;
TRUNCATE TABLE order_links CASCADE;
TRUNCATE TABLE contact_info CASCADE;
TRUNCATE TABLE campaigns CASCADE;
TRUNCATE TABLE vacancies CASCADE;

-- 1. Seed Menu Items
INSERT INTO menu_items (category, name, slug, description, price, image_url, is_featured, is_available, display_order) VALUES
-- HOTCAKES
('Hotcakes', 'Classic Hotcakes', 'classic-hotcakes', 'Served with butter and maple syrup.', 220, '/images/menu/menu-classic-hotcakes.jpg', true, true, 1),
('Hotcakes', 'Blueberry Hotcakes', 'blueberry-hotcakes', 'Fresh blueberry compote, whipped cream.', 280, '/images/menu/menu-blueberry-hotcakes.jpg', true, true, 2),
('Hotcakes', 'Chocolate Chip Hotcakes', 'chocolate-chip-hotcakes', 'Chocolate chips, chocolate drizzle, whipped cream.', 260, '/images/menu/menu-chocolate-chip-hotcakes.jpg', false, true, 3),
('Hotcakes', 'Nutella Banana Hotcakes', 'nutella-banana-hotcakes', 'Nutella spread, fresh banana slices, whipped cream.', 320, '/images/menu/menu-nutella-banana-hotcakes.jpg', true, true, 4),
('Hotcakes', 'Savory Hotcakes', 'savory-hotcakes', 'Served with scrambled eggs, chicken bacon, maple syrup.', 380, '/images/menu/menu-savory-hotcakes.jpg', false, true, 5),

-- HOT COFFEE
('Hot Coffee', 'Espresso (Single)', 'espresso-single', 'Single shot of rich espresso.', 90, '/images/menu/menu-espresso.jpg', false, true, 6),
('Hot Coffee', 'Espresso (Double)', 'espresso-double', 'Double shot of rich espresso.', 120, '/images/menu/menu-espresso-double.jpg', false, true, 7),
('Hot Coffee', 'Americano', 'americano', 'Espresso diluted with hot water.', 140, '/images/menu/menu-americano.jpg', false, true, 8),
('Hot Coffee', 'Cafe Latte', 'cafe-latte', 'Espresso with steamed milk and a thin layer of foam.', 180, '/images/menu/menu-cafe-latte.jpg', false, true, 9),
('Hot Coffee', 'Cappuccino', 'cappuccino', 'Espresso with equal parts steamed milk and foam.', 180, '/images/menu/menu-cappuccino.jpg', true, true, 10),
('Hot Coffee', 'Flat White', 'flat-white', 'Espresso with microfoam milk.', 190, '/images/menu/menu-flat-white.jpg', false, true, 11),
('Hot Coffee', 'Cafe Mocha', 'cafe-mocha', 'Espresso with chocolate sauce and steamed milk.', 210, '/images/menu/menu-cafe-mocha.jpg', false, true, 12),
('Hot Coffee', 'Caramel Macchiato', 'caramel-macchiato', 'Espresso with vanilla syrup, steamed milk, and caramel drizzle.', 220, '/images/menu/menu-caramel-macchiato.jpg', true, true, 13),

-- COLD COFFEE
('Cold Coffee', 'Iced Americano', 'iced-americano', 'Espresso over ice with water.', 150, '/images/menu/menu-iced-americano.jpg', false, true, 14),
('Cold Coffee', 'Iced Latte', 'iced-latte', 'Espresso and cold milk over ice.', 190, '/images/menu/menu-iced-latte.jpg', false, true, 15),
('Cold Coffee', 'Iced Mocha', 'iced-mocha', 'Espresso, chocolate, and milk over ice.', 220, '/images/menu/menu-iced-mocha.jpg', false, true, 16),
('Cold Coffee', 'Cold Brew', 'cold-brew', 'Slow-steeped cold coffee served over ice.', 180, '/images/menu/menu-cold-brew.jpg', true, true, 17),
('Cold Coffee', 'Affogato', 'affogato', 'Espresso poured over a scoop of vanilla ice cream.', 170, '/images/menu/menu-affogato.jpg', false, true, 18),
('Cold Coffee', 'Blended Frappe', 'blended-frappe', 'Blended coffee with ice, milk, and syrup (Classic, Mocha, or Caramel).', 240, '/images/menu/menu-blended-frappe.jpg', false, true, 19),

-- TEA & HOT BEVERAGES
('Tea & Hot Beverages', 'Organic Green Tea', 'organic-green-tea', 'Freshly brewed green tea.', 100, '/images/menu/menu-organic-green-tea.jpg', false, true, 20),
('Tea & Hot Beverages', 'Masala Chia', 'masala-chia', 'Traditional spiced milk tea.', 125, '/images/menu/menu-masala-chia.jpg', false, true, 21),
('Tea & Hot Beverages', 'Hot Chocolate', 'hot-chocolate', 'Creamy steamed milk and rich chocolate.', 190, '/images/menu/menu-hot-chocolate.jpg', false, true, 22),
('Tea & Hot Beverages', 'Matcha Latte', 'matcha-latte', 'Ground green tea leaves with steamed milk.', 240, '/images/menu/menu-matcha-latte.jpg', false, true, 23),

-- BEVERAGES & SHAKES
('Beverages & Shakes', 'Classic Milkshake', 'classic-milkshake', 'Thick blended milkshake (Vanilla, Chocolate, or Strawberry).', 210, '/images/menu/menu-classic-milkshake.jpg', false, true, 24),
('Beverages & Shakes', 'Oreo Milkshake', 'oreo-milkshake', 'Blended shake with Oreo cookies and whipped cream.', 240, '/images/menu/menu-oreo-milkshake.jpg', true, true, 25),
('Beverages & Shakes', 'Fresh Lemonade', 'fresh-lemonade', 'Squeezed lemons over ice with sugar syrup.', 130, '/images/menu/menu-fresh-lemonade.jpg', false, true, 26),
('Beverages & Shakes', 'Peach Iced Tea', 'peach-iced-tea', 'Brewed tea chilled with sweet peach flavor.', 150, '/images/menu/menu-peach-iced-tea.jpg', false, true, 27),

-- SANDWICHES & SAVORIES
('Sandwiches & Savories', 'Grilled Cheese Sandwich', 'grilled-cheese-sandwich', 'Toasted bread with cheddar and mozzarella cheese.', 240, '/images/menu/menu-grilled-cheese-sandwich.jpg', false, true, 28),
('Sandwiches & Savories', 'Chicken Club Sandwich', 'chicken-club-sandwich', 'Grilled chicken, chicken bacon, lettuce, tomato, mayo, egg.', 350, '/images/menu/menu-chicken-club-sandwich.jpg', true, true, 29),
('Sandwiches & Savories', 'Veggie Wrap', 'veggie-wrap', 'Seasoned vegetables and hummus wrapped in flatbread.', 220, '/images/menu/menu-veggie-wrap.jpg', false, true, 30),
('Sandwiches & Savories', 'French Fries', 'french-fries', 'Crispy golden fries served with ketchup.', 150, '/images/menu/menu-french-fries.jpg', false, true, 31),

-- DESSERTS & BAKERY
('Desserts & Bakery', 'Butter Croissant', 'butter-croissant', 'Flaky, buttery baked croissant.', 130, '/images/menu/menu-butter-croissant.jpg', false, true, 32),
('Desserts & Bakery', 'Chocolate Croissant', 'chocolate-croissant', 'Croissant filled with rich chocolate.', 160, '/images/menu/menu-chocolate-croissant.jpg', false, true, 33),
('Desserts & Bakery', 'Chocolate Brownie', 'chocolate-brownie', 'Warm chocolate brownie served with vanilla ice cream.', 220, '/images/menu/menu-chocolate-brownie.jpg', false, true, 34),
('Desserts & Bakery', 'Cheesecake (Slice)', 'cheesecake-slice', 'Delicious cheesecake slice (Blueberry or Caramel).', 280, '/images/menu/menu-cheesecake-slice.jpg', true, true, 35);

-- 2. Seed Contact Info
INSERT INTO contact_info (key, value) VALUES
('whatsapp', '+977 976-3687532'),
('instagram', 'https://www.instagram.com/hotcakesnepal/'),
('tiktok', ''),
('phone', '+977 976-3687532'),
('address', 'Hattiban, Lalitpur, Nepal');

-- 3. Seed Order Links
INSERT INTO order_links (platform, display_name, url, is_active, metadata) VALUES
('bhoj', 'Bhoj', '', false, '{"button_text": "ORDER NOW >"}'::jsonb),
('foodmandu', 'Foodmandu', '', false, '{"button_text": "ORDER NOW >"}'::jsonb),
('pathao', 'Pathao Food', '', true, '{"button_text": "ORDER NOW >"}'::jsonb),
('daraz', 'Daraz Food', '', true, '{"button_text": "ORDER NOW >"}'::jsonb),
('khalti', 'Khalti Food', '', true, '{"button_text": "ORDER NOW >"}'::jsonb),
('custom', 'Custom Order', '/contact', true, '{"button_text": "PLACE A CUSTOM ORDER >"}'::jsonb);

-- 4. Seed Campaigns
INSERT INTO campaigns (name, tagline, is_active, status, type, priority, placement, start_date, end_date, metadata) VALUES
('Brew Streak Rewards', '10% upto 11am - Keep your streak alive and earn amazing rewards!', true, 'active', 'streak', 100, 'hero_section', now(), now() + interval '365 days', '{"badge_text": "STREAK REWARD", "sub_tagline": "10% upto 11am", "how_it_works": {"steps": ["Give your phone number to our staff on checkout", "Earn 1 stamp per day upon purchase", "Collect 10 stamps to earn 1 free coffee of choice", "Show your completed card to barista to redeem"], "footnote": "* Valid on all coffee beverages"}}'::jsonb);

-- 5. Seed Site Settings
INSERT INTO site_settings (key, value) VALUES
('open_status', '{"is_open": true}'::jsonb);

-- 6. Seed Vacancies
INSERT INTO vacancies (title, description, google_form_link, image_url, is_active) VALUES
('Barista Wanted', 'We are looking for an experienced Barista to join our team. Must know espresso prep, milk frothing, and customer service.', 'https://forms.gle/exampleFormLink', '/images/vacancies/vacancy-default.jpg', true);
