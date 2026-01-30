'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Filter, Loader2 } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import api from '@/lib/api';
import { Track } from '@/lib/store';
import { TrackCard } from '@/components/shared/TrackCard';
import { FilterSidebar } from '@/components/shared/FilterSidebar';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

// --- КОМПОНЕНТ-ЗАГЛУШКА (SKELETON) ---
function MusicPageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white">Каталог музыки</h1>
      </div>
      <div className="flex gap-8 relative items-start">
        {/* Фейковый сайдбар */}
        <aside className="hidden lg:block w-64 shrink-0 sticky top-24 h-[calc(100vh-6rem)] border-r border-white/5">
           <div className="h-full w-full bg-background animate-pulse rounded-lg" />
        </aside>
        {/* Фейковый контент */}
        <div className="flex-1 min-w-0">
           <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-[380px] bg-background animate-pulse rounded-xl" />
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}

export default function MusicPage() {
  return (
    <Suspense fallback={<MusicPageSkeleton />}>
      <MusicContent />
    </Suspense>
  );
}

function MusicContent() {
  const searchParams = useSearchParams();
  const [tracks, setTracks] = useState<Track[]>([]);
  
  // Состояния для пагинации
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Хук для отслеживания "дна" страницы
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '200px',
  });

  // Функция загрузки данных
  async function fetchTracks(pageNum: number, isNewSearch: boolean = false) {
    // Если уже загружаем или данные кончились (и это не новый поиск) — выходим
    if (loading) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', pageNum.toString());
      params.set('ordering', '-created_at');

      const res = await api.get(`/api/tracks/?${params.toString()}`);
      const newTracks = res.data.results || res.data;

      if (isNewSearch || pageNum === 1) {
        setTracks(newTracks);
      } else {
        setTracks(prev => {
          const existingIds = new Set(prev.map(t => t.id));
          const uniqueNewTracks = newTracks.filter((t: Track) => !existingIds.has(t.id));
          return [...prev, ...uniqueNewTracks];
        });
      }

      if (!res.data.next) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    } catch (err: any) {
      // ИСПРАВЛЕНИЕ: Если 404, значит страницы кончились (стандарт DRF)
      if (err.response && err.response.status === 404) {
        setHasMore(false);
      } else {
        console.error("Ошибка загрузки треков:", err);
      }
    } finally {
      setLoading(false);
    }
  }

  // Эффект 1: Смена фильтров -> Грузим страницу 1
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchTracks(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Эффект 2: Бесконечный скролл
  useEffect(() => {
    // ИСПРАВЛЕНИЕ: Добавлено tracks.length > 0
    // Мы не пытаемся грузить следующую страницу, пока не загружена хотя бы первая.
    if (inView && hasMore && !loading && tracks.length > 0) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchTracks(nextPage, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, hasMore, loading, tracks.length]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white">Каталог музыки</h1>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="lg:hidden flex items-center gap-2 border-2 border-white text-white font-bold uppercase tracking-wide hover:bg-white hover:text-black transition-colors"
          onClick={() => setMobileFiltersOpen(true)}
        >
          <Filter size={18} strokeWidth={3} /> Фильтры
        </Button>
      </div>

      <div className="flex gap-8 relative items-start">
        <FilterSidebar 
          mobileOpen={mobileFiltersOpen} 
          setMobileOpen={setMobileFiltersOpen} 
        />

        <div className="flex-1 min-w-0 relative min-h-[800px]">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {tracks.map((track) => (
              <TrackCard key={track.id} track={track} playlist={tracks} />
            ))}
          </div>

          {tracks.length === 0 && !loading && (
            <div className="text-center py-20 bg-background rounded-lg animate-in fade-in">
              <p className="text-gray-400 text-lg">По выбранным фильтрам ничего не найдено.</p>
              <Button 
                variant="outline" 
                className="mt-4 border border-white/80 text-white"
                onClick={() => window.location.href = '/music'}
              >
                Очистить фильтры
              </Button>
            </div>
          )}

          {/* Observer срабатывает, только если есть еще страницы */}
          {(hasMore || loading) && (
            <div ref={ref} className="w-full py-8 flex justify-center min-h-[100px] mt-4">
               {loading && (
                 <div className="flex flex-col items-center gap-2 text-gray-400">
                    <Loader2 className="animate-spin text-green-400" size={32} />
                    {tracks.length > 0 && <span className="text-sm">Загрузка...</span>}
                 </div>
               )}
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}