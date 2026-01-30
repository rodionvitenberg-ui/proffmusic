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
  const [name, setName] = useState(''); // Опционально по ТЗ
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Если корзина пуста, редиректим на главную
  useEffect(() => {
    // Небольшая задержка для гидратации
    const timer = setTimeout(() => {
        if (items.length === 0) router.push('/');
    }, 500);
    return () => clearTimeout(timer);
  }, [items, router]);

  const total = items.reduce((sum, item) => sum + parseFloat(item.price), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 1. Формируем данные для бэкенда
      // Наш бэкенд ждет items: [{type: 'track', id: 1}, ...]
      const payload = {
        email,
        items: items.map(item => ({
          type: item.type,
          id: item.id
        }))
      };

      // 2. Отправляем запрос
      const res = await api.post('/orders/checkout/', payload);
      
      // 3. Получаем payment_url и переходим
      if (res.data.payment_url) {
        window.location.href = res.data.payment_url;
      } else {
        setError('Ошибка: Сервер не вернул ссылку на оплату');
      }

    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Произошла ошибка при создании заказа');
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-[#181818] p-8 rounded-xl border border-white/5 shadow-2xl">
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Оформление заказа</h1>
          <p className="text-gray-400 text-sm mt-2">
            Сумма к оплате: <span className="text-green-400 font-bold">{total.toFixed(2)} ₽</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Email (Обязательно) */}
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
              Сюда придет ссылка на скачивание файлов.
            </p>
          </div>

          {/* Имя (Опционально) */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
              Имя (необязательно)
            </label>
            <input
              id="name"
              type="text"
              placeholder="Как к вам обращаться?"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0f0f0f] border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-white/20 focus:border-white outline-none transition"
            />
          </div>

          {/* Ошибка */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {/* Кнопка Оплатить */}
          <Button 
            type="submit" 
            size="lg" 
            className="w-full py-4 text-base hover:bg-white hover:text-blackrelative overflow-hidden"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin" size={20} /> Обработка...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Lock size={18} /> Оплатить {total.toFixed(2)} ₽
              </span>
            )}
          </Button>

          <p className="text-xs text-center text-gray-500 flex items-center justify-center gap-1">
            <Lock size={12} /> Безопасная оплата через ЮKassa
          </p>
        </form>
      </div>
    </div>
  );
}