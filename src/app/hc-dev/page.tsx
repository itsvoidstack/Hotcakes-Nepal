'use client';

import { useState, useEffect } from 'react';
import DevLogin from '@/components/dev/DevLogin';
import DevClient from '@/components/dev/DevClient';

export default function DevPage() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check developer local storage session state on mount
    const savedToken = localStorage.getItem('dev_token');
    const sessionState = localStorage.getItem('dev_session');

    if (savedToken && sessionState === 'authenticated') {
      setToken(savedToken);
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (newToken: string) => {
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('dev_session');
    localStorage.removeItem('dev_token');
    setToken(null);
  };

  if (loading) {
    return (
      <div className="bg-cream min-h-[calc(100vh-80px)] flex items-center justify-center font-body text-mocha">
        Loading developer session...
      </div>
    );
  }

  return (
    <div className="bg-cream min-h-[calc(100vh-80px)] py-12 px-4 flex flex-col justify-start items-center">
      {token ? (
        <DevClient token={token} onLogout={handleLogout} />
      ) : (
        <div className="flex-grow flex items-center justify-center w-full">
          <DevLogin onLoginSuccess={handleLoginSuccess} />
        </div>
      )}
    </div>
  );
}
