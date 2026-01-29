'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import api from '@/lib/api';
import { Track } from '@/lib/store';
import { TrackCard } from '@/components/shared/TrackCard';
import { Button } from '@/components/ui/Button';

export function NewReleases() {
  const [newReleases, setNewReleases] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNew() {
      try {
        const res = await api.get('/tracks/?is_new=true');
        setNewReleases(res.data.results || res.data);
      } catch (err) {
        console.error('Ошибка загрузки новинок:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchNew();
  }, []);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-white">Новые релизы</h2>
          
          {/* Облачили в кнопку с использованием asChild для правильной вложенности Link */}
          <Button 
            variant="ghost" 
            asChild 
            className="text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Link href="/music?is_new=true" className="flex items-center gap-2">
              Смотреть все 
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {newReleases.map((track) => (
            <TrackCard key={track.id} track={track} playlist={newReleases} />
          ))}
          
          {newReleases.length === 0 && !loading && (
            <p className="text-gray-500 col-span-3">Пока нет новинок.</p>
          )}
        </div>

      </div>
    </section>
  );
}