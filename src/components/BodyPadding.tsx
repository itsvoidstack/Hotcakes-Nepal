'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

const ADMIN_PREFIXES = ['/hc-dashboard', '/hc-dev'];

export default function BodyPadding() {
  const pathname = usePathname();
  const isAdmin = ADMIN_PREFIXES.some(p => pathname.startsWith(p));

  useEffect(() => {
    const apply = () => {
      if (isAdmin || window.innerWidth >= 768) {
        document.body.style.paddingBottom = '0px';
      } else {
        document.body.style.paddingBottom =
          'max(80px, calc(64px + env(safe-area-inset-bottom, 0px)))';
      }
    };
    apply();
    window.addEventListener('resize', apply);
    return () => window.removeEventListener('resize', apply);
  }, [isAdmin, pathname]);

  return null;
}
