'use client';

import { Play, Pause, ShoppingBag, Check, ListMusic } from 'lucide-react';
import { Collection, useCartStore, usePlayerStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { TrackCard } from '@/components/shared/TrackCard';
import { toast } from '@/components/ui/toast'; // <--- Импорт тоста

export function CollectionDetails({ collection }: { collection: Collection }) {
  const { addToCart, isInCart } = useCartStore();
  
  const { setTrack, currentTrack, isPlaying, togglePlay } = usePlayerStore();
  
  const added = isInCart(collection.id, 'collection');
  
  const firstTrack = collection.tracks?.[0];
  const isPlayingFirst = firstTrack && currentTrack?.id === firstTrack.id && isPlaying;

  const handlePlayAll = () => {
    if (!firstTrack) return;
    if (isPlayingFirst) {
      togglePlay();
    } else {
      setTrack(firstTrack, collection.tracks);
    }
  };

  const handleBuyPack = () => {
    if (!added) {
      addToCart(collection, 'collection');
      toast.success('Сборник добавлен', {
        description: `Пак "${collection.title}" теперь в корзине`,
        duration: 3000,
      });
    }
  };

  return (
    <div className="pb-20">
      {/* HEADER SECTION */}
      <div className="relative bg-[#181818] border-b border-white/5 py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Блюр на фоне */}
        <div 
           className="absolute inset-0 bg-cover bg-center blur-3xl opacity-10 pointer-events-none"
           style={{ backgroundImage: `url(${collection.cover_image})` }}
        />

        <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row gap-10 items-center md:items-start">
          
          {/* Обложка */}
          <div className="w-64 h-64 sm:w-80 sm:h-80 shrink-0 rounded-lg shadow-2xl overflow-hidden bg-gray-800 border border-white/10">
            <img 
              src={collection.cover_image || '/placeholder.jpg'} 
              alt={collection.title} 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Инфо */}
          <div className="flex-1 text-center md:text-left space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-medium mb-3">
                <ListMusic size={14} /> Сборник / Альбом
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{collection.title}</h1>
              <p className="text-gray-300 text-lg leading-relaxed max-w-2xl">
                {collection.description}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              {/* Кнопка Play All */}
              <button 
                onClick={handlePlayAll}
                className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition shadow-lg"
              >
                {isPlayingFirst ? <Pause fill="black" /> : <Play fill="black" className="ml-1" />}
              </button>
              
              <div className="h-10 border-l border-white/10 hidden sm:block" />

              {/* Цена и Купить */}
              <div className="flex items-center gap-6">
                 <div className="text-3xl font-bold text-white">{collection.price} ₽</div>
                 <Button 
                   size="lg"
                   variant={added ? 'secondary' : 'default'}
                   onClick={handleBuyPack}
                   disabled={added}
                   className={cn(
                     "min-w-[180px] h-14 text-lg",
                     !added && "bg-white text-black hover:bg-gray-200"
                   )}
                 >
                    {added ? (
                      <span className="flex items-center gap-2"><Check /> В корзине</span>
                    ) : (
                      <span className="flex items-center gap-2"><ShoppingBag /> Купить пак</span>
                    )}
                 </Button>
              </div>
            </div>
            
            <p className="text-sm text-gray-500">
              Включает {collection.tracks?.length || 0} треков. Экономия при покупке сборником.
            </p>
          </div>
        </div>
      </div>

      {/* TRACKLIST SECTION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-white mb-8">Треки в этом сборнике</h2>
        
        {collection.tracks && collection.tracks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {collection.tracks.map((track) => (
              <TrackCard 
                key={track.id} 
                track={track} 
                playlist={collection.tracks} 
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">В этом сборнике пока нет треков.</p>
        )}
      </div>
    </div>
  );
}