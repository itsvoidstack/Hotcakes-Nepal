import { getSupabaseAdmin } from '@/lib/supabase/client';
import StreakSearch from '@/components/StreakSearch';

export const revalidate = 60;

export default async function StreakPage() {
  const supabase = getSupabaseAdmin();
  // Fetch active campaign details to display
  const { data: campaignData } = await supabase
    .from('campaigns')
    .select('*')
    .eq('is_active', true)
    .single();

  const now = new Date();
  const campaign = campaignData && (!campaignData.end_date || new Date(campaignData.end_date) > now)
    ? campaignData
    : null;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-cream min-h-screen py-16 px-4">
      {/* Campaign Strip (empty state matching home page) */}
      {!campaign && (
        <section className="bg-warm-white py-4.5 px-4 text-center z-10 border-b border-latte/60 shadow-sm mb-12 rounded-2xl max-w-[1280px] mx-auto">
          <div className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 text-roasted" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-mocha/90 font-body text-xs md:text-sm font-medium tracking-wide">
              Check back soon for our next seasonal reward events & specials!
            </span>
          </div>
        </section>
      )}
      
      <div className="max-w-[1280px] mx-auto text-center mb-12">
        <span className="text-xs font-semibold uppercase tracking-widest text-roasted mb-2 block">Rewards</span>
        <h1 className="font-heading font-bold text-4xl md:text-5xl text-espresso mb-4">
          Brew Streak Loyalty
        </h1>
        {campaign ? (
          <div className="space-y-2">
            <p className="font-body text-mocha text-base max-w-md mx-auto">
              Visit us, purchase any coffee, and get your stamp card stamped by our barista. **{campaign.tagline}**
            </p>
            {(campaign.start_date || campaign.end_date) && (
              <p className="text-xs font-semibold text-roasted tracking-wide uppercase mt-2">
                {campaign.start_date && `Starts: ${formatDate(campaign.start_date)}`}
                {campaign.start_date && campaign.end_date && '  •  '}
                {campaign.end_date && `Ends: ${formatDate(campaign.end_date)}`}
              </p>
            )}
          </div>
        ) : (
          <p className="font-body text-mocha text-base max-w-md mx-auto">
            Check your current visit stamps and progress toward rewards.
          </p>
        )}
      </div>

      <StreakSearch />

      <div className="max-w-md mx-auto mt-16 text-center text-xs text-mocha leading-relaxed">
        <h3 className="font-heading font-bold text-sm text-espresso mb-2">How it works</h3>
        <ol className="list-decimal list-inside space-y-1 text-left max-w-xs mx-auto">
          <li>Give your phone number to our staff on checkout</li>
          <li>Earn 1 stamp per day upon purchase</li>
          <li>Collect 10 stamps to earn 1 free coffee of choice</li>
          <li>Show your completed card to barista to redeem</li>
        </ol>
      </div>
    </div>
  );
}
