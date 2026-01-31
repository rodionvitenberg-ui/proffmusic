'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Play, Pause, ShoppingBag, Check, 
  Clock, Calendar, ShieldCheck, 
  ArrowLeft, Loader2, Music4, ListMusic
} from 'lucide-react';

import api from '@/lib/api';
import { Collection, useCartStore, usePlayerStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/toast';

export default function CollectionPage() {
  const params = useParams();
  const router = useRouter();
  const { slug } = params as { slug: string };
  
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);

  // Сторы
  const { currentTrack, isPlaying, setTrack: setPlayerTrack, togglePlay } = usePlayerStore();
  const { addToCart, removeFromCart, isInCart } = useCartStore();

  useEffect(() => {
    async function fetchCollection() {
      try {
        const res = await api.get<Collection>(`/api/collections/${slug}/`);
        setCollection(res.data);
      } catch (error) {
        console.error('Ошибка загрузки сборника:', error);
      } finally {
        setLoading(false);
      }
    }
    if (slug) fetchCollection();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-500" size={40} />
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center text-white">
        <h1 className="text-2xl font-bold mb-4">Сборник не найден</h1>
        <Link href="/collections">
          <Button variant="outline">Все сборники</Button>
        </Link>
      </div>
    );
  }

  // --- ЛОГИКА ---
  
  const added = isInCart(collection.id, 'collection');

  // Играть весь сборник (начинаем с первого трека)
  const handlePlayCollection = () => {
    if (collection.tracks && collection.tracks.length > 0) {
       // Если этот трек уже играет, ставим паузу/плей
       // Иначе загружаем ВЕСЬ плейлист сборника
       if (currentTrack?.id === collection.tracks[0].id) {
         togglePlay();
       } else {
         setPlayerTrack(collection.tracks[0], collection.tracks);
       }
    }
  };

  const isPlayingFirstTrack = collection.tracks && collection.tracks.length > 0 && currentTrack?.id === collection.tracks[0].id && isPlaying;

  const handleCartClick = () => {
    if (added) {
      removeFromCart(collection.id, 'collection');
      toast.info('Убрано', { description: 'Сборник удален из корзины' });
    } else {
      addToCart(collection, 'collection');
      toast.success('Добавлено', { description: 'Сборник добавлен в корзину' });
    }
  };

  const handleBuyNow = () => {
    if (!added) addToCart(collection, 'collection');
    router.push('/cart');
  };

  const formattedPrice = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
  }).format(Number(collection.price));

  return (
    <div className="min-h-screen bg-[#0f0f0f] pb-20">
      
      {/* === ГЕРОЙСКИЙ БЛОК === */}
      <div className="relative h-[60vh] min-h-[500px] w-full overflow-hidden">
        
        {/* 1. Фон-изображение */}
        <div className="absolute inset-0">
            <Image 
              src={collection.cover_image || '/placeholder.jpg'}
              alt={collection.title}
              fill
              priority
              className="object-cover"
            />
        </div>

        {/* 2. Градиент (Плавный переход в черный) */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/80 to-transparent" />

        {/* 3. Контент */}
        <div className="absolute inset-0 flex flex-col justify-end relative z-10">
             
             {/* Кнопка Назад */}
             <div className="absolute top-24 left-4 md:left-8">
                <Link href="/collections">
                  <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10 gap-2 pl-2">
                    <ArrowLeft size={18} /> Все сборники
                  </Button>
                </Link>
             </div>

            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-12 flex flex-col md:flex-row items-end md:items-center justify-between gap-8">
              
              {/* Инфо */}
              <div className="space-y-4 max-w-3xl">
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full border border-white/10 uppercase tracking-wider">
                        <ListMusic size={12} /> Сборник
                    </span>
                </div>
                
                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-none drop-shadow-2xl">
                    {collection.title}
                </h1>
                
                {collection.description && (
                    <p className="text-lg text-gray-300 line-clamp-2 leading-relaxed max-w-2xl drop-shadow-md">
                        {collection.description}
                    </p>
                )}

                <div className="flex items-center gap-6 text-sm text-gray-400 pt-2">
                   <div className="flex items-center gap-2">
                      <Music4 size={16} /> {collection.tracks?.length || 0} треков
                   </div>
                   <div className="flex items-center gap-2">
                      <ShieldCheck size={16} className="text-green-500"/> Royalty Free
                   </div>
                </div>
              </div>

              {/* Действия */}
              <div className="flex flex-col items-end gap-6 shrink-0 w-full md:w-auto">
                  <div className="text-4xl font-bold text-white tabular-nums tracking-tight drop-shadow-lg">
                      {formattedPrice}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 w-full md:justify-end">
                      {/* Play */}
                      <Button
                        size="lg"
                        className="h-14 w-14 rounded-full bg-white text-black hover:bg-purple-400 hover:scale-105 transition-all shadow-xl p-0 flex items-center justify-center"
                        onClick={handlePlayCollection}
                      >
                         {isPlayingFirstTrack ? <Pause size={24} fill="black" /> : <Play size={24} fill="black" className="ml-1" />}
                      </Button>

                      {/* Buy */}
                      <Button 
                        size="lg"
                        className="h-14 px-8 text-base font-bold uppercase tracking-wide bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-900/20"
                        onClick={handleBuyNow}
                      >
                        Купить сборник
                      </Button>

                      {/* Cart */}
                      <Button
                        size="lg"
                        variant="outline"
                        className={cn(
                            "h-14 w-14 rounded-full border-2 transition-all p-0 flex items-center justify-center backdrop-blur-sm",
                            added 
                             ? "border-green-500 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white"
                             : "border-white/20 text-white hover:bg-white hover:text-black hover:border-white"
                        )}
                        onClick={handleCartClick}
                      >
                         {added ? <Check size={24} /> : <ShoppingBag size={24} />}
                      </Button>
                  </div>
              </div>
            </div>
        </div>
      </div>

      {/* === СПИСОК ТРЕКОВ === */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
         <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
            Содержание сборника
         </h2>

         <div className="bg-[#181818] border border-white/5 rounded-xl overflow-hidden">
            {collection.tracks && collection.tracks.length > 0 ? (
                <div className="divide-y divide-white/5">
                    {collection.tracks.map((track, index) => {
                        const isTrackPlaying = currentTrack?.id === track.id && isPlaying;
                        
                        return (
                            <div 
                                key={track.id} 
                                className="group flex items-center gap-4 p-4 hover:bg-white/5 transition-colors cursor-pointer"
                                onClick={() => setPlayerTrack(track, collection.tracks)}
                            >
                                <div className="text-gray-500 w-6 text-center text-sm font-medium group-hover:hidden">
                                    {index + 1}
                                </div>
                                <div className="w-6 hidden group-hover:flex justify-center">
                                     <Play size={16} className="text-white" fill="white"/>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className={cn("font-medium truncate", isTrackPlaying ? "text-purple-400" : "text-white")}>
                                        {track.title}
                                    </div>
                                    <div className="text-xs text-gray-500 truncate">
                                        {track.category?.name}
                                    </div>
                                </div>

                                <div className="hidden sm:block text-sm text-gray-400">
                                    {track.duration || "—"}
                                </div>
                                
                                {/* Можно добавить кнопку "купить отдельно", если нужно */}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="p-8 text-center text-gray-500">
                    В этом сборнике пока нет треков.
                </div>
            )}
         </div>
      </div>

    </div>
  );
}