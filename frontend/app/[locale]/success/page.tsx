'use client';

import { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export default function SuccessPage() {
  const clearCart = useCartStore((state) => state.clearCart);
  const t = useTranslations('success');

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-500">
        <CheckCircle size={40} className="text-green-500" />
      </div>

      <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{t('title')}</h1>

      <p className="text-lg text-gray-300 max-w-md mx-auto mb-8">
        {t('description')}
      </p>

      <div className="p-4 bg-[#181818] rounded-lg border border-white/10 max-w-sm mx-auto mb-8">
        <p className="text-sm text-gray-400">
          {t('spamNote')}
        </p>
      </div>

      <Link href="/">
        <Button size="lg" variant="outline">{t('backToMusic')}</Button>
      </Link>
    </div>
  );
}