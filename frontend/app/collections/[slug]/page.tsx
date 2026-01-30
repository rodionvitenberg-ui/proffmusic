import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import api from '@/lib/api';
import { Collection } from '@/lib/store';
import { CollectionDetails } from '@/components/music/CollectionDetails';

type Props = {
  params: Promise<{ slug: string }>;
};

// 1. ИСПРАВЛЕНИЕ МЕТАДАННЫХ
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const res = await api.get<Collection>(`/api/collections/${slug}/`);
    const collection = res.data;
    
    // Фикс:
    const images = collection.cover_image ? [collection.cover_image] : [];

    return {
      title: `${collection.title} | Сборник ProffMusic`,
      description: collection.description,
      openGraph: { 
        images: images, 
      },
    };
  } catch (e) {
    return { title: 'Сборник не найден' };
  }
}

async function getCollection(slug: string) {
  try {
    const res = await api.get<Collection>(`/api/collections/${slug}/`);
    return res.data;
  } catch (e) {
    return null;
  }
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  const collection = await getCollection(slug);

  if (!collection) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MusicAlbum',
    name: collection.title,
    description: collection.description,
    image: collection.cover_image,
    numTracks: collection.tracks?.length || 0,
    offers: {
      '@type': 'Offer',
      price: collection.price,
      priceCurrency: 'RUB',
      url: `https://proffmusic.ru/collections/${collection.slug}`,
    },
    track: collection.tracks?.map(track => ({
      '@type': 'MusicRecording',
      name: track.title,
      duration: track.duration ? `PT${track.duration}` : undefined,
      url: `https://proffmusic.ru/tracks/${track.slug}`
    }))
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
       <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
       
       <CollectionDetails collection={collection} />
    </div>
  );
}