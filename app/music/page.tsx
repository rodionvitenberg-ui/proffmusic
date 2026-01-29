'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Filter, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { Track } from '@/lib/store';
import { TrackCard } from '@/components/shared/TrackCard';
import { FilterSidebar } from '@/components/shared/FilterSidebar';
import { Button } from '@/components/ui/Button';

// Основной компонент оборачиваем в Suspense, так как используем useSearchParams
export default function MusicPage() {
  return (
    <Suspense fallback={<div className="text-white text-center py-20">Загрузка каталога...</div>}>
      <MusicContent />
    </Suspense>
  );
}

function MusicContent() {
  const searchParams = useSearchParams();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Следим за URL. Если изменились параметры (теги, категории), перезагружаем треки.
  useEffect(() => {
    async function fetchTracks() {
      setLoading(true);
      try {
        // searchParams.toString() автоматически берет всё: ?category__slug=...&tags__slug=...
        const queryString = searchParams.toString();
        const res = await api.get(`/tracks/?${queryString}&ordering=-created_at`);
        setTracks(res.data.results || res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchTracks();
  }, [searchParams]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Заголовок + Кнопка фильтров (Мобила) */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white">Каталог музыки</h1>
        <Button 
          variant="outline" 
          size="sm" 
          className="lg:hidden flex items-center gap-2"
          onClick={() => setMobileFiltersOpen(true)}
        >
          <Filter size={16} /> Фильтры
        </Button>
      </div>

      <div className="flex gap-8">
        {/* Сайдбар (на десктопе слева) */}
        <FilterSidebar 
          mobileOpen={mobileFiltersOpen} 
          setMobileOpen={setMobileFiltersOpen} 
        />

        {/* Сетка треков */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-white" size={40} />
            </div>
          ) : tracks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {tracks.map((track) => (
                <TrackCard key={track.id} track={track} playlist={tracks} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-[#181818] rounded-lg border border-white/5">
              <p className="text-gray-400 text-lg">По выбранным фильтрам ничего не найдено.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => window.location.href = '/music'} // Полный сброс
              >
                Очистить фильтры
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}