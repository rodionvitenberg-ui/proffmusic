# ProffMusic v2.0 Interface Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the existing storefront as cinematic studio — warm black, antique brass primary, Zodiak titles, USD prices — without rewriting the app.

**Architecture:** One token sheet in `globals.css` plus `formatPrice`. Chrome and catalog consume tokens. Delete unused motion toys. Copy follows the spec table.

**Tech Stack:** Next.js 16, Tailwind 4, next-intl, lucide-react, existing Inter + Zodiak files. Skills: better-ui, better-colors, better-writing, ponytail.

**Spec:** `docs/superpowers/specs/2026-08-15-proffmusic-v2-design.md`

## Global Constraints

- Tokens are the verbatim block in the spec. No hex theme values. No second accent hue.
- Brass (`bg-primary`) is the filled primary action and the playing indicator only.
- `Button` variants: `default | outline | ghost | destructive`. Press: `active:scale-[0.96]`.
- No DarkVeil, no card-flip, no `transition: all`, no permanent `will-change`.
- `formatPrice` uses `Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })`.
- Sentence case. Verb-first buttons. Locale owns the hero.
- Do not add a component library, icon pack, or light mode.
- Verify in the browser on desktop and a 390px viewport before claiming a task done.

---

### Task 1: Tokens, type role, `formatPrice`, drop `₽`

**Files:**
- Modify: `frontend/app/globals.css`
- Modify: `frontend/app/[locale]/layout.tsx`
- Create: `frontend/lib/price.ts`
- Create: `frontend/lib/price.test.ts` (or a tiny node assert — see step 1)
- Modify every `₽` call site listed below

**Interfaces:**
- Consumes: none
- Produces: `formatPrice(amount: number | string): string`; CSS custom properties from the spec; `--font-custom` available as a utility on titles

₽ call sites to switch to `{formatPrice(x)}`:

- `frontend/components/shared/TrackCard.tsx`
- `frontend/components/music/TrackDetails.tsx`
- `frontend/components/music/CollectionCard.tsx`
- `frontend/components/music/CollectionDetails.tsx`
- `frontend/app/[locale]/cart/page.tsx`
- `frontend/app/[locale]/checkout/page.tsx`
- `frontend/app/[locale]/profile/page.tsx`
- `frontend/app/[locale]/collections/[slug]/page.tsx` (`currency: 'RUB'` → `'USD'`)
- `frontend/app/[locale]/tracks/[slug]/page.tsx` (`priceCurrency: 'RUB'` → `'USD'`)

- [ ] **Step 1: Write the price test**

`frontend/lib/price.ts` does not exist yet. Create `frontend/lib/price.test.ts` as a self-check the existing test runner can skip; run it with node:

```ts
import { formatPrice } from './price';
import assert from 'node:assert/strict';

assert.equal(formatPrice(29), '$29.00');
assert.equal(formatPrice('29.5'), '$29.50');
assert.equal(formatPrice(0), '$0.00');
console.log('price ok');
```

If the project has no ts-node, write `frontend/lib/price.mjs` is wrong — keep `.ts` and run:

```bash
cd frontend && npx tsx -e "const {formatPrice}=require('./lib/price.ts')"
```

Simpler: put a `demo` block in `price.ts` is not needed. Run with:

```bash
cd frontend && node --import tsx --test lib/price.test.ts
```

If `tsx` is not installed, do not add it. Use this instead in `price.test.mjs`:

```js
import assert from 'node:assert/strict';
export function formatPrice(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(amount));
}
// keep the real implementation only in price.ts — duplicate is not allowed.
```

Ponytail: skip a test runner. Add this at the bottom of `price.ts` and run it with `npx tsc` plus a one-liner:

After implementing, run:

```bash
cd frontend && node -e "console.log(new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(29))"
```

Expected: `$29.00`. The function must match that.

Write `frontend/lib/price.ts`:

```ts
export function formatPrice(amount: number | string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(amount));
}
```

- [ ] **Step 2: Replace the theme in `globals.css`**

Replace the `:root` and `.dark` blocks with the spec token sheet (copy verbatim, including `--shadow-border`). Keep the `@theme inline` mapping that already points `--color-*` at these variables. Remove the hex dark overrides (`#121418`, `#9793a5`, `#5227FF`, double semicolon on `--secondary`).

Add grain once:

```css
.film-grain {
  pointer-events: none;
  position: fixed;
  inset: 0;
  z-index: 1;
  opacity: 0.04;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
}
```

- [ ] **Step 3: Wire Zodiak on the layout**

In `frontend/app/[locale]/layout.tsx`, `myCustomFont` is already created. Add `myCustomFont.variable` to `<body className={cn(..., inter.className, myCustomFont.variable)}>`. Do not put Zodiak on body text.

- [ ] **Step 4: Replace every `₽` and RUB currency string** with `formatPrice(...)` / `'USD'`. Import from `@/lib/price`.

- [ ] **Step 5: Typecheck**

