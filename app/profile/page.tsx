'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { LogOut, Camera, Package, Calendar } from 'lucide-react';

interface OrderHistoryItem {
    id: string;
    amount: string;
    created_at: string;
    items_display: string[];
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, updateAvatar, isAuthenticated } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // 1. Проверка авторизации
  useEffect(() => {
    // Небольшой таймаут для гидратации zustand
    const timer = setTimeout(() => {
        if (!isAuthenticated) router.push('/login');
    }, 500);
    return () => clearTimeout(timer);
  }, [isAuthenticated, router]);

  // 2. Загрузка истории заказов
  useEffect(() => {
    if (isAuthenticated) {
        api.get('/users/orders/')
           .then(res => setOrders(res.data))
           .catch(console.error)
           .finally(() => setLoadingOrders(false));
    }
  }, [isAuthenticated]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        try {
            await updateAvatar(file);
        } catch (error) {
            alert('Ошибка загрузки фото');
        }
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* ЛЕВАЯ КОЛОНКА: Профиль */}
        <div className="bg-[#181818] p-6 rounded-xl border border-white/5 h-fit text-center">
            {/* Аватар */}
            <div className="relative w-32 h-32 mx-auto mb-4 group">
                <img 
                    src={user.avatar || '/placeholder-user.jpg'} // Закинь placeholder-user.jpg в public
                    alt="Avatar" 
                    className="w-full h-full rounded-full object-cover border-4 border-[#252525]"
                />
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
                >
                    <Camera className="text-white" />
                </button>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleAvatarChange}
                />
            </div>
            
            <h2 className="text-xl font-bold text-white mb-1">
                {user.first_name || 'Пользователь'} {user.last_name}
            </h2>
            <p className="text-gray-400 text-sm mb-6">{user.email}</p>
            
            <Button variant="secondary" onClick={() => { logout(); router.push('/'); }} className="w-full gap-2">
                <LogOut size={16} /> Выйти
            </Button>
        </div>

        {/* ПРАВАЯ КОЛОНКА: История заказов */}
        <div className="md:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4">История покупок</h2>
            
            {loadingOrders ? (
                <p className="text-gray-500">Загрузка...</p>
            ) : orders.length > 0 ? (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-[#181818] p-5 rounded-lg border border-white/5 flex flex-col sm:flex-row justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                                    <Calendar size={14} />
                                    {new Date(order.created_at).toLocaleDateString()} 
                                    <span className="text-gray-600">|</span> 
                                    #{order.id.slice(0, 8)}
                                </div>
                                <div className="space-y-1">
                                    {order.items_display.map((title, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-white font-medium">
                                            <Package size={16} className="text-green-400" />
                                            {title}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-lg font-bold text-white">{order.amount} ₽</div>
                                <div className="text-xs text-green-400 font-medium uppercase tracking-wider mt-1">Оплачено</div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-[#181818] rounded-lg border border-white/5">
                    <p className="text-gray-400">Вы еще ничего не купили.</p>
                </div>
            )}
        </div>

      </div>
    </div>
  );
}