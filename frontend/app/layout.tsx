import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import localFont from 'next/font/local';
import Script from 'next/script';
import './globals.css';
import { Navbar } from '@/components/shared/Navbar';
import { Player } from '@/components/shared/Player';
import { Footer } from '@/components/shared/Footer';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { ToastContainer } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

const myCustomFont = localFont({
  src: [
    {
      path: './fonts/Zodiak-Variable.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/Zodiak-Black.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-custom', 
  display: 'swap',
});

const inter = Inter({ 
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://proffmusic.shop'), 
  title: {
    default: 'ProffMusic | Professional Original Music',
    template: '%s | ProffMusic',
  },
  
  description: 'Marketplace for professional original music for videos, advertising and YouTube. No Content ID.',

  verification: {
    yandex: 'a6718f8f58a53afe',
  },
  
  openGraph: {
    title: 'ProffMusic',
    description: 'Professional original music for videos, advertising and YouTube. No Content ID.',
    url: 'https://proffmusic.shop',
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
        
        {/* Контент */}
        <main className="pt-16 min-h-screen"> 
          {children}
        </main>
        
        {/* Футер */}
        <Footer />
        
        {/* Плеер */}
        <Player />
        <ToastContainer />
        {/* --- Yandex.Metrika --- */}
        <Script id="yandex-metrika" strategy="afterInteractive">
          {`
            (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
            m[i].l=1*new Date();
            for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
            k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
            (window, document, "script", "https://mc.yandex.ru/metrika/tag.js?id=106604978", "ym");

            ym(106604978, "init", {
                ssr: true,
                webvisor: true,
                clickmap: true,
                ecommerce: "dataLayer",
                referrer: document.referrer,
                url: location.href,
                accurateTrackBounce: true,
                trackLinks: true
            });
          `}
        </Script>
        <noscript>
          <div>
            <img 
              src="https://mc.yandex.ru/watch/106604978" 
              style={{ position: 'absolute', left: '-9999px' }} 
              alt="" 
            />
          </div>
        </noscript>
        {/* --- /Yandex.Metrika --- */}
      </body>
    </html>
  );
}
