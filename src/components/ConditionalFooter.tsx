import { headers } from 'next/headers';
import Footer from './Footer';

const HIDDEN_PATHS = ['/hc-dashboard', '/hc-dev'];

export default async function ConditionalFooter() {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';

  if (HIDDEN_PATHS.some((path) => pathname.startsWith(path))) {
    return null;
  }

  return <Footer />;
}
