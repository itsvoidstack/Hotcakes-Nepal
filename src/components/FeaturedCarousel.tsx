'use client';

import Link from 'next/link';
import ImageWithFallback from './ImageWithFallback';
import { useRef, useState, useEffect } from 'react';

type MenuItem = {
  id: string;
  name: string;
  price: number;
  description: string | null;
  image_url: string | null;
};

interface FeaturedCarouselProps {
  items: MenuItem[];
}

export default function FeaturedCarousel({ items }: FeaturedCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    updateScrollButtons();
    window.addEventListener('resize', updateScrollButtons);
    return () => window.removeEventListener('resize', updateScrollButtons);
  }, [items]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320;
      const newScrollLeft = direction === 'left' 
        ? scrollContainerRef.current.scrollLeft - scrollAmount 
        : scrollContainerRef.current.scrollLeft + scrollAmount;
      
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
      
      setTimeout(updateScrollButtons, 300);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-mocha font-body">
        No featured items available right now. View our menu below.
      </div>
    );
  }

  return (
    <div className="relative group">
      {/* Desktop Left Arrow */}
      <button
        onClick={() => scroll('left')}
        disabled={!canScrollLeft}
        className={`hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 rounded-full bg-white shadow-lg items-center justify-center transition-all duration-200 hover:bg-cream ${!canScrollLeft ? 'opacity-0 pointer-events-none' : 'opacity-0 group-hover:opacity-100'}`}
        aria-label="Scroll left"
      >
        <svg className="w-6 h-6 text-espresso" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Desktop Right Arrow */}
      <button
        onClick={() => scroll('right')}
        disabled={!canScrollRight}
        className={`hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 rounded-full bg-white shadow-lg items-center justify-center transition-all duration-200 hover:bg-cream ${!canScrollRight ? 'opacity-0 pointer-events-none' : 'opacity-0 group-hover:opacity-100'}`}
        aria-label="Scroll right"
      >
        <svg className="w-6 h-6 text-espresso" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div
        ref={scrollContainerRef}
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:overflow-x-hidden md:scroll-smooth"
        onScroll={updateScrollButtons}
      >
        {items.map((item) => (
          <div
            key={item.id}
            className="snap-start flex-shrink-0 w-[280px] sm:w-[320px]"
          >
            <div className="group flex flex-col bg-warm-white rounded-[20px] overflow-hidden border border-latte hover:-translate-y-1 transition-all duration-300 hover:shadow-lg">
              <div className="relative h-64 w-full bg-latte/30 overflow-hidden">
                <ImageWithFallback
                  src={item.image_url || '/images/menu/placeholder.jpg'}
                  alt={item.name}
                  fill
                  className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
                  sizes="(max-width: 768px) 80vw, 320px"
                  fallbackEmoji="🥞"
                />
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-baseline justify-between gap-2 mb-2">
                  <h3 className="font-heading font-bold text-xl text-espresso">
                    {item.name}
                  </h3>
                  <span className="font-heading text-roasted font-semibold">
                    Rs. {item.price}
                  </span>
                </div>
                <p className="font-body text-mocha text-sm leading-relaxed mb-6 flex-grow">
                  {item.description || 'Prepared fresh with premium ingredients.'}
                </p>
                <Link
                  href="/order"
                  className="w-full text-center py-2.5 bg-roasted hover:bg-dark-roast text-white text-xs font-semibold rounded-full transition-colors duration-200"
                >
                  Order Now
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
