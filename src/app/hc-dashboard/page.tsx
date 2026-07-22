import type { Metadata } from 'next';
import DashboardPageClient from './DashboardPageClient';

export const metadata: Metadata = {
  title: "Owner Portal | Hotcakes Nepal",
  alternates: {
    canonical: "https://hotcakes-nepal.vercel.app/hc-dashboard"
  }
};

export default function DashboardPage() {
  return <DashboardPageClient />;
}
