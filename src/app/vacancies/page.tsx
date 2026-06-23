import ImageWithFallback from '@/components/ImageWithFallback';
import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';

type Vacancy = Database['public']['Tables']['vacancies']['Row'];

export const revalidate = 60;

export default async function VacanciesPage() {
  const supabase = getSupabaseAdmin();
  // Fetch active vacancies
  const { data: vacancies } = await supabase
    .from('vacancies')
    .select('*')
    .eq('is_active', true);

  const activeVacancies = vacancies || [];

  return (
    <div className="bg-cream min-h-screen py-16 px-4">
      <div className="max-w-[1280px] mx-auto text-center mb-16">
        <span className="text-xs font-semibold uppercase tracking-widest text-roasted mb-2 block">Careers</span>
        <h1 className="font-heading font-bold text-4xl md:text-5xl text-espresso mb-4">
          Join Our Team
        </h1>
        <p className="font-body text-mocha/90 text-base max-w-md mx-auto">
          We are always looking for passionate baristas, bakers, and service staff to craft memorable cafe experiences.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-8">
        {activeVacancies.length > 0 ? (
          activeVacancies.map((vacancy: Vacancy) => (
            <div
              key={vacancy.id}
              className="glass-card p-6 md:p-8 rounded-[28px] flex flex-col md:flex-row gap-6 items-start animate-fade-up border border-latte/80 shadow-sm"
            >
              {vacancy.image_url && (
                <div className="relative w-full md:w-48 h-48 rounded-2xl overflow-hidden bg-latte/30 flex-shrink-0">
                  <ImageWithFallback
                    src={vacancy.image_url}
                    alt={vacancy.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 192px"
                    fallbackEmoji="💼"
                  />
                </div>
              )}
              <div className="flex-grow">
                <h2 className="font-heading font-bold text-2xl text-espresso mb-3 leading-snug">
                  {vacancy.title}
                </h2>
                <p className="font-body text-mocha/90 text-sm leading-relaxed mb-6 whitespace-pre-wrap">
                  {vacancy.description}
                </p>
                <Link
                  href={vacancy.google_form_link}
                  target="_blank"
                  className="inline-block px-8 py-3.5 bg-roasted hover:bg-dark-roast text-white text-xs uppercase tracking-wider font-semibold rounded-full transition-all duration-300 shadow-sm"
                >
                  Apply via Google Form
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-warm-white/50 rounded-[28px] border border-dashed border-latte/60 p-10 max-w-md mx-auto animate-fade-up">
            <svg className="w-12 h-12 mx-auto text-mocha/40 mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
            <h3 className="font-heading font-semibold text-xl text-espresso mb-2">
              No Current Openings
            </h3>
            <p className="font-body text-mocha/90 text-sm">
              We don&apos;t have any active vacancy campaigns running right now. Follow us on Instagram or reach out to know when we open new positions!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
