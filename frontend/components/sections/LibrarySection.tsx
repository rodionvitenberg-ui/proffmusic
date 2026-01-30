'use client';

import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { Track } from '@/lib/store';
import { TrackCard } from '@/components/shared/TrackCard';

export function LibrarySection() {
  const [libraryTracks, setLibraryTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '200px',
  });

  async function fetchLibrary(pageNum: number) {
    setLoading(true);
    try {
      const res = await api.get(`/api/tracks/?page=${pageNum}&ordering=-created_at`);
      const newTracks = res.data.results || res.data;
      
      if (pageNum === 1) {
        setLibraryTracks(newTracks);
      } else {
        setLibraryTracks(prev => {
          const existingIds = new Set(prev.map(t => t.id));
          const uniqueNewTracks = newTracks.filter((t: Track) => !existingIds.has(t.id));
          return [...prev, ...uniqueNewTracks];
        });
      }

      if (!res.data.next) {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Ошибка загрузки фонотеки:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLibrary(1);
  }, []);

  useEffect(() => {
    if (inView && hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchLibrary(nextPage);
    }
  }, [inView, hasMore, loading]);

  return (
    <section id="library" className="py-20 px-4 sm:px-6 lg:px-8 bg-background/70">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-white mb-8">Вся фонотека</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {libraryTracks.map((track) => (
            <TrackCard key={track.id} track={track} playlist={libraryTracks} />
          ))}
        </div>

        {/* Элемент-триггер для Observer'а */}
        <div ref={ref} className="mt-12 flex justify-center w-full py-8 min-h-[100px]">
          {loading && hasMore && (
            <div className="flex flex-col items-center text-gray-400 gap-2">
               <Loader2 className="animate-spin" size={32} />
               <span className="text-sm">Загрузка музыки...</span>
            </div>
          )}
          
          {!hasMore && libraryTracks.length > 0 && (
            <p className="text-gray-500 animate-in fade-in">Вы посмотрели все треки.</p>
          )}
        </div>
      </div>
    </section>
  );
}