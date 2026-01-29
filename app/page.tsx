import { Hero } from '@/components/sections/Hero';
import { NewReleases } from '@/components/sections/NewReleases';
import { LibrarySection } from '@/components/sections/LibrarySection';

// Обрати внимание: здесь больше не нужен 'use client', 
// так как страница сама по себе логики не содержит, 
// она просто собирает компоненты (которые внутри себя могут быть client-side).
export default function HomePage() {
  return (
    <div className="bg-[#0f0f0f] min-h-screen">
      <Hero />
      <NewReleases />
      <LibrarySection />
    </div>
  );
}