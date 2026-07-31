import Logo from './Logo';
import { getSupabaseAdmin } from '@/lib/supabase/client';

export const revalidate = 60;

export default async function SiteLogo() {
  let logoUrl: string | undefined = undefined;

  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'logo_image')
      .maybeSingle();
    
    logoUrl = (data?.value as { url?: string })?.url || undefined;
  } catch (err) {
    console.error('Error fetching dynamic site logo:', err);
  }

  return <Logo src={logoUrl || '/logo.png'} />;
}

