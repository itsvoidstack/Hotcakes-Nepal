import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import MaintenanceWrapper from "@/components/MaintenanceWrapper";
import ConditionalFooter from "@/components/ConditionalFooter";
import SiteLogo from "@/components/SiteLogo";
import { headers } from "next/headers";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700"],
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Hotcakes Nepal | Premium Cafe & Coffee Boutique",
  description: "Experience the warm, cozy, and premium coffee and hotcakes boutique in Nepal. 10 visits = 1 free coffee. Start your streak today.",
  openGraph: {
    title: "Hotcakes Nepal | Premium Cafe & Coffee Boutique",
    description: "Experience the warm, cozy, and premium coffee and hotcakes boutique in Nepal. 10 visits = 1 free coffee. Start your streak today.",
    type: "website",
    locale: "en_US",
    siteName: "Hotcakes Nepal",
  },
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
    <html lang="en">
      <body
        className={`${playfair.variable} ${plusJakarta.variable} font-body bg-cream text-espresso antialiased min-h-screen pb-20 md:pb-0`}
      >
        <Navbar logo={<SiteLogo />} />
        <MaintenanceWrapper>
          <main className="min-h-[calc(100vh-80px)]">
            {children}
          </main>
        </MaintenanceWrapper>
        <ConditionalFooter />
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
