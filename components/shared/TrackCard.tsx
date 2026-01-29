'use client';

import { Play, Pause, ShoppingBag, Check } from 'lucide-react'; // Добавил иконку Check
import { Track, useCartStore, usePlayerStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/toast';
import { Card, CardContent } from '@/components/ui/card';

interface TrackCardProps {
  track: Track;
  playlist?: Track[];
}

export function TrackCard({ track, playlist }: TrackCardProps) {
  const { currentTrack, isPlaying, setTrack, togglePlay } = usePlayerStore();
  const { addToCart, removeFromCart, isInCart } = useCartStore(); // Достаем removeFromCart

  const isCurrent = currentTrack?.id === track.id;
  const isActive = isCurrent && isPlaying;
  const added = isInCart(track.id, 'track');

  const handlePlayClick = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      setTrack(track, playlist);
    }
  };

  // Единый хендлер для добавления/удаления
  const handleCartToggle = () => {
    if (added) {
      // Если уже в корзине — удаляем
      removeFromCart(track.id, 'track');
      toast.info('Убрано из корзины', {
        description: `${track.title} удален`,
        duration: 2000,
      });
    } else {
      // Если нет — добавляем
      addToCart(track, 'track');
      toast.success('Добавлено в корзину', {
        description: `${track.title} готов к покупке`,
        duration: 3000,
      });
    }
  };

  return (
    <Card className="group relative bg-[#181818] border-white/5 hover:bg-[#202020] hover:border-white/10 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md">
      <CardContent className="p-4">
        
        {/* Обложка */}
        <div className="relative aspect-square rounded-md overflow-hidden mb-4 bg-gray-800 shadow-inner">
          <img 
            src={track.cover_image || '/placeholder.jpg'} 
            alt={track.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
          
          <div className={cn(
            "absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 backdrop-blur-[2px]",
            isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}>
            <button 
              onClick={handlePlayClick}
              className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200 transform shadow-lg"
            >
              {isActive ? <Pause fill="black" /> : <Play fill="black" className="ml-1" />}
            </button>
          </div>
        </div>

        {/* Инфо */}
        <div className="flex justify-between items-start gap-3">
          <div className="min-w-0 flex-1">
            <h3 className={cn("font-semibold text-base text-white truncate pr-2 transition-colors", isCurrent && "text-green-400")}>
              {track.title}
            </h3>
            <p className="text-sm text-gray-400 truncate">
              {track.category?.name || 'ProffMusic'}
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-2 shrink-0">
            <span className="text-sm font-bold text-white">{track.price} ₽</span>
            
            <Button 
              size="sm" 
              // Убираем variant="secondary", управляем классами вручную
              onClick={handleCartToggle}
              className={cn(
                "h-8 px-3 transition-all duration-200 transform shadow-sm",
                added 
                  ? "bg-green-600 text-white hover:bg-green-700 hover:shadow-md active:scale-95" // Стиль "В корзине"
                  : "bg-white text-black hover:bg-gray-200 hover:shadow-md active:scale-90 active:bg-gray-300" // Стиль "Купить"
              )}
            >
              {added ? <Check size={16} /> : <ShoppingBag size={16} />}
            </Button>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}