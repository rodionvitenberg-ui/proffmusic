'use client';

import { Mail, MessageCircle, FileText, Phone } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function ContactsPage() {
  const t = useTranslations('static');

  return (
    <div className="min-h-screen w-full px-2 md:px-0">
      <div className="mx-auto max-w-5xl min-h-screen bg-secondary border-x border-white/5 shadow-2xl pt-32 pb-20 px-6 md:px-16">

        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
            {t('contactsTitle')}
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            {t('contactsIntro')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-[#181818] p-8 rounded-2xl border border-white/5 hover:border-green-500/30 transition-all group">
            <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center text-green-400 mb-6 group-hover:scale-110 transition-transform">
              <Mail size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{t('supportService')}</h3>
            <p className="text-gray-400 mb-6 text-sm">
              {t('supportDesc')}
            </p>
            <a
              href="mailto:shop@proffmusic.shop"
              className="text-2xl font-bold text-white hover:text-green-400 transition-colors break-all"
            >
              shop@proffmusic.shop
            </a>
          </div>

          <div className="bg-[#181818] p-8 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all group">
            <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
              <MessageCircle size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{t('telegram')}</h3>
            <p className="text-gray-400 mb-6 text-sm">
              {t('telegramDesc')}
            </p>
            <a
              href="#"
              className="text-2xl font-bold text-white hover:text-blue-400 transition-colors"
            >
              @proffmusic
            </a>
          </div>
        </div>

        <div className="bg-[#181818] rounded-2xl border border-white/5 p-8 md:p-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="text-gray-500" size={20} />
                <h3 className="text-lg font-bold text-white uppercase tracking-wider">{t('requisites')}</h3>
              </div>
              <p className="text-xl font-bold text-white">ProffMusic.</p>
            </div>

            <div className="hidden md:block w-px h-16 bg-white/10"></div>

            <div className="md:text-right">
              <div className="flex items-center gap-3 mb-2 md:justify-end">
                <div className="md:hidden"><Phone className="text-gray-500" size={18} /></div>
                <span className="text-sm text-gray-500 uppercase tracking-wider font-bold">{t('phone')}</span>
              </div>
              <a
                href="tel:+79258708299"
                className="text-2xl md:text-3xl font-bold text-white hover:text-white/70 transition-colors whitespace-nowrap"
              >
                +7 (925) 870-82-99
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}