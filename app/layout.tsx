import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';
import { Navbar } from '@/components/shared/Navbar';
import { Player } from '@/components/shared/Player';
import { Footer } from '@/components/shared/Footer';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { ToastContainer } from '@/components/ui/toast';
import { cn } from '@/lib/utils';


const inter = Inter({ 
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://proffmusic.ru'), 
  title: {
    default: 'ProffMusic | Профессиональная авторская музыка',
    template: '%s | ProffMusic',
  },
  
  description: 'Маркетплейс авторской музыки для видео, рекламы и YouTube. Без Content ID.',
  
  openGraph: {
    title: 'ProffMusic',
    description: 'Авторская музыка для твоих проектов',
    url: 'https://proffmusic.ru',
    siteName: 'ProffMusic',
    locale: 'ru_RU',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className="dark" suppressHydrationWarning>
      <body 
        className={cn(
          "min-h-screen bg-background text-foreground antialiased",
          inter.className
        )}
      >
        <AuthProvider />
        <Navbar />
        
        {/* Контент. pb-0, так как отступ снизу теперь дает футер */}
        <main className="pt-16 min-h-screen"> 
          {children}
        </main>
        
        {/* Футер */}
        <Footer />
        
        {/* Плеер (фиксирован поверх футера) */}
        <Player />
        <ToastContainer />
      </body>
    </html>
  );
}