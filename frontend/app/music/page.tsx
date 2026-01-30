'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Filter, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { Track } from '@/lib/store';
import { TrackCard } from '@/components/shared/TrackCard';
import { FilterSidebar } from '@/components/shared/FilterSidebar';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

// --- КОМПОНЕНТ-ЗАГЛУШКА (SKELETON) ---
// Он повторяет структуру страницы, чтобы скролл не прыгал, если React решит "перемонтировать" контент.
function MusicPageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white">Каталог музыки</h1>
      </div>
      <div className="flex gap-8 relative items-start">
        {/* Фейковый сайдбар */}
        <aside className="hidden lg:block w-64 shrink-0 sticky top-24 h-[calc(100vh-6rem)] border-r border-white/5">
           <div className="h-full w-full bg-[#181818]/50 animate-pulse rounded-lg" />
        </aside>
        {/* Фейковый контент */}
        <div className="flex-1 min-w-0">
           <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-[380px] bg-[#181818]/50 animate-pulse rounded-xl" />
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
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    async function fetchTracks() {
      setLoading(true);
      try {
        const queryString = searchParams.toString();
        const res = await api.get(`/api/tracks/?${queryString}&ordering=-created_at`);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white">Каталог музыки</h1>
        
        {/* КНОПКА ФИЛЬТРОВ (МОБИЛЬНАЯ) */}
        {/* Обновленный стиль: Белая обводка, белый текст, жирный шрифт */}
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
          {loading && (
            <div className="absolute inset-0 z-20 bg-[#0f0f0f]/30 backdrop-blur-[1px] flex items-start justify-center pt-32 transition-all duration-300 rounded-xl">
              <div className="bg-[#181818] p-4 rounded-full shadow-2xl border border-white/10">
                 <Loader2 className="animate-spin text-green-400" size={32} />
              </div>
            </div>
          )}

          <div className={cn("transition-opacity duration-300", loading ? "opacity-40 pointer-events-none" : "opacity-100")}>
            {tracks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {tracks.map((track) => (
                  <TrackCard key={track.id} track={track} playlist={tracks} />
                ))}
              </div>
            ) : (
              !loading && (
                <div className="text-center py-20 bg-[#181818] rounded-lg border border-white/5 animate-in fade-in">
                  <p className="text-gray-400 text-lg">По выбранным фильтрам ничего не найдено.</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => window.location.href = '/music'}
                  >
                    Очистить фильтры
                  </Button>
                </div>
              )
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}