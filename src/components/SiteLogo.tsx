import Logo from './Logo';
import { getSupabaseAdmin } from '@/lib/supabase/client';

export const revalidate = 60;

export default async function SiteLogo() {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'logo_image')
    .single();
  
  const logoUrl = (data?.value as { url?: string })?.url;
  
  return <Logo src={logoUrl} />;
}
