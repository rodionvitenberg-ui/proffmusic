'use client';

import { Button } from '@/components/ui/Button';
import { Music } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export function Hero() {
  const t = useTranslations('hero');
  const scrollToLibrary = () => {
    document.getElementById('library')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative flex h-[80vh] w-full items-center justify-center overflow-hidden">
      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center justify-center space-y-6 px-4 text-center md:space-y-8">
        <h1 className="font-[family-name:var(--font-custom)] text-4xl tracking-tight text-foreground sm:text-5xl md:text-7xl">
          <span className="block">{t('line1')}</span>
          <span className="block">{t('line2')}</span>
        </h1>

        <div className="mx-auto flex max-w-3xl flex-col items-center gap-2 text-base font-medium text-muted-foreground sm:text-lg md:text-xl">
          <p>{t('subtitle1')}</p>
          <p>{t('subtitle2')}</p>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 pt-6 sm:flex-row">
          <Button size="lg" onClick={scrollToLibrary} className="h-12 w-full px-8 text-base sm:w-auto">
            <Music size={20} />
            {t('listenToTracks')}
          </Button>
          <Link href="/about" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="h-12 w-full px-8 text-base">
              {t('aboutUs')}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
