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
    default: "Hotcakes Nepal | Café in Hattiban, Lalitpur — Pancakes, Coffee & Desserts",
    template: "%s | Hotcakes Nepal",
  },
  description: "Hotcakes Nepal is a cozy aesthetic café in Hattiban, Lalitpur. We serve fluffy pancakes, specialty coffee, handcrafted desserts, and fresh breakfast. A vibe café near Lalitpur — perfect for slow mornings, study sessions, and quiet corners.",
  keywords: [
    "Hotcakes Nepal",
    "cafe in Hattiban",
    "cafe near Hattiban",
    "cafe near Lalitpur",
    "coffee shop in Lalitpur",
    "breakfast cafe in Lalitpur",
    "pancake cafe Nepal",
    "vibe cafe",
    "aesthetic cafe in Lalitpur",
    "dessert cafe",
    "specialty coffee Lalitpur",
    "cafe near me Lalitpur",
    "cafe near Little Angels School",
    "hotcakes cafe Kathmandu",
    "brunch cafe Nepal",
    "coffee shop Hattiban",
    "fluffy pancakes Lalitpur",
    "cozy cafe Nepal",
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
    },
  },
  openGraph: {
    title: "Hotcakes Nepal | Café in Hattiban, Lalitpur — Pancakes, Coffee & Desserts",
    description: "Hotcakes Nepal is a cozy aesthetic café in Hattiban, Lalitpur. We serve fluffy pancakes, specialty coffee, handcrafted desserts, and fresh breakfast. A vibe café near Lalitpur — perfect for slow mornings and quiet corners.",
    type: "website",
    locale: "en_US",
    siteName: "Hotcakes Nepal",
    url: BASE_URL,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Hotcakes Nepal — Café in Hattiban, Lalitpur",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hotcakes Nepal | Café in Hattiban, Lalitpur — Pancakes, Coffee & Desserts",
    description: "Hotcakes Nepal is a cozy aesthetic café in Hattiban, Lalitpur. We serve fluffy pancakes, specialty coffee, handcrafted desserts, and fresh breakfast.",
    images: [OG_IMAGE],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CafeOrCoffeeShop",
  "@id": `${BASE_URL}/#cafe`,
  "name": "Hotcakes Nepal",
  "alternateName": ["Hot Cakes Nepal", "Hotcakes Cafe Hattiban"],
  "description": "Hotcakes Nepal is a cozy aesthetic café in Hattiban, Lalitpur serving fluffy pancakes, specialty coffee, handcrafted desserts, and fresh breakfast. A perfect vibe café for slow mornings, study sessions, and quiet corners.",
  "url": BASE_URL,
  "telephone": "+977-9763687532",
  "email": "hotcakesnepal@gmail.com",
  "image": OG_IMAGE,
  "logo": OG_IMAGE,
  "priceRange": "$$",
  "currenciesAccepted": "NPR",
  "paymentAccepted": "Cash, Online Transfer",
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
      "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
      "opens": "08:00",
      "closes": "20:00"
    }
  ],
  "servesCuisine": ["Pancakes", "Coffee", "Desserts", "Breakfast", "Specialty Coffee"],
  "menu": `${BASE_URL}/menu`,
  "sameAs": [
    "https://www.instagram.com/hotcakesnepal",
    "https://www.tiktok.com/@hotcakesnepal"
  ],
  "amenityFeature": [
    { "@type": "LocationFeatureSpecification", "name": "Wi-Fi", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Takeout", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Dine-in", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Delivery", "value": true }
  ],
  "areaServed": {
    "@type": "Place",
    "name": "Lalitpur, Bagmati Province, Nepal"
  }
};

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