```bash
cd frontend && npx tsc --noEmit
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add frontend/app/globals.css frontend/app/[locale]/layout.tsx frontend/lib/price.ts frontend/components frontend/app
git commit -m "feat(ui): studio tokens, Zodiak variable, USD prices"
```

---

### Task 2: Button + Navbar + Footer + Hero

**Files:**
- Modify: `frontend/components/ui/Button.tsx`
- Modify: `frontend/components/shared/Navbar.tsx`
- Modify: `frontend/components/shared/Footer.tsx`
- Modify: `frontend/components/sections/Hero.tsx`
- Modify: `frontend/messages/en.json` (`hero`, `navbar`)
- Modify: `frontend/messages/ru.json` (`hero`, `navbar`)

**Interfaces:**
- Consumes: tokens from Task 1
- Produces: `Button` variants `default | outline | ghost | destructive`; Navbar without `LayeredButton`

- [ ] **Step 1: Slim `Button.tsx`**

Replace `buttonVariants` with:

```ts
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,background-color,box-shadow,transform] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-[var(--shadow-border)] hover:opacity-90",
        outline: "border border-border bg-transparent text-foreground hover:bg-muted",
        ghost: "text-foreground hover:bg-muted",
        destructive: "bg-destructive text-white hover:opacity-90",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);
```

Grep for `variant="success"` / `warning` / `info` / `dark` / `light` / `gradient` / `glass`. Change each to `default` or `outline`. There should be few.

- [ ] **Step 2: Navbar**

Remove `LayeredButton`. Render nav items as `<Link className="text-sm text-muted-foreground hover:text-foreground px-3 py-2">`. Active: `text-foreground`. Language switch stays a small pair of text buttons. Bag icon `currentColor`. Drop `will-change-transform` from the nav class. Keep hide-on-scroll. Use `bg-background/90 backdrop-blur-md border-b border-border`.

- [ ] **Step 3: Hero**

Delete `GradientText`. Two Zodiak lines:

```tsx
<h1 className="font-[family-name:var(--font-custom)] text-4xl sm:text-5xl md:text-7xl tracking-tight text-foreground">
  <span className="block">{t('line1')}</span>
  <span className="block">{t('line2')}</span>
</h1>
```

`en.json` hero:

```json
"line1": "Professional",
"line2": "original music",
"subtitle1": "For videos, advertisements, YouTube and corporate projects.",
"subtitle2": "Live instruments, commercial license, no Content ID issues.",
"listenToTracks": "Listen to tracks",
"aboutUs": "About the studio"
```

`ru.json` hero (locale owns the line — Russian, not English):

```json
"line1": "Профессиональная",
"line2": "оригинальная музыка",
"subtitle1": "Для видео, рекламы, YouTube и корпоративных проектов.",
"subtitle2": "Живые инструменты, коммерческая лицензия, без Content ID.",
"listenToTracks": "Слушать треки",
"aboutUs": "О студии"
```

Primary button `Listen to tracks` (`variant="default"`). Secondary `About the studio` (`variant="outline"`) → `/about`. Remove leftover keys `professional` / `originalMusic` after switching call sites.

- [ ] **Step 4: Footer**

Replace hardcoded dark hex with `bg-background border-t border-border text-muted-foreground`. Links are foreground/underline on hover, not brass.

- [ ] **Step 5: Browser check**

Home (RU and EN): hero is in the locale language, brass primary, no purple gradient, nav is text links. Mobile 390px: hamburger still works.

- [ ] **Step 6: Commit**

```bash
git add frontend/components/ui/Button.tsx frontend/components/shared/Navbar.tsx frontend/components/shared/Footer.tsx frontend/components/sections/Hero.tsx frontend/messages
git commit -m "feat(ui): studio chrome — button, nav, hero, footer"
```

---

### Task 3: Catalog without flip, grain, DarkVeil off

**Files:**
- Modify: `frontend/app/[locale]/page.tsx`
- Modify: `frontend/components/shared/TrackCard.tsx`
- Modify: `frontend/components/music/CollectionCard.tsx`
- Modify: `frontend/components/music/TrackDetails.tsx`
- Modify: `frontend/components/shared/Player.tsx`
- Modify: `frontend/components/sections/NewReleases.tsx` (title type only)

**Interfaces:**
- Consumes: `formatPrice`, `Button`, tokens
- Produces: front-only `TrackCard`

- [ ] **Step 1: Homepage background**

`page.tsx` — remove `DarkVeil` import and the WebGL layer. Use:

```tsx
<div className="relative min-h-screen bg-background">
  <div className="film-grain" aria-hidden />
  <div className="relative z-10">
    <Hero />
    <NewReleases />
    <LibrarySection />
  </div>
</div>
```

- [ ] **Step 2: Rewrite `TrackCard` without `CardFlip`**

Structure:

```tsx
<article className="flex h-full flex-col">
  <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
    <Image ... className="object-cover outline outline-1 -outline-offset-1 outline-white/10" />
    <button
      onClick={handlePlayClick}
      className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-150 hover:opacity-100 data-[active=true]:opacity-100"
      data-active={isActive}
      aria-label={isActive ? 'Pause' : 'Play'}
    >
      <span className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground active:scale-[0.96]">
        {isActive ? <Pause /> : <Play className="translate-x-[2px]" />}
      </span>
    </button>
  </div>
  <Link href={`/tracks/${track.slug}`}>
    <h3 className={cn("mt-2 truncate text-lg font-medium text-foreground", isCurrent && "text-primary")}>
      {track.title}
    </h3>
  </Link>
  <div className="flex items-center justify-between border-b border-border pb-3">
    <span className="truncate text-sm text-muted-foreground">{track.category?.name ?? 'ProffMusic'}</span>
    <span className="tabular-nums text-foreground">{formatPrice(track.price)}</span>
  </div>
  <div className="mt-auto grid grid-cols-2 gap-3 pt-3">
    <Button variant="outline" onClick={handleBuyNow}>{t('buy')}</Button>
    <Button variant={added ? 'outline' : 'default'} onClick={handleCartToggle}>
      {added ? t('inCart') : t('addToCart')}
    </Button>
  </div>
</article>
```

No `scale-110`. No green. No uppercase tracking. Sentence-case labels already in messages (`Buy`, `Add to cart`) — if the JSON is title case, change those two keys to sentence case in both locales.

Move tags/description to the track detail page (they already live there). Do not keep a flip back.

- [ ] **Step 3: Collection cards + details + player**

Same rules: `formatPrice`, image outline, brass only on the primary buy / playing state. Player cover: `outline outline-1 -outline-offset-1 outline-white/10`. Playing title: `text-primary`. Buy on the player: `variant="default"`. In-cart: `variant="outline"` + check icon (filled).

- [ ] **Step 4: New Releases / section titles**

Page section titles use Zodiak: `font-[family-name:var(--font-custom)] text-3xl text-foreground`.

- [ ] **Step 5: Browser check**

`/en` and `/en/music`: cards do not flip. Play disc appears on hover. Price is `$…`. Cover edges have a thin white outline. Home has grain, no moving veil. Mobile: two-column grid still taps.

- [ ] **Step 6: Commit**

```bash
git add frontend/app/[locale]/page.tsx frontend/components
git commit -m "feat(ui): catalog cards without flip, grain instead of DarkVeil"
```

---

### Task 4: Copy pass + delete dead code

**Files:**
- Modify: `frontend/messages/en.json`, `frontend/messages/ru.json`
- Delete if zero imports: `frontend/components/DarkVeil.tsx`, `frontend/components/SplitText.tsx`, `frontend/components/GradientText.tsx`, `frontend/components/ui/morphy-button.tsx`, `frontend/components/ui/layered-button.tsx`, `frontend/components/ui/card-flip.tsx`
- Modify: `frontend/package.json` — remove `ogl` and `gsap` / `@gsap/react` only if `rg` shows zero imports

**Interfaces:**
- Consumes: remaining pages (auth, about, license, contacts, cart empty — already good)
- Produces: spec copy table applied; dead files gone

- [ ] **Step 1: Apply the spec copy table** to checkout/success (if payments Task 5 has not already), `navbar.viewAll`, `common.viewAll`, auth (`signIn` / `signUp` stay verb-first, delete any “Let’s go” / “Welcome back” cleverness if it fights the voice — keep `Welcome back` only if it stays calm). Change `View All →` to `View all` / `Смотреть все`.

Cart empty state stays. License/about copy stays (it is the voice).

- [ ] **Step 2: Grep then delete**

```bash
rg -l "DarkVeil|SplitText|GradientText|MorphyButton|LayeredButton|CardFlip|from 'ogl'|from 'gsap'" frontend --glob '!node_modules/**'
```

Delete files with zero remaining imports. Then:

```bash
cd frontend && npm uninstall ogl gsap @gsap/react
```

only if those imports are gone. Leave `framer-motion` and `motion` if toast/forms still import them. If `GradientText` is gone and nothing imports `motion/react`, `npm uninstall motion`.

- [ ] **Step 3: Typecheck + lint**

```bash
cd frontend && npx tsc --noEmit && npm run lint
```

- [ ] **Step 4: Browser regression**

Walk: home, /music, /tracks/[slug], /collections, /cart (empty + with item), /login, /about, /license. Desktop and 390px. Confirm no purple borders, no flip, no DarkVeil, brass used once per view.

- [ ] **Step 5: Commit**

```bash
git add frontend
git commit -m "chore(ui): copy pass and delete unused motion toys"
```

---

## Self-review

- Spec coverage: tokens, type, formatPrice, chrome, catalog, grain, copy, deletions — tasked. Checkout method picker lives in the payments plan (Task 5). Join is visual: checkout uses `Button` + tokens from this plan.
- No placeholders.
- `formatPrice` signature is stable for the payments plan.
