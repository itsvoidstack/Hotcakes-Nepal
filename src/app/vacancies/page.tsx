import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';
import type { Metadata } from 'next';

type Vacancy = Database['public']['Tables']['vacancies']['Row'];

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Careers — Join the Hotcakes Nepal Team in Hattiban, Lalitpur",
  description: "Join the Hotcakes Nepal team — one of the most loved cafés in Hattiban, Lalitpur. View open positions for barista, kitchen, and service roles. Apply to work at a cozy breakfast café near Little Angels School.",
  alternates: {
    canonical: "https://hotcakes-nepal.vercel.app/vacancies"
  },
  openGraph: {
    title: "Careers — Hotcakes Nepal | Jobs in Hattiban, Lalitpur",
    description: "View open positions and apply to work at Hotcakes Nepal — a beloved breakfast and specialty coffee café in Hattiban, Lalitpur near Little Angels School.",
    url: "https://hotcakes-nepal.vercel.app/vacancies",
    images: [
      {
        url: "https://hotcakes-nepal.vercel.app/images/hero/hero-main.jpg",
        width: 1200,
        height: 630,
        alt: "Hotcakes Nepal — cozy café in Hattiban, Lalitpur hiring team members",
      },
    ],
  },
};

// Helper to parse location and employment type from description or titles
function parseVacancyDetails(description: string | null) {
  let location = 'Kathmandu, Nepal'; // Default
  let type = 'Full-Time'; // Default

  if (!description) return { location, type, cleanDescription: '' };

  // Parse lines starting with "Location:" or "Type:" or "Employment Type:" (case-insensitive)
  const lines = description.split('\n');
  const remainingLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    const lower = trimmed.toLowerCase();
    
    if (lower.startsWith('location:')) {
      location = trimmed.substring(9).trim();
    } else if (lower.startsWith('type:')) {
      type = trimmed.substring(5).trim();
    } else if (lower.startsWith('employment type:')) {
      type = trimmed.substring(16).trim();
    } else {
      remainingLines.push(line);
    }
  }

  // Fallback keyword checks if default values were not overridden by tags
  if (location === 'Kathmandu, Nepal') {
    const descLower = description.toLowerCase();
    if (descLower.includes('lalitpur')) {
      location = 'Lalitpur, Nepal';
    } else if (descLower.includes('pokhara')) {
      location = 'Pokhara, Nepal';
    }
  }

  if (type === 'Full-Time') {
    const descLower = description.toLowerCase();
    if (descLower.includes('part-time') || descLower.includes('part time')) {
      type = 'Part-Time';
    } else if (descLower.includes('internship') || descLower.includes('intern')) {
      type = 'Internship';
    }
  }

  // Filter out empty lines to keep description compact and tidy
  const cleanDescription = remainingLines.filter(line => line.trim() !== '').join('\n').trim();

  return { 
    location, 
    type, 
    cleanDescription: cleanDescription || description 
  };
}

