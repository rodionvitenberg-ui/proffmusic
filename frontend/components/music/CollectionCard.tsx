'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Disc, Check, Banknote } from 'lucide-react';
import { Collection, useCartStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/toast';

export function CollectionCard({ collection }: { collection: Collection }) {
  const router = useRouter();
  const { addToCart, removeFromCart, isInCart } = useCartStore();
  const added = isInCart(collection.id, 'collection');

  // Хендлер Корзины
  const handleCartToggle = (e: React.MouseEvent) => {
    e.preventDefault(); // Предотвращаем переход по ссылке (если карточка будет ссылкой)
    if (added) {
      removeFromCart(collection.id, 'collection');
      toast.info('Убрано', { description: 'Сборник удален из корзины' });
    } else {
      addToCart(collection, 'collection');
      toast.success('Добавлено', { description: 'Сборник в корзине' });
    }
  };

  // Хендлер Покупки
  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!added) {
      addToCart(collection, 'collection');
    }
    router.push('/cart');
  };

  return (
    // Обертка с фиксированной высотой, как у TrackCard
    <div className="h-[380px] flex flex-col bg-[#181818] border border-white/5 hover:border-white/10 rounded-xl p-4 transition-all duration-300 hover:shadow-md group">
      
      {/* 1. Обложка */}
      <Link href={`/collections/${collection.slug}`} className="block relative aspect-square rounded-lg overflow-hidden bg-gray-800 shadow-inner">
        <img 
          src={collection.cover_image || '/placeholder.jpg'} 
          alt={collection.title}
          className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
        />
        {/* Бейдж с количеством треков */}
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-medium text-white flex items-center gap-1 shadow-sm border border-white/10">
           <Disc size={12} />
           {collection.tracks?.length || 0}
        </div>
      </Link>

      {/* 2. Заголовок */}
      <div className="mt-3">
        <Link href={`/collections/${collection.slug}`}>
          <h3 className="font-bold text-lg text-white truncate hover:text-green-400 transition-colors">
            {collection.title}
          </h3>
        </Link>
      </div>

      {/* 3. Описание/Тип и Цена */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-auto">
        <span className="text-sm text-gray-400 truncate max-w-[60%]">
          Сборник
        </span>
        <span className="text-lg font-bold text-white tabular-nums">
          {collection.price} ₽
        </span>
      </div>

      {/* 4. Кнопки действий (Сетка 2 колонки) */}
      <div className="grid grid-cols-2 gap-3 mt-3">
        {/* Кнопка Купить */}
        <Button
          variant="outline"
          onClick={handleBuyNow}
          className="w-full h-10 border-white/20 hover:border-white font-bold uppercase tracking-wide text-xs text-white"
        >
          <Banknote size={14} className="mr-2" />
          Купить
        </Button>

        {/* Кнопка Корзины */}
        <Button 
          onClick={handleCartToggle}
          className={cn(
            "w-full h-10 font-bold uppercase tracking-wide text-xs transition-all",
            added 
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-white hover:bg-border hover:text-white text-black"
          )}
        >
          {added ? (
            <>
              <Check size={16} className="mr-2" />
              В корзине
            </>
          ) : (
            <>
              <ShoppingBag size={16} className="mr-2" />
              В корзину
            </>
          )}
        </Button>
      </div>

    </div>
  );
}