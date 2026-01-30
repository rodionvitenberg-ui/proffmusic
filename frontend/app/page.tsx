import { Hero } from '@/components/sections/Hero';
import { NewReleases } from '@/components/sections/NewReleases';
import { LibrarySection } from '@/components/sections/LibrarySection';
import DarkVeil from '@/components/DarkVeil';

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-[#0f0f0f]">
      
      {/* ГЛОБАЛЬНЫЙ ФОН (Слой 0) */}
      {/* fixed inset-0 гарантирует, что фон покрывает весь экран и не скроллится вместе с контентом */}
      <div className="fixed inset-0 z-0 h-full w-full pointer-events-none">
        <DarkVeil
          hueShift={0}
          noiseIntensity={0}
          scanlineIntensity={0}
          speed={0.5}
          scanlineFrequency={0}
          warpAmount={0}
        />
        {/* Затемнение фона для лучшей читаемости контента */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* КОНТЕНТ (Слой 10) */}
      {/* Весь контент страницы рендерится поверх DarkVeil */}
      <div className="relative z-10">
        <Hero />
        <NewReleases />
        <LibrarySection />
      </div>
      
    </div>
  );
}