'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavbarProps {
  logo: React.ReactNode;
}

export default function Navbar({ logo }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Menu', path: '/menu' },
    { label: 'Streak', path: '/streak' },
    { label: 'Vacancies', path: '/vacancies' },
    { label: 'Location', path: '/location' },
    { label: 'Contact', path: '/contact' },
  ];

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        scrolled
          ? 'py-3 bg-cream/80 backdrop-blur-md border-b border-latte shadow-sm'
          : 'py-5 bg-transparent'
      }`}
    >
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 flex items-center justify-between">
        {/* Left: Logo */}
        {logo}

        {/* Center: Links (Desktop Only) */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link
                key={link.path}
                href={link.path}
                className={`relative py-1 text-sm font-medium transition-colors hover:text-roasted ${
                  isActive ? 'text-roasted' : 'text-mocha'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-roasted rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: CTA Button */}
        <div className="flex items-center gap-4">
          <Link
            href="/order"
            className="px-6 py-2.5 bg-roasted hover:bg-dark-roast text-white text-sm font-medium rounded-full transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 shadow-sm"
          >
            Order Now
          </Link>
        </div>
      </div>
    </header>
  );
}
