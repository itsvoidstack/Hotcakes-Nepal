import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import MaintenanceWrapper from "@/components/MaintenanceWrapper";
import ConditionalFooter from "@/components/ConditionalFooter";
import SiteLogo from "@/components/SiteLogo";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["600", "700"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Hotcakes Nepal | Premium Cafe & Coffee Boutique",
  description: "Experience the warm, cozy, and premium coffee and hotcakes boutique in Nepal. 10 visits = 1 free coffee. Start your streak today.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${playfair.variable} ${dmSans.variable} font-body bg-cream text-espresso antialiased min-h-screen pb-20 md:pb-0`}
      >
        <Navbar logo={<SiteLogo />} />
        <MaintenanceWrapper>
          <main className="min-h-[calc(100vh-80px)]">
            {children}
          </main>
        </MaintenanceWrapper>
        <ConditionalFooter />
        <BottomNav />
      </body>
    </html>
  );
}
