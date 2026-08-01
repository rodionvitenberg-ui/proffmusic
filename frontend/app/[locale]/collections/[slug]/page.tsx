'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import {
  Play, Pause, ShoppingBag, Check,
  Music4, ListMusic, ShieldCheck,
  ArrowLeft, Loader2
} from 'lucide-react';

import api from '@/lib/api';
import { Collection, useCartStore, usePlayerStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/toast';
import { Link, useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export default function CollectionPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('collectionDetails');
  const { slug } = params as { slug: string };

  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);

  const { currentTrack, isPlaying, setTrack: setPlayerTrack, togglePlay } = usePlayerStore();
  const { addToCart, removeFromCart, isInCart } = useCartStore();

  useEffect(() => {
    async function fetchCollection() {
      try {
        const res = await api.get<Collection>(`/api/collections/${slug}/`);
        setCollection(res.data);
      } catch (error) {
        console.error('Error loading collection:', error);
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
        <h1 className="text-2xl font-bold mb-4">{t('notFound')}</h1>
        <Link href="/collections">
          <Button variant="outline">{t('allCollections')}</Button>
        </Link>
      </div>
    );
  }

  const added = isInCart(collection.id, 'collection');

  const handlePlayCollection = () => {
    if (collection.tracks && collection.tracks.length > 0) {
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
      toast.info(t('removed'), { description: t('removedDesc') });
    } else {
      addToCart(collection, 'collection');
      toast.success(t('added'), { description: t('addedDesc') });
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

        {/* 2. Градиент */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/80 to-transparent" />

        {/* 3. Контент */}
        <div className="absolute inset-0 flex flex-col justify-end relative z-10">

          <div className="absolute top-24 left-4 md:left-8">
            <Link href="/collections">
              <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10 gap-2 pl-2">
                <ArrowLeft size={18} /> {t('allCollections')}
              </Button>
            </Link>
          </div>

          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-12 flex flex-col md:flex-row items-end md:items-center justify-between gap-8">

            <div className="space-y-4 max-w-3xl">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full border border-white/10 uppercase tracking-wider">
                  <ListMusic size={12} /> {t('collection')}
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
                  <Music4 size={16} /> {t('tracksCount', { count: collection.tracks?.length || 0 })}
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-green-500" /> {t('royaltyFree')}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-6 shrink-0 w-full md:w-auto">
              <div className="text-4xl font-bold text-white tabular-nums tracking-tight drop-shadow-lg">
                {formattedPrice}
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full md:justify-end">
                <Button
                  size="lg"
                  className="h-14 w-14 rounded-full bg-white text-black hover:bg-purple-400 hover:scale-105 transition-all shadow-xl p-0 flex items-center justify-center"
                  onClick={handlePlayCollection}
                >
                  {isPlayingFirstTrack ? <Pause size={24} fill="black" /> : <Play size={24} fill="black" className="ml-1" />}
                </Button>

                <Button
                  size="lg"
                  className="h-14 px-8 text-base font-bold uppercase tracking-wide bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-900/20"
                  onClick={handleBuyNow}
                >
                  {t('buyCollection')}
                </Button>

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
          {t('contents')}
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
                      <Play size={16} className="text-white" fill="white" />
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
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              {t('emptyTracks')}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}