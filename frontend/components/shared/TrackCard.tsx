'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Play, Pause, ShoppingBag, Check, Zap, Banknote, Tag as TagIcon } from 'lucide-react';
import { Track, useCartStore, usePlayerStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button'; // Убедись, что Button импортируется корректно
import { toast } from '@/components/ui/toast';
import { CardFlip, CardFlipFront, CardFlipBack } from '@/components/ui/card-flip';
import Link from 'next/link';

interface TrackCardProps {
  track: Track;
  playlist?: Track[];
}

export function TrackCard({ track, playlist }: TrackCardProps) {
  const router = useRouter();
  const { currentTrack, isPlaying, setTrack, togglePlay } = usePlayerStore();
  const { addToCart, removeFromCart, isInCart } = useCartStore();

  const isCurrent = currentTrack?.id === track.id;
  const isActive = isCurrent && isPlaying;
  const added = isInCart(track.id, 'track');

  // Хендлер Плеера (Останавливаем всплытие, чтобы карточка не перевернулась)
  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrent) {
      togglePlay();
    } else {
      setTrack(track, playlist);
    }
  };

  // Хендлер Корзины
  const handleCartToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (added) {
      removeFromCart(track.id, 'track');
      toast.info('Убрано', { description: 'Трек удален из корзины' });
    } else {
      addToCart(track, 'track');
      toast.success('Добавлено', { description: 'Трек в корзине' });
    }
  };

  // Хендлер Покупки
  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!added) {
      addToCart(track, 'track');
    }
    router.push('/cart');
  };

  return (
    <div className="h-[380px]"> {/* Фиксируем высоту, чтобы карточки были одинаковыми */}
      <CardFlip>
        {/* --- ЛИЦЕВАЯ СТОРОНА --- */}
        <CardFlipFront>
          
          {/* 1. Обложка + Play */}
          <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-800 shadow-inner group">
            <Image
              src={track.cover_image || '/placeholder.jpg'} 
              alt={track.title}
              fill
              className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
            />
            <div className={cn(
              "absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 backdrop-blur-[2px]",
              isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}>
              <button 
                onClick={handlePlayClick}
                className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl"
              >
                {isActive ? <Pause fill="black" size={24} /> : <Play fill="black" className="ml-1" size={24} />}
              </button>
            </div>
          </div>

          {/* 2. Заголовок */}
          <div className="mt-1">
            <h3 className={cn("font-bold text-lg text-white truncate", isCurrent && "text-green-400")}>
              {track.title}
            </h3>
          </div>

          {/* 3. Категория и Цена (в одну строку) */}
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <span className="text-sm text-gray-400 truncate max-w-[60%]">
              {track.category?.name || 'ProffMusic'}
            </span>
            <span className="text-lg font-bold text-white tabular-nums">
              {track.price} ₽
            </span>
          </div>

          {/* 4. Кнопки действий (Симметричная сетка) */}
          <div className="grid grid-cols-2 gap-3 mt-auto">
            {/* Кнопка Купить */}
            <Button
              variant="outline"
              onClick={handleBuyNow}
              className="w-full h-10 border-white/20 border-white/20 hover:border-white font-bold uppercase tracking-wide text-xs text-white"
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
        </CardFlipFront>


        {/* --- ОБРАТНАЯ СТОРОНА --- */}
        <CardFlipBack>
          <div className="flex flex-col h-full space-y-4">
            
            {/* Хедер обратной стороны */}
            <div className="border-b border-white/10 pb-2">
              <h4 className="font-bold text-white text-lg">{track.title}</h4>
              <p className="text-xs text-gray-500">{track.category?.name}</p>
            </div>

            {/* Теги */}
            {track.tags && track.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {track.tags.map((tag) => (
                  <Link 
                    key={tag.id} 
                    href={`/music?tags__slug=${tag.slug}`}
                    onClick={(e) => e.stopPropagation()} // Чтобы клик по тегу не переворачивал карту
                    className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] text-gray-300 hover:bg-white/10 hover:border-white/30 transition-colors flex items-center gap-1"
                  >
                    <TagIcon size={10} />
                    {tag.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Описание */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
              <p className="text-sm text-gray-400 leading-relaxed">
                {track.description_full || track.description_short || "Описание отсутствует."}
              </p>
            </div>
            
            <div className="pt-2 text-center text-xs text-gray-600">
              Нажмите, чтобы вернуться
            </div>
          </div>
        </CardFlipBack>
      </CardFlip>
    </div>
  );
}