import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Music, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen w-full px-2 md:px-0">
      <div className="mx-auto max-w-5xl min-h-screen bg-secondary border-x border-white/5 shadow-2xl pt-32 pb-20 px-6 md:px-16 flex flex-col items-center justify-center text-center">
        
        {/* Код ошибки */}
        <div className="text-[120px] md:text-[180px] font-black leading-none text-white/10 select-none -mb-10">
          404
        </div>

        {/* Иконка */}
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-8 border border-white/10">
          <Music size={36} className="text-gray-400" />
        </div>

        <h1 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">
          This page went silent
        </h1>
        <p className="text-lg text-gray-400 max-w-md mx-auto mb-10 leading-relaxed">
          The track or page you are looking for doesn't exist or has been moved. 
          Let's get you back to the music.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/">
            <Button size="lg" className="w-full sm:w-auto bg-white text-black hover:bg-gray-200 font-bold px-8">
              <Home className="mr-2" size={18} />
              Back to Home
            </Button>
          </Link>
          <Link href="/music">
            <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/20 hover:border-white text-white px-8">
              <ArrowLeft className="mr-2" size={18} />
              Go to Library
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}