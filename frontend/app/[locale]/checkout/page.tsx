'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/lib/store';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Loader2, Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';

export default function CheckoutPage() {
  const router = useRouter();
  const { items } = useCartStore();
  const t = useTranslations('checkout');

  const [email, setEmail] = useState('');
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
    setIsLoading(true);

    try {
      const payload = {
        email,
        items: items.map(item => ({
          type: item.type,
          id: item.id
        }))
      };

      const res = await api.post('/api/orders/checkout/', payload);

      if (res.data.payment_url) {
        window.location.href = res.data.payment_url;
      } else {
        setError(t('errorServer'));
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || t('errorCreating'));
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-[#181818] p-8 rounded-xl border border-white/5 shadow-2xl">

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
          <p className="text-gray-400 text-sm mt-2">
            {t('totalToPay')} <span className="text-green-400 font-bold">{total.toFixed(2)} ₽</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              {t('email')} <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder={t('emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0f0f0f] border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-white/20 focus:border-white outline-none transition"
            />
            <p className="text-xs text-gray-500 mt-1">
              {t('emailHint')}
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full py-4 text-base bg-green-500 hover:bg-green-400 text-white transition-all"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin" size={20} /> {t('processing')}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Lock size={18} /> {t('completePurchase')} • {total.toFixed(2)} ₽
              </span>
            )}
          </Button>

          <p className="text-xs text-center text-gray-500">
            {t('mockPayment')}
          </p>
        </form>
      </div>
    </div>
  );
}