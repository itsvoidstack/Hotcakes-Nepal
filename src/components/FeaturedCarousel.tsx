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
      <div className="text-center py-16 bg-warm-white/50 rounded-[24px] border border-dashed border-latte/60 p-8 max-w-md mx-auto animate-fade-up">
        <svg className="w-10 h-10 mx-auto text-mocha/40 mb-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
        </svg>
        <h3 className="font-heading font-semibold text-base text-espresso mb-1">
          Featured Specials Coming Soon
        </h3>
        <p className="font-body text-mocha text-xs">
          We are currently preparing our seasonal specials. Check back soon for fresh, handcrafted favorites!
        </p>
      </div>
    );
  }

  return (
    <div className="relative group">
      {/* Desktop Left Arrow */}
      <button
        onClick={() => scroll('left')}
        disabled={!canScrollLeft}
        className={`hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 z-10 w-12 h-12 rounded-full bg-warm-white border border-latte/70 shadow-sm items-center justify-center transition-all duration-300 hover:bg-roasted hover:text-white text-espresso disabled:opacity-0 ${!canScrollLeft ? 'pointer-events-none' : 'opacity-0 group-hover:opacity-100'}`}
        aria-label="Scroll left"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Desktop Right Arrow */}
      <button
        onClick={() => scroll('right')}
        disabled={!canScrollRight}
        className={`hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 z-10 w-12 h-12 rounded-full bg-warm-white border border-latte/70 shadow-sm items-center justify-center transition-all duration-300 hover:bg-roasted hover:text-white text-espresso disabled:opacity-0 ${!canScrollRight ? 'pointer-events-none' : 'opacity-0 group-hover:opacity-100'}`}
        aria-label="Scroll right"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div
        ref={scrollContainerRef}
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        onScroll={updateScrollButtons}
      >
        {items.map((item) => (
          <div
            key={item.id}
            className="snap-start flex-shrink-0 w-[280px] sm:w-[320px]"
          >
            <div className="group flex flex-col bg-warm-white rounded-[24px] overflow-hidden border border-latte/80 hover:-translate-y-1.5 transition-all duration-300 hover:shadow-xl hover:shadow-espresso/5">
              <div className="relative h-64 w-full bg-latte/30 overflow-hidden">
                <ImageWithFallback
                  src={item.image_url || '/images/menu/placeholder.jpg'}
                  alt={item.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 80vw, 320px"
                  fallbackEmoji="🥞"
                />
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="font-heading font-bold text-xl text-espresso group-hover:text-roasted transition-colors mb-2 leading-snug">
                  {item.name}
                </h3>
                <p className="font-body text-mocha/90 text-sm leading-relaxed mb-4 flex-grow min-h-[72px] line-clamp-3">
                  {item.description || 'Prepared fresh daily using only quality local ingredients.'}
                </p>
                <div className="mt-4 pt-4 border-t border-latte/40 flex flex-col gap-3">
                  <span className="font-heading text-roasted font-bold text-xl">
                    Rs. {item.price}
                  </span>
                  <Link
                    href="/order"
                    className="w-full text-center py-3 bg-roasted hover:bg-dark-roast text-white text-xs uppercase tracking-wider font-semibold rounded-full transition-all duration-300 hover:shadow-md"
                  >
                    Order Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
