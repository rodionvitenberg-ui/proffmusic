import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from './api';

export interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    avatar: string | null;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    token: string | null;
    
    // Действия
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, re_password: string) => Promise<void>;
    logout: () => void;
    fetchProfile: () => Promise<void>;
    updateAvatar: (file: File) => Promise<void>;
    checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            token: null,

            login: async (email, password) => {
                try {
                    // 1. Получаем токены
                    const res = await api.post('/auth/jwt/create/', { email, password });
                    const { access, refresh } = res.data;

                    // 2. Сохраняем токен в стейт и в localStorage (для axios интерцептора)
                    localStorage.setItem('accessToken', access); 
                    set({ token: access, isAuthenticated: true });

                    // 3. Грузим профиль
                    await get().fetchProfile();
                } catch (error) {
                    console.error("Login error:", error);
                    throw error;
                }
            },

            register: async (email, password, re_password) => {
                // Djoser требует re_password
                await api.post('/auth/users/', { email, password, username: email, re_password });
                // После регистрации сразу логиним
                await get().login(email, password);
            },

            logout: () => {
                localStorage.removeItem('accessToken');
                set({ user: null, token: null, isAuthenticated: false });
            },

            fetchProfile: async () => {
                try {
                    // Djoser endpoint 'me' возвращает профиль
                    const res = await api.get('/auth/users/me/');
                    set({ user: res.data });
                } catch (error) {
                    // Если токен протух - разлогиниваем
                    get().logout();
                }
            },
            
            updateAvatar: async (file) => {
                const formData = new FormData();
                formData.append('avatar', file);
                
                // Важно: для файлов Content-Type должен быть multipart/form-data
                // Axios обычно сам ставит, если видит FormData, но заголовок Bearer нужен
                const res = await api.post('/users/upload_avatar/', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                
                // Обновляем юзера в стейте
                set((state) => ({ 
                    user: { ...state.user!, avatar: res.data.avatar } 
                }));
            },

            checkAuth: async () => {
                // 1. Пытаемся достать токен руками, если Zustand еще спит
                const token = localStorage.getItem('accessToken');
                
                if (token) {
                    // 2. Если токен есть, считаем, что мы авторизованы (пока предварительно)
                    set({ token, isAuthenticated: true });
                    
                    // 3. Пробуем загрузить профиль, чтобы убедиться, что токен живой
                    try {
                        await get().fetchProfile();
                    } catch (e) {
                        // Если токен протух — выкидываем
                        get().logout();
                    }
                }
            }
        }),
        {
            name: 'proffmusic-auth',
            storage: createJSONStorage(() => localStorage),
            skipHydration: true,
        }
    )
);