'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trash2, ArrowRight, Music } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { Button } from '@/components/ui/Button'; // Убедись, что путь правильный (button с маленькой)

export default function CartPage() {
  const { items, removeFromCart } = useCartStore();
  
  // Хак для гидратации (Zustand persist):
  // Мы ждем, пока компонент смонтируется на клиенте, прежде чем рендерить содержимое корзины.
  // Это предотвращает расхождение HTML между сервером и клиентом.
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    // Принудительно запускаем регидрацию хранилища, если нужно, 
    // но обычно useEffect + mounted флага достаточно.
    useCartStore.persist.rehydrate();
    setMounted(true);
  }, []);

  if (!mounted) {
    // Пока не смонтировались (SSR), можно вернуть лоадер или пустой div
    return <div className="min-h-screen bg-[#0f0f0f]" />; 
  }

  // Считаем сумму
  const total = items.reduce((sum, item) => sum + item.price, 0);

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 bg-[#0f0f0f]">
        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-6">
          <Music size={32} className="text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Корзина пуста</h1>
        <p className="text-gray-400 mb-8">Вы еще не добавили ни одного трека.</p>
        <Link href="/">
          <Button size="lg">Перейти в каталог</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 min-h-screen">
      <h1 className="text-3xl font-bold text-white mb-8">Ваша корзина</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Список товаров */}
        <div className="md:col-span-2 space-y-4">
          {items.map((item) => (
            <div 
              key={item.cartId} // Используем уникальный сгенерированный ID
              className="flex items-center gap-4 bg-[#181818] p-4 rounded-lg border border-white/5"
            >
              <img 
                src={item.image || '/placeholder.jpg'} 
                alt={item.title} 
                className="w-16 h-16 object-cover rounded bg-gray-700"
              />
              
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium truncate">{item.title}</h3>
                <p className="text-sm text-gray-400">
                  {item.type === 'collection' ? 'Сборник' : 'Трек'}
                </p>
              </div>

              <div className="text-right flex flex-col items-end gap-2">
                <div className="text-white font-bold">{item.price} ₽</div>
                <button 
                  onClick={() => removeFromCart(item.id, item.type)}
                  className="text-gray-500 hover:text-red-400 transition flex items-center gap-1 text-sm"
                  title="Удалить"
                >
                  <Trash2 size={16} /> <span className="hidden sm:inline">Удалить</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Итого и кнопка */}
        <div className="md:col-span-1">
          <div className="bg-[#181818] p-6 rounded-lg border border-white/5 sticky top-24">
            <h2 className="text-xl font-bold text-white mb-4">Итого</h2>
            
            <div className="flex justify-between items-center mb-6 pb-6 border-b border-white/10">
              <span className="text-gray-400">Товары ({items.length})</span>
              <span className="text-white font-medium">{total.toFixed(2)} ₽</span>
            </div>

            <div className="flex justify-between items-center mb-8">
              <span className="text-lg font-bold text-white">К оплате</span>
              <span className="text-2xl font-bold text-green-400">{total.toFixed(2)} ₽</span>
            </div>

            <Link href="/checkout" className="block w-full">
              <Button size="lg" className="w-full">
                Оформить заказ
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>
            
            <p className="text-xs text-center text-gray-500 mt-4">
              Нажимая кнопку, вы соглашаетесь с условиями лицензии.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}