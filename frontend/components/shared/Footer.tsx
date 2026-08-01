'use client';

import { Mail } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations('footer');
  const tc = useTranslations('common');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 bg-secondary border-t border-white/10 pt-16 pb-32 text-sm text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

          {/* 1. Лого и Описание */}
          <div className="space-y-2">
            <Link href="/" className="inline-block group">
              <img
                src="/logo.png"
                alt="ProffMusic Logo"
                className="h-12 w-auto object-contain opacity-90 group-hover:opacity-100 transition-opacity -ml-[9px]"
              />
            </Link>
            <p className="leading-relaxed">
              {t('description')}
            </p>
          </div>

          {/* 2. Категории */}
          <div>
            <h3 className="font-bold text-white mb-4">{t('music')}</h3>
            <ul className="space-y-2">
              <li><Link href="/music?category__slug=dlya-youtube" className="hover:text-white transition">{t('forYouTube')}</Link></li>
              <li><Link href="/music?category__slug=reklama-i-promo" className="hover:text-white transition">{t('advertising')}</Link></li>
              <li><Link href="/music?category__slug=kino" className="hover:text-white transition">{t('cinema')}</Link></li>
              <li><Link href="/music?category__slug=korporativ" className="hover:text-white transition">{t('corporate')}</Link></li>
              <li><Link href="/collections" className="text-green-400 hover:text-green-300 transition">{t('collections')}</Link></li>
            </ul>
          </div>

          {/* 3. Компания */}
          <div>
            <h3 className="font-bold text-white mb-4">{t('company')}</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="hover:text-white transition">{t('aboutUs')}</Link></li>
              <li><Link href="/license" className="hover:text-white transition">{t('license')}</Link></li>
              <li><Link href="/contacts" className="hover:text-white transition">{t('contacts')}</Link></li>
            </ul>
          </div>

          {/* 4. Контакты */}
          <div>
            <h3 className="font-bold text-white mb-2">{t('support')}</h3>
            <a href="mailto:shop@proffmusic.shop" className="flex items-center gap-2 hover:text-white transition">
              <Mail size={16} />shop@proffmusic.shop
            </a>
          </div>

        </div>

        {/* НИЖНЯЯ ПОЛОСА */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-center md:text-left">
            <p>{tc('allRights', { year: currentYear })}</p>
          </div>

          <a
            href="https://bussisart.space"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono text-gray-700 uppercase tracking-widest hover:text-gray-500 transition-colors cursor-pointer select-none"
            title={t('developedBy')}
          >
            busisart.space
          </a>
        </div>

      </div>
    </footer>
  );
}