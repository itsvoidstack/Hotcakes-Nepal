'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function MaintenanceWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Admin, developer, and API routes bypass maintenance mode
    if (
      pathname.startsWith('/hc-dev') || 
      pathname.startsWith('/hc-dashboard') || 
      pathname.startsWith('/api')
    ) {
      setLoading(false);
      return;
    }

    const checkMaintenance = async () => {
      try {
        const res = await fetch('/api/maintenance');
        const data = await res.json();
        if (data.maintenance) {
          setIsMaintenance(true);
        }
      } catch (err) {
        console.error('Failed to check maintenance mode', err);
      } finally {
        setLoading(false);
      }
    };

    checkMaintenance();
  }, [pathname]);

  if (loading) {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center font-body text-mocha text-sm">
        Connecting to Hotcakes Nepal...
      </div>
    );
  }

  if (isMaintenance) {
    return (
      <div className="fixed inset-0 z-[9999] bg-cream flex flex-col items-center justify-center p-6 text-center">
        <div className="glass-card max-w-md p-8 md:p-12 rounded-[24px] border border-latte shadow-lg animate-fade-up">
          <span className="text-6xl block mb-6 animate-bounce">☕</span>
          <h1 className="font-heading font-bold text-3xl md:text-4xl text-espresso mb-4">
            Brewing Updates
          </h1>
          <p className="font-body text-mocha text-sm leading-relaxed mb-6">
            Hotcakes Nepal is currently undergoing scheduled maintenance. We are refining our recipes and systems to serve you better.
          </p>
          <div className="w-16 h-1 border-t-2 border-roasted mx-auto mb-6"></div>
          <p className="font-body text-xs text-mocha/70 italic">
            We'll be back shortly! Thank you for your patience.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
