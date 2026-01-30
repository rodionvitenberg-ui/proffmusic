import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// --- Типы данных ---

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  tag_type: 'mood' | 'instrument' | 'usage';
}

export interface Track {
  id: number;
  title: string;
  slug: string;
  price: string | number; // Цена может приходить строкой или числом
  cover_image?: string;
  audio_file_preview?: string;
  duration?: string;
  category?: Category;
  tags?: Tag[];
  description_short?: string;
  description_full?: string;
  is_new?: boolean;
}

export interface Collection {
  id: number;
  title: string;
  slug: string;
  cover_image?: string;
  price: string | number;
  description?: string;
  tracks?: Track[];
  is_new?: boolean;
}

// Элемент корзины
export interface CartItem {
  id: number;
  type: 'track' | 'collection';
  title: string;
  price: number;
  image?: string;
  slug: string;
  cartId: string;
  originalData?: Track | Collection;
}

// Интерфейс плеера
interface PlayerState {
  currentTrack: Track | null;
  playlist: Track[];
  isPlaying: boolean;
  setTrack: (track: Track, playlist?: Track[]) => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrev: () => void;
  pause: () => void;
  play: () => void;
}

// Интерфейс корзины
interface CartState {
  items: CartItem[];
  addToCart: (item: Track | Collection, type: 'track' | 'collection') => void;
  removeFromCart: (id: number, type: 'track' | 'collection') => void;
  isInCart: (id: number, type: 'track' | 'collection') => boolean;
  clearCart: () => void;
  totalPrice: () => number;
}

// --- Реализация Store ---

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      currentTrack: null,
      playlist: [],
      isPlaying: false,

      setTrack: (track, playlist = []) => {
        if (get().currentTrack?.id === track.id) {
          set((state) => ({ isPlaying: !state.isPlaying }));
        } else {
          set({ 
            currentTrack: track, 
            playlist: playlist.length > 0 ? playlist : [track],
            isPlaying: true 
          });
        }
      },

      togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
      pause: () => set({ isPlaying: false }),
      play: () => set({ isPlaying: true }),

      playNext: () => {
        const { currentTrack, playlist } = get();
        if (!currentTrack || playlist.length === 0) return;
        const currentIndex = playlist.findIndex((t) => t.id === currentTrack.id);
        const nextTrack = playlist[currentIndex + 1];
        if (nextTrack) set({ currentTrack: nextTrack, isPlaying: true });
        else set({ isPlaying: false });
      },
      
      playPrev: () => {
        const { currentTrack, playlist } = get();
        if (!currentTrack || playlist.length === 0) return;
        const currentIndex = playlist.findIndex((t) => t.id === currentTrack.id);
        const prevTrack = playlist[currentIndex - 1];
        if (prevTrack) set({ currentTrack: prevTrack, isPlaying: true });
      }
    }),
    {
      name: 'proffmusic-player',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        currentTrack: state.currentTrack, 
        playlist: state.playlist,
        volume: 1
      }),
    }
  )
);

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addToCart: (item, type) => {
        const { items } = get();
        // Проверяем дубликаты
        const exists = items.find((i) => i.id === item.id && i.type === type);
        if (exists) return;

        const newItem: CartItem = {
          id: item.id,
          type,
          title: item.title,
          price: Number(item.price), // Гарантируем число
          image: item.cover_image,
          slug: item.slug,
          cartId: `${type}-${item.id}`, // Генерируем уникальный ключ
          originalData: item,
        };

        set({ items: [...items, newItem] });
      },

      removeFromCart: (id, type) => {
        set((state) => ({
          items: state.items.filter(item => !(item.id === id && item.type === type))
        }));
      },

      isInCart: (id, type) => {
        return get().items.some((i) => i.id === id && i.type === type);
      },

      clearCart: () => set({ items: [] }),
      
      totalPrice: () => {
        return get().items.reduce((sum, item) => sum + item.price, 0);
      }
    }),
    {
      name: 'proffmusic-cart',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    }
  )
);