'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trash2, ArrowRight, Music } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';

export default function CartPage() {
  const { items, removeFromCart } = useCartStore();
  
  // Хак для гидратации (Zustand persist)
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    useCartStore.persist.rehydrate();
    setMounted(true);
  }, []);

  // Считаем сумму
  const total = items.reduce((sum, item) => sum + item.price, 0);

  // --- РЕНДЕР ---
  return (
    // 1. ВНЕШНИЙ КОНТЕЙНЕР (Прозрачный, на всю высоту)
    <div className="min-h-screen w-full px-2 md:px-0">
      
      {/* 2. "ПОДФОН" (ВНУТРЕННИЙ КОНТЕЙНЕР - ПОЛОСА) */}
      <div className="mx-auto max-w-5xl min-h-screen bg-secondary border-x border-white/5 shadow-2xl pt-28 pb-12 px-6 md:px-10">
        
        {/* А. Состояние загрузки (Пока не смонтировано) */}
        {!mounted ? (
           <div className="flex h-[50vh] items-center justify-center">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
           </div>
        ) : items.length === 0 ? (
          
          // Б. Состояние "Корзина пуста"
          <div className="flex flex-col items-center justify-center text-center h-[60vh]">
            <div className="w-20 h-20 bg-[#181818] rounded-full flex items-center justify-center mb-6 border border-white/5 shadow-inner">
              <Music size={32} className="text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Корзина пуста</h1>
            <p className="text-gray-400 mb-8 max-w-md">
              Похоже, вы еще не выбрали ни одного трека для своего следующего шедевра.
            </p>
            <Link href="/music">
              <Button size="lg" className="px-8">Перейти в каталог</Button>
            </Link>
          </div>

        ) : (
          
          // В. Состояние "Есть товары"
          <>
            <h1 className="text-3xl font-bold text-white mb-8">Ваша корзина</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Список товаров */}
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
                        {item.type === 'collection' ? 'Сборник' : 'Трек'}
                      </p>
                    </div>

                    <div className="text-right flex flex-col items-end gap-2 shrink-0">
                      <div className="text-white font-bold tabular-nums">{item.price} ₽</div>
                      <button 
                        onClick={() => removeFromCart(item.id, item.type)}
                        className="text-gray-500 hover:text-red-400 transition flex items-center gap-1 text-sm group"
                        title="Удалить"
                      >
                        <Trash2 size={16} className="group-hover:scale-110 transition-transform" /> 
                        <span className="hidden sm:inline">Удалить</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Итого и кнопка */}
              <div className="md:col-span-1">
                <div className="bg-[#181818] p-6 rounded-xl border border-white/5 sticky top-28 shadow-lg">
                  <h2 className="text-xl font-bold text-white mb-4">Детали заказа</h2>
                  
                  <div className="flex justify-between items-center mb-6 pb-6 border-b border-white/10">
                    <span className="text-gray-400">Товары:</span>
                    <span className="text-white font-medium tabular-nums">{total.toFixed(0)} ₽</span>
                  </div>

                  <div className="flex justify-between items-center mb-8">
                    <span className="text-lg font-bold text-white">К оплате:</span>
                    <span className="text-2xl font-bold text-green-400 tabular-nums">{total.toFixed(0)} ₽</span>
                  </div>

                  <Link href="/checkout" className="block w-full">
                    <Button size="lg" className="hover:bg-white hover:text-black w-full transition-colors font-bold">
                      Оформить заказ
                      <ArrowRight size={18} className="ml-2" />
                    </Button>
                  </Link>
                  
                  <p className="text-[10px] text-center text-gray-500 mt-4 leading-tight">
                    Нажимая кнопку, вы соглашаетесь с условиями <Link href="/license" className="underline hover:text-gray-300">лицензионного соглашения</Link>.
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