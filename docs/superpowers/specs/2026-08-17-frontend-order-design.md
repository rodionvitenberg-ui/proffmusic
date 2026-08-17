# Frontend order design

Date: 2026-08-17
Status: accepted

Make the Nuxt storefront readable and safe to change. Same look, same routes.
A change in one place must not break another. Text must be visible on every page.

## Identity

Van Morrison chrome (Oswald / Inria, `#0f0f0f`), purple veil on home, Hyprofflex/Proff voice.
Not the cinematic-studio spec (brass, Zodiak, no DarkVeil).

## Why it is fragile today

`web/` loads `vm.css` (260 KB, one line, 632 color declarations) written for a concert site.
Donor sets `h1–h5 { color: #0f0f0f }` on a dark body. White is re-applied only on a few product classes.
`t()` on objects returns vue-i18n v10 AST, so journal titles and bodies print empty.

## CSS

Seven owned files. Hex/rgba only in `tokens.css`. Class names in Vue stay.

```
tokens.css    colors, fonts — the only place hex/rgba live
reset.css     tiny reset + dark body defaults (headings inherit --text)
chrome.css    header, footer, buttons, fields, player
type.css      wordmark, page titles, body, links
home.css      veil, hero, curtains, fan, rails
catalog.css   catalog, cards, filters
pages.css     pm-page, journal, legal, profile, auth, cart, checkout
```

`vm.css` is not imported. `vanmorrison/` is a visual reference only.
`color: transparent` is allowed only on `.site-hero__heading-outline`.

## Copy

- `t('key')` — strings only
- `useI18nArray('key')` — `string[]`
- `useI18nList<T>('key')` — typed object lists via `getLocaleMessage`
- Locale JSON is the journal/legal/about source. No CMS.
- Filter label is Category, not Style.

## Modules

Folders stay. No component library.

| Place | Job |
| --- | --- |
| `pages/` | route + compose |
| `components/home` | veil, hero, fan, rails |
| `components/catalog` | cards, filters |
| `SiteHeader/Footer/PlayerBar` | chrome |
| `useApi` | the only HTTP door |
| `useI18n*` | copy |
| `stores/` | auth, cart, player |
| `types/catalog.ts` | Track, Collection, CartItem |
| `assets/css/` | the seven files |

Empty `NUXT_PUBLIC_API_URL` means same-origin `/api`. Dev-only fallback `http://127.0.0.1:8000`.

## Domain

See root `CONTEXT.md`. Marketing may say «мелодия»; the catalog thing is a Track.

## Ship bar

- Journal, legal, about, profile, checkout: text is readable
- Change `--text` — it applies everywhere
- `vm.css` is not in the bundle
- Login, catalog, player, cart still work
- Home still has veil + curtains + Proff copy

## Out of scope

New look, new routes, CMS, payment-method UI, deleting `vanmorrison/`, backend models, rewriting page SFCs, a component library, renaming `/music`.
