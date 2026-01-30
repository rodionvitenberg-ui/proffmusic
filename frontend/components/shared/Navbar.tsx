'use client';

import { useState, useEffect, useRef } from 'react'; // Добавили useRef
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Menu, X, ChevronDown } from 'lucide-react';
import { useCartStore, Category } from '@/lib/store';
import { useAuthStore } from '@/lib/auth';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { LayeredButton } from '@/components/ui/layered-button';

const NAV_LINKS = [
  { href: '/collections', label: 'Сборники' },
  { href: '/license', label: 'Лицензия' },
  { href: '/contacts', label: 'Контакты' },
  { href: '/about', label: 'О нас' },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const [categories, setCategories] = useState<Category[]>([]);
  const itemsCount = useCartStore((state) => state.items.length);
  const { isAuthenticated, user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  // --- ЛОГИКА СКРЫТИЯ ПРИ СКРОЛЛЕ ---
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Логика:
      // 1. Если скроллим ВНИЗ и прокрутили больше 50px -> Скрываем
      // 2. Если скроллим ВВЕРХ -> Показываем
      // 3. Если мы в самом верху (< 10px) -> Всегда показываем
      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  // ----------------------------------

  useEffect(() => {
    setMounted(true);
    const fetchCategories = async () => {
      try {
        const res = await api.get('/api/categories/');
        setCategories(res.data);
      } catch (e) {
        console.error('Не удалось загрузить категории меню', e);
      }
    };
    fetchCategories();
  }, []);

  return (
    <nav 
      className={cn(
        // Базовые стили
        "fixed top-0 left-0 right-0 z-[100] bg-secondary/90 backdrop-blur-md border-b border-white/10 transform-gpu will-change-transform transition-transform duration-300 ease-in-out",
        // Условие скрытия: Скрываем, только если isVisible=false И меню закрыто (!isOpen).
        // Если открыто мобильное меню, хедер должен быть виден всегда.
        (!isVisible && !isOpen) ? "-translate-y-full" : "translate-y-0"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* ЛОГОТИП */}
          <Link href="/" className="flex items-center h-full py-2 group shrink-0">
            {/* 1. Мобильный логотип */}
            <img 
              src="/logo2.png" 
              alt="ProffMusic Logo" 
              className="h-10 w-auto max-w-[150px] object-contain md:hidden transition-opacity hover:opacity-90" 
            />

            {/* 2. Десктопный логотип */}
            <img 
              src="/logo.png" 
              alt="ProffMusic Logo" 
              className="hidden md:block h-12 w-auto object-contain transition-opacity hover:opacity-90" 
            />
          </Link>

          {/* ДЕСКТОПНОЕ МЕНЮ */}
          <div className="hidden md:flex items-center gap-3 h-full">
            
            {/* Меню "Музыка" (со скелетоном) */}
            {!mounted ? (
              <div className="h-10 w-28 rounded-md border-2 border-white/10 bg-transparent animate-pulse" />
            ) : (
              <div className="relative group h-full flex items-center">
                <Link href="/music">
                  <LayeredButton
                    as="span"
                    variant="outline"
                    className={cn(
                      "border-2 border-white/20 hover:border-white text-base h-10 px-5 cursor-pointer transition-colors",
                      pathname.startsWith('/music') ? "bg-white text-black border-white" : "text-gray-200"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      Музыка <ChevronDown size={16} />
                    </span>
                  </LayeredButton>
                </Link>

                {/* Дропдаун */}
                <div className="absolute top-full left-0 w-64 bg-[#181818] border border-white/10 rounded-md shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 pt-2">
                  <div className="py-2 flex flex-col">
                    {categories.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/music?category__slug=${cat.slug}`}
                        className="block px-4 py-3 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors border-l-2 border-transparent hover:border-white"
                      >
                        {cat.name}
                      </Link>
                    ))}
                    <div className="border-t border-white/10 mt-2 pt-2">
                       <Link href="/music" className="block px-4 py-3 text-sm text-gray-300 hover:bg-white/10 hover:text-white font-medium border-l-2 border-transparent hover:border-white">
                          Смотреть всё →
                       </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Ссылки (со скелетонами) */}
            {!mounted ? (
              NAV_LINKS.map((link) => (
                <div key={link.href} className="h-10 w-24 rounded-md border-2 border-white/10 bg-transparent animate-pulse" />
              ))
            ) : (
              NAV_LINKS.map((link) => (
                <Link key={link.href} href={link.href}>
                  <LayeredButton
                    as="span"
                    variant="outline"
                    className={cn(
                      "border-2 border-white/20 hover:border-white text-base h-10 px-5 cursor-pointer transition-colors",
                      pathname === link.href ? "bg-white text-black border-white" : "text-gray-200"
                    )}
                  >
                    {link.label}
                  </LayeredButton>
                </Link>
              ))
            )}
          </div>

          {/* ПРАВАЯ ЧАСТЬ */}
          <div className="flex items-center gap-4 shrink-0">
            
            {/* Корзина */}
            <Link href="/cart" className="relative p-2 hover:bg-white/10 rounded-full transition group">
              <ShoppingBag className="text-gray-300 group-hover:text-white" size={24} />
              {mounted && itemsCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-black bg-white rounded-full animate-in fade-in zoom-in duration-300">
                  {itemsCount}
                </span>
              )}
            </Link>

            {/* Профиль / Вход (со скелетоном) */}
            {!mounted ? (
              <div className="hidden md:block h-10 w-20 rounded-md border-2 border-white/10 bg-transparent animate-pulse" />
            ) : (
              isAuthenticated ? (
                <Link 
                  href="/profile" 
                  className="hidden md:block w-10 h-10 rounded-full overflow-hidden border-2 border-white/20 hover:border-white transition shrink-0 animate-in fade-in duration-300"
                >
                  <Avatar variant="none" className="w-full h-full">
                    {user?.avatar ? (
                      <AvatarImage src={user.avatar} alt={user.email || 'Profile'} />
                    ) : (
                      <AvatarFallback className="bg-gray-700 text-white font-medium">
                        {user?.email?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </Link>
              ) : (
                <Link href="/login" className="hidden md:block">
                  <LayeredButton 
                    as="span" 
                    variant="outline"
                    size="sm" 
                    className={cn(
                      "h-10 px-6 text-sm cursor-pointer border-2 border-white/20 hover:border-white text-gray-200"
                    )}
                  >
                     Войти
                  </LayeredButton>
                </Link>
              )
            )}

            {/* КНОПКА БУРГЕРА */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-gray-300 hover:text-white focus:outline-none relative z-[1000]"
              aria-label="Открыть меню"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* МОБИЛЬНОЕ МЕНЮ (Выпадающая шторка) */}
      {isOpen && (
        <div className="md:hidden bg-[#0f0f0f] border-b border-white/10 animate-in slide-in-from-top-5 max-h-[80vh] overflow-y-auto">
          <div className="px-4 pt-4 pb-6 space-y-1">
            
            <Link
              href="/music"
              onClick={() => setIsOpen(false)}
              className={cn(
                "block px-3 py-3 rounded-md text-lg font-medium",
                pathname.startsWith('/music') ? "bg-white/10 text-white" : "text-gray-300 hover:bg-white/5 hover:text-white"
              )}
            >
              Музыка
            </Link>

            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "block px-3 py-3 rounded-md text-lg font-medium",
                  pathname === link.href ? "bg-white/10 text-white" : "text-gray-300 hover:bg-white/5 hover:text-white"
                )}
              >
                {link.label}
              </Link>
            ))}
            
            <div className="pt-4 mt-4 border-t border-white/10">
              {isAuthenticated ? (
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-3 rounded-md text-lg font-medium text-gray-300 hover:bg-white/5 hover:text-white"
                >
                  Профиль
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center px-4 py-3 rounded-md bg-white text-black font-bold hover:bg-gray-200 transition"
                >
                  Войти
                </Link>
              )}
            </div>

          </div>
        </div>
      )}
    </nav>
  );
}