'use client';

import { useState, useMemo } from 'react';

import Link from 'next/link';
import ImageWithFallback from './ImageWithFallback';

interface MenuItem {
  id: string;
  category: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  is_featured: boolean;
}

interface MenuClientProps {
  initialItems: MenuItem[];
}

export default function MenuClient({ initialItems }: MenuClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Extract unique categories dynamically
  const categories = ['All', ...Array.from(new Set(initialItems.map(item => item.category)))];

  // Filter items based on category and search query
  const filteredItems = useMemo(() => {
    return initialItems.filter(item => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [initialItems, selectedCategory, searchQuery]);

  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-6 pt-0 pb-12">
      {/* Search Bar */}
      <div className="max-w-md mx-auto mb-5">
        <div className="relative">
          <input
            type="text"
            placeholder="Search our menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-warm-white border border-latte rounded-full font-body text-espresso placeholder-mocha/60 focus:outline-none focus:ring-2 focus:ring-roasted transition-all"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-mocha/60"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.636Z" />
          </svg>
        </div>
      </div>

      <div className="w-full overflow-hidden">
        <div className="flex overflow-x-auto gap-6 pb-2.5 mb-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] -mx-4 px-4 md:mx-0 md:px-0 justify-start md:justify-center">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`whitespace-nowrap text-base font-serif italic transition-all duration-200 ${
                selectedCategory === category
                  ? 'text-roasted underline underline-offset-8 decoration-latte'
                  : 'text-mocha/80 hover:text-espresso'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className={`group flex flex-col hover:-translate-y-1 transition-all duration-250 ease-out ${!item.is_available ? 'opacity-50' : ''}`}
            >
              {/* Image Container */}
              <div className="relative aspect-[4/3] w-full bg-latte/30 rounded-3xl overflow-hidden mb-4 group-hover:shadow-sm transition-all duration-250 ease-out">
                <ImageWithFallback
                  src={item.image_url || '/images/menu/placeholder.jpg'}
                  alt={item.name}
                  fill
                  className="object-cover group-hover:scale-[1.03] transition-transform duration-250 ease-out"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  fallbackEmoji="🥞"
                />
                {item.is_featured && item.is_available && (
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-espresso/90 text-white rounded-full text-[9px] font-medium tracking-wide uppercase">
                      <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      Bestseller
                    </span>
                  </div>
                )}
              </div>

              {/* Item Details */}
              <div className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="font-heading font-semibold text-lg text-espresso leading-tight">
                    {item.name}
                  </h3>
                  <span className="font-body text-roasted font-medium text-sm">
                    Rs. {item.price}
                  </span>
                </div>
                <p className="font-body text-mocha/80 text-sm line-clamp-2">
                  {item.description || 'Fresh & homemade daily with premium ingredients.'}
                </p>
                {item.is_available && (
                  <Link
                    href="/order"
                    className="group/btn inline-flex items-center justify-center gap-1.5 mt-1 py-2 bg-roasted/5 hover:bg-roasted text-roasted hover:text-white text-[10px] uppercase tracking-widest font-semibold rounded-full transition-all duration-300 border border-roasted/20"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Order Now
                  </Link>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-16">
            <p className="font-body text-mocha text-sm">
              No items match your search or filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
