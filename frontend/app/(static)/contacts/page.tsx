'use client';

import Link from 'next/link';
import { Mail, MessageCircle, MapPin, Clock, FileText, ArrowRight } from 'lucide-react';
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
            Свяжитесь с нами
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            У вас возникли вопросы по лицензии, оплате или скачиванию? 
            Наша команда поддержки всегда на связи и готова помочь.
          </p>
        </div>

        {/* СЕТКА КОНТАКТОВ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            
            {/* Карточка: Email */}
            <div className="bg-[#181818] p-8 rounded-2xl border border-white/5 hover:border-green-500/30 transition-all group">
                <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center text-green-400 mb-6 group-hover:scale-110 transition-transform">
                    <Mail size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Служба поддержки</h3>
                <p className="text-gray-400 mb-6 text-sm">
                    Для решения технических вопросов и проблем с заказами. Отвечаем в течение 24 часов.
                </p>
                <a 
                    href="mailto:support@proffmusic.ru" 
                    className="text-2xl font-bold text-white hover:text-green-400 transition-colors break-all"
                >
                    support@proffmusic.ru
                </a>
            </div>

            {/* Карточка: Telegram / Мессенджеры */}
            <div className="bg-[#181818] p-8 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all group">
                <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                    <MessageCircle size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Telegram</h3>
                <p className="text-gray-400 mb-6 text-sm">
                    Быстрая связь с менеджером для обсуждения индивидуальных условий или партнерства.
                </p>
                <a 
                    href="#" 
                    className="text-2xl font-bold text-white hover:text-blue-400 transition-colors"
                >
                    @proffmusic_support
                </a>
            </div>
        </div>

        {/* ЮРИДИЧЕСКИЙ БЛОК (Реквизиты) */}
        <div className="bg-[#151515] rounded-xl p-8 border border-white/5 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
                <h3 className="text-lg font-bold text-white mb-1">Юридическая информация</h3>
                <p className="text-gray-500 text-sm">
                    Официальные реквизиты для контрагентов
                </p>
            </div>
            <div className="text-sm text-gray-400 text-right space-y-1">
                <p>ИП Иванов Иван Иванович</p>
                <p>ОГРНИП: 3123456789000</p>
                <p>ИНН: 770000000000</p>
            </div>
        </div>

      </div>
    </div>
  );
}