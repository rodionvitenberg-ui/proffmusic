import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TrackDetails } from '@/components/music/TrackDetails';
import api from '@/lib/api';
import { Track } from '@/lib/store';
import { TrackCard } from '@/components/shared/TrackCard';

type Props = {
  params: Promise<{ slug: string }>;
};

// Функция загрузки трека (вынесена для переиспользования)
async function getTrack(slug: string) {
  try {
    const decodedSlug = decodeURIComponent(slug);
    const res = await api.get<Track>(`/tracks/${decodedSlug}/`);
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

// 1. ИСПРАВЛЕНИЕ МЕТАДАННЫХ
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const track = await getTrack(slug);

  if (!track) {
    return { title: 'Трек не найден | ProffMusic' };
  }

  // Фикс: проверяем, есть ли картинка. Если нет — передаем пустой массив или дефолтную картинку.
  const images = track.cover_image ? [track.cover_image] : [];

  return {
    title: `${track.title} | Скачать музыку | ProffMusic`,
    description: track.description_short || `Купить лицензионный трек ${track.title}.`,
    openGraph: {
      title: track.title,
      description: track.description_short,
      images: images, // Теперь тут массив строк, без undefined
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
    image: track.cover_image || '', // Фикс для JSON-LD
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
      
      <div className="min-h-screen bg-[#0f0f0f]">
        <TrackDetails track={track} />

        {relatedTracks.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-white/5">
            <h2 className="text-2xl font-bold text-white mb-8">Похожие треки</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedTracks.map((related) => (
                <TrackCard key={related.id} track={related} playlist={relatedTracks} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}