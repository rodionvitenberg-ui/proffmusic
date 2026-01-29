import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/profile/', '/checkout/', '/admin/'], // Закрываем личные кабинеты
    },
    sitemap: 'https://proffmusic.ru/sitemap.xml',
  };
}