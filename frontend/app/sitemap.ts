import { MetadataRoute } from 'next';
import api from '@/lib/api';
import { Track, Collection, Category } from '@/lib/store';

// Базовый URL
const BASE_URL = 'https://proffmusic.shop';
const LOCALES = ['ru', 'en'];

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

    const trackUrls = tracks.flatMap((track) =>
      LOCALES.map((locale) => ({
        url: `${BASE_URL}/${locale}/tracks/${track.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
        alternates: {
          languages: {
            ru: `${BASE_URL}/ru/tracks/${track.slug}`,
            en: `${BASE_URL}/en/tracks/${track.slug}`,
          },
        },
      }))
    );

    const collectionUrls = collections.flatMap((col) =>
      LOCALES.map((locale) => ({
        url: `${BASE_URL}/${locale}/collections/${col.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
        alternates: {
          languages: {
            ru: `${BASE_URL}/ru/collections/${col.slug}`,
            en: `${BASE_URL}/en/collections/${col.slug}`,
          },
        },
      }))
    );

    const categoryUrls = categories.flatMap((cat) =>
      LOCALES.map((locale) => ({
        url: `${BASE_URL}/${locale}/music?category__slug=${cat.slug}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.7,
        alternates: {
          languages: {
            ru: `${BASE_URL}/ru/music?category__slug=${cat.slug}`,
            en: `${BASE_URL}/en/music?category__slug=${cat.slug}`,
          },
        },
      }))
    );

    const staticRoutes = ['', '/music', '/about', '/collections', '/license', '/contacts', '/login', '/register'];

    const routes = staticRoutes.flatMap((route) =>
      LOCALES.map((locale) => ({
        url: `${BASE_URL}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1.0 : 0.8,
        alternates: {
          languages: {
            ru: `${BASE_URL}/ru${route}`,
            en: `${BASE_URL}/en${route}`,
          },
        },
      }))
    );

    return [...routes, ...collectionUrls, ...trackUrls, ...categoryUrls];

  } catch (error) {
    console.error('Sitemap generation error:', error);
    return [
      {
        url: `${BASE_URL}/ru`,
        lastModified: new Date(),
        alternates: {
          languages: {
            ru: `${BASE_URL}/ru`,
            en: `${BASE_URL}/en`,
          },
        },
      },
    ];
  }
}