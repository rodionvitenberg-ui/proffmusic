import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

function getLocale(): string {
  if (typeof window !== 'undefined') {
    // next-intl middleware сохраняет locale в cookie NEXT_LOCALE
    const match = document.cookie.match(/(?:^|;\s*)NEXT_LOCALE=([^;]+)/);
    return match ? match[1] : 'ru';
  }
  return 'ru';
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ПЕРЕХВАТЧИК: Добавляет токен и локаль в каждый запрос
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Передаём язык на бэкенд (Django LocaleMiddleware читает Accept-Language)
    if (config.headers) {
      config.headers['Accept-Language'] = getLocale();
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;