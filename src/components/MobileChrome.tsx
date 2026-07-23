'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import BottomNav from './BottomNav';

const ADMIN_PREFIXES = ['/hc-dashboard', '/hc-dev'];

export default function MobileChrome() {
  const pathname = usePathname();
  const isAdmin = ADMIN_PREFIXES.some(p => pathname.startsWith(p));

  if (isAdmin) return null;

  return (
    <>
      <BottomNav />
      <Link
        href="/order"
        aria-label="Order now from Hotcakes Nepal"
        className="md:hidden fixed z-30 flex items-center gap-2 px-5 py-3 bg-roasted hover:bg-dark-roast text-white text-xs uppercase tracking-wider font-bold rounded-full shadow-xl transition-all duration-300 active:scale-[0.96]"
        style={{
          bottom: 'calc(72px + env(safe-area-inset-bottom, 0px))',
          right: '16px',
          minHeight: '44px',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
          className="w-4 h-4"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Order Now
      </Link>
    </>
  );
}
