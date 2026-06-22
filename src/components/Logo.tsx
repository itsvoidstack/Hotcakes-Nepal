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
    <Link href="/" className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-roasted rounded-md">
      {imgError ? (
        <div className="flex items-center gap-2">
          <span className="text-2xl" role="img" aria-label="Hotcakes Logo">🥞</span>
          <span className="font-heading font-bold text-xl tracking-tight text-espresso">
            Hotcakes <span className="text-roasted">Nepal</span>
          </span>
        </div>
      ) : (
        <Image
          src={src || '/images/logo.jpeg'}
          alt="Hotcakes Nepal Logo"
          width={130}
          height={36}
          className="object-contain"
          onError={() => setImgError(true)}
          priority
        />
      )}
    </Link>
  );
}
