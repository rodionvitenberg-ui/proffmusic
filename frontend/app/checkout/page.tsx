'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Loader2, Lock } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { items } = useCartStore();
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Если корзина пуста, редиректим на главную
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
        // Редиректим на страницу успеха (корзина очистится там)
        window.location.href = res.data.payment_url;
      } else {
        setError('Error: Server did not return a success link');
      }

    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'An error occurred while creating the order');
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-[#181818] p-8 rounded-xl border border-white/5 shadow-2xl">
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Checkout</h1>
          <p className="text-gray-400 text-sm mt-2">
            Total to Pay: <span className="text-green-400 font-bold">{total.toFixed(2)} ₽</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Email (Required) */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0f0f0f] border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-white/20 focus:border-white outline-none transition"
            />
            <p className="text-xs text-gray-500 mt-1">
              The download link will be sent to this email.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {/* Кнопка Оплатить */}
          <Button 
            type="submit" 
            size="lg" 
            className="w-full py-4 text-base bg-green-500 hover:bg-green-400 text-white transition-all"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin" size={20} /> Processing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Lock size={18} /> Complete Purchase • {total.toFixed(2)} ₽
              </span>
            )}
          </Button>

          <p className="text-xs text-center text-gray-500">
            Mock payment. No real money will be charged.
          </p>
        </form>
      </div>
    </div>
  );
}
