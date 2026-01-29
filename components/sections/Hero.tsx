'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Music } from 'lucide-react';

export function Hero() {
  const scrollToLibrary = () => {
    document.getElementById('library')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative h-[80vh] flex items-center justify-center bg-gradient-to-b from-purple-900/20 to-[#0f0f0f]">
      {/* Фон можно вынести в CSS или оставить так */}
      <div className="absolute inset-0 bg-[url('/hero-bg.jpg')] opacity-10 bg-cover bg-center" />
      
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in duration-700">
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight">
          Профессиональная <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Авторская Музыка
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
          Для видео, рекламы, YouTube и корпоративных проектов. 
          Живые инструменты, коммерческая лицензия, никаких проблем с Content ID.
        </p>
        
        <div className="flex items-center justify-center gap-4 pt-4">
          <Button size="lg" onClick={scrollToLibrary}>
            <Music className="mr-2" size={20} />
            Слушать треки
          </Button>
          <Link href="/about">
            <Button variant="outline" size="lg">О нас</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}