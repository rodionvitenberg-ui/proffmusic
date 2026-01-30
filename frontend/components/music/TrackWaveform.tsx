'use client';

import { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrackWaveformProps {
  audioUrl: string;
  height?: number;
  waveColor?: string;
  progressColor?: string;
}

export function TrackWaveform({ 
  audioUrl, 
  height = 64, 
  waveColor = '#4b5563', // Серый (непрослушанное)
  progressColor = '#22c55e' // Зеленый (прослушанное)
}: TrackWaveformProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Инициализация
    wavesurfer.current = WaveSurfer.create({
      container: containerRef.current,
      waveColor: waveColor,
      progressColor: progressColor,
      cursorColor: 'transparent', // Убираем вертикальную палку курсора
      barWidth: 2, // Ширина "столбика" (как на Epidemic)
      barGap: 3,   // Расстояние между ними
      barRadius: 2, // Закругление
      height: height,
      normalize: true, // Растягиваем пики на всю высоту
      url: audioUrl,
    });

    // Обработчики событий
    wavesurfer.current.on('ready', () => setIsReady(true));
    wavesurfer.current.on('play', () => setIsPlaying(true));
    wavesurfer.current.on('pause', () => setIsPlaying(false));
    wavesurfer.current.on('finish', () => setIsPlaying(false));

    return () => {
      wavesurfer.current?.destroy();
    };
  }, [audioUrl, height, waveColor, progressColor]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    wavesurfer.current?.playPause();
  };

  return (
    <div className="relative w-full group">
      {/* Контейнер волны */}
      <div 
        ref={containerRef} 
        className={cn(
            "w-full cursor-pointer transition-opacity duration-500",
            isReady ? "opacity-100" : "opacity-50"
        )} 
      />

      {/* Оверлей с кнопкой Play (появляется при наведении) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
         <button 
           onClick={togglePlay}
           className={cn(
             "w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-black shadow-lg transition-all transform pointer-events-auto",
             isPlaying ? "opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100" : "opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
           )}
         >
            {isPlaying ? <Pause size={20} fill="black" /> : <Play size={20} fill="black" className="ml-1" />}
         </button>
      </div>

      {/* Лоадер */}
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500">
          Загрузка спектра...
        </div>
      )}
    </div>
  );
}