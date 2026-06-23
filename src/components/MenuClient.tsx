'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';

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
    <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-12">
      {/* Search Bar */}
      <div className="max-w-md mx-auto mb-10">
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

      {/* Category Tabs (Horizontally Scrollable, No Scrollbars Visible) */}
      <div className="flex overflow-x-auto gap-6 pb-4 mb-10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] -mx-4 px-4 md:mx-0 md:px-0 justify-start md:justify-center">
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

      {/* Menu Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className={`group flex flex-col overflow-hidden ${!item.is_available ? 'opacity-50' : ''}`}
            >
              {/* Image Container */}
              <div className="relative aspect-[3/4] w-full bg-latte/20 overflow-hidden mb-4">
                <Image
                  src={item.image_url || '/images/menu/placeholder.jpg'}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 width%3D%22100%25%22 height%3D%22100%25%22 viewBox%3D%220 0 100 100%22%3E%3Crect width%3D%22100%25%22 height%3D%22100%25%22 fill%3D%22%23E8DED2%22%2F%3E%3Ctext x%3D%2250%25%22 y%3D%2250%25%22 dominant-baseline%3D%22middle%22 text-anchor%3D%22middle%22 font-family%3D%22sans-serif%22 font-size%3D%2210%22 fill%3D%22%235E5248%22%3E🥞%3C%2Ftext%3E%3C%2Fsvg%3E';
                  }}
                />
                {item.is_featured && item.is_available && (
                  <span className="absolute top-3 left-3 bg-white/90 text-espresso px-2 py-0.5 rounded-full text-[10px] font-serif">
                    Bestseller
                  </span>
                )}
              </div>

              {/* Item Details */}
              <div className="flex flex-col gap-1">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="font-heading font-semibold text-base text-espresso">
                    {item.name}
                  </h3>
                  <span className="font-body text-xs text-roasted">
                    Rs. {item.price}
                  </span>
                </div>
                <p className="font-body text-xs text-mocha/70 line-clamp-2">
                  {item.description || 'Fresh & homemade daily.'}
                </p>
                {item.is_available && (
                  <Link
                    href="/order"
                    className="mt-2 text-[10px] font-medium text-roasted hover:text-espresso transition-colors uppercase tracking-wider"
                  >
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
