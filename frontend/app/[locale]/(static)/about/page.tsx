'use client';

import { Music, ShieldCheck, Mic2, Heart } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export default function AboutPage() {
  const t = useTranslations('static');

  return (
    <div className="min-h-screen w-full px-2 md:px-0">
      <div className="mx-auto max-w-5xl min-h-screen bg-secondary border-x border-white/5 shadow-2xl pt-32 pb-20 px-6 md:px-16">

        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
            {t('aboutTitle')}
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            {t('aboutIntro')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <div className="bg-[#181818] p-8 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
            <Mic2 className="text-purple-400 mb-4" size={32} />
            <h3 className="text-xl font-bold text-white mb-3">{t('noAi')}</h3>
            <p className="text-gray-400 leading-relaxed">
              {t('noAiDesc')}
            </p>
          </div>

          <div className="bg-[#181818] p-8 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
            <ShieldCheck className="text-green-400 mb-4" size={32} />
            <h3 className="text-xl font-bold text-white mb-3">{t('safe')}</h3>
            <p className="text-gray-400 leading-relaxed">
              {t('safeDesc')}
            </p>
          </div>
        </div>

        <div className="prose prose-invert prose-lg max-w-none mb-20">
          <h2 className="text-3xl font-bold text-white mb-6">{t('philosophy')}</h2>
          <p className="text-gray-300">{t('philosophy1')}</p>
          <p className="text-gray-300">{t('philosophy2')}</p>
        </div>

        <div className="border-t border-white/10 pt-16 mb-16">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">{t('suitedFor')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-white/5 rounded-lg text-white font-medium">{t('cinema')}</div>
            <div className="p-4 bg-white/5 rounded-lg text-white font-medium">{t('youtubeBlogs')}</div>
            <div className="p-4 bg-white/5 rounded-lg text-white font-medium">{t('advertising')}</div>
            <div className="p-4 bg-white/5 rounded-lg text-white font-medium">{t('gaming')}</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 rounded-2xl p-10 text-center border border-white/10 relative overflow-hidden">
          <div className="relative z-10">
            <Heart className="mx-auto text-white mb-4" size={40} />
            <h2 className="text-3xl font-bold text-white mb-4">{t('findYourSound')}</h2>
            <p className="text-gray-300 mb-8 max-w-lg mx-auto">
              {t('ctaDesc')}
            </p>
            <Link href="/music">
              <Button size="lg" className="bg-white text-black hover:bg-gray-200 font-bold px-8">
                <Music className="mr-2" size={18} />
                {t('goToLibrary')}
              </Button>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}