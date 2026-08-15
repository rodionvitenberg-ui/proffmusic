import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import localFont from 'next/font/local';
import Script from 'next/script';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import '../globals.css';
import { Navbar } from '@/components/shared/Navbar';
import { Player } from '@/components/shared/Player';
import { Footer } from '@/components/shared/Footer';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { ToastContainer } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

const myCustomFont = localFont({
  src: [
    {
      path: '../fonts/Zodiak-Variable.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/Zodiak-Black.woff2',
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
  display: 'swap',
});

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const t = await getTranslations({ locale, namespace: 'common' });
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://proffmusic.shop';

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${t('appName')} | ${t('appTagline')}`,
      template: `%s | ${t('appName')}`,
    },
    description: t('appDescription'),
    verification: {
      yandex: 'a6718f8f58a53afe',
    },
    openGraph: {
      title: t('appName'),
      description: t('appDescription'),
      url: `${siteUrl}/${locale}`,
      siteName: t('appName'),
      locale: locale === 'ru' ? 'ru_RU' : 'en_US',
      type: 'website',
    },
    alternates: {
      canonical: `${siteUrl}/${locale}`,
      languages: {
        ru: `${siteUrl}/ru`,
        en: `${siteUrl}/en`,
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Params;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale} className="dark" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background text-foreground antialiased",
          inter.className,
          myCustomFont.variable
        )}
      >
        <NextIntlClientProvider>
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
        </NextIntlClientProvider>
      </body>
    </html>
  );
}