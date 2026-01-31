import { MetadataRoute } from 'next';
import api from '@/lib/api';
import { Track, Collection, Category } from '@/lib/store';

// Базовый URL
const BASE_URL = 'https://proffmusic.ru';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const [tracksRes, collectionsRes, categoriesRes] = await Promise.all([
      api.get('/api/tracks/?page_size=1000'),
      api.get('/api/collections/?page_size=1000'),
      api.get('/api/categories/'),
    ]);

    const tracks: Track[] = tracksRes.data.results || tracksRes.data;
    const collections: Collection[] = collectionsRes.data.results || collectionsRes.data;
    const categories: Category[] = categoriesRes.data;

    const trackUrls = tracks.map((track) => ({
      url: `${BASE_URL}/api/tracks/${track.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    const collectionUrls = collections.map((col) => ({
      url: `${BASE_URL}/api/collections/${col.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }));

    const categoryUrls = categories.map((cat) => ({
      url: `${BASE_URL}/api/music?category__slug=${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }));

    const routes = [
      '',
      '/music',
      '/about',
      '/login',
      '/register',
    ].map((route) => ({
      url: `${BASE_URL}${route}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    }));

    return [...routes, ...collectionUrls, ...trackUrls, ...categoryUrls];
    
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return [
      {
        url: BASE_URL,
        lastModified: new Date(),
      },
    ];
  }
}