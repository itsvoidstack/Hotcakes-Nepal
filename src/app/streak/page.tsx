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
        <section className="bg-warm-white py-4 px-4 text-center z-10 border-b border-latte mb-12">
          <div className="max-w-[1280px] mx-auto">
            <span className="text-mocha font-body text-sm md:text-base">
              No campaigns are currently running.
            </span>
          </div>
        </section>
      )}
      
      <div className="max-w-[1280px] mx-auto text-center mb-12">
        <span className="text-4xl block mb-4">🏆</span>
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
