'use client';

import { useState, useEffect } from 'react';
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

  useEffect(() => {
    setMounted(true);
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories/');
        setCategories(res.data);
      } catch (e) {
        console.error('Не удалось загрузить категории меню', e);
      }
    };
    fetchCategories();
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-secondary backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* ЛОГОТИП */}
          <Link href="/" className="flex items-center h-full py-2 group shrink-0">
            <img 
              src="/logo.png" 
              alt="ProffMusic Logo" 
              className="h-12 w-auto object-contain transition-opacity hover:opacity-90" 
            />
          </Link>

          {/* ДЕСКТОПНОЕ МЕНЮ */}
          <div className="hidden md:flex items-center gap-3 h-full">
            
            {/* Меню "Музыка" */}
            <div className="relative group h-full flex items-center">
              <Link href="/music">
                <LayeredButton
                  as="span"
                  variant="outline"
                  className={cn(
                    // Единый стиль границ для всех кнопок
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
                     <Link href="/music" className="block px-4 py-3 text-sm text-gray-300 hover:text-white-300 font-medium hover:bg-white/5">
                        Смотреть всё →
                     </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Ссылки (Сборники, Лицензия, Контакты, О нас) */}
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href}>
                <LayeredButton
                  as="span"
                  variant="outline"
                  className={cn(
                    // Те же самые классы границ, что и у кнопки "Музыка"
                    "border-2 border-white/20 hover:border-white text-base h-10 px-5 cursor-pointer transition-colors",
                    pathname === link.href ? "bg-white text-black border-white" : "text-gray-200"
                  )}
                >
                  {link.label}
                </LayeredButton>
              </Link>
            ))}
          </div>

          {/* ПРАВАЯ ЧАСТЬ */}
          <div className="flex items-center gap-4">
            
            <Link href="/cart" className="relative p-2 hover:bg-white/10 rounded-full transition group">
              <ShoppingBag className="text-gray-300 group-hover:text-white" size={24} />
              {mounted && itemsCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-black bg-white rounded-full">
                  {itemsCount}
                </span>
              )}
            </Link>

            {mounted && (
              isAuthenticated ? (
                <Link href="/profile" className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20 hover:border-white transition block shrink-0">
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
                    variant="outline" // <-- ИСПРАВЛЕНО: теперь outline (прозрачная)
                    size="sm" 
                    className={cn(
                      // <-- ИСПРАВЛЕНО: добавлены те же классы границ
                      "h-10 px-6 text-sm cursor-pointer border-2 border-white/20 hover:border-white text-gray-200"
                    )}
                  >
                     Войти
                  </LayeredButton>
                </Link>
              )
            )}

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-gray-300 hover:text-white"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* МОБИЛЬНОЕ МЕНЮ */}
      {isOpen && (
        <div className="md:hidden bg-[#0f0f0f] border-b border-white/10 animate-in slide-in-from-top-5 max-h-[80vh] overflow-y-auto">
          <div className="px-4 pt-4 pb-6 space-y-2">
            <div className="pb-2 border-b border-white/10 mb-2">
              <p className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Категории
              </p>
              {categories.map((cat) => (
                 <Link
                   key={cat.slug}
                   href={`/music?category__slug=${cat.slug}`}
                   onClick={() => setIsOpen(false)}
                   className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-white/10 hover:text-white pl-6"
                 >
                   {cat.name}
                 </Link>
              ))}
            </div>

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
            
            {!isAuthenticated && (
               <div className="pt-4 mt-4 border-t border-white/10">
                 <Link
                   href="/login"
                   onClick={() => setIsOpen(false)}
                   className="block w-full text-center px-4 py-3 rounded-md bg-white text-black font-bold hover:bg-gray-200 transition"
                 >
                   Войти
                 </Link>
               </div>
            )}
            
             {isAuthenticated && (
               <Link
                 href="/profile"
                 onClick={() => setIsOpen(false)}
                 className="flex items-center gap-3 px-3 py-3 mt-4 rounded-md bg-white/5 hover:bg-white/10"
               >
                 <span className="w-8 h-8 rounded-full overflow-hidden border border-white/20 bg-gray-700 flex items-center justify-center text-xs font-bold text-white">
                    {user?.avatar ? (
                       <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                       user?.email?.[0]?.toUpperCase() || 'U'
                    )}
                 </span>
                 <span className="text-white font-medium">Профиль</span>
               </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}