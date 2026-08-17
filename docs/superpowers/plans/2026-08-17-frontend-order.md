# Frontend order — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Nuxt storefront readable and safe to change — same look, same routes — by owning the CSS, fixing invisible text, and putting HTTP and copy behind one contract each.

**Architecture:** Stop importing the 260 KB Van Morrison `vm.css`. Rewrite only the class names actually used in `web/app/**/*.vue` into seven readable CSS files on tokens. `t()` is strings only; object lists go through `useI18nList`. Every request goes through `useApi`. Domain language lives in root `CONTEXT.md`.

**Tech Stack:** Nuxt 4, Vue 3, Pinia, @nuxtjs/i18n v10, existing Oswald / Inria, existing GSAP + OGL DarkVeil. Skills: domain-modeling, impeccable-design-polish.

**Spec (write on Task 1):** `docs/superpowers/specs/2026-08-17-frontend-order-design.md`

## Global Constraints

- Visual identity stays: Van Morrison chrome (Oswald / Inria, `#0f0f0f`), purple veil on home, Hyprofflex/Proff voice. Not the cinematic-studio / brass / Zodiak spec.
- Same routes and page SFCs. No new pages, no CMS, no component library, no payment-method UI, no backend model changes.
- `vanmorrison/` stays in the repo as a visual reference and is never imported.
- Class names in Vue stay (`site-header__*`, `button--solid`, `cat-card`, `pm-page`, …).
- Hex / rgba for theme values live only in `tokens.css`.
- `color: transparent` is allowed only on `.site-hero__heading-outline`.
- Every heading inherits `--text`. No leftover `h1,h2,h3,h4,h5 { color: #0f0f0f }`.
- `t()` is for strings. Arrays: `useI18nArray`. Object lists: `useI18nList`.
- All HTTP through `useApi`. Empty `NUXT_PUBLIC_API_URL` = same-origin. Dev-only fallback `http://127.0.0.1:8000`.
- Copy and types follow `CONTEXT.md`. Marketing may say «мелодия»; the catalog thing is a Track.
- Filter label «Стиль» becomes Category (`filters.category`).
- Verify in the browser (desktop + ~390px) before claiming a visual task done. `npm run build` must pass at the end.
- Ponytail: no extra abstraction, no new icon pack, no toast system.

## Locked decisions

- Keep current look (user).
- Done bar = understandability + isolation, not a rewrite (user).
- Own an extracted CSS system (user).
- Seven CSS files (user).
- i18n contract with `useI18nList` (user).
- Module folders stay; HTTP only via `useApi` (user).
- Glossary approved (user) — see Task 1 `CONTEXT.md` body.

---

## File map

| File | Responsibility |
| --- | --- |
| `CONTEXT.md` | Domain glossary. No implementation. |
| `docs/adr/0001-own-the-css.md` | Why `vm.css` is not imported. |
| `docs/superpowers/specs/2026-08-17-frontend-order-design.md` | Approved design. |
| `web/app/assets/css/tokens.css` | Colors, fonts, space. Only hex/rgba. |
| `web/app/assets/css/reset.css` | Reset + dark body + heading `--text`. |
| `web/app/assets/css/chrome.css` | Header, nav, footer, buttons, fields, player. |
| `web/app/assets/css/type.css` | Wordmark, page titles, body, links. |
| `web/app/assets/css/home.css` | Veil, hero, curtains, fan, rails. |
| `web/app/assets/css/catalog.css` | Catalog, cards, filters only (trim the rest). |
| `web/app/assets/css/pages.css` | `pm-page`, journal, legal, profile, auth, cart, track hero. |
| `web/nuxt.config.ts` | CSS load order; drop `vm.css`. |
| `web/app/utils/apiBase.ts` | Pure `apiBase(apiUrl, isDev)`. |
| `web/app/composables/useApi.ts` | Only HTTP door, uses `apiBase`. |
| `web/app/composables/useI18nList.ts` | Typed object lists from locale JSON. |
| `web/app/pages/journal/index.vue` | Use `useI18nList`. |
| `web/app/pages/journal/[slug].vue` | Use `useI18nList`. |
| `web/app/stores/auth.ts` | Call `useApi`, not `$fetch(config.public.apiUrl)`. |
| `web/app/pages/checkout.vue` | Same. |
| `web/i18n/locales/ru.json`, `en.json` | `filters.category`. |
| `web/app/components/catalog/FilterSidebar.vue` | `t('filters.category')`. |

