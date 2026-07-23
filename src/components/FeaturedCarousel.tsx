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
    <div className="relative group w-full max-w-full overflow-x-hidden">
      {/* Desktop Left Arrow */}
      <button
        onClick={() => scroll('left')}
        disabled={!canScrollLeft}
        className={`hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 z-10 w-12 h-12 rounded-full bg-warm-white border border-latte/70 shadow-sm items-center justify-center transition-all duration-300 hover:bg-roasted hover:text-white text-espresso disabled:opacity-0 ${!canScrollLeft ? 'pointer-events-none' : 'opacity-0 group-hover:opacity-100'}`}
        aria-label="Scroll carousel left"
      >
        <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Desktop Right Arrow */}
      <button
        onClick={() => scroll('right')}
        disabled={!canScrollRight}
        className={`hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 z-10 w-12 h-12 rounded-full bg-warm-white border border-latte/70 shadow-sm items-center justify-center transition-all duration-300 hover:bg-roasted hover:text-white text-espresso disabled:opacity-0 ${!canScrollRight ? 'pointer-events-none' : 'opacity-0 group-hover:opacity-100'}`}
        aria-label="Scroll carousel right"
      >
        <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div className="w-full overflow-hidden">
        <div
          ref={scrollContainerRef}
          role="region"
          aria-label="Featured menu items carousel"
          className="flex overflow-x-auto snap-x snap-mandatory pb-4 scroll-smooth w-full max-w-full gap-0 md:gap-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          onScroll={updateScrollButtons}
        >
          {items.map((item) => (
            <div
              key={item.id}
              className="snap-center flex-shrink-0 w-[85vw] max-w-[340px] px-2 md:w-[280px] lg:w-[300px] md:px-0"
            >
              <div className="group flex flex-col bg-warm-white rounded-[18px] overflow-hidden border border-latte/60 hover:border-latte transition-all duration-300 hover:shadow-md h-full">
                <div className="relative h-44 md:h-48 w-full bg-latte/20 overflow-hidden">
                  <ImageWithFallback
                    src={item.image_url || '/images/menu/placeholder.jpg'}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-103 transition-transform duration-700"
                    sizes="(max-width: 768px) 85vw, 300px"
                    fallbackEmoji="🥞"
                  />
                  {/* Bestseller Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-espresso/80 text-white rounded-full text-[9px] font-semibold tracking-wider uppercase">
                      <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      Bestseller
                    </span>
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <div className="flex items-baseline justify-between gap-2 mb-1.5">
                    <h3 className="font-heading font-medium text-base text-espresso leading-tight">
                      {item.name}
                    </h3>
                    <span className="font-body text-roasted font-semibold text-sm shrink-0">
                      Rs. {item.price}
                    </span>
                  </div>
                  <p className="font-body text-mocha/65 text-xs leading-relaxed mb-4 line-clamp-2">
                    {item.description || 'Prepared fresh daily with premium ingredients.'}
                  </p>
                  <Link
                    href="/order"
                    className="mt-auto w-full inline-flex items-center justify-center gap-1.5 py-2.5 bg-roasted hover:bg-dark-roast text-cream text-[10px] uppercase tracking-[0.12em] font-semibold rounded-full transition-colors duration-300"
                  >
                    Order Now
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}