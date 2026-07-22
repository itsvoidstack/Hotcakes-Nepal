'use client';

import { useState, useEffect } from 'react';
import DevLogin from '@/components/dev/DevLogin';
import DevClient from '@/components/dev/DevClient';

export default function DevPage() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('hc_dev_session');
    const loginTime = localStorage.getItem('hc_dev_login_time');

    if (savedToken && loginTime) {
      const hoursElapsed = (Date.now() - parseInt(loginTime)) / (1000 * 60 * 60);
      if (hoursElapsed >= 4) {
        localStorage.removeItem('hc_dev_session');
        localStorage.removeItem('hc_dev_login_time');
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
    localStorage.removeItem('hc_dev_session');
    localStorage.removeItem('hc_dev_login_time');
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
        <DevLogin onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  return (
    <div className="bg-cream min-h-[calc(100vh-80px)] py-12 px-4 flex flex-col justify-start items-center">
      <DevClient token={token} onLogout={handleLogout} />
    </div>
  );
}
