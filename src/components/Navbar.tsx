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
      setScrolled(window.scrollY > 10);
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
      className={`sticky top-0 z-40 w-full h-[72px] flex items-center bg-cream/95 transition-shadow duration-300 ${
        scrolled ? 'border-b border-latte/30 shadow-sm' : ''
      }`}
    >
      <div className="max-w-[1280px] w-full mx-auto px-4 md:px-6 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center">
          {logo}
        </div>

        {/* Center: Links (Desktop Only) */}
        <nav className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link
                key={link.path}
                href={link.path}
                className={`relative group py-1 text-sm font-medium tracking-widest transition-all duration-300 ${
                  isActive ? 'text-roasted' : 'text-mocha/70 hover:text-espresso'
                }`}
              >
                {link.label}
                <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-roasted transition-all duration-300 group-hover:w-full ${
                  isActive ? 'w-full' : 'w-0'
                }`} />
              </Link>
            );
          })}
        </nav>

        {/* Right: CTA Button */}
        <div className="flex items-center gap-4">
          <Link
            href="/order"
            className="group inline-flex items-center justify-center gap-2 px-7 py-2.5 bg-roasted hover:bg-dark-roast text-white text-xs uppercase tracking-widest font-semibold rounded-full transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 hover:shadow-lg shadow-md"
          >
            Order Now
            <svg className="w-3 h-3 -mr-1 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
}
