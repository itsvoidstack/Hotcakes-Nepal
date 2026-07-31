'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface LogoProps {
  src?: string;
}

export default function Logo({ src }: LogoProps) {
  const defaultLogo = '/logo.png';
  const [currentSrc, setCurrentSrc] = useState<string>(src || defaultLogo);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setCurrentSrc(src || defaultLogo);
    setImgError(false);
  }, [src]);

  const handleError = () => {
    if (currentSrc !== defaultLogo) {
      // Fallback to default logo.png if custom uploaded image URL fails
      setCurrentSrc(defaultLogo);
    } else {
      setImgError(true);
    }
  };

  return (
    <Link
      href="/"
      className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-roasted rounded-md transition-opacity hover:opacity-90 py-1"
    >
      {/* Logo Image */}
      {!imgError && (
        <div className="relative w-auto h-[42px] flex items-center justify-start flex-shrink-0">
          <Image
            src={currentSrc}
            alt="Hotcakes Nepal Logo"
            width={150}
            height={42}
            className="object-contain max-h-[42px] w-auto"
            onError={handleError}
            priority
          />
        </div>
      )}

      {/* Brand Text */}
      <span className="font-heading font-bold text-[22px] tracking-tight text-espresso leading-none">
        Hotcakes <span className="text-roasted font-medium">Nepal</span>
      </span>
    </Link>
  );
}

