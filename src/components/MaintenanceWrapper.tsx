import { headers } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/supabase/client';

const BYPASS_PATHS = ['/hc-dev', '/hc-dashboard', '/api'];

export default async function MaintenanceWrapper({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';

  if (BYPASS_PATHS.some((path) => pathname.startsWith(path))) {
    return <>{children}</>;
  }

  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'maintenance_mode')
    .single();

  const isMaintenance = data?.value === 'true';

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
            We&apos;ll be back shortly! Thank you for your patience.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
