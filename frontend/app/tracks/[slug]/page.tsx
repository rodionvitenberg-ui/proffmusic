import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TrackDetails } from '@/components/music/TrackDetails';
import api from '@/lib/api';
import { Track } from '@/lib/store';
import { TrackCard } from '@/components/shared/TrackCard';

type Props = {
  params: Promise<{ slug: string }>;
};

// Функция загрузки трека
async function getTrack(slug: string) {
  try {
    const decodedSlug = decodeURIComponent(slug);
    const res = await api.get<Track>(`/api/tracks/${decodedSlug}/`);
    return res.data;
  } catch (e) {
    return null;
  }
}

async function getRelatedTracks(categorySlug: string | undefined, currentId: number) {
  if (!categorySlug) return [];
  try {
    const res = await api.get(`/api/tracks/?category__slug=${categorySlug}&page_size=4`);
    const tracks = (res.data.results || res.data) as Track[];
    return tracks.filter(t => t.id !== currentId).slice(0, 3);
  } catch (e) {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const track = await getTrack(slug);

  if (!track) {
    return { title: 'Трек не найден | ProffMusic' };
  }

  return {
    title: `${track.title} - ${track.category?.name || 'Music'} | ProffMusic`,
    description: track.description_full || `Слушать трек ${track.title} на ProffMusic`,
    openGraph: {
      images: [track.cover_image || '/logo.png'],
    },
  };
}

export default async function TrackPage({ params }: Props) {
  const { slug } = await params;
  const track = await getTrack(slug);

  if (!track) {
    notFound();
  }

  const relatedTracks = await getRelatedTracks(track.category?.slug, track.id);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MusicRecording',
    name: track.title,
    duration: track.duration ? `PT${track.duration}` : undefined,
    image: track.cover_image || '',
    description: track.description_full,
    offers: {
      '@type': 'Offer',
      price: track.price,
      priceCurrency: 'RUB',
      url: `https://proffmusic.ru/tracks/${track.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* ИСПРАВЛЕНИЕ ЗАЗОРА:
         1. 'bg-[#0f0f0f]' — чтобы фон страницы сливался с компонентом TrackDetails.
         2. 'min-h-screen' — растягивает фон на всю высоту, убирая белые/черные полосы снизу.
         3. 'flex flex-col' — для правильного позиционирования дочерних элементов.
      */}
      <div className="w-full bg-[#0f0f0f] min-h-screen flex flex-col">
        
        <TrackDetails track={track} />

        {relatedTracks.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-white/5 w-full">
            <h2 className="text-2xl font-bold text-white mb-8">Похожие треки</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedTracks.map((related) => (
                <TrackCard key={related.id} track={related} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}