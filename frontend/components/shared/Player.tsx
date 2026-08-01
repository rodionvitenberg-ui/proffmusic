'use client';

import { useEffect, useRef, useState } from 'react';
import { usePlayerStore, useCartStore } from '@/lib/store';
import {
  Play, Pause, SkipBack, SkipForward, Volume2,
  ChevronDown, ShoppingBag, Check, Music, ChevronUp
} from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/toast';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

const formatTime = (time: number) => {
  if (!time || isNaN(time)) return '0:00';
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export function Player() {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    playNext,
    playPrev,
    pause
  } = usePlayerStore();

  const { addToCart, removeFromCart, isInCart } = useCartStore();
  const t = useTranslations('player');

  const [mounted, setMounted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [volume, setVolume] = useState(0.7);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (currentTrack) {
      setIsCollapsed(false);
    }
  }, [currentTrack]);

  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;
    if (isPlaying) {
      audioRef.current.play().catch((e) => {
        console.error("Autoplay prevented:", e);
        pause();
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrack, pause]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const added = currentTrack ? isInCart(currentTrack.id, 'track') : false;

  const handleCartClick = () => {
    if (!currentTrack) return;
    if (added) {
      removeFromCart(currentTrack.id, 'track');
      toast.info(t('removed'), { description: t('trackRemovedFromCart') });
    } else {
      addToCart(currentTrack, 'track');
      toast.success(t('added'), { description: t('trackAddedToCart') });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current && !isDragging) {
      setProgress(audioRef.current.currentTime);
    }
  };

  const handleSeekStart = () => setIsDragging(true);
  const handleSeekMove = (e: React.ChangeEvent<HTMLInputElement>) => setProgress(Number(e.target.value));
  const handleSeekEnd = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = progress;
    }
    setIsDragging(false);
  };

  if (!mounted || !currentTrack) return null;

  return (
    <>
      <audio
        ref={audioRef}
        src={currentTrack.audio_file_preview}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => audioRef.current && setDuration(audioRef.current.duration)}
        onEnded={playNext}
      />

      <button
        onClick={() => setIsCollapsed(false)}
        className={cn(
          "fixed bottom-4 right-4 z-40 h-14 w-14 rounded-full bg-[#181818] border border-white/20 shadow-2xl flex items-center justify-center transition-all duration-500 hover:scale-110 group overflow-hidden",
          isCollapsed ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none"
        )}
        title={t('expandPlayer')}
      >
        {isPlaying && (
          <div className="absolute inset-0 bg-green-500/10 animate-pulse" />
        )}

        {currentTrack.cover_image && (
          <Image
            src={currentTrack.cover_image}
            alt=""
            fill
            sizes="80px"
            className="opacity-40 object-cover"
          />
        )}

        <ChevronUp size={24} className="text-white relative z-10 group-hover:text-green-400 transition-colors" />
      </button>

      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 bg-[#121212]/95 backdrop-blur-md border-t border-white/10 z-50 px-4 py-3 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] transition-transform duration-500 ease-in-out",
          isCollapsed ? "translate-y-full" : "translate-y-0"
        )}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

          <div className="flex items-center gap-3 w-1/3 min-w-[140px]">
            <div className="h-12 w-12 bg-gray-800 rounded overflow-hidden shrink-0 relative group">
              {currentTrack.cover_image ? (
                <Image src={currentTrack.cover_image} alt="" fill sizes="48px" className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-700"><Music size={20} /></div>
              )}
            </div>
            <div className="min-w-0">
              <Link href={`/tracks/${currentTrack.slug}`} className="text-white hover:text-green-400 transition-colors block truncate">
                <h4 className="text-white font-bold text-sm truncate">{currentTrack.title}</h4>
              </Link>
              <p className="text-gray-400 text-xs truncate">{currentTrack.category?.name}</p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center flex-1 max-w-xl">
            <div className="flex items-center gap-6 mb-1">
              <button onClick={playPrev} className="text-gray-400 hover:text-white transition"><SkipBack size={20} /></button>
              <button onClick={togglePlay} className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition shadow-lg">
                {isPlaying ? <Pause size={18} fill="black" /> : <Play size={18} fill="black" className="ml-0.5" />}
              </button>
              <button onClick={playNext} className="text-gray-400 hover:text-white transition"><SkipForward size={20} /></button>
            </div>

            <div className="flex items-center gap-3 w-full text-xs text-gray-500 font-mono">
              <span className="w-9 text-right tabular-nums">{formatTime(progress)}</span>
              <div className="relative flex-1 h-3 flex items-center group cursor-pointer">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={progress}
                  onMouseDown={handleSeekStart}
                  onTouchStart={handleSeekStart}
                  onChange={handleSeekMove}
                  onMouseUp={handleSeekEnd}
                  onTouchEnd={handleSeekEnd}
                  className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                />
                <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-white group-hover:bg-green-400 transition-colors" style={{ width: `${(progress / (duration || 1)) * 100}%` }} />
                </div>
              </div>
              <span className="w-9 tabular-nums">{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center justify-end w-1/3 gap-4">

            <button
              onClick={handleCartClick}
              className={cn(
                "flex items-center gap-2 text-xs font-bold transition-all px-3 py-1.5 rounded-full border",
                added
                  ? "bg-green-600 border-green-600 text-white hover:bg-green-700"
                  : "bg-transparent border-white/20 text-white hover:bg-white hover:text-black hover:border-white"
              )}
            >
              {added ? <Check size={14} /> : <ShoppingBag size={14} />}
              <span className="hidden xl:inline">{added ? t('inCart') : t('buy')}</span>
            </button>

            <div className="hidden md:flex items-center gap-2 group">
              <Volume2 size={18} className="text-gray-400 group-hover:text-white transition" />
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-16 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-white"
              />
            </div>

            <button
              onClick={() => setIsCollapsed(true)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              title={t('collapsePlayer')}
            >
              <ChevronDown size={22} />
            </button>
          </div>

        </div>
      </div>
    </>
  );
}