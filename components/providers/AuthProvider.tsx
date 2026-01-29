'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/auth';

export function AuthProvider() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    // При монтировании приложения проверяем, есть ли сохраненный вход
    useAuthStore.persist.rehydrate(); // Восстанавливаем состояние zustand
    checkAuth(); // Проверяем токен и грузим профиль
  }, [checkAuth]);

  return null; // Этот компонент ничего не рисует, он просто работает в фоне
}