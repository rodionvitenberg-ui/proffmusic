'use client';

import * as React from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/label';
import { Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Transition from '@/components/ui/transition'; 
import { Card, CardContent } from '@/components/ui/card';


// Кастомный Input
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md bg-[#181818] text-white px-3 py-2 text-base ring-offset-background placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-300",
          className
        )}
        style={{
          borderWidth: "2px",
          borderImage: `conic-gradient(
            rgb(80, 80, 80) 0deg,
            rgb(23, 23, 23) 90deg,
            rgb(80, 80, 80) 180deg,
            rgb(23, 23, 23) 270deg,
            rgb(80, 80, 80) 360deg
          ) 1 / 1 / 0 stretch`,
        }}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await login(email, password);
      router.push('/profile');
    } catch (err: any) {
        const msg = err.response?.data?.detail || 'Неверный логин или пароль';
        setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // --- ОБНОВЛЕННОЕ ИНТРО ---
  // triggerExit больше не нужен, так как у нас autoExit={true}
  const introContent = () => (
    <div className="flex flex-col items-center justify-center gap-6 p-4">
      
      {/* 1. Логотипы */}
      <div className="relative">
        {/* Мобильный логотип */}
        <img 
          src="/logo2.png" 
          alt="ProffMusic Logo" 
          className="w-40 h-auto object-contain md:hidden" 
        />
        {/* Десктопный логотип */}
        <img 
          src="/logo.png" 
          alt="ProffMusic Logo" 
          className="hidden md:block w-100 h-auto object-contain" 
        />
      </div>

      {/* Слоган */}
      <div className="text-lg sm:text-xl md:text-2xl text-white font-light tracking-wide opacity-80 max-w-[280px] sm:max-w-md text-center break-words">
        Профессиональная музыка для твоих проектов
      </div>
      
      {/* Декоративная полоска */}
      <div className="w-16 h-0.5 bg-white/30 rounded-full"></div>

      {/* 2. Кнопка "Войти" удалена, так как переход автоматический */}
    </div>
  );

  return (
    <div className="bg-[#0f0f0f] flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-4 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <div className="flex flex-col gap-6 overflow-hidden">
          
          <Transition
            intro={introContent}
            introDuration={0.8}
            transitionDuration={0.5}
            type="slide"
            direction="right"
            className="bg-[#181818] rounded-xl"
            autoExit={true}
          >
            <Card className="overflow-hidden p-0 border-0 bg-[#181818] shadow-2xl">
              <CardContent className="grid p-0 md:grid-cols-2">
                
                {/* ЛЕВАЯ ЧАСТЬ: ФОРМА */}
                <div className="p-6 md:p-12 relative flex flex-col justify-center">
                  <div className="flex flex-col gap-6 relative z-10">
                    <div className="flex flex-col items-center text-center">
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                        С возвращением
                      </h1>
                      <p className="text-gray-400 text-sm mt-2">
                        Войдите, чтобы управлять покупками
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="grid gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm text-gray-300 font-medium">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="name@example.com"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="password" className="text-sm text-gray-300 font-medium">Пароль</Label>
                          <Link
                            href="#"
                            className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                          >
                            Забыли пароль?
                          </Link>
                        </div>
                        <Input
                          id="password"
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>

                      {error && (
                        <div className="flex items-center gap-2 p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                          <AlertCircle size={16} />
                          {error}
                        </div>
                      )}

                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 mt-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                      >
                        {loading ? <Loader2 className="animate-spin" /> : 'Войти'}
                      </Button>
                    </form>

                    <div className="text-center text-sm text-gray-400">
                      Нет аккаунта?{" "}
                      <Link href="/register" className="text-purple-400 hover:text-purple-300 underline underline-offset-4 transition-colors">
                        Зарегистрироваться
                      </Link>
                    </div>
                  </div>
                </div>

                {/* ПРАВАЯ ЧАСТЬ: КАРТИНКА */}
                <div className="relative hidden md:flex overflow-hidden w-full h-full min-h-[600px]">
                  <div className="absolute inset-0 bg-purple-900/20 z-10 mix-blend-overlay" />
                  <img
                    src="https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?q=80&w=1920&auto=format&fit=crop"
                    alt="Music Background"
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                  />
                  
                  <div className="absolute bottom-12 left-12 right-12 z-20">
                     <blockquote className="text-white border-l-2 border-purple-500 pl-4">
                        <p className="text-lg font-medium italic">
                          "Музыка — это стенограмма эмоций."
                        </p>
                        <footer className="text-sm text-gray-300 mt-2">— Лев Толстой</footer>
                     </blockquote>
                  </div>
                </div>

              </CardContent>
            </Card>
          </Transition>

          {/* ФУТЕР ФОРМЫ (Плавное появление) */}
          <div className="w-full max-w-sm md:max-w-3xl mx-auto px-4 sm:px-6">
            <motion.div
              className="text-gray-500 text-center text-xs sm:text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }} // Чуть увеличил задержку, так как introDuration=2.5
            >
              Нажимая войти, вы соглашаетесь с{" "}
              <Link href="/privacy" className="text-purple-400 hover:underline">
                Политикой конфиденциальности
              </Link>
              .
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
}