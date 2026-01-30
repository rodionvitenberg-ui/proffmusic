'use client';

import { useEffect, useState } from 'react';
import { ArrowDown } from 'lucide-react';
import api from '@/lib/api';
import { Track } from '@/lib/store';
import { TrackCard } from '@/components/shared/TrackCard';
import { Button } from '@/components/ui/Button';

export function LibrarySection() {
  const [libraryTracks, setLibraryTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  async function fetchLibrary(pageNum: number) {
    setLoading(true);
    try {
      const res = await api.get(`/tracks/?page=${pageNum}&ordering=-created_at`);
      const newTracks = res.data.results || res.data;
      
      if (pageNum === 1) {
        setLibraryTracks(newTracks);
      } else {
        setLibraryTracks(prev => [...prev, ...newTracks]);
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

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchLibrary(nextPage);
  };

  return (
    <section id="library" className="py-20 px-4 sm:px-6 lg:px-8 bg-background/70">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-white mb-8">Вся фонотека</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {libraryTracks.map((track) => (
            <TrackCard key={track.id} track={track} playlist={libraryTracks} />
          ))}
        </div>

        <div className="mt-12 text-center">
          {hasMore ? (
            <Button 
              variant="outline" 
              size="lg" 
              onClick={loadMore}
              className="min-w-[200px]"
            >
              {loading ? 'Загрузка...' : 'Показать еще'}
              {!loading && <ArrowDown className="ml-2" size={16} />}
            </Button>
          ) : (
            <p className="text-gray-500 mt-8">Вы посмотрели все треки.</p>
          )}
        </div>
      </div>
    </section>
  );
}