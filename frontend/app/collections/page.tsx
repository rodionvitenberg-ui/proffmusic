'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { Collection } from '@/lib/store';
import { CollectionCard } from '@/components/music/CollectionCard';

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCollections() {
      try {
        const res = await api.get('/collections/?ordering=-created_at');
        setCollections(res.data.results || res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchCollections();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">Сборники Музыки</h1>
        <p className="text-gray-400 max-w-2xl mx-auto text-lg">
          Тематические подборки для ваших проектов. Экономьте до 50% покупая паком.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-white" size={40} />
        </div>
      ) : collections.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {collections.map((col) => (
            <CollectionCard key={col.id} collection={col} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-[#181818] rounded-lg border border-white/5">
          <p className="text-gray-400 text-lg">Сборники пока не добавлены.</p>
        </div>
      )}
    </div>
  );
}