Delete from the Nuxt bundle (file may remain untracked or be moved aside, but must not be in `css:`):

- `web/app/assets/css/vm.css`
- `web/app/assets/css/overrides.css` (rules land in the seven files)

Never copy from the donor: `concert-vault*`, `cky-*`, `news-*`, `subscribe-panel*`, `album-*`, `ticket-*`, `gloader`, cookie-banner vars.

---

### Task 1: Glossary, ADR, spec on disk

**Files:**
- Create: `CONTEXT.md`
- Create: `docs/adr/0001-own-the-css.md`
- Create: `docs/superpowers/specs/2026-08-17-frontend-order-design.md`
- Create: `docs/superpowers/plans/2026-08-17-frontend-order.md` (copy of this plan)

**Interfaces:**
- Consumes: none
- Produces: the glossary below; ADR title `Own the CSS; donor is reference only`

- [ ] **Step 1: Write `CONTEXT.md` verbatim**

```md
# ProffMusic

A boutique where one Creator sells original recorded music with a License.

## Language

### People

**Creator**:
Kotsart Hyprofflex (Proff), who composes and sells the music.
_Avoid_: artist, author, we, brand

**Collector**:
A person who buys a License.
_Avoid_: customer, user, listener, fan, client

**Account**:
An email login that can hold Orders and an avatar.
_Avoid_: user, profile

### Catalog

**Track**:
One original recorded piece sold with a License.
_Avoid_: song, melody, piece, product, item

**Collection**:
A priced set of Tracks sold together.
_Avoid_: album, compilation, bundle

**Category**:
The primary shelf of a Track by use (YouTube, ads, corporate).
_Avoid_: genre, style

**Tag**:
A filter facet on a Track: usage, instrument, or mood. Usage tags are not Categories.
_Avoid_: keyword, label

**Preview**:
The short public audio clip of a Track.
_Avoid_: demo, sample

**Full file**:
The protected master delivered after payment.
_Avoid_: original, WAV, ZIP

**Catalog**:
The browsable Tracks and Collections for sale.
_Avoid_: library, music

**Journal**:
Static essays by the Creator.
_Avoid_: blog, news

### Commerce

**Boutique**:
This shop: one Creator, original recorded music sold with a License.
_Avoid_: marketplace, platform, store

**License**:
The usage rights granted by buying a Track or Collection.
_Avoid_: terms, EULA

**Cart**:
A client-side list of Tracks and Collections not yet ordered.
_Avoid_: bag, basket

**Order**:
A request to pay, keyed by email, containing Order items.
_Avoid_: purchase, transaction, checkout

**Order item**:
One Track or one Collection on an Order, with the price at sale time.

**Download token**:
A time-limited, use-limited link that delivers the Full file.
_Avoid_: download link, entitlement
```

- [ ] **Step 2: Write the ADR**

`docs/adr/0001-own-the-css.md`:

```md
# Own the CSS; donor is reference only

The storefront imported a 260 KB minified Van Morrison concert-site stylesheet.
Shop pages inherited heading color `#0f0f0f` on a `#0f0f0f` body, plus unused
rules for tickets, cookie banners, and albums. We keep the look, rewrite only
the classes the Vue app actually uses, and never import `vm.css`.
`vanmorrison/` stays as a visual reference.

**Considered:** namespacing the donor (still unreadable); scoped styles per SFC
(chrome would drift).
```

- [ ] **Step 3: Write the spec**

Save the approved design (identity, CSS seven files, i18n contract, module table, ship bar, out of scope) to `docs/superpowers/specs/2026-08-17-frontend-order-design.md`. Copy this plan to `docs/superpowers/plans/2026-08-17-frontend-order.md`.

- [ ] **Step 4: Commit**

```bash
git add CONTEXT.md docs/adr/0001-own-the-css.md docs/superpowers/specs/2026-08-17-frontend-order-design.md docs/superpowers/plans/2026-08-17-frontend-order.md
git commit -m "docs: lock boutique language and own-the-css decision"
```

---

### Task 2: Tokens, reset, headings become `--text`

This is the CSS half of “I cannot see text”. Load the new files **after** `vm.css` for this task only so they win. `vm.css` still in the bundle until Task 7.

**Files:**
- Create: `web/app/assets/css/tokens.css`
- Create: `web/app/assets/css/reset.css`
- Modify: `web/nuxt.config.ts` (`css` array)

**Interfaces:**
- Consumes: none
- Produces: `--text`, `--bg`, `--ff-oswald`, `--ff-inria`, `--mint`, `--veil-base`; `h1–h5 { color: var(--text) }`

- [ ] **Step 1: Write `tokens.css`**

Copy these values from the live look (overrides + donor + catalog). Do not invent brass.

```css
:root {
  --ff-inria: "Inria Serif", serif;
  --ff-oswald: Oswald, sans-serif;
  --bg: #0f0f0f;
  --text: #fff;
  --muted: #9a9a9a;
  --near-black: #1a1a1a;
  --border: #333;
  --white: #fff;
  --mint: #4ff8d2;
  --veil-base: #0a0512;
  --brand-primary: #009fdd;
  --journal-link: #a78bfa;
}
```

`@font-face` blocks move here from `overrides.css` (same four TTF paths, `font-display: swap`).

- [ ] **Step 2: Write `reset.css`**

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

body.theme-dark {
  background: var(--bg);
  color: var(--text);
}

body.theme-dark h1,
body.theme-dark h2,
body.theme-dark h3,
body.theme-dark h4,
body.theme-dark h5 {
  color: var(--text);
}
```

Specificity must beat `vm.css`’s `h1,h2,h3,h4,h5 { color:#0f0f0f }`. If it does not, use `body.theme-dark h1, … { color: var(--text) !important }` only as a last resort and remove the `!important` in Task 7 when `vm.css` is gone.

- [ ] **Step 3: Register the files**

In `web/nuxt.config.ts`:

```ts
css: [
  '~/assets/css/vm.css',
  '~/assets/css/tokens.css',
  '~/assets/css/reset.css',
  '~/assets/css/overrides.css',
  '~/assets/css/catalog.css',
],
```

- [ ] **Step 4: Browser check**

Open `/ru/journal`, `/ru/profile` (if logged out, `/ru/about` and `/ru/journal` are enough). `h2.journal-card__title` and any `h2` must be white, not black-on-black. Home wordmark still reads.

- [ ] **Step 5: Commit**

```bash
git add web/app/assets/css/tokens.css web/app/assets/css/reset.css web/nuxt.config.ts
git commit -m "fix: headings inherit --text so copy is visible on dark pages"
```

---

### Task 3: `useI18nList` + journal + Category label

This is the i18n half of “I cannot see text”.

**Files:**
- Create: `web/app/composables/useI18nList.ts`
- Create: `web/app/composables/localeMessage.test.mjs` (node assert, no new deps)
- Modify: `web/app/pages/journal/index.vue`
- Modify: `web/app/pages/journal/[slug].vue`
- Modify: `web/i18n/locales/ru.json`, `web/i18n/locales/en.json`
- Modify: `web/app/components/catalog/FilterSidebar.vue`

**Interfaces:**
- Consumes: `useI18n().locale`, `getLocaleMessage` (same as `useI18nArray`)
- Produces: `useI18nList<T>(key: string): ComputedRef<T[]>`

- [ ] **Step 1: Extract a pure reader and test it**

`web/app/composables/readLocalePath.ts`:

```ts
export function readLocalePath(root: unknown, key: string): unknown {
  return key.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[part]
    return undefined
  }, root)
}

export function asList<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[]
  return []
}
```

