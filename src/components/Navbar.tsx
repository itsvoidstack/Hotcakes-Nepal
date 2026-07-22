'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavbarProps {
  logo: React.ReactNode;
}

export default function Navbar({ logo }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Menu', path: '/menu' },
    { label: 'Campaigns', path: '/streak' },
    { label: 'Vacancies', path: '/vacancies' },
    { label: 'Location', path: '/location' },
    { label: 'Contact', path: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-50 pointer-events-none w-full flex justify-center">
      <div 
        className={`w-[calc(100%-2rem)] md:w-[calc(100%-3rem)] max-w-[1240px] pointer-events-auto relative mt-5 md:mt-6 bg-[#FCFBF8] border rounded-[20px] md:rounded-[24px] transition-shadow duration-300 ${
          scrolled ? 'shadow-md border-latte/30' : 'shadow-[0_4px_20px_rgba(46,34,27,0.02)] border-latte/15'
        }`}
      >
        <div className="w-full px-5 md:px-7 flex items-center justify-between h-16 md:h-[68px]">
          {/* Left: Logo */}
          <div className="flex-1 flex items-center justify-start">
            {logo}
          </div>

          {/* Center: Links (Desktop Only) */}
          <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-6 lg:gap-8 justify-center">
            {navLinks.map((link) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`relative group py-1 text-[13px] font-semibold tracking-wider transition-colors duration-200 ${
                    isActive ? 'text-roasted' : 'text-mocha/80 hover:text-espresso'
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

          {/* Right: CTA & Sign in (Desktop) / Hamburger (Mobile) */}
          <div className="flex-1 flex items-center justify-end gap-5">
            {/* Desktop only CTA and Sign in */}
            <div className="hidden lg:flex items-center gap-6">
              <Link
                href="/hc-dashboard"
                className="text-[13px] font-semibold text-mocha/80 hover:text-espresso transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/order"
                className="group inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-roasted hover:bg-dark-roast text-white text-[11px] uppercase tracking-widest font-semibold rounded-full transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 hover:shadow-md shadow-sm"
              >
                Order Now
                <svg className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </svg>
              </Link>
            </div>

            {/* Mobile only Hamburger Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
              className="lg:hidden p-2 rounded-full hover:bg-latte/20 text-espresso transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-roasted"
              aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
            >
              {isOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu Card */}
        {isOpen && (
          <nav
            id="mobile-menu"
            aria-label="Mobile navigation"
            className="absolute top-[calc(100%+8px)] left-0 right-0 z-50 bg-[#FCFBF8] border border-latte/20 rounded-[20px] shadow-lg p-5 flex flex-col gap-4 animate-fade-up lg:hidden pointer-events-auto"
          >
            {navLinks.map((link) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`text-sm font-semibold tracking-wider transition-colors py-1 text-center ${
                    isActive ? 'text-roasted' : 'text-mocha/80 hover:text-espresso'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="border-t border-latte/20 my-1" />
            <div className="flex flex-col gap-3">
              <Link
                href="/hc-dashboard"
                onClick={() => setIsOpen(false)}
                className="text-sm font-semibold text-mocha/80 hover:text-espresso transition-colors text-center py-1"
              >
                Sign in
              </Link>
              <Link
                href="/order"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-roasted hover:bg-dark-roast text-white text-xs uppercase tracking-widest font-semibold rounded-full shadow-md transition-all active:scale-[0.98]"
              >
                Order Now
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </svg>
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

