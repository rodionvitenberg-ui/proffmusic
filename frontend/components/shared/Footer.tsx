'use client';

import Link from 'next/link';
import { Mail, Instagram, Youtube, Send } from 'lucide-react'; // Убрали Music из импорта

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 bg-secondary border-t border-white/10 pt-16 pb-32 text-sm text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* 1. Лого и Описание */}
          <div className="space-y-2">
            <Link href="/" className="inline-block group">
              {/* ЛОГОТИП */}
              {/* h-12 = размер логотипа. Меняйте это число (h-10, h-14, h-16), чтобы регулировать размер */}
              <img 
                src="/logo.png" 
                alt="ProffMusic Logo" 
                className="h-12 w-auto object-contain opacity-90 group-hover:opacity-100 transition-opacity -ml-[9px]" 
              />
            </Link>
            <p className="leading-relaxed">
              Профессиональная авторская музыка для ваших видео, рекламы и YouTube. 
              Без Content ID, с коммерческой лицензией.
            </p>
          </div>

          {/* 2. Категории */}
          <div>
            <h3 className="font-bold text-white mb-4">Музыка</h3>
            <ul className="space-y-2">
              <li><Link href="/music?category__slug=dlya-youtube" className="hover:text-white transition">Для YouTube</Link></li>
              <li><Link href="/music?category__slug=reklama-i-promo" className="hover:text-white transition">Реклама и промо</Link></li>
              <li><Link href="/music?category__slug=kino" className="hover:text-white transition">Кино и Трейлеры</Link></li>
              <li><Link href="/music?category__slug=korporativ" className="hover:text-white transition">Корпоративная</Link></li>
              <li><Link href="/collections" className="text-green-400 hover:text-green-300 transition">Сборники (Паки)</Link></li>
            </ul>
          </div>

          {/* 3. Компания */}
          <div>
            <h3 className="font-bold text-white mb-4">Компания</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="hover:text-white transition">О нас</Link></li>
              <li><Link href="/license" className="hover:text-white transition">Лицензия</Link></li>
              <li><Link href="/contacts" className="hover:text-white transition">Контакты</Link></li>
            </ul>
          </div>

          {/* 4. Контакты и Соцсети */}
          <div>
            <h3 className="font-bold text-white mb-2">Поддержка</h3>
            <a href="mailto:shop@proffmusic.ru" className="flex items-center gap-2 hover:text-white transition">
              <Mail size={16} />shop@proffmusic.ru
            </a>
          </div>

        </div>

        {/* НИЖНЯЯ ПОЛОСА (Изменено) */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* ЛЕВАЯ СТОРОНА: Копирайт + Ссылки */}
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-center md:text-left">
            <p>© {currentYear} ProffMusic.</p>
            <div className="flex gap-4 text-xs font-medium text-gray-500">
            </div>
          </div>

          {/* ПРАВАЯ СТОРОНА: Инициалы RV */}
          <div 
            className="text-xs font-mono text-gray-700 uppercase tracking-widest hover:text-gray-500 transition-colors cursor-default select-none"
            title="Developed by Rodion Vitenberg"
          >
             ikSoft
          </div>

        </div>

      </div>
    </footer>
  );
}