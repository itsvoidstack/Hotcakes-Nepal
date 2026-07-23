'use client';

import { useState, useEffect } from 'react';
import DashboardLogin from '@/components/dashboard/DashboardLogin';
import DashboardClient from '@/components/dashboard/DashboardClient';

export default function DashboardPageClient() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('hc_dashboard_session');
    const loginTime = localStorage.getItem('hc_dashboard_login_time');

    if (savedToken && loginTime) {
      const hoursElapsed = (Date.now() - parseInt(loginTime)) / (1000 * 60 * 60);
      if (hoursElapsed >= 8) {
        localStorage.removeItem('hc_dashboard_session');
        localStorage.removeItem('hc_dashboard_login_time');
        setToken(null);
      } else {
        setToken(savedToken);
      }
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (newToken: string) => {
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('hc_dashboard_session');
    localStorage.removeItem('hc_dashboard_login_time');
    setToken(null);
  };

  if (loading) {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center font-body text-mocha">
        Loading session...
      </div>
    );
  }

  if (!token) {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center px-4">
        <DashboardLogin onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  return (
    <div className="bg-cream min-h-[calc(100vh-80px)] py-6 md:py-12 w-full overflow-x-hidden">
      <DashboardClient token={token} onLogout={handleLogout} />
    </div>
  );
}
