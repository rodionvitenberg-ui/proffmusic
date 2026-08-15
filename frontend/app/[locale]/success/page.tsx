'use client';

import { useEffect } from 'react';
import { Check } from 'lucide-react';
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
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex size-16 items-center justify-center rounded-full border border-border">
        <Check size={28} className="text-foreground" />
      </div>

      <h1 className="mb-4 font-[family-name:var(--font-custom)] text-3xl text-foreground md:text-4xl">
        {t('title')}
      </h1>

      <p className="mx-auto mb-8 max-w-md text-lg text-muted-foreground">
        {t('description')}
      </p>

      <div className="mb-8 max-w-sm rounded-lg bg-card p-4 shadow-[var(--shadow-border)]">
        <p className="text-sm text-muted-foreground">{t('spamNote')}</p>
      </div>

      <Link href="/music">
        <Button size="lg">{t('backToMusic')}</Button>
      </Link>
    </div>
  );
}
