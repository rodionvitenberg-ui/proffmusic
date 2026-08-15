'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useCartStore, Category } from '@/lib/store';
import { useAuthStore } from '@/lib/auth';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export function Navbar() {
  const t = useTranslations('navbar');
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const [categories, setCategories] = useState<Category[]>([]);
  const itemsCount = useCartStore((state) => state.items.length);
  const { isAuthenticated, user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
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

  useEffect(() => {
    setMounted(true);
    const fetchCategories = async () => {
      try {
        const res = await api.get('/api/categories/');
        setCategories(res.data);
      } catch (e) {
        console.error('Can not load menu categories', e);
      }
    };
    fetchCategories();
  }, []);

  const NAV_LINKS = [
    { href: '/music', key: 'music' },
    { href: '/collections', key: 'collections' },
    { href: '/license', key: 'license' },
    { href: '/contacts', key: 'contacts' },
    { href: '/about', key: 'about' },
  ];
  const locale = pathname.split('/')[1] || 'ru';
  const pathnameWithoutLocale = pathname.replace(/^\/(ru|en)/, '') || '/';

  const linkClass = (active: boolean) =>
    cn(
      'px-3 py-2 text-sm transition-colors duration-150',
      active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
    );

  return (
    <nav
      className={cn(
        'fixed top-0 right-0 left-0 z-[100] border-b border-border bg-background/90 backdrop-blur-md transition-transform duration-300 ease-in-out',
        !isVisible && !isOpen ? '-translate-y-full' : 'translate-y-0'
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="flex h-full shrink-0 items-center py-2">
            <img src="/logo2.png" alt="ProffMusic" className="h-10 w-auto max-w-[150px] object-contain md:hidden" />
            <img src="/logo.png" alt="ProffMusic" className="hidden h-12 w-auto object-contain md:block" />
          </Link>

          <div className="hidden h-full items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <div key={link.href} className="relative group flex h-full items-center">
                <Link
                  href={link.href}
                  className={linkClass(
                    link.href === '/music'
                      ? pathnameWithoutLocale.startsWith('/music')
                      : pathnameWithoutLocale === link.href
                  )}
                >
                  {t(link.key)}
                </Link>
                {link.href === '/music' && categories.length > 0 && (
                  <div className="invisible absolute top-full left-0 w-56 rounded-md bg-card py-2 opacity-0 shadow-[var(--shadow-border)] transition-[opacity,transform] duration-150 group-hover:visible group-hover:opacity-100">
                    {categories.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/music?category__slug=${cat.slug}`}
                        className="block px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex shrink-0 items-center gap-4">
            <div className="hidden items-center gap-1 md:flex">
              <Link href="/" locale="ru" className={cn('px-2 py-1 text-xs', locale === 'ru' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground')}>
                RU
              </Link>
              <Link href="/" locale="en" className={cn('px-2 py-1 text-xs', locale === 'en' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground')}>
                EN
              </Link>
            </div>

            <Link href="/cart" className="relative rounded-full p-2 hover:bg-muted">
              <ShoppingBag className="text-foreground" size={22} />
              {mounted && itemsCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                  {itemsCount}
                </span>
              )}
            </Link>

            {mounted && (
              isAuthenticated ? (
                <Link href="/profile" className="hidden size-9 overflow-hidden rounded-full outline outline-1 -outline-offset-1 outline-white/10 md:block">
                  <Avatar variant="none" className="h-full w-full">
                    {user?.avatar ? (
                      <AvatarImage src={user.avatar} alt={user.email || t('profile')} />
                    ) : (
                      <AvatarFallback className="bg-muted text-foreground">
                        {user?.email?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </Link>
              ) : (
                <Link href="/login" className={cn('hidden md:block', linkClass(false))}>
                  {t('signIn')}
                </Link>
              )
            )}

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-foreground md:hidden"
              aria-label={t('openMenu')}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="max-h-[80vh] overflow-y-auto border-b border-border bg-background md:hidden">
          <div className="space-y-1 px-4 pt-4 pb-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'block rounded-md px-3 py-3 text-lg',
                  pathnameWithoutLocale === link.href || (link.href === '/music' && pathnameWithoutLocale.startsWith('/music'))
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                )}
              >
                {t(link.key)}
              </Link>
            ))}
            <div className="mt-4 border-t border-border pt-4">
              {isAuthenticated ? (
                <Link href="/profile" onClick={() => setIsOpen(false)} className="block px-3 py-3 text-lg text-muted-foreground">
                  {t('profile')}
                </Link>
              ) : (
                <Link href="/login" onClick={() => setIsOpen(false)} className="block px-3 py-3 text-lg text-foreground">
                  {t('signIn')}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
