'use client';

import { Check, X, AlertCircle, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export default function LicensePage() {
  const t = useTranslations('license');

  return (
    <div className="min-h-screen w-full px-2 md:px-0">
      <div className="mx-auto max-w-5xl min-h-screen bg-secondary border-x border-white/5 shadow-2xl pt-20 pb-20 px-6 md:px-16">

        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
            {t('title1')}<br />
            {t('title2')}
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            {t('intro')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          <div className="bg-[#181818] p-6 rounded-xl border border-white/5">
            <h3 className="font-bold text-white mb-2 text-lg">{t('monetizationTitle')}</h3>
            <p className="text-gray-400 text-sm">{t('monetizationDesc')}</p>
          </div>
          <div className="bg-[#181818] p-6 rounded-xl border border-white/5">
            <h3 className="font-bold text-white mb-2 text-lg">{t('lifetimeTitle')}</h3>
            <p className="text-gray-400 text-sm">{t('lifetimeDesc')}</p>
          </div>
          <div className="bg-[#181818] p-6 rounded-xl border border-white/5">
            <h3 className="font-bold text-white mb-2 text-lg">{t('platformsTitle')}</h3>
            <p className="text-gray-400 text-sm">{t('platformsDesc')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                <Check size={20} strokeWidth={3} />
              </span>
              {t('allowed')}
            </h2>
            <ul className="space-y-4">
              {(t.raw('allowedList') as string[]).map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-300">
                  <Check size={18} className="text-green-500 mt-1 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-400">
                <X size={20} strokeWidth={3} />
              </span>
              {t('notAllowed')}
            </h2>
            <ul className="space-y-4">
              {(t.raw('notAllowedList') as string[]).map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-300">
                  <X size={18} className="text-red-500 mt-1 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-[#181818] border border-white/5 rounded-2xl p-8 mb-16">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <AlertCircle className="text-yellow-500" />
            {t('contentIdTitle')}
          </h2>
          <div className="text-gray-300 space-y-4 text-sm leading-relaxed">
            <p>{t('contentId1')}</p>
            <p>{t('contentId2')}</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-left gap-6 border-t border-white/10 pt-10">
          <div>
            <h3 className="text-white font-bold mb-1">{t('questions')}</h3>
            <p className="text-gray-500 text-sm">{t('questionsDesc')}</p>
          </div>
          <div className="flex gap-4">
            <Link href="/contacts">
              <Button variant="outline" className="border-white/10 text-white hover:bg-white hover:text-black">
                <HelpCircle size={16} className="mr-2" />
                {t('contactUs')}
              </Button>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}