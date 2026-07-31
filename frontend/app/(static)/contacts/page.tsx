'use client';

import Link from 'next/link';
// Добавил 'Phone' в импорты
import { Mail, MessageCircle, MapPin, Clock, FileText, ArrowRight, Phone } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function ContactsPage() {
  return (
    // ВНЕШНИЙ КОНТЕЙНЕР
    <div className="min-h-screen w-full px-2 md:px-0">
      
      {/* ВНУТРЕННИЙ КОНТЕЙНЕР ("ПОДФОН") */}
      <div className="mx-auto max-w-5xl min-h-screen bg-secondary border-x border-white/5 shadow-2xl pt-32 pb-20 px-6 md:px-16">
        
        {/* ЗАГОЛОВОК */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
            Contact Us
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Do you have any questions about licensing, payment or downloading? 
            Our support team is always available and ready to help.
          </p>
        </div>

        {/* СЕТКА КОНТАКТОВ (Email и Telegram) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            
            {/* Карточка: Email */}
            <div className="bg-[#181818] p-8 rounded-2xl border border-white/5 hover:border-green-500/30 transition-all group">
                <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center text-green-400 mb-6 group-hover:scale-110 transition-transform">
                    <Mail size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Support Service</h3>
                <p className="text-gray-400 mb-6 text-sm">
                    For resolving technical questions and issues with orders. We respond within 24 hours.
                </p>
                <a 
                    href="mailto:shop@proffmusic.shop" 
                    className="text-2xl font-bold text-white hover:text-green-400 transition-colors break-all"
                >
                    shop@proffmusic.shop
                </a>
            </div>

            {/* Карточка: Telegram */}
            <div className="bg-[#181818] p-8 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all group">
                <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                    <MessageCircle size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Telegram</h3>
                <p className="text-gray-400 mb-6 text-sm">
                    Fast communication with a manager for discussing individual conditions or partnership.
                </p>
                <a 
                    href="#" 
                    className="text-2xl font-bold text-white hover:text-blue-400 transition-colors"
                >
                    @proffmusic
                </a>
            </div>
        </div>

        {/* НОВАЯ СЕКЦИЯ: РЕКВИЗИТЫ И ТЕЛЕФОН */}
        <div className="bg-[#181818] rounded-2xl border border-white/5 p-8 md:p-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                
                {/* Левая часть: Юридическая инфа */}
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                        <FileText className="text-gray-500" size={20} />
                        <h3 className="text-lg font-bold text-white uppercase tracking-wider">Requisites</h3>
                    </div>
                    
                    <div className="space-y-1">
                        <p className="text-xl font-bold text-white">John Doe.</p>
                        <div className="flex flex-col sm:flex-row gap-y-1 gap-x-6 text-gray-400 text-sm font-mono">
                            <span>773373839292</span>
                            <span>321774600117719</span>
                        </div>
                    </div>
                </div>

                {/* Разделитель (виден только на десктопе) */}
                <div className="hidden md:block w-px h-16 bg-white/10"></div>

                {/* Правая часть: Телефон */}
                <div className="md:text-right">
                    <div className="flex items-center gap-3 mb-2 md:justify-end">
                         {/* На мобилках иконка слева, на десктопе текст справа, но иконку можно оставить для стиля */}
                         <div className="md:hidden"><Phone className="text-gray-500" size={18} /></div>
                         <span className="text-sm text-gray-500 uppercase tracking-wider font-bold">Phone</span>
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