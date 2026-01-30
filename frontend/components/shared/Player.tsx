'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePlayerStore } from '@/lib/store';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import Image from 'next/image';

// Форматирование времени (125.5 -> 2:05)
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
  
  const [mounted, setMounted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Локальные стейты для UI
  const [volume, setVolume] = useState(0.7);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Управление Play/Pause через пропсы стора
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;

    if (isPlaying) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error("Autoplay prevented:", error);
          pause(); // Если браузер блокирует, ставим паузу в сторе
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrack, pause]);

  // 2. Управление громкостью
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // --- ХЕНДЛЕРЫ АУДИО СОБЫТИЙ ---

  const handleTimeUpdate = () => {
    // Обновляем прогресс только если пользователь НЕ тянет ползунок прямо сейчас
    if (audioRef.current && !isDragging) {
      setProgress(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      if (isPlaying) audioRef.current.play().catch(() => pause());
    }
  };

  const handleEnded = () => {
    playNext();
  };

  // --- ЛОГИКА ПЕРЕМОТКИ (SEEK) ---

  const handleSeekStart = () => {
    setIsDragging(true);
  };

  const handleSeekMove = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Просто обновляем визуальное положение ползунка
    setProgress(Number(e.target.value));
  };

  const handleSeekEnd = (e: React.MouseEvent<HTMLInputElement> | React.TouchEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      // Применяем новое время к аудио
      const newTime = Number((e.currentTarget as HTMLInputElement).value);
      audioRef.current.currentTime = newTime;
      setProgress(newTime);
    }
    setIsDragging(false);
  };

  if (!mounted || !currentTrack) return null;

  return (
    <>
      {/* Скрытый нативный аудиоплеер для обработки логики */}
      <audio
        ref={audioRef}
        src={currentTrack.audio_file_preview}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      {/* UI ПЛЕЕРА */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#121212] border-t border-white/10 z-50 px-4 py-3 shadow-2xl animate-in slide-in-from-bottom duration-500">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* 1. Информация о треке */}
          <div className="flex items-center gap-3 w-1/3 min-w-[140px]">
            <div className="h-12 w-12 bg-gray-800 rounded overflow-hidden shrink-0 border border-white/10 relative">
              {currentTrack.cover_image && (
                <Image 
                   src={currentTrack.cover_image} 
                   alt={currentTrack.title}
                   fill 
                   className="object-cover w-full h-full"
                />
              )}
            </div>
            <div className="min-w-0 overflow-hidden">
              <h4 className="text-white font-bold text-sm truncate">{currentTrack.title}</h4>
              <p className="text-gray-400 text-xs truncate">
                {currentTrack.category?.name || 'ProffMusic'}
              </p>
            </div>
          </div>

          {/* 2. Контроллеры и Ползунок */}
          <div className="flex flex-col items-center justify-center flex-1 max-w-xl">
            {/* Кнопки */}
            <div className="flex items-center gap-4 mb-1">
              <button onClick={playPrev} className="text-gray-400 hover:text-white transition active:scale-95">
                <SkipBack size={20} />
              </button>
              
              <button 
                onClick={togglePlay}
                className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition active:scale-95 shadow-lg"
              >
                {isPlaying ? <Pause size={18} fill="black" /> : <Play size={18} fill="black" className="ml-0.5" />}
              </button>

              <button onClick={playNext} className="text-gray-400 hover:text-white transition active:scale-95">
                <SkipForward size={20} />
              </button>
            </div>

            {/* Слайдер времени (Input Range) */}
            <div className="flex items-center gap-3 w-full text-xs text-gray-400 font-mono select-none">
              <span className="w-9 text-right tabular-nums">
                {formatTime(progress)}
              </span>
              
              <div className="relative flex-1 h-4 flex items-center group">
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
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                
                {/* Кастомный прогресс-бар */}
                <div className="w-full h-1 bg-gray-700 rounded-lg overflow-hidden relative">
                    <div 
                        className="h-full bg-white group-hover:bg-purple-400 transition-colors"
                        style={{ width: `${(progress / (duration || 1)) * 100}%` }}
                    />
                </div>
                {/* Точка ползунка */}
                <div 
                    className="absolute h-3 w-3 bg-white rounded-full shadow pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ left: `${(progress / (duration || 1)) * 100}%`, transform: 'translateX(-50%)' }}
                />
              </div>
              
              <span className="w-9 tabular-nums">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* 3. Громкость */}
          <div className="hidden md:flex items-center justify-end w-1/3 gap-2">
            <Volume2 size={18} className="text-gray-400" />
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-24 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-gray-400 hover:accent-white transition-colors"
            />
          </div>
          
        </div>
      </div>
    </>
  );
}