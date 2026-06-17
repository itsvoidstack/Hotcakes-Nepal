'use client';

import { useState } from 'react';

interface DashboardLoginProps {
  onLoginSuccess: (token: string) => void;
}

export default function DashboardLogin({ onLoginSuccess }: DashboardLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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

      // Save token in localStorage and invoke success callback
      localStorage.setItem('admin_session', 'authenticated');
      localStorage.setItem('admin_token', data.token);
      onLoginSuccess(data.token);
    } catch (err: any) {
      setError(err.message || 'An error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full glass-card p-8 md:p-10 rounded-[24px] border border-latte shadow-sm animate-fade-up">
      <div className="text-center mb-8">
        <span className="text-4xl block mb-3">🔐</span>
        <h1 className="font-heading font-bold text-3xl text-espresso mb-2">
          Cafe Admin Panel
        </h1>
        <p className="font-body text-mocha text-sm">
          Please enter your credentials to manage the cafe settings.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-mocha uppercase tracking-wider mb-2">
            Username
          </label>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. Hotcakes-Nepal"
            className="w-full h-12 px-4 bg-warm-white border border-latte rounded-xl font-body text-espresso placeholder-mocha/40 focus:outline-none focus:ring-2 focus:ring-roasted transition-all text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-mocha uppercase tracking-wider mb-2">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full h-12 px-4 bg-warm-white border border-latte rounded-xl font-body text-espresso placeholder-mocha/40 focus:outline-none focus:ring-2 focus:ring-roasted transition-all text-sm"
          />
        </div>

        {error && (
          <div className="p-3.5 bg-muted-red/15 text-muted-red rounded-xl text-center text-xs font-body leading-relaxed">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-roasted hover:bg-dark-roast disabled:bg-mocha/40 text-white font-semibold rounded-full transition-all duration-200 transform hover:-translate-y-0.5 shadow-sm text-sm"
        >
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
