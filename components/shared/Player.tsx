'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link'; // Импорт Link
import { usePlayerStore } from '@/lib/store';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';

export function Player() {
  const { 
    currentTrack, 
    isPlaying, 
    togglePlay, 
    playNext, 
    playPrev, 
    pause
  } = usePlayerStore();
  
  // Состояние гидратации (чтобы избежать ошибок при SSR + LocalStorage)
  const [mounted, setMounted] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const [volume, setVolume] = useState(0.7);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false); // Чтобы ползунок не прыгал, когда мы его тянем

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Синхронизация стейта и аудио-элемента
  useEffect(() => {
    if (!mounted) return;

    if (currentTrack && audioRef.current) {
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Автоплей заблокирован браузером или ошибка загрузки
            pause();
          });
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack, pause, mounted]);

  // 2. Обновление громкости
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // 3. Обработчик времени (срабатывает, пока играет музыка)
  const onTimeUpdate = () => {
    if (audioRef.current && !isDragging) { // Не обновляем, если пользователь тянет ползунок
      setProgress(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const onLoadedMetadata = (e: React.SyntheticEvent<HTMLAudioElement>) => {
     setDuration(e.currentTarget.duration);
  }

  // 4. Когда трек закончился
  const onEnded = () => {
    playNext();
  };

  // 5. Начало перетаскивания ползунка
  const handleSeekStart = () => {
    setIsDragging(true);
  }

  // 6. Процесс перетаскивания (только визуально)
  const handleSeekMove = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProgress(Number(e.target.value));
  }

  // 7. Конец перетаскивания (применяем время)
  const handleSeekEnd = (e: React.MouseEvent<HTMLInputElement> | React.TouchEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const newTime = Number(e.currentTarget.value);
      audioRef.current.currentTime = newTime;
      setIsDragging(false);
    }
  }

  // Форматирование времени
  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (!mounted || !currentTrack) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#121212] border-t border-white/10 px-4 py-3 z-50 transition-transform duration-300">
      <audio
        ref={audioRef}
        src={currentTrack.audio_file_preview || ''}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onEnded={onEnded}
      />

      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Инфо о треке */}
        <div className="flex items-center gap-4 w-1/3 min-w-[150px]">
          <img 
            src={currentTrack.cover_image || '/placeholder.jpg'} 
            alt={currentTrack.title} 
            className="w-12 h-12 rounded bg-gray-800 object-cover shadow-sm"
          />
          <div className="truncate flex flex-col">
            {/* ТЕПЕРЬ ЭТО ССЫЛКА */}
            <Link 
              href={`/tracks/${currentTrack.slug}`} 
              className="text-white font-medium text-sm truncate hover:text-purple-400 transition-colors"
            >
              {currentTrack.title}
            </Link>
            <Link 
              href={`/music?category__slug=${currentTrack.category?.slug}`}
              className="text-gray-400 text-xs truncate hover:text-gray-300 transition-colors"
            >
              {currentTrack.category?.name || 'Музыка'}
            </Link>
          </div>
        </div>

        {/* Контроллеры и Прогресс */}
        <div className="flex flex-col items-center w-full max-w-lg gap-1">
          <div className="flex items-center gap-6">
            <button onClick={playPrev} className="text-gray-400 hover:text-white transition active:scale-95">
              <SkipBack size={20} />
            </button>
            
            <button 
              onClick={togglePlay} 
              className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition shadow-lg"
            >
              {isPlaying ? <Pause size={20} fill="black" /> : <Play size={20} fill="black" className="ml-1" />}
            </button>
            
            <button onClick={playNext} className="text-gray-400 hover:text-white transition active:scale-95">
              <SkipForward size={20} />
            </button>
          </div>

          <div className="flex items-center gap-3 w-full text-xs text-gray-400 font-mono select-none">
            <span className="w-9 text-right">{formatTime(progress)}</span>
            
            {/* Улучшенный Input Range */}
            <input
              type="range"
              min={0}
              max={duration && !isNaN(duration) ? duration : 100}
              value={progress}
              onMouseDown={handleSeekStart}
              onTouchStart={handleSeekStart}
              onChange={handleSeekMove}
              onMouseUp={handleSeekEnd}
              onTouchEnd={handleSeekEnd}
              className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-white hover:accent-purple-400 transition-colors"
            />
            
            <span className="w-9">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Громкость */}
        <div className="hidden md:flex items-center justify-end w-1/3 gap-2">
          <Volume2 size={18} className="text-gray-400" />
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-24 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-gray-400 hover:accent-white"
          />
        </div>

      </div>
    </div>
  );
}