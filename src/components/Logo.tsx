'use client';

import Image from 'next/image';
import { useState } from 'react';
import Link from 'next/link';

interface LogoProps {
  src?: string;
}

export default function Logo({ src }: LogoProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <Link href="/" className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-roasted rounded-md transition-opacity hover:opacity-90">
      {imgError ? (
        <div className="flex items-center gap-2.5 py-1">
          <svg className="w-6 h-6 text-roasted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {/* Top pancake oval */}
            <ellipse cx="12" cy="7" rx="8" ry="3.5" fill="currentColor" fillOpacity="0.1" />
            <ellipse cx="12" cy="7" rx="8" ry="3.5" />
            {/* Butter square on top */}
            <path d="M10.5 6h3v2h-3z" fill="currentColor" />
            {/* Second pancake curve */}
            <path d="M4 11c0 2 3.5 3.5 8 3.5s8-1.5 8-3.5" />
            {/* Third pancake curve */}
            <path d="M4 15c0 2 3.5 3.5 8 3.5s8-1.5 8-3.5" />
            {/* Plate curve */}
            <path d="M2 18.5c0 2.5 4.5 4.5 10 4.5s10-2 10-4.5" />
          </svg>
          <span className="font-heading font-bold text-xl tracking-tight text-espresso leading-none">
            Hotcakes <span className="text-roasted font-medium">Nepal</span>
          </span>
        </div>
      ) : (
        <div className="relative w-[130px] h-[36px] flex items-center justify-start">
          <Image
            src={src || '/images/logo.jpeg'}
            alt="Hotcakes Nepal Logo"
            width={130}
            height={36}
            className="object-contain max-h-[36px] w-auto"
            onError={() => setImgError(true)}
            priority
          />
        </div>
      )}
    </Link>
  );
}
