import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import MaintenanceWrapper from "@/components/MaintenanceWrapper";
import Footer from "@/components/Footer";
import SiteLogo from "@/components/SiteLogo";
import MobileChrome from "@/components/MobileChrome";
import BodyPadding from "@/components/BodyPadding";
import { headers } from "next/headers";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

const BASE_URL = 'https://hotcakes-nepal.vercel.app';
const OG_IMAGE = `${BASE_URL}/images/hero/hero-main.jpg`;

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  verification: {
    google: "FUggnaI0TbJr1Z5bUeK5oT3el1nkgxnQvn2zH1ijXnc",
  },
  title: {
    default: "Hotcakes Nepal | Best Café in Hattiban, Lalitpur — Pancakes, Specialty Coffee & Desserts",
    template: "%s | Hotcakes Nepal",
  },
  description: "Hotcakes Nepal — cozy café in Hattiban, Lalitpur near Little Angels School. Fluffy pancakes, hand-drip specialty coffee, fresh baked muffins, peanut butter cookies, and handcrafted desserts. Open daily 8 AM–8 PM. Great for slow mornings, study sessions, date spots, and brunch in Lalitpur.",
  keywords: [
    "Hotcakes Nepal",
    "cafe in Hattiban",
    "cafe near Hattiban Lalitpur",
    "cafe near Little Angels School",
    "cafe near Ekantakuna",
    "cafe near Jawalakhel",
    "cafe near me Lalitpur",
    "best cafe in Lalitpur",
    "coffee shop in Lalitpur",
    "coffee shop Hattiban",
    "hand drip coffee Lalitpur",
    "hand drip coffee Nepal",
    "pour over coffee Kathmandu",
    "specialty coffee Lalitpur",
    "specialty coffee Kathmandu",
    "pancake cafe Nepal",
    "fluffy pancakes Lalitpur",
    "best pancakes Kathmandu",
    "fresh baked muffins Nepal",
    "chocolate muffin Lalitpur",
    "fresh baked cookies Lalitpur",
    "peanut butter cookies Nepal",
    "handcrafted desserts Lalitpur",
    "dessert cafe Lalitpur",
    "brunch cafe Nepal",
    "breakfast cafe in Lalitpur",
    "cafe open early morning Lalitpur",
    "cafe open 6am Kathmandu",
    "early morning coffee Lalitpur",
    "breakfast cafe open early Nepal",
    "aesthetic cafe in Lalitpur",
    "aesthetic cafe for photos Nepal",
    "vibe cafe Lalitpur",
    "cozy cafe Nepal",
    "study cafe Lalitpur",
    "quiet cafe for work Lalitpur",
    "reading cafe Nepal",
    "slow morning cafe Kathmandu",
    "date cafe Lalitpur",
    "cafe with good ambiance Lalitpur",
    "hotcakes cafe Kathmandu",
    "pancake cafe Kathmandu",
    "best cafe Kathmandu",
    "best breakfast cafe Kathmandu",
    "top cafes near Kathmandu",
    "cafe in Lalitpur",
    "cafe near Lalitpur",
    "cafe in Kathmandu",
    "cafe in Bhaktapur",
  ],
  authors: [{ name: "Hotcakes Nepal" }],
  creator: "Hotcakes Nepal",
  publisher: "Hotcakes Nepal",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    title: "Hotcakes Nepal | Best Café in Hattiban, Lalitpur — Pancakes, Specialty Coffee & Desserts",
    description: "Cozy café in Hattiban, Lalitpur near Little Angels School. Fluffy pancakes, hand-drip specialty coffee, fresh baked cookies, muffins, and handcrafted desserts. Open daily 8 AM–8 PM — perfect for brunch, study sessions, and slow mornings.",
    type: "website",
    locale: "en_US",
    siteName: "Hotcakes Nepal",
    url: BASE_URL,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Hotcakes Nepal — cozy café in Hattiban, Lalitpur serving fluffy pancakes and specialty coffee",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hotcakes Nepal | Best Café in Hattiban, Lalitpur — Pancakes, Coffee & Desserts",
    description: "Cozy café in Hattiban, Lalitpur near Little Angels School. Fluffy pancakes, hand-drip specialty coffee, fresh baked muffins and cookies. Open daily 8 AM–8 PM.",
    images: [OG_IMAGE],
    creator: "@hotcakesnepal",
    site: "@hotcakesnepal",
  },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "CafeOrCoffeeShop",
    "@id": `${BASE_URL}/#cafe`,
    "name": "Hotcakes Nepal",
    "alternateName": ["Hot Cakes Nepal", "Hotcakes Cafe Hattiban", "Hotcakes Lalitpur", "Hotcakes Coffee Shop Lalitpur"],
    "description": "Hotcakes Nepal is a cozy café in Hattiban, Lalitpur — one of the best breakfast cafés near Little Angels School, Ekantakuna, and Jawalakhel. We serve fluffy pancakes, hand-drip specialty coffee, fresh baked muffins, peanut butter cookies, chocolate muffins, and handcrafted desserts. A beloved study café, date spot, and aesthetic vibe space open daily for slow mornings and brunch.",
    "url": BASE_URL,
    "telephone": "+977-9763687532",
    "email": "hotcakesnepal@gmail.com",
    "image": [
      OG_IMAGE,
      `${BASE_URL}/images/location/location-interior-1.jpg`,
      `${BASE_URL}/images/menu/Cappuccino.jpeg`
    ],
    "logo": {
      "@type": "ImageObject",
      "url": OG_IMAGE,
      "width": 512,
      "height": 512
    },
    "priceRange": "$$",
    "currenciesAccepted": "NPR",
    "paymentAccepted": "Cash, Online Transfer, eSewa, Khalti",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Hattiban",
      "addressLocality": "Lalitpur",
      "addressRegion": "Bagmati Province",
      "postalCode": "44700",
      "addressCountry": "NP"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 27.6477,
      "longitude": 85.3363
    },
    "hasMap": "https://maps.app.goo.gl/Akbsp1cgDmTLDPy18",
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        "opens": "08:00",
        "closes": "20:00"
      }
    ],
    "servesCuisine": [
      "Pancakes",
      "Hotcakes",
      "Specialty Coffee",
      "Hand Drip Coffee",
      "Pour Over Coffee",
      "Espresso",
      "Desserts",
      "Breakfast",
      "Brunch",
      "Baked Goods",
      "Muffins",
      "Cookies",
      "Sandwiches"
    ],
    "menu": `${BASE_URL}/menu`,
    "sameAs": [
      "https://www.instagram.com/hotcakesnepal",
      "https://www.tiktok.com/@hotcakesnepal",
      "https://maps.app.goo.gl/Akbsp1cgDmTLDPy18"
    ],
    "amenityFeature": [
      { "@type": "LocationFeatureSpecification", "name": "Free Wi-Fi", "value": true },
      { "@type": "LocationFeatureSpecification", "name": "Takeout", "value": true },
      { "@type": "LocationFeatureSpecification", "name": "Dine-in", "value": true },
      { "@type": "LocationFeatureSpecification", "name": "Delivery", "value": true },
      { "@type": "LocationFeatureSpecification", "name": "Outdoor Seating", "value": false },
      { "@type": "LocationFeatureSpecification", "name": "Power Outlets", "value": true },
      { "@type": "LocationFeatureSpecification", "name": "Quiet Study Zone", "value": true },
      { "@type": "LocationFeatureSpecification", "name": "Custom Orders", "value": true }
    ],
    "areaServed": [
      { "@type": "Place", "name": "Hattiban, Lalitpur, Nepal" },
      { "@type": "Place", "name": "Ekantakuna, Lalitpur, Nepal" },
      { "@type": "Place", "name": "Jawalakhel, Lalitpur, Nepal" },
      { "@type": "Place", "name": "Lalitpur, Bagmati Province, Nepal" },
      { "@type": "Place", "name": "Kathmandu Valley, Nepal" },
      { "@type": "Place", "name": "Bhaktapur, Nepal" }
    ],
    "keywords": "cafe in Hattiban, cafe near Hattiban Lalitpur, cafe near Little Angels School, best cafe in Lalitpur, coffee shop Hattiban, specialty coffee Lalitpur, hand drip coffee Lalitpur, pancake cafe Nepal, fluffy pancakes Lalitpur, fresh baked muffins Nepal, peanut butter cookies Nepal, handcrafted desserts Lalitpur, dessert cafe Lalitpur, breakfast cafe in Lalitpur, brunch cafe Nepal, study cafe Lalitpur, aesthetic cafe in Lalitpur, cozy cafe Nepal, date cafe Lalitpur, cafe open early morning Lalitpur, best cafe Kathmandu, pancake cafe Kathmandu"
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Where is Hotcakes Nepal located?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Hotcakes Nepal is located in Hattiban, Lalitpur, Nepal — close to Little Angels School, Ekantakuna, and Jawalakhel. It is one of the most accessible cafés in the Lalitpur area. Find us on Google Maps: https://maps.app.goo.gl/Akbsp1cgDmTLDPy18"
        }
      },
      {
        "@type": "Question",
        "name": "What time does Hotcakes Nepal open?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Hotcakes Nepal opens at 8:00 AM every day and closes at 8:00 PM, including weekends and public holidays. We are one of the few breakfast cafés in Lalitpur open early in the morning."
        }
      },
      {
        "@type": "Question",
        "name": "What food and drinks does Hotcakes Nepal serve?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We serve fluffy pancakes (hotcakes), hand-drip specialty coffee, pour-over coffee, espresso drinks, fresh baked muffins, chocolate muffins, peanut butter cookies, handcrafted desserts, sandwiches, and full breakfast items — all prepared fresh daily in our Hattiban kitchen."
        }
      },
      {
        "@type": "Question",
        "name": "Does Hotcakes Nepal serve specialty or hand-drip coffee?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Hotcakes Nepal specialises in hand-drip pour-over coffee, espresso-based drinks, and cold brew — making us one of the top specialty coffee shops in Lalitpur and the Hattiban area."
        }
      },
      {
        "@type": "Question",
        "name": "Is Hotcakes Nepal a good place to study or work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Hotcakes Nepal is a favourite study café and quiet work café in Lalitpur. We have free high-speed Wi-Fi, dedicated quiet zones, and power outlets — making it ideal for students, remote workers, and freelancers near Ekantakuna, Jawalakhel, and Little Angels School."
        }
      },
      {
        "@type": "Question",
        "name": "Does Hotcakes Nepal offer home delivery?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. You can order Hotcakes Nepal items via Bhoj and Foodmandu for delivery to Lalitpur, Kathmandu, and nearby areas. We also take custom orders via WhatsApp."
        }
      },
      {
        "@type": "Question",
        "name": "Can I place a custom dessert or cake order at Hotcakes Nepal?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. We accept custom orders for cakes, desserts, and special events. Contact us via WhatsApp or visit our Order page to place a custom request."
        }
      },
      {
        "@type": "Question",
        "name": "Is Hotcakes Nepal good for a date or aesthetic photos?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Absolutely. Hotcakes Nepal is one of the most aesthetic cafés in Lalitpur — with warm lighting, cozy rustic interiors, and beautifully presented food. It is a popular date café and photography spot in the Hattiban area."
        }
      },
      {
        "@type": "Question",
        "name": "What are the best pancakes to try at Hotcakes Nepal?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our signature fluffy pancakes (hotcakes) are the most popular item on the menu. We also serve pancake stacks with various toppings — considered some of the best pancakes in Kathmandu Valley."
        }
      }
    ]
  }
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = headers();
  const pathname = headersList.get('x-pathname') || headersList.get('x-invoke-path') || '';
  const isAdminPage = pathname.startsWith('/hc-dashboard') || pathname.startsWith('/hc-dev') || pathname.startsWith('/api');
  
  return (
    <html lang="en" className="overflow-x-hidden">
      <head>
        <style>{`*, *::before, *::after { box-sizing: border-box; }`}</style>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${playfair.variable} ${inter.variable} font-body bg-cream text-espresso antialiased min-h-screen overflow-x-hidden w-full max-w-full`}
      >
        <BodyPadding />
        {/* Skip to main content — hidden until focused, for keyboard/screen reader users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-roasted focus:text-white focus:text-sm focus:font-semibold focus:rounded-full focus:shadow-lg focus:outline-none"
        >
          Skip to main content
        </a>

        <Navbar logo={<SiteLogo />} />
        <MaintenanceWrapper>
          <main id="main-content" className="min-h-[calc(100vh-80px)] w-full max-w-full overflow-x-hidden">
            {children}
          </main>
        </MaintenanceWrapper>
        {!isAdminPage && <Footer />}
        <MobileChrome />
      </body>
    </html>
  );
}
