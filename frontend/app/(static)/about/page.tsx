'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Music, ShieldCheck, Mic2, Heart } from 'lucide-react';

export default function AboutPage() {
  return (
    // ВНЕШНИЙ КОНТЕЙНЕР (Прозрачный, на всю высоту)
    <div className="min-h-screen w-full px-2 md:px-0">
      
      {/* ВНУТРЕННИЙ КОНТЕЙНЕР ("ПОДФОН" - Полоса) */}
      <div className="mx-auto max-w-5xl min-h-screen bg-secondary border-x border-white/5 shadow-2xl pt-32 pb-20 px-6 md:px-16">
        
        {/* Заголовок и Вступление */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
            ProffMusic
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Бутик авторской музыки для профессионального видеопродакшна. 
            Мы создаем звук, который дышит, чувствует и усиливает ваши истории.
          </p>
        </div>

        {/* Блок преимуществ (Сетка) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            
            {/* Карточка 1: Живой звук */}
            <div className="bg-[#181818] p-8 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                <Mic2 className="text-purple-400 mb-4" size={32} />
                <h3 className="text-xl font-bold text-white mb-3">Никакого AI. Только люди.</h3>
                <p className="text-gray-400 leading-relaxed">
                    Мы принципиально не используем нейросети для генерации музыки. 
                    Каждый трек в нашей библиотеке написан живым композитором, сыгран на реальных инструментах 
                    и сведен профессиональным звукорежиссером. Мы верим, что эмоции может передать только человек.
                </p>
            </div>

            {/* Карточка 2: Юридическая чистота */}
            <div className="bg-[#181818] p-8 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                <ShieldCheck className="text-green-400 mb-4" size={32} />
                <h3 className="text-xl font-bold text-white mb-3">100% Безопасно.</h3>
                <p className="text-gray-400 leading-relaxed">
                    Никаких страйков и Content ID. Мы обладаем исключительными правами на всю музыку в каталоге. 
                    Покупая лицензию, вы получаете официальный документ, который защищает ваш проект на YouTube, 
                    в кино и на ТВ.
                </p>
            </div>
        </div>

        {/* Текстовый блок: История */}
        <div className="prose prose-invert prose-lg max-w-none mb-20">
            <h2 className="text-3xl font-bold text-white mb-6">Наша философия</h2>
            <p className="text-gray-300">
                В эпоху фаст-фуд контента мы выбрали другой путь. Мы создаем музыку не для алгоритмов, а для режиссеров, 
                которые ценят детали. Мы знаем, как сложно найти трек, который не звучит как "стоковая заглушка".
            </p>
            <p className="text-gray-300">
                ProffMusic начинался как закрытое сообщество композиторов, работающих для киноиндустрии. 
                Сегодня мы открыли свои архивы для всех креаторов. Здесь вы не найдете миллионов однотипных треков. 
                Вместо этого мы предлагаем тщательно отобранную коллекцию, где каждое произведение имеет свой характер.
            </p>
        </div>

        {/* Блок: Кому это нужно? */}
        <div className="border-t border-white/10 pt-16 mb-16">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">Идеально подходит для</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-4 bg-white/5 rounded-lg text-white font-medium">Кино и Трейлеров</div>
                <div className="p-4 bg-white/5 rounded-lg text-white font-medium">YouTube Блогов</div>
                <div className="p-4 bg-white/5 rounded-lg text-white font-medium">Рекламных роликов</div>
                <div className="p-4 bg-white/5 rounded-lg text-white font-medium">Игровой индустрии</div>
            </div>
        </div>

        {/* CTA (Призыв к действию) */}
        <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 rounded-2xl p-10 text-center border border-white/10 relative overflow-hidden">
            <div className="relative z-10">
                <Heart className="mx-auto text-white mb-4" size={40} />
                <h2 className="text-3xl font-bold text-white mb-4">Найдите свой звук</h2>
                <p className="text-gray-300 mb-8 max-w-lg mx-auto">
                    Послушайте нашу коллекцию и убедитесь в качестве сами. Демо-версии доступны бесплатно.
                </p>
                <Link href="/music">
                    <Button size="lg" className="bg-white text-black hover:bg-gray-200 font-bold px-8">
                        <Music className="mr-2" size={18} />
                        Перейти в каталог
                    </Button>
                </Link>
            </div>
        </div>

      </div>
    </div>
  );
}