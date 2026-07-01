import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import MaintenanceWrapper from "@/components/MaintenanceWrapper";
import Footer from "@/components/Footer";
import SiteLogo from "@/components/SiteLogo";
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

export const metadata: Metadata = {
  metadataBase: new URL('https://hotcakes-nepal.vercel.app'),
  verification: {
    google: "FUggnaI0TbJr1Z5bUeK5oT3el1nkgxnQvn2zH1ijXnc",
  },
  title: "Hotcakes Nepal | Premium Pancakes, Coffee & Cafe in Hattiban, Lalitpur",
  description: "Hotcakes Nepal is a cozy cafe in Hattiban, Lalitpur serving premium pancakes, specialty coffee, desserts, breakfast, and handcrafted beverages. Visit us near Little Angels School.",
  keywords: [
    "Hotcakes Nepal",
    "Cafe in Hattiban",
    "Cafe in Lalitpur",
    "Cafe near Little Angels",
    "Pancakes in Kathmandu",
    "Coffee in Lalitpur",
    "Breakfast cafe Nepal",
    "Dessert cafe Kathmandu",
    "Coffee shop Hattiban"
  ],
  authors: [{ name: "Hotcakes Nepal" }],
  openGraph: {
    title: "Hotcakes Nepal | Premium Pancakes, Coffee & Cafe in Hattiban, Lalitpur",
    description: "Hotcakes Nepal is a cozy cafe in Hattiban, Lalitpur serving premium pancakes, specialty coffee, desserts, breakfast, and handcrafted beverages. Visit us near Little Angels School.",
    type: "website",
    locale: "en_US",
    siteName: "Hotcakes Nepal",
    images: ["/images/hero/hero-main.jpg"]
  },
  twitter: {
    card: "summary_large_image",
    title: "Hotcakes Nepal | Premium Pancakes, Coffee & Cafe in Hattiban, Lalitpur",
    description: "Hotcakes Nepal is a cozy cafe in Hattiban, Lalitpur serving premium pancakes, specialty coffee, desserts, breakfast, and handcrafted beverages. Visit us near Little Angels School.",
    images: ["/images/hero/hero-main.jpg"]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = headers();
  const pathname = headersList.get('x-pathname') || '';
  const isAdminPage = pathname.startsWith('/hc-dashboard') || pathname.startsWith('/hc-dev') || pathname.startsWith('/api');
  
  return (
    <html lang="en" className="overflow-x-hidden">
      <head>
        <style>{`*, *::before, *::after { box-sizing: border-box; }`}</style>
      </head>
      <body
        className={`${playfair.variable} ${inter.variable} font-body bg-cream text-espresso antialiased min-h-screen pb-20 md:pb-0 overflow-x-hidden w-full max-w-full`}
      >
        <Navbar logo={<SiteLogo />} />
        <MaintenanceWrapper>
          <main className="min-h-[calc(100vh-80px)] w-full max-w-full overflow-x-hidden">
            {children}
          </main>
        </MaintenanceWrapper>
        {!isAdminPage && <Footer />}
        <BottomNav />
        
        {/* Floating Order Button (Mobile Only) */}
        {!isAdminPage && (
          <Link
            href="/order"
            className="md:hidden fixed bottom-20 right-4 z-30 flex items-center gap-2 px-6 py-3.5 bg-roasted hover:bg-dark-roast text-white text-xs uppercase tracking-wider font-bold rounded-full shadow-xl transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
            style={{ minWidth: '44px', minHeight: '44px' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Order Now
          </Link>
        )}
      </body>
    </html>
  );
}
