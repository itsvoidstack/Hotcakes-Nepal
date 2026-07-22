'use client';

import { useState } from 'react';

interface StreakResult {
  found: boolean;
  customer_code?: string;
  phone_number?: string;
  streak_count?: number;
  last_stamp_at?: string;
}

export default function StreakSearch() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<StreakResult | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    // Client-side validation: must match HC-XXXX code format or be at least 10-digit phone
    const isCode = /^HC-[0-9]{4}$/i.test(trimmed);
    const isPhone = /^\+?[0-9\s\-]{10,20}$/.test(trimmed);

    if (!isCode && !isPhone) {
      setError('Please enter a valid Customer Code (e.g. HC-4721) or phone number (at least 10 digits).');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch(`/api/streak/search?q=${encodeURIComponent(trimmed)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to perform lookup');
      }

      setResult(data);
      if (data.found === false) {
        setError('No record found for this number or code.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred during search.';
      setError(message || 'An error occurred during search.');
    } finally {
      setLoading(false);
    }
  };

  const getNextStampStatus = (lastStampAt: string | undefined) => {
    if (!lastStampAt) return { available: true };
    const lastStamp = new Date(lastStampAt).getTime();
    const now = new Date().getTime();
    const timeDiff = now - lastStamp;
    const hours24 = 24 * 60 * 60 * 1000;

    if (timeDiff < hours24) {
      const nextStampTime = new Date(lastStamp + hours24);
      const diffMs = hours24 - timeDiff;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return {
        available: false,
        nextStampTime,
        remainingText: `${diffHours}h ${diffMins}m remaining`,
      };
    }
    return { available: true };
  };

  const totalStreaks = 10;

  return (
    <div className="max-w-md mx-auto">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <input
          type="text"
          placeholder="Enter phone number or customer code..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-grow h-12 px-6 bg-warm-white border border-latte rounded-full font-body text-espresso placeholder-mocha/60 focus:outline-none focus:ring-2 focus:ring-roasted transition-all text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 h-12 bg-roasted hover:bg-dark-roast disabled:bg-mocha/40 text-white text-xs uppercase tracking-wider font-semibold rounded-full transition-all duration-300 shadow-sm"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && (
        <div className="p-4 bg-muted-red/15 text-muted-red rounded-xl text-center text-sm font-body mb-6">
          {error}
        </div>
      )}

      {/* Result Card */}
      {result && result.found && (
        <div className={`glass-card p-6 rounded-2xl animate-fade-up border shadow-sm transition-all duration-500 ${
          result.streak_count === totalStreaks
            ? 'border-olive bg-olive/5 shadow-olive/10'
            : 'border-latte'
        }`}>
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-latte">
            <div className="text-left">
              <span className="text-xs font-semibold text-mocha uppercase tracking-wider block mb-1">
                Customer Code
              </span>
              <span className="font-heading text-lg font-bold text-espresso">
                {result.customer_code}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-mocha uppercase tracking-wider block mb-1">
                Phone Number
              </span>
              <span className="font-body text-sm text-espresso font-medium">
                {result.phone_number}
              </span>
            </div>
          </div>

          <div className="mb-6">
            <h3 className={`font-heading font-bold text-2xl text-center mb-2 ${
              result.streak_count === totalStreaks ? 'text-olive animate-pulse' : 'text-espresso'
            }`}>
              {result.streak_count} / {totalStreaks} Stamps
            </h3>
            <p className="font-body text-mocha text-xs text-center font-medium mb-3">
              {result.streak_count === totalStreaks
                ? '🎉 Complete! Claim your free coffee on your next visit.'
                : `${totalStreaks - (result.streak_count || 0)} more visits for a free coffee!`}
            </p>

            {result.last_stamp_at && (
              <div className="px-4 py-2 bg-cream/40 rounded-xl border border-latte/40 text-center">
                {(() => {
                  const status = getNextStampStatus(result.last_stamp_at);
                  if (status.available) {
                    return (
                      <span className="text-xs font-semibold text-olive flex items-center justify-center gap-1">
                        🟢 Next stamp available now!
                      </span>
                    );
                  } else {
                    return (
                      <span className="text-xs font-semibold text-mocha flex flex-col items-center justify-center gap-0.5">
                        <span>⏳ Next stamp available in {status.remainingText}</span>
                        <span className="text-[10px] text-mocha/60 font-normal">
                          ({status.nextStampTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                        </span>
                      </span>
                    );
                  }
                })()}
              </div>
            )}
          </div>

          {/* Stamp Grid */}
          <div className="grid grid-cols-5 gap-3 max-w-[280px] mx-auto">
            {Array.from({ length: totalStreaks }).map((_, index) => {
              const isStamped = index < (result.streak_count || 0);
              const isReward = result.streak_count === totalStreaks;
              return (
                <div
                  key={index}
                  className={`aspect-square flex items-center justify-center rounded-full border text-lg transition-all duration-300 ${
                    isStamped
                      ? isReward
                        ? 'bg-olive border-olive text-white shadow-md shadow-olive/20 scale-105 animate-pulse'
                        : 'bg-roasted border-roasted text-white shadow-sm scale-105'
                      : 'bg-cream/50 border-latte text-mocha/30'
                  }`}
                  aria-label={isStamped ? `Stamp ${index + 1} marked` : `Stamp ${index + 1} empty`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h14v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                    <line x1="6" y1="3" x2="6" y2="5" strokeLinecap="round" />
                    <line x1="10" y1="3" x2="10" y2="5" strokeLinecap="round" />
                    <line x1="14" y1="3" x2="14" y2="5" strokeLinecap="round" />
                  </svg>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