`web/app/composables/localeMessage.test.mjs`:

```js
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ru = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../../i18n/locales/ru.json'), 'utf8'))

function readLocalePath(root, key) {
  return key.split('.').reduce((acc, part) => (acc && typeof acc === 'object' ? acc[part] : undefined), root)
}
function asList(value) {
  return Array.isArray(value) ? value : []
}

const articles = asList(readLocalePath(ru, 'journal.articles'))
assert.equal(articles.length, 5)
assert.equal(typeof articles[0].title, 'string')
assert.ok(articles[0].title.length > 0)
assert.ok(Array.isArray(articles[0].body))
assert.equal(asList(readLocalePath(ru, 'journal.missing')).length, 0)
console.log('locale path ok')
```

Run:

```bash
node web/app/composables/localeMessage.test.mjs
```

Expected: `locale path ok`.

- [ ] **Step 2: Implement `useI18nList`**

```ts
import { asList, readLocalePath } from './readLocalePath'

export function useI18nList<T>(key: string): ComputedRef<T[]> {
  const { locale, getLocaleMessage } = useI18n()
  return computed(() => asList<T>(readLocalePath(getLocaleMessage(locale.value), key)))
}
```

Optionally refactor `useI18nArray` to use `readLocalePath` + `asList` + existing `nodeToString`. Do not change its public signature.

- [ ] **Step 3: Switch journal pages**

`journal/index.vue` and `journal/[slug].vue`: replace

```ts
const articles = t('journal.articles') as unknown as JournalArticle[]
```

with

```ts
const articles = useI18nList<JournalArticle>('journal.articles')
```

In templates, `articles` is a ref: `v-for="article in articles"`, `articles.find` becomes `articles.find` on the unwrapped list in the computed for `[slug].vue`:

```ts
const article = computed(() => articles.value.find((a) => a.slug === slug))
```

- [ ] **Step 4: Category label**

Add `filters.category`: `"Категория"` / `"Category"`. Point `FilterSidebar.vue` at `t('filters.category')`. Leave `filters.style` unused or delete both locales.

- [ ] **Step 5: Browser check**

`/ru/journal` shows five titles + leads. Open one article: title, lead, body paragraphs, byline. `/en/journal` same. `/ru/music` filter group reads «Категория».

- [ ] **Step 6: Commit**

```bash
git add web/app/composables/readLocalePath.ts web/app/composables/useI18nList.ts web/app/composables/localeMessage.test.mjs web/app/composables/useI18nArray.ts web/app/pages/journal web/i18n/locales web/app/components/catalog/FilterSidebar.vue
git commit -m "fix: read journal copy from locale JSON, not t() AST"
```

---

### Task 4: `chrome.css` — header, footer, buttons, fields, player

**Files:**
- Create: `web/app/assets/css/chrome.css`
- Modify: `web/nuxt.config.ts` (append `chrome.css`)
- Move player-bar rules out of `catalog.css` into `chrome.css` (cut, do not duplicate)

**Interfaces:**
- Consumes: tokens
- Produces: readable rules for `site-header*`, `site-nav*`, `site-footer*`, `.button`, `.button--solid`, `.button--white`, `.freeform-input`, `.pm-field*`, `.player-bar*`

- [ ] **Step 1: Inventory donor rules for the prefixes above**

Beautify or grep `vm.css` for `.site-header`, `.site-nav`, `.site-footer`, `.button`, `.freeform-input`. Copy only matching selectors. Skip concert/cookie/news.

- [ ] **Step 2: Inspect `.button--white` in the browser on `/ru`**

If the “Связаться с создателем” CTA has no glyphs, it is the donor `color: transparent`. Rewrite as hollow: transparent fill, `border-color: var(--text)`, `color: var(--text)`. Hover inverts to `--bg` on `--text`. Do **not** keep `color: transparent`.

`.button--solid` stays white fill / dark text, hover invert — as `overrides.css` already does.

- [ ] **Step 3: Port header/footer/player**

Include the header/cart/locale/mobile overrides from `overrides.css` (cart mint badge uses `--mint`). Player-bar block from `catalog.css` lines ~388–512, hex → tokens. `body:has(.player-bar) .site-footer` stays with the player.

Header GSAP classes (`site-header--nav-open`, `site-nav__panel--left`) must keep the same transform hooks.

- [ ] **Step 4: Browser check**

Desktop + 390px: header wordmark, nav, locale, cart badge, contacts button. Open hamburger, Escape closes. Footer links. Play a track: player bar visible, play button contrast OK.

- [ ] **Step 5: Commit**

```bash
git add web/app/assets/css/chrome.css web/app/assets/css/catalog.css web/nuxt.config.ts
git commit -m "refactor: extract chrome CSS from the donor sheet"
```

---

### Task 5: `type.css` + `home.css`

**Files:**
- Create: `web/app/assets/css/type.css`
- Create: `web/app/assets/css/home.css`
- Modify: `web/nuxt.config.ts`
- Cut `home-rail*` and `.home-page` out of `catalog.css` / `overrides.css` into `home.css`

**Interfaces:**
- Consumes: tokens
- Produces: type defaults; home veil/hero/fan/rails matching the current page

- [ ] **Step 1: `type.css`**

```css
.pm-page__title,
.cat__title,
.home-rail__title,
.the-music__title {
  color: var(--text);
  font-family: var(--ff-oswald);
  font-weight: 700;
  text-transform: uppercase;
}

.pm-page__body,
.the-music__para {
  color: var(--text);
  font-family: var(--ff-inria);
  line-height: 1.6;
}

a {
  color: inherit;
}
```

Keep existing sizes from `overrides.css` / `catalog.css` (the `max(2.4rem, 5vw)` title scale). Do not invent a new type ramp.

- [ ] **Step 2: `home.css`**

Port from `vm.css` + `SiteHero.vue` scoped-looking global rules + `overrides.css` (`.the-music` translucent, `.home-page` z-index, fixed veil, `.site-hero { background: transparent }`).

Prefixes: `site-hero*`, `the-music*`, `home-page`, `home-rail*`.

`.site-hero__heading-outline` is the only `color: transparent` (+ existing stroke if the donor has it). Fill span stays `--text`.

- [ ] **Step 3: Browser check**

`/ru` and `/en`: curtains open, wordmark readable, veil visible through the Creator section, fan cards, both CTAs readable, new/popular rails. Resize to 390px.

- [ ] **Step 4: Commit**

```bash
git add web/app/assets/css/type.css web/app/assets/css/home.css web/app/assets/css/catalog.css web/nuxt.config.ts
git commit -m "refactor: extract home and type CSS from the donor sheet"
```

---

### Task 6: `pages.css` + slim `catalog.css`

**Files:**
- Create: `web/app/assets/css/pages.css`
- Modify: `web/app/assets/css/catalog.css` (only `cat*` + filters + grid + empty)
- Modify: `web/nuxt.config.ts`

**Interfaces:**
- Consumes: tokens, type
- Produces: `pm-page*`, `journal-card*`, `profile*`, `cart-*`, `track-page`, `track-hero*`

- [ ] **Step 1: Move page rules**

From `overrides.css`: `.pm-page*`, `.profile*`, input autofill, `.pm-field*`. From `catalog.css`: `.cart-list*`, `.cart-foot`, `.track-page`, `.track-hero*`. From journal SFCs: lift scoped journal styles into `pages.css` and delete the `<style scoped>` blocks so journal headings cannot regress independently.

Journal links keep `--journal-link`. Track buy hover keeps `--mint` glow (current look).

- [ ] **Step 2: Slim `catalog.css`**

After the cut it should only style: `.cat`, `.cat__*`, `.cat-card*`, `.cat-grid`, `.cat-filters*`, `.cat-empty`. No player, cart, hero, home-rail.

- [ ] **Step 3: Browser check**

`/ru/about`, `/ru/license`, `/ru/contacts`, `/ru/rules`, `/ru/privacy`, `/ru/gdpr`, `/ru/terms`, `/ru/journal`, `/ru/cart`, `/ru/checkout`, `/ru/login`, `/ru/register`, a `/ru/tracks/:slug` if the API is up. Body copy and titles visible. Forms: white text on dark inputs.

- [ ] **Step 4: Commit**

```bash
git add web/app/assets/css/pages.css web/app/assets/css/catalog.css web/app/pages/journal web/nuxt.config.ts
git commit -m "refactor: isolate page and catalog CSS"
```

---

### Task 7: Drop `vm.css` and `overrides.css`

**Files:**
- Modify: `web/nuxt.config.ts` — final `css` array
- Delete (or stop tracking) `web/app/assets/css/vm.css` and `web/app/assets/css/overrides.css`
- Modify: `web/app/assets/css/reset.css` — remove any `!important` added in Task 2

**Interfaces:**
- Consumes: the seven files complete
- Produces: bundle without the donor sheet

- [ ] **Step 1: Final load order**

```ts
css: [
  '~/assets/css/tokens.css',
  '~/assets/css/reset.css',
  '~/assets/css/type.css',
  '~/assets/css/chrome.css',
  '~/assets/css/home.css',
  '~/assets/css/catalog.css',
  '~/assets/css/pages.css',
],
```

- [ ] **Step 2: Grep for leftover donor-only classes still needed**

```bash
rg -o 'class="[^"]+"' web/app --glob '*.vue'
```

Every class in that list must have a rule in the seven files (or be a state hook like `is-on`). If a used class has no rule and the page looks wrong, port that one rule — do not re-import `vm.css`.

- [ ] **Step 3: Browser regression**

Home, catalog, collection, track, journal, about, cart, header, footer, player. Desktop + 390px. Compare against `vanmorrison/` only as a chrome reference, not as a layout to copy 1:1 (the shop was already a subset).

- [ ] **Step 4: Commit**

```bash
git add web/nuxt.config.ts web/app/assets/css
git commit -m "refactor: stop shipping the Van Morrison donor stylesheet"
```

---

### Task 8: One HTTP door

**Files:**
- Create: `web/app/utils/apiBase.ts`
- Create: `web/app/utils/apiBase.test.mjs`
- Modify: `web/app/composables/useApi.ts`
- Modify: `web/app/stores/auth.ts`
- Modify: `web/app/pages/checkout.vue`
- Modify: `web/app/pages/profile.vue` if it `$fetch`es with `config.public.apiUrl`

**Interfaces:**
- Consumes: `runtimeConfig.public.apiUrl`
- Produces:

```ts
export function apiBase(apiUrl: string, isDev: boolean): string
export function useApi(): {
  base: string
  coverSrc(url?: string | null): string
  list<T>(path: string, opts?: { throwOnError?: boolean }): Promise<T[]>
  getPage<T>(path: string): Promise<{ results: T[]; next: string | null }>
  get<T>(path: string, headers?: Record<string, string>): Promise<T>
  post<T>(path: string, body?: unknown, headers?: Record<string, string>): Promise<T>
}
```

- [ ] **Step 1: Test `apiBase`**

```js
import assert from 'node:assert/strict'

function apiBase(apiUrl, isDev) {
  const configured = String(apiUrl || '').replace(/\/$/, '')
  if (configured) return configured
  return isDev ? 'http://127.0.0.1:8000' : ''
}

assert.equal(apiBase('https://proffmusic.shop', false), 'https://proffmusic.shop')
assert.equal(apiBase('', true), 'http://127.0.0.1:8000')
assert.equal(apiBase('', false), '')
assert.equal(apiBase('http://127.0.0.1:8000/', true), 'http://127.0.0.1:8000')
console.log('apiBase ok')
```

```bash
node web/app/utils/apiBase.test.mjs
```

- [ ] **Step 2: Implement and wire `useApi`**

```ts
import { apiBase } from '~/utils/apiBase'

export function useApi() {
  const config = useRuntimeConfig()
  const base = apiBase(String(config.public.apiUrl || ''), import.meta.dev)

  function coverSrc(url?: string | null) {
    if (!url) return ''
    if (url.startsWith('http://') || url.startsWith('https://')) return url
    return `${base}${url.startsWith('/') ? url : `/${url}`}`
  }

  async function get<T>(path: string, headers?: Record<string, string>): Promise<T> {
    return await $fetch<T>(`${base}${path}`, { headers })
  }

  async function post<T>(path: string, body?: unknown, headers?: Record<string, string>): Promise<T> {
    return await $fetch<T>(`${base}${path}`, { method: 'POST', body, headers })
  }

  // list / getPage stay as they are, using `${base}${path}`
  return { base, coverSrc, list, getPage, get, post }
}
```

- [ ] **Step 3: Auth + checkout + profile**

`auth.ts` `login` / `register` / `fetchMe` / `uploadAvatar` call `useApi().post` / `get`. Checkout `submit` calls `post('/api/orders/checkout/', payload, auth.authHeaders())`. Grep and kill remaining `config.public.apiUrl` in `web/app`.

- [ ] **Step 4: Smoke**

With Django up: `/ru/music` lists tracks. Login works. Checkout still posts (mock or live — do not change providers).

- [ ] **Step 5: Commit**

```bash
git add web/app/utils/apiBase.ts web/app/utils/apiBase.test.mjs web/app/composables/useApi.ts web/app/stores/auth.ts web/app/pages/checkout.vue web/app/pages/profile.vue
git commit -m "refactor: send every storefront request through useApi"
```

---

### Task 9: Impeccable pass + full verification

**Files:** only the seven CSS files, and a page only if a real bug shows up.

**Interfaces:** none new.

- [ ] **Step 1: Audit against impeccable-design-polish**

On the running app, not from memory:

- Contrast: `--text` on `--bg`; `--text` on the purple veil (Creator section). Raise veil overlay opacity only if body copy fails a visual check — do not change hue.
- States: solid / white / ghost-equivalent buttons have hover, focus-visible (2px `--text` offset), disabled. No `transition: all`.
- Motion: `prefers-reduced-motion` already skips hero curtains — add the same early-return discipline if header GSAP still fights reduced motion (it already has a branch; confirm it).
- No new glow, no brass, no extra cards.
- Focus order: header → main → footer → player.

- [ ] **Step 2: Route checklist (ru and en, desktop + 390px)**

`/`, `/music`, `/collections`, `/collections/:slug`, `/tracks/:slug`, `/journal`, `/journal/:slug`, `/about`, `/license`, `/contacts`, `/rules`, `/privacy`, `/gdpr`, `/terms`, `/cart`, `/checkout`, `/login`, `/register`, `/profile`, `/success`.

Every page: visible title, visible body if it has one, no black-on-black headings, no empty journal cards.

- [ ] **Step 3: Build**

```bash
cd web && npm run build
```

Expected: success. Bundle must not contain the 260 KB donor (check that `vm.css` is not listed in `.nuxt` / `.output` CSS).

- [ ] **Step 4: Commit**

```bash
git add web/app/assets/css
git commit -m "fix: harden contrast, states, and reduced-motion on owned CSS"
```

---

## Out of scope

- Cinematic-studio restyle, Zodiak, brass tokens, deleting DarkVeil
- New routes, CMS, payment picker, BTCPay UI
- Deleting `vanmorrison/`
- Backend models, fulfill(), Lemon Squeezy
- Rewriting Vue page SFCs or introducing a component library
- Renaming `/music` to `/catalog`

## Spec coverage

| Spec item | Task |
| --- | --- |
| CONTEXT.md glossary | 1 |
| ADR own-the-css | 1 |
| Heading `--text` / visible titles | 2 |
| Journal copy via `useI18nList` | 3 |
| Category, not Style | 3 |
| Seven CSS files | 4–6 |
| Drop `vm.css` | 7 |
| `useApi` only HTTP door | 8 |
| Same-origin when API URL empty | 8 |
| Impeccable + all-route browser check | 9 |
| Same look / routes | all |
