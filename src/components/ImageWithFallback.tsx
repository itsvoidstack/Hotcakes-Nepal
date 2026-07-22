'use client';

import { useState } from 'react';
import Image, { ImageProps } from 'next/image';

interface ImageWithFallbackProps extends Omit<ImageProps, 'onError'> {
  fallbackEmoji: string;
}

export default function ImageWithFallback({
  src,
  alt,
  fallbackEmoji,
  className,
  fill,
  sizes,
  priority,
  ...props
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div 
        className="w-full h-full min-w-full min-h-full flex items-center justify-center bg-[#EDE8E3] select-none text-center"
        style={fill ? { position: 'absolute', inset: 0 } : undefined}
      >
        <span className="text-4xl" role="img" aria-label={alt || "placeholder"}>
          {fallbackEmoji}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      className={className}
      sizes={sizes}
      priority={priority}
      onError={() => setError(true)}
      {...props}
    />
  );
}
