'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/lib/store';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Loader2, CreditCard } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { formatPrice } from '@/lib/price';
import { cn } from '@/lib/utils';

type Provider = 'lemonsqueezy' | 'btcpay';

export default function CheckoutPage() {
  const router = useRouter();
  const { items } = useCartStore();
  const t = useTranslations('checkout');

  const [email, setEmail] = useState('');
  const [provider, setProvider] = useState<Provider>('lemonsqueezy');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      if (items.length === 0) router.push('/');
    }, 500);
    return () => clearTimeout(timer);
  }, [items, router]);

  const total = items.reduce((sum, item) => sum + item.price, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError(t('emailError'));
      return;
    }
    setIsLoading(true);

    try {
      const res = await api.post('/api/orders/checkout/', {
        email,
        provider,
        items: items.map((item) => ({ type: item.type, id: item.id })),
      });

      if (res.data.payment_url) {
        window.location.href = res.data.payment_url;
      } else {
        setError(t('errorCreating'));
      }
    } catch {
      setError(t('errorCreating'));
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-card p-8 shadow-[var(--shadow-border)]">
        <div className="mb-8 text-center">
          <h1 className="font-[family-name:var(--font-custom)] text-2xl text-foreground">
            {t('title')}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('totalToPay')}{' '}
            <span className="font-medium tabular-nums text-foreground">{formatPrice(total)}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-foreground">
              {t('email')}
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder={t('emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground outline-none transition-[box-shadow,border-color] duration-150 focus:ring-1 focus:ring-ring"
            />
            <p className="mt-1 text-xs text-muted-foreground">{t('emailHint')}</p>
            {error && (
              <p className="mt-2 text-sm text-destructive" role="alert">{error}</p>
            )}
          </div>

          <fieldset className="grid grid-cols-2 gap-3">
            <legend className="sr-only">{t('title')}</legend>
            <button
              type="button"
              onClick={() => setProvider('lemonsqueezy')}
              className={cn(
                'flex items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm transition-[background-color,color,box-shadow] duration-150 active:scale-[0.96]',
                provider === 'lemonsqueezy'
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border text-foreground hover:bg-muted'
              )}
            >
              <CreditCard size={16} />
              {t('payWithCard')}
            </button>
            <button
              type="button"
              onClick={() => setProvider('btcpay')}
              className={cn(
                'flex items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm transition-[background-color,color,box-shadow] duration-150 active:scale-[0.96]',
                provider === 'btcpay'
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border text-foreground hover:bg-muted'
              )}
            >
              {t('payWithBitcoin')}
            </button>
          </fieldset>

          <Button type="submit" size="lg" className="w-full py-4 text-base" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin" size={20} /> {t('processing')}
              </span>
            ) : (
              t('pay', { price: formatPrice(total) })
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            {provider === 'lemonsqueezy' ? t('redirectCard') : t('redirectBitcoin')}
          </p>
        </form>
      </div>
    </div>
  );
}