export default async function VacanciesPage() {
  const supabase = getSupabaseAdmin();
  // Fetch active vacancies
  const { data: vacancies } = await supabase
    .from('vacancies')
    .select('*')
    .eq('is_active', true);

  const activeVacancies = vacancies || [];

  return (
    <div className="bg-cream min-h-screen py-12 md:py-24 px-4 flex flex-col items-center">
      {/* Page Title & Leaf Wreath Ornament */}
      <div className="max-w-[1280px] w-full text-center mb-12 md:mb-16 animate-fade-up">
        <h1 className="font-heading font-medium uppercase tracking-[0.15em] text-espresso text-[36px] md:text-[48px] lg:text-[54px] mb-3 leading-none">
          CAREERS
        </h1>
        {/* Leaf Ornament */}
        <div className="flex items-center justify-center gap-2 text-roasted opacity-60 mb-6">
          <div className="w-8 h-px bg-latte/70" />
          <span className="text-xs">❦</span>
          <div className="w-8 h-px bg-latte/70" />
        </div>
        <h2 className="font-heading font-medium text-xl md:text-2xl text-espresso/90 mb-2">
          Join the Hotcakes Nepal team in Hattiban, Lalitpur
        </h2>
        <p className="font-body text-[#6B5B52] text-sm md:text-base max-w-md mx-auto leading-relaxed">
          Build meaningful experiences, serve great specialty coffee, and grow with one of Lalitpur&apos;s most loved breakfast cafés.
        </p>
      </div>

      {activeVacancies.length > 0 ? (
        <div className="max-w-[1280px] w-full mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 px-4 animate-fade-up">
          {activeVacancies.map((vacancy: Vacancy) => {
            const { location, type, cleanDescription } = parseVacancyDetails(vacancy.description);
            return (
              <div
                key={vacancy.id}
                className="bg-white border border-latte rounded-[20px] p-6 shadow-sm flex flex-col justify-between h-full hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
              >
                <div className="flex-grow flex flex-col">
                  <h3 className="font-heading font-medium text-xl md:text-2xl text-espresso mb-3 leading-snug">
                    {vacancy.title}
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] md:text-[11px] font-medium tracking-wide bg-warm-white border border-latte text-mocha">
                      📍 {location}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] md:text-[11px] font-medium tracking-wide bg-warm-white border border-latte text-roasted uppercase">
                      💼 {type}
                    </span>
                  </div>
                  <p className="font-body text-mocha/80 text-sm leading-relaxed mb-6 flex-grow whitespace-pre-wrap">
                    {cleanDescription}
                  </p>
                </div>
                <div className="mt-auto">
                  <Link
                    href={vacancy.google_form_link}
                    target="_blank"
                    className="w-full inline-flex items-center justify-center px-6 py-2.5 bg-roasted hover:bg-dark-roast text-cream text-[11px] uppercase tracking-widest font-semibold rounded-full shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
                  >
                    Apply Now
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Premium Empty State Card matching Campaign page exactly */
        <div className="w-full max-w-[680px] mx-auto bg-warm-white border border-latte rounded-[24px] p-8 md:p-14 text-center shadow-sm animate-fade-up">
          {/* Symmetrical Briefcase Icon Illustration */}
          <div className="relative w-36 h-36 mx-auto mb-6 flex items-center justify-center">
            {/* Background circular highlight */}
            <div className="absolute w-24 h-24 rounded-full bg-cream/70" />
            
            {/* Decorative leaf branch wreath and briefcase SVG */}
            <svg viewBox="0 0 200 200" className="w-full h-full relative z-10">
              {/* Left Leaf Wreath */}
              <g className="text-roasted/40" fill="currentColor">
                <path d="M65,145 C55,135 50,115 52,95 C53,85 58,75 65,68" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M52,95 C45,95 40,98 42,103 C44,108 50,105 52,101 Z" />
                <path d="M55,115 C47,118 43,123 46,127 C49,131 54,125 56,121 Z" />
                <path d="M61,132 C54,138 52,144 56,147 C60,150 63,142 64,137 Z" />
                <path d="M51,80 C44,78 39,81 40,86 C41,91 47,90 49,86 Z" />
              </g>
              
              {/* Right Leaf Wreath */}
              <g className="text-roasted/40" fill="currentColor">
                <path d="M135,145 C145,135 150,115 148,95 C147,85 142,75 135,68" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M148,95 C155,95 160,98 158,103 C156,108 150,105 148,101 Z" />
                <path d="M145,115 C153,118 157,123 154,127 C151,131 146,125 144,121 Z" />
                <path d="M139,132 C146,138 148,144 144,147 C140,150 137,142 136,137 Z" />
                <path d="M149,80 C156,78 161,81 160,86 C159,91 153,90 151,86 Z" />
              </g>

              {/* Sparkles */}
              <g className="text-roasted/70" fill="currentColor">
                <path d="M58,60 L60,56 L62,60 L66,62 L62,64 L60,68 L58,64 L54,62 Z" />
                <path d="M138,62 L140,58 L142,62 L146,64 L142,66 L140,70 L138,66 L134,64 Z" opacity="0.8" />
              </g>
              
              {/* Briefcase (Center) */}
              <g transform="translate(68, 64)" className="text-roasted" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                {/* Briefcase Handle */}
                <path d="M22,18 V13 C22,11 24,9 26,9 H38 C40,9 42,11 42,13 V18" strokeWidth="3" />
                
                {/* Briefcase Body */}
                <rect x="6" y="18" width="52" height="36" rx="5" fill="currentColor" fillOpacity="0.1" />
                
                {/* Accent band/strap */}
                <path d="M6,30 L58,30" strokeWidth="3" />
                
                {/* Lock/Latch */}
                <rect x="25" y="27" width="14" height="9" rx="2" fill="currentColor" className="stroke-roasted" />
                <circle cx="32" cy="31.5" r="1.5" fill="currentColor" />
              </g>
            </svg>
          </div>

          <h2 className="font-heading font-medium text-2xl md:text-3xl text-espresso tracking-[0.06em] mb-4 uppercase">
            NO OPEN POSITIONS
          </h2>
          
          <p className="font-body text-[#6B5B52] text-sm md:text-[15px] leading-[1.6] max-w-md mx-auto mb-10">
            {"We're not hiring at the moment, but we're always excited to meet passionate people. Follow us on social media or check back soon for future opportunities."}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/menu"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-7 py-3.5 bg-roasted hover:bg-dark-roast text-cream text-[11px] uppercase tracking-widest font-semibold rounded-full shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
            >
              ☕ Browse Menu
            </Link>
            <Link
              href="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-7 py-3.5 border border-espresso/25 text-espresso hover:bg-espresso hover:text-cream text-[11px] uppercase tracking-widest font-semibold rounded-full hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
            >
              📞 Contact Us
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

