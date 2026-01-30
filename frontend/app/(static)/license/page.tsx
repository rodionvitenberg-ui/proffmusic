'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Check, X, FileText, AlertCircle, HelpCircle, ShieldCheck } from 'lucide-react';

export default function LicensePage() {
  return (
    // ВНЕШНИЙ КОНТЕЙНЕР
    <div className="min-h-screen w-full px-2 md:px-0">
      
      {/* ВНУТРЕННИЙ КОНТЕЙНЕР ("ПОДФОН") */}
      <div className="mx-auto max-w-5xl min-h-screen bg-secondary border-x border-white/5 shadow-2xl pt-20 pb-20 px-6 md:px-16">
        
        {/* ЗАГОЛОВОК */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
            Одна лицензия.<br />
            Безграничные возможности.
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Мы упростили всё до предела. Покупая трек на ProffMusic, вы получаете пожизненное право 
            использовать его в своих проектах. Никаких скрытых платежей и сложных условий.
          </p>
        </div>

        {/* ГЛАВНЫЕ ПЛЮСЫ (Карточки) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
             <div className="bg-[#181818] p-6 rounded-xl border border-white/5">
                <h3 className="font-bold text-white mb-2 text-lg">YouTube Монетизация</h3>
                <p className="text-gray-400 text-sm">
                    Ваши видео не получат страйков. Вы можете спокойно включать монетизацию и получать доход с рекламы.
                </p>
             </div>
             <div className="bg-[#181818] p-6 rounded-xl border border-white/5">
                <h3 className="font-bold text-white mb-2 text-lg">Пожизненные права</h3>
                <p className="text-gray-400 text-sm">
                    Оплатили один раз — используете навсегда. Даже если вы удалите аккаунт или мы закроемся.
                </p>
             </div>
             <div className="bg-[#181818] p-6 rounded-xl border border-white/5">
                <h3 className="font-bold text-white mb-2 text-lg">Для любых платформ</h3>
                <p className="text-gray-400 text-sm">
                    Instagram, TikTok, Facebook, Twitch, ТВ, Кинотеатры. Ограничений по площадкам нет.
                </p>
             </div>
        </div>

        {/* СПИСКИ (МОЖНО / НЕЛЬЗЯ) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
            
            {/* ЧТО МОЖНО */}
            <div>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                        <Check size={20} strokeWidth={3} />
                    </span>
                    Разрешено
                </h2>
                <ul className="space-y-4">
                    {[
                        "Использование в личных и коммерческих видео.",
                        "Использование в рекламе (Таргет, ТВ, Радио).",
                        "Подкасты, аудиокниги и медитации.",
                        "Фильмы, сериалы и документалистика.",
                        "Фриланс (создание видео для клиентов).",
                        "Игры и мобильные приложения.",
                    ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-gray-300">
                            <Check size={18} className="text-green-500 mt-1 shrink-0" />
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* ЧТО НЕЛЬЗЯ */}
            <div>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-400">
                        <X size={20} strokeWidth={3} />
                    </span>
                    Запрещено
                </h2>
                <ul className="space-y-4">
                    {[
                        "Заявлять авторство на музыку (вы покупаете право использования, а не авторство).",
                        "Загружать треки в системы Content ID (это блокирует других пользователей).",
                        "Перепродавать музыку в чистом виде (на дисках, стоках).",
                        "Создавать ремиксы и выдавать их за свои оригинальные работы.",
                        "Использовать в продуктах, где музыка является основным товаром (например, музыкальные игрушки без лицензии Extended).",
                    ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-gray-300">
                            <X size={18} className="text-red-500 mt-1 shrink-0" />
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>

        {/* FAQ / ВАЖНОЕ */}
        <div className="bg-[#181818] border border-white/5 rounded-2xl p-8 mb-16">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <AlertCircle className="text-yellow-500" />
                Важное примечание про Content ID
            </h2>
            <div className="text-gray-300 space-y-4 text-sm leading-relaxed">
                <p>
                    ProffMusic гарантирует, что все треки в нашей библиотеке <strong>не зарегистрированы в системе Content ID</strong>. 
                    Это значит, что вы не получите автоматических жалоб от YouTube.
                </p>
                <p>
                    Однако, мы строго запрещаем нашим пользователям регистрировать свои видео с нашей музыкой в системе Content ID. 
                    Если вы это сделаете, вы нарушите права других покупателей. Нарушение этого правила влечет за собой аннулирование лицензии.
                </p>
            </div>
        </div>

        {/* КОНТАКТЫ */}
        <div className="flex flex-col md:flex-row items-center justify-left gap-6 border-t border-white/10 pt-10">
            <div>
                <h3 className="text-white font-bold mb-1">Остались вопросы?</h3>
                <p className="text-gray-500 text-sm">
                    Напишите нам, если ваш проект требует особых условий.
                </p>
            </div>
            <div className="flex gap-4">
                <Link href="/contacts">
                    <Button variant="outline" className="border-white/10 text-white hover:bg-white hover:text-black">
                        <HelpCircle size={16} className="mr-2" />
                        Связаться с нами
                    </Button>
                </Link>
            </div>
        </div>

      </div>
    </div>
  );
}