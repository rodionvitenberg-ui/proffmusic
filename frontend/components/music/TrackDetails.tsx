'use client';

import { Play, Pause, ShoppingBag, Clock, Check } from 'lucide-react';
import { Track, useCartStore, usePlayerStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

const WaveformBars = ({ playing }: { playing: boolean }) => (
  <div className="flex items-end gap-1 h-12 w-full max-w-md opacity-80">
    {[...Array(20)].map((_, i) => (
      <div
        key={i}
        className={cn(
          "w-1.5 bg-green-500 rounded-t transition-all duration-300",
          playing ? "animate-pulse" : "h-2"
        )}
        style={{
          height: playing ? `${Math.random() * 100}%` : '20%',
          animationDelay: `${i * 0.05}s`
        }}
      />
    ))}
  </div>
);

export function TrackDetails({ track }: { track: Track }) {
  const t = useTranslations('trackDetails');
  const { currentTrack, isPlaying, setTrack, togglePlay } = usePlayerStore();
  const { addToCart, isInCart } = useCartStore();

  const isCurrent = currentTrack?.id === track.id;
  const isActive = isCurrent && isPlaying;
  const added = isInCart(track.id, 'track');

  const handlePlay = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      setTrack(track, [track]);
    }
  };

  return (
    <div className="relative overflow-hidden">

      <div
        className="absolute inset-0 bg-cover bg-center blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundImage: `url(${track.cover_image})` }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">

          {/* ОБЛОЖКА */}
          <div className="relative group shrink-0 w-full md:w-[400px] aspect-square rounded-xl overflow-hidden shadow-2xl bg-[#181818]">
            <Image
              src={track.cover_image || '/placeholder.jpg'}
              alt={track.title}
              fill
              sizes="(min-width: 768px) 400px, 100vw"
              className="w-full h-full object-cover"
            />
            <div
              className="absolute inset-0 bg-black/30 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handlePlay}
            >
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition">
                {isActive ? <Pause size={32} fill="black" /> : <Play size={32} fill="black" className="ml-2" />}
              </div>
            </div>
          </div>

          {/* ИНФОРМАЦИЯ */}
          <div className="flex-1 w-full space-y-6">

            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-green-400 border border-white/5">
                  {track.category?.name || 'Single'}
                </span>
                {track.is_new && (
                  <span className="px-3 py-1 rounded-full bg-purple-500/20 text-xs font-medium text-purple-400 border border-purple-500/20">
                    {t('new')}
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 leading-tight">
                {track.title}
              </h1>
              <div className="flex flex-wrap gap-2 text-sm text-gray-400">
                {track.tags?.map(tag => (
                  <span key={tag.id} className="hover:text-white transition cursor-pointer">#{tag.name}</span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 py-4 border-y border-white/10">
              <button
                onClick={handlePlay}
                className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-400 text-black flex items-center justify-center transition shadow-glow shrink-0"
              >
                {isActive ? <Pause size={24} fill="black" /> : <Play size={24} fill="black" className="ml-1" />}
              </button>

              <div className="flex-1 flex flex-col justify-center h-14">
                {isActive ? <p className="text-green-400 text-xs font-mono mb-1">{t('nowPlaying')}</p> : <p className="text-gray-500 text-xs font-mono mb-1">{t('preview')}</p>}
                <WaveformBars playing={isActive} />
              </div>

              <div className="flex items-center gap-2 text-gray-400 font-mono text-sm">
                <Clock size={16} />
                {track.duration ? track.duration : "03:45"}
              </div>
            </div>

            <div className="prose prose-invert max-w-none text-gray-300">
              <p>{track.description_full || track.description_short}</p>
            </div>

            <div className="bg-[#181818] rounded-xl p-6 border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <p className="text-sm text-gray-400 mb-1">{t('royaltyFree')}</p>
                <p className="text-3xl font-bold text-white">{track.price} ₽</p>
              </div>

              <Button
                size="lg"
                className={cn("w-full sm:w-auto min-w-[200px] h-14 text-lg", added ? "bg-gray-700 hover:bg-gray-600" : "bg-white text-black hover:bg-gray-200")}
                onClick={() => !added && addToCart(track, 'track')}
                disabled={added}
              >
                {added ? (
                  <span className="flex items-center gap-2"><Check /> {t('addedToCart')}</span>
                ) : (
                  <span className="flex items-center gap-2"><ShoppingBag /> {t('buyTrack')}</span>
                )}
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <Check size={14} className="text-green-500" /> {t('wavMp3')}
              </div>
              <div className="flex items-center gap-2">
                <Check size={14} className="text-green-500" /> {t('commercialUse')}
              </div>
              <div className="flex items-center gap-2">
                <Check size={14} className="text-green-500" /> {t('youtubeSafe')}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}