import { Hero } from '@/components/sections/Hero';
import { NewReleases } from '@/components/sections/NewReleases';
import { LibrarySection } from '@/components/sections/LibrarySection';
import { setRequestLocale } from 'next-intl/server';

type Params = Promise<{ locale: string }>;

export default async function HomePage({ params }: { params: Params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="relative min-h-screen bg-background">
      <div className="film-grain" aria-hidden />
      <div className="relative z-10">
        <Hero />
        <NewReleases />
        <LibrarySection />
      </div>
    </div>
  );
}
