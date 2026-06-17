'use client';

import { useState, useEffect } from 'react';
import DashboardLogin from '@/components/dashboard/DashboardLogin';
import DashboardClient from '@/components/dashboard/DashboardClient';

export default function DashboardPage() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage session state on mount
    const savedToken = localStorage.getItem('admin_token');
    const sessionState = localStorage.getItem('admin_session');

    if (savedToken && sessionState === 'authenticated') {
      setToken(savedToken);
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (newToken: string) => {
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_session');
    localStorage.removeItem('admin_token');
    setToken(null);
  };

  if (loading) {
    return (
      <div className="bg-cream min-h-[calc(100vh-80px)] flex items-center justify-center font-body text-mocha">
        Loading session...
      </div>
    );
  }

  return (
    <div className="bg-cream min-h-[calc(100vh-80px)] py-12 px-4 flex flex-col justify-start items-center">
      {token ? (
        <DashboardClient token={token} onLogout={handleLogout} />
      ) : (
        <div className="flex-grow flex items-center justify-center w-full">
          <DashboardLogin onLoginSuccess={handleLoginSuccess} />
        </div>
      )}
    </div>
  );
}
