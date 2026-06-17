import { supabase } from '@/lib/supabase/client';
import Image from 'next/image';
import Link from 'next/link';

export const revalidate = 0;

export default async function VacanciesPage() {
  // Fetch active vacancies
  const { data: vacancies } = await supabase
    .from('vacancies')
    .select('*')
    .eq('is_active', true);

  const activeVacancies = vacancies || [];

  return (
    <div className="bg-cream min-h-screen py-16 px-4">
      <div className="max-w-[1280px] mx-auto text-center mb-16">
        <span className="text-4xl block mb-4">💼</span>
        <h1 className="font-heading font-bold text-4xl md:text-5xl text-espresso mb-4">
          join our team
        </h1>
        <p className="font-body text-mocha text-base max-w-md mx-auto">
          We are always looking for passionate baristas, bakers, and service staff to craft memorable cafe experiences.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-8">
        {activeVacancies.length > 0 ? (
          activeVacancies.map((vacancy) => (
            <div
              key={vacancy.id}
              className="glass-card p-6 md:p-8 rounded-[24px] flex flex-col md:flex-row gap-6 items-start animate-fade-up"
            >
              {vacancy.image_url && (
                <div className="relative w-full md:w-48 h-48 rounded-2xl overflow-hidden bg-latte/30 flex-shrink-0">
                  <Image
                    src={vacancy.image_url}
                    alt={vacancy.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 192px"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
              <div className="flex-grow">
                <h2 className="font-heading font-bold text-2xl text-espresso mb-3">
                  {vacancy.title}
                </h2>
                <p className="font-body text-mocha text-sm leading-relaxed mb-6 whitespace-pre-wrap">
                  {vacancy.description}
                </p>
                <Link
                  href={vacancy.google_form_link}
                  target="_blank"
                  className="inline-block px-8 py-3 bg-roasted hover:bg-dark-roast text-white text-xs font-semibold rounded-full transition-colors duration-200 shadow-sm"
                >
                  Apply via Google Form
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 border border-dashed border-latte rounded-[24px] glass-card p-8">
            <span className="text-3xl block mb-3">☕</span>
            <h3 className="font-heading font-semibold text-lg text-espresso mb-1">
              No Current Openings
            </h3>
            <p className="font-body text-mocha text-sm">
              We don\'t have any active vacancy campaigns running right now. Follow us on Instagram to know when we open new positions!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
