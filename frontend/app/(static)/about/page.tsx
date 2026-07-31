'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Music, ShieldCheck, Mic2, Heart } from 'lucide-react';

export default function AboutPage() {
  return (
    // ВНЕШНИЙ КОНТЕЙНЕР (Прозрачный, на всю высоту)
    <div className="min-h-screen w-full px-2 md:px-0">
      
      {/* ВНУТРЕННИЙ КОНТЕЙНЕР ("ПОДФОН" - Полоса) */}
      <div className="mx-auto max-w-5xl min-h-screen bg-secondary border-x border-white/5 shadow-2xl pt-32 pb-20 px-6 md:px-16">
        
        {/* Заголовок и Вступление */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
            ProffMusic
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed"> 
            We create sound that breathes, feels and amplifies your stories.
          </p>
        </div>

        {/* Блок преимуществ (Сетка) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            
            {/* Карточка 1: Живой звук */}
            <div className="bg-[#181818] p-8 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                <Mic2 className="text-purple-400 mb-4" size={32} />
                <h3 className="text-xl font-bold text-white mb-3">Никакого AI. Только люди.</h3>
                <p className="text-gray-400 leading-relaxed">
                    We principlely do not use neural networks for music generation. 
                    Every track in our library is written by a live composer, played on real instruments 
                    and mixed by a professional sound engineer. We believe that emotions can only be conveyed by a human.
                </p>
            </div>

            {/* Карточка 2: Юридическая чистота */}
            <div className="bg-[#181818] p-8 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                <ShieldCheck className="text-green-400 mb-4" size={32} />
                <h3 className="text-xl font-bold text-white mb-3">100% Безопасно.</h3>
                <p className="text-gray-400 leading-relaxed">
                    No strikes or Content ID. We own the exclusive rights to all music in our catalog. 
                    When you purchase a license, you receive an official document that protects your project on YouTube, 
                    in film and on TV.
                </p>
            </div>
        </div>

        {/* Текстовый блок: История */}
        <div className="prose prose-invert prose-lg max-w-none mb-20">
            <h2 className="text-3xl font-bold text-white mb-6">Our Philosophy</h2>
            <p className="text-gray-300">
                In the era of fast-food content, we have chosen a different path. We create music not for algorithms, but for directors, 
                who value details. We know how difficult it is to find a track that doesn't sound like a "stock placeholder".
            </p>
            <p className="text-gray-300">
                ProffMusic started as a closed community of composers working for the film industry. 
                Today we have opened our archives to all creators. Here you will not find millions of identical tracks. 
                Instead, we offer a carefully curated collection where each piece has its own character.
            </p>
        </div>

        {/* Блок: Кому это нужно? */}
        <div className="border-t border-white/10 pt-16 mb-16">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">Ideally suited for</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-4 bg-white/5 rounded-lg text-white font-medium">Cinema and Trailers</div>
                <div className="p-4 bg-white/5 rounded-lg text-white font-medium">YouTube Blogs</div>
                <div className="p-4 bg-white/5 rounded-lg text-white font-medium">Advertising Videos</div>
                <div className="p-4 bg-white/5 rounded-lg text-white font-medium">Gaming Industry</div>
            </div>
        </div>

        {/* CTA (Призыв к действию) */}
        <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 rounded-2xl p-10 text-center border border-white/10 relative overflow-hidden">
            <div className="relative z-10">
                <Heart className="mx-auto text-white mb-4" size={40} />
                <h2 className="text-3xl font-bold text-white mb-4">Find Your Sound</h2>
                <p className="text-gray-300 mb-8 max-w-lg mx-auto">
                    Listen our collection and verify the quality yourself. Demo versions are available for free.
                </p>
                <Link href="/music">
                    <Button size="lg" className="bg-white text-black hover:bg-gray-200 font-bold px-8">
                        <Music className="mr-2" size={18} />
                        Go to Library
                    </Button>
                </Link>
            </div>
        </div>

      </div>
    </div>
  );
}