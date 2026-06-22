'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

const HIDDEN_PATHS = ['/hc-dashboard', '/hc-dev'];

export default function ConditionalFooter() {
  const pathname = usePathname();

  if (HIDDEN_PATHS.some((path) => pathname.startsWith(path))) {
    return null;
  }

  return <Footer />;
}
