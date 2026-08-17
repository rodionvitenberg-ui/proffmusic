# Van Morrison study replica

Internal Vite + Vue 3 + GSAP port of [vanmorrison.com](https://vanmorrison.com/) home, `/music` and `/news`. Original BEM CSS kept as-is.

```bash
cd vanmorrison
npm install
npm run dev
```

Opens on `http://localhost:5174`.

Do not deploy this as a public Van Morrison site. It is a design study.

Assets: `public/fonts`, `public/images`, `public/media`, plus `catalog.json` / `news.json` / `shows.json`. Re-fetch with `node scripts/fetch-assets.mjs`.
