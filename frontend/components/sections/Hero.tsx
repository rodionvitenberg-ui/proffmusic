'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Music } from 'lucide-react';
import GradientText from '@/components/GradientText';

export function Hero() {
  const scrollToLibrary = () => {
    document.getElementById('library')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    // Убрали bg-цвет и DarkVeil. Теперь фон прозрачный.
    <section className="relative h-[80vh] w-full flex items-center justify-center overflow-hidden">
      
      {/* КОНТЕНТ (Слой 10 - чтобы быть над будущим фоном, но под навбаром) */}
      <div className="relative z-10 w-full px-4 max-w-4xl mx-auto flex flex-col items-center justify-center text-center space-y-6 md:space-y-8">
        
        {/* ЗАГОЛОВКИ */}
        <div className="flex flex-col items-center justify-center">
          
          {/* Первая строка: Обычный белый текст */}
          <span className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight mb-2">
            Профессиональная
          </span>
          
          {/* Вторая строка: Только Градиент (без SplitText) */}
          <div className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-tight py-2">
             <GradientText
                colors={["#5227FF", "#FF9FFC", "#B19EEF"]}
                animationSpeed={8}
                showBorder={false}
                className="inline-block"
             >
                Авторская Музыка
             </GradientText>
          </div>

        </div>
        
        {/* ОПИСАНИЕ (Простой текст) */}
        <div className="flex flex-col items-center gap-2 max-w-3xl mx-auto text-base sm:text-lg md:text-xl text-gray-300 font-medium">
          <p>
            Для видео, рекламы, YouTube и корпоративных проектов.
          </p>
          <p className="text-gray-400">
            Живые инструменты, коммерческая лицензия, никаких проблем с Content ID.
          </p>
        </div>
        
        {/* КНОПКИ */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
          <Button 
            size="lg" 
            onClick={scrollToLibrary}
            className="w-full sm:w-auto h-12 text-base px-8 bg-white hover:bg-border hover:text-white text-black cursor-pointer transition flex items-center justify-center gap-2"
          >
            <Music className="mr-2" size={20} />
            Слушать треки
          </Button>
          <Link href="/about" className="w-full sm:w-auto">
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full h-12 text-base px-8 border-white/20 hover:border-white cursor-pointer text-white hover:bg-white/10 transition"
            >
              О нас
            </Button>
          </Link>
        </div>

      </div>
    </section>
  );
}