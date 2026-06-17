'use client';

import { useState } from 'react';
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
  const filteredItems = initialItems.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

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

      {/* Category Tabs (Horizontally Scrollable on Mobile) */}
      <div className="flex overflow-x-auto gap-3 pb-4 mb-12 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 justify-start md:justify-center">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
              selectedCategory === category
                ? 'bg-roasted text-white shadow-sm'
                : 'bg-warm-white border border-latte text-mocha hover:bg-latte/10'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className={`group flex flex-col bg-warm-white rounded-[20px] overflow-hidden border border-latte transition-all duration-300 hover:shadow-lg ${
                !item.is_available ? 'opacity-60' : 'hover:-translate-y-1'
              }`}
            >
              {/* Image Container */}
              <div className="relative h-60 w-full bg-latte/30 overflow-hidden">
                <Image
                  src={item.image_url || '/images/menu/placeholder.jpg'}
                  alt={item.name}
                  fill
                  className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 width%3D%22100%25%22 height%3D%22100%25%22 viewBox%3D%220 0 100 100%22%3E%3Crect width%3D%22100%25%22 height%3D%22100%25%22 fill%3D%22%23E8DED2%22%2F%3E%3Ctext x%3D%2250%25%22 y%3D%2250%25%22 dominant-baseline%3D%22middle%22 text-anchor%3D%22middle%22 font-family%3D%22sans-serif%22 font-size%3D%2210%22 fill%3D%22%235E5248%22%3E🥞%3C%2Ftext%3E%3C%2Fsvg%3E';
                  }}
                />
                {!item.is_available && (
                  <div className="absolute inset-0 bg-espresso/60 flex items-center justify-center">
                    <span className="bg-white/90 text-espresso px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">
                      Unavailable
                    </span>
                  </div>
                )}
                {item.is_featured && item.is_available && (
                  <span className="absolute top-4 left-4 bg-olive text-white px-3 py-1 rounded-full text-xs font-medium">
                    Bestseller
                  </span>
                )}
              </div>

              {/* Item Details */}
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-baseline justify-between gap-2 mb-2">
                  <h3 className="font-heading font-bold text-lg text-espresso group-hover:text-roasted transition-colors">
                    {item.name}
                  </h3>
                  <span className="font-heading text-roasted font-semibold">
                    Rs. {item.price}
                  </span>
                </div>
                <p className="font-body text-mocha text-sm leading-relaxed mb-6 flex-grow">
                  {item.description || 'Fresh and prepared daily using only quality local ingredients.'}
                </p>

                {item.is_available ? (
                  <Link
                    href="/order"
                    className="w-full text-center py-2.5 bg-roasted hover:bg-dark-roast text-white text-xs font-semibold rounded-full transition-colors duration-200"
                  >
                    Order Now
                  </Link>
                ) : (
                  <button
                    disabled
                    className="w-full py-2.5 bg-latte text-mocha/50 text-xs font-semibold rounded-full cursor-not-allowed"
                  >
                    Out of Stock
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-16">
            <p className="font-body text-mocha text-lg">No items match your search or filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
