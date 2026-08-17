export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  modules: ['@pinia/nuxt', '@nuxtjs/i18n'],
  css: [
    '~/assets/css/tokens.css',
    '~/assets/css/reset.css',
    '~/assets/css/type.css',
    '~/assets/css/chrome.css',
    '~/assets/css/home.css',
    '~/assets/css/catalog.css',
    '~/assets/css/pages.css',
  ],
  i18n: {
    locales: [
      { code: 'ru', language: 'ru-RU', file: 'ru.json' },
      { code: 'en', language: 'en-US', file: 'en.json' },
    ],
    defaultLocale: 'ru',
    langDir: 'locales',
    strategy: 'prefix',
    detectBrowserLanguage: false,
  },
  runtimeConfig: {
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://127.0.0.1:8000' : ''),
    },
  },
  app: {
    head: {
      htmlAttrs: { class: 'js' },
      bodyAttrs: { class: 'theme-dark' },
      // Preload шрифтов — единственная реальная причина «дёргания» хедера на
      // первой загрузке: шрифты подключены через font-display: swap, поэтому
      // до загрузки TTF браузер рендерит логотип/кнопки системным fallback-шрифтом,
      // а когда Oswald/Inria подгружаются — текст меняет ширину, и раскладка «прыгает».
      // preload заставляет браузер начать скачивание шрифтов максимально рано,
      // сводя окно FOUT к нулю.
      link: [
        { rel: 'preload', as: 'font', type: 'font/ttf', crossorigin: '', href: '/fonts/oswald/Oswald-Regular.ttf' },
        { rel: 'preload', as: 'font', type: 'font/ttf', crossorigin: '', href: '/fonts/oswald/Oswald-Bold.ttf' },
        { rel: 'preload', as: 'font', type: 'font/ttf', crossorigin: '', href: '/fonts/inria-serif/InriaSerif-Regular.ttf' },
        { rel: 'preload', as: 'font', type: 'font/ttf', crossorigin: '', href: '/fonts/inria-serif/InriaSerif-Bold.ttf' },
      ],
    },
  },
})