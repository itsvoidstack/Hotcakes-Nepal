'use client';

import { useState } from 'react';

interface DashboardLoginProps {
  onLoginSuccess: (token: string) => void;
}

export default function DashboardLogin({ onLoginSuccess }: DashboardLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to authenticate');
      }

      localStorage.setItem('hc_dashboard_session', data.token);
      localStorage.setItem('hc_dashboard_login_time', Date.now().toString());
      onLoginSuccess(data.token);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred during login.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-cream p-8 md:p-10 rounded-[24px] border border-latte shadow-sm animate-fade-up">
      <div className="text-center mb-8">
        <h1 className="font-heading font-bold text-3xl text-espresso mb-1">
          Hot Cakes Nepal
        </h1>
        <p className="font-body text-mocha text-sm font-semibold uppercase tracking-wider">
          Cafe Panel
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="admin-username"
            className="block text-xs font-semibold text-mocha uppercase tracking-wider mb-2"
          >
            Username
          </label>
          <input
            id="admin-username"
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            className="w-full h-12 px-4 bg-warm-white border border-latte rounded-xl font-body text-espresso placeholder-mocha/40 focus:outline-none focus:ring-2 focus:ring-roasted transition-all text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="admin-password"
            className="block text-xs font-semibold text-mocha uppercase tracking-wider mb-2"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="admin-password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full h-12 px-4 pr-12 bg-warm-white border border-latte rounded-xl font-body text-espresso placeholder-mocha/40 focus:outline-none focus:ring-2 focus:ring-roasted transition-all text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-mocha/60 hover:text-mocha text-xs font-body"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 text-red-600 border border-red-200 rounded-xl text-center text-sm font-body leading-relaxed">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-[#2C1810] hover:bg-[#1f100a] disabled:bg-mocha/40 text-white font-semibold rounded-full transition-all duration-200 shadow-sm text-sm"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
