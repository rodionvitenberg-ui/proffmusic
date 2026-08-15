'use client';

import { useEffect, useState } from 'react';
import { Trash2, ArrowRight, Music } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { formatPrice } from '@/lib/price';

export default function CartPage() {
  const { items, removeFromCart } = useCartStore();
  const t = useTranslations('cart');
  const c = useTranslations('common');

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    useCartStore.persist.rehydrate();
    setMounted(true);
  }, []);

  const total = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="min-h-screen w-full px-2 md:px-0">
      <div className="mx-auto max-w-5xl min-h-screen bg-secondary border-x border-white/5 shadow-2xl pt-28 pb-12 px-6 md:px-10">

        {!mounted ? (
          <div className="flex h-[50vh] items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center h-[60vh]">
            <div className="w-20 h-20 bg-[#181818] rounded-full flex items-center justify-center mb-6 border border-white/5 shadow-inner">
              <Music size={32} className="text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">{t('emptyTitle')}</h1>
            <p className="text-gray-400 mb-8 max-w-md">
              {t('emptyDescription')}
            </p>
            <Link href="/music">
              <Button size="lg" className="px-8">{t('browseMusic')}</Button>
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-white mb-8">{t('title')}</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-4">
                {items.map((item) => (
                  <div
                    key={item.cartId}
                    className="flex items-center gap-4 bg-[#181818] p-4 rounded-lg border border-white/5 shadow-sm hover:border-white/10 transition"
                  >
                    <img
                      src={item.image || '/placeholder.jpg'}
                      alt={item.title}
                      className="w-16 h-16 object-cover rounded bg-gray-700 shadow-sm"
                    />

                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium truncate pr-2">{item.title}</h3>
                      <p className="text-sm text-gray-400">
                        {item.type === 'collection' ? t('collection') : t('track')}
                      </p>
                    </div>

                    <div className="text-right flex flex-col items-end gap-2 shrink-0">
                      <div className="text-foreground font-bold tabular-nums">{formatPrice(item.price)}</div>
                      <button
                        onClick={() => removeFromCart(item.id, item.type)}
                        className="text-gray-500 hover:text-red-400 transition flex items-center gap-1 text-sm group"
                        title={t('remove')}
                      >
                        <Trash2 size={16} className="group-hover:scale-110 transition-transform" />
                        <span className="hidden sm:inline">{t('remove')}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="md:col-span-1">
                <div className="bg-[#181818] p-6 rounded-xl border border-white/5 sticky top-28 shadow-lg">
                  <h2 className="text-xl font-bold text-white mb-4">{t('orderDetails')}</h2>

                  <div className="flex justify-between items-center mb-6 pb-6 border-b border-white/10">
                    <span className="text-gray-400">{t('items')}</span>
                    <span className="text-foreground font-medium tabular-nums">{formatPrice(total)}</span>
                  </div>

                  <div className="flex justify-between items-center mb-8">
                    <span className="text-lg font-bold text-white">{t('totalToPay')}</span>
                    <span className="text-2xl font-bold text-foreground tabular-nums">{formatPrice(total)}</span>
                  </div>

                  <Link href="/checkout" className="block w-full">
                    <Button size="lg" className="hover:bg-white hover:text-black w-full transition-colors font-bold">
                      {t('checkout')}
                      <ArrowRight size={18} className="ml-2" />
                    </Button>
                  </Link>

                  <p className="text-[10px] text-center text-gray-500 mt-4 leading-tight">
                    {t('licenseAgreement')} <Link href="/license" className="underline hover:text-gray-300">{t('licenseHref') || c('proffmusic')}</Link>
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}