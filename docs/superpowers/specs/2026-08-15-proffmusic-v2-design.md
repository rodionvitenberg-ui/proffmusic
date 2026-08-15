# ProffMusic v2.0 Design

Date: 2026-08-15
Status: accepted (currency + style locked with the product owner)

A guest can pay with a card or Bitcoin, receive the download email, and the store looks like the product the copy already claims: live instruments, film-grade music, no AI.

Not a rewrite. Keep Next.js 16 + Django 6 + the existing order → token → email → download path.

## Key Decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| Market | International, USD | Lemon Squeezy is a USD/EUR Merchant of Record. Catalog prices become dollars. No live FX. Reprice in admin. |
| Cards | Lemon Squeezy | Merchant of Record handles VAT. Create Checkout supports `custom_price` in cents. One store product, no catalog sync. |
| Crypto | BTCPay Server, BTC + Lightning only | 0% processor fee, non-custodial, open source. Custodial gateways (NOWPayments, OpenNode, CoinGate) are not “free and honest”. |
| Visual | Cinematic studio | Warm near-black, one antique-brass accent, Zodiak display + Inter UI, CSS grain. Matches the about-page brief. Current purple-WebGL look contradicts it. |
| Stack | Keep it | Restyle and plug payments in. Do not replace the catalog, player, auth, or admin. |

## Constraints (every implementer inherits these)

- Ponytail: no PaymentStrategy, no provider registry, no new component library, no new icon pack, no light mode.
- Colors: OKLCH in `@theme` only. Brass means primary action and “now playing”. Never links, borders, or headings.
- Motion: CSS transitions on named properties. Press scale is `0.96`. No `transition: all`. No permanent `will-change`. No card-flip. No DarkVeil.
- Copy: about-page voice. Sentence case. Verb-first buttons. Errors say how to fix, on the field. Locale owns the hero (RU is Russian, EN is English).
- Money tests are mandatory. UI without a browser check is unfinished.

## Current system (do not break)

- `orders.views.checkout` creates an `Order` + `OrderItem`s from the cart.
- `create_payment()` currently marks the order paid immediately (mock).
- `DownloadToken` (48 hours, 3 uses) + email + single file or ZIP already works. Keep `fulfill()` as the only path that flips `pending → paid`.
- Prices are `Decimal` labeled RUB. UI hardcodes `₽`. `Order.yookassa_payment_id` is dead.
- Frontend: Tailwind 4, next-intl (`en`/`ru`), Zustand cart, WaveSurfer player, lucide icons.
- Forced `.dark`. Zodiak is loaded as `--font-custom` and almost unused. Body is Inter.
- Unused / removable after restyle: `DarkVeil.tsx` (only homepage), `SplitText.tsx` (zero imports), `morphy-button.tsx` (zero imports), `GradientText` (only Hero).

---

## Payments

### Flow

```
POST /api/orders/checkout/
  { email, items, provider: "lemonsqueezy" | "btcpay" }

  create Order(status=pending, amount, currency="USD")
  → create_lemonsqueezy_checkout(order)  OR  create_btcpay_invoice(order)
  → { order_id, payment_url }

  frontend redirects to the hosted page

POST /api/orders/webhooks/lemonsqueezy/     HMAC-SHA256, raw body
POST /api/orders/webhooks/btcpay/           HMAC-SHA256, raw body
  verify signature
  → fulfill(order):
        if already paid: return
        status=paid
        generate DownloadToken
        send_order_email
```

`PAYMENTS_BACKEND=mock` (default when `DEBUG=True`) keeps the old instant-pay path for local dev. Production must set `PAYMENTS_BACKEND=live`.

No abstraction layer. Two create functions + one `fulfill()` in `orders/services.py`.

### Lemon Squeezy

One hidden store product, one variant named “Music license”.

`POST https://api.lemonsqueezy.com/v1/checkouts`

```
custom_price                              # int cents = order.amount * 100
product_options.name                      # "ProffMusic · order {id[:8]}"
product_options.redirect_url              # {SITE_URL}/{locale}/success?order_id=
product_options.receipt_button_text       # "Download"
product_options.enabled_variants          # [LEMON_SQUEEZY_VARIANT_ID]
checkout_data.email                       # order.email
checkout_data.custom.order_id             # str(order.id)
checkout_options.locale                   # "en" | "ru"
checkout_options.background_color         # #1C1913
checkout_options.button_color             # #D4A84B
checkout_options.button_text_color        # #241C0F
```

Webhook: accept `order_created` when `data.attributes.status == "paid"`. Read `meta.custom_data.order_id`. Header `X-Signature` is hex HMAC-SHA256 of the raw body with `LEMONSQUEEZY_WEBHOOK_SECRET`. Store `data.id` on `Order.provider_payment_id`.

Do not create an LS product per track.

### BTCPay Server

Greenfield API. One store. Bitcoin + Lightning. No altcoin plugins.

`POST {BTCPAY_URL}/api/v1/stores/{BTCPAY_STORE_ID}/invoices`

```
amount                 # str(order.amount)
currency               # "USD"
metadata.orderId       # str(order.id)
checkout.redirectURL   # {SITE_URL}/{locale}/success?order_id=
```

Webhook: handle `InvoiceSettled` only. Ignore `InvoiceProcessing`, `InvoiceExpired`. Header `BTCPay-Sig` is `sha256=<hex>`. HMAC-SHA256 of the raw body with `BTCPAY_WEBHOOK_SECRET`. Store the invoice id on `Order.provider_payment_id`.

Hosting default: Docker on the existing Ubuntu box, Nginx location for invoice pages. A third-party BTCPay host is acceptable (still 0% processor). Not a product debate.

### Model

One migration on `Order`:

```
provider              CharField  choices=mock|lemonsqueezy|btcpay  default=mock
provider_payment_id   CharField  max_length=100  blank
currency              CharField  max_length=3    default=USD
# delete yookassa_payment_id
```

`Track.price` / `Collection.price` stay Decimal. Admin verbose name becomes “Price (USD)”. Existing rows are re-priced in admin (optional one-shot `manage.py reprice --rate X` if the catalog is large). No runtime FX.

### Checkout UI

One screen.

1. Email — visible label. Placeholder `name@studio.com`.
2. Two methods: **Pay with card** (filled brass, primary) and **Pay with Bitcoin** (outline).
3. Submit: `Pay {formatPrice(total)}` / `Оплатить {formatPrice(total)}`.
4. Field error: `Enter an email so we can send the download link.`
5. Start-payment error: `Unable to start payment. Try again.`
6. Quiet redirect line: `You will continue on Lemon Squeezy` / `You will continue on BTCPay`.
7. No mock disclaimer in production.
8. Success: thank-you, order id, what was bought, check-spam note, one button `Open the library`.

### Payments out of scope

Subscriptions, coupons, our tax engine, LS catalog sync, crypto-to-fiat conversion, refund UI, altcoins, a second entitlement system, YooKassa/SBP.

---

## Interface — cinematic studio

Warm near-black. One accent: antique brass. Zodiak on titles, Inter on chrome. CSS film grain. Covers are the art. Quiet, expensive, human.

Spirit references (not to clone): ECM / Deutsche Grammophon digital, a scoring stage, a printed cue sheet.

### Tokens (copy verbatim into `globals.css`)

```css
:root, .dark {
  --background: oklch(0.145 0.012 80);
  --foreground: oklch(0.95 0.01 85);
  --card: oklch(0.185 0.012 80);
  --card-foreground: oklch(0.95 0.01 85);
  --muted: oklch(0.22 0.012 80);
  --muted-foreground: oklch(0.72 0.015 80);
  --primary: oklch(0.78 0.11 85);
  --primary-foreground: oklch(0.18 0.03 80);
  --secondary: oklch(0.22 0.012 80);
  --secondary-foreground: oklch(0.95 0.01 85);
  --accent: var(--primary);
  --accent-foreground: var(--primary-foreground);
  --destructive: oklch(0.65 0.18 25);
  --border: oklch(1 0 0 / 0.08);
  --input: oklch(1 0 0 / 0.10);
  --ring: oklch(0.78 0.11 85);
  --radius: 0.5rem;
  --shadow-border: 0 0 0 1px oklch(1 0 0 / 0.08);
  --shadow-border-hover: 0 0 0 1px oklch(1 0 0 / 0.13);
}
```

Rules:

- Brass = filled primary button + playing indicator. Nothing else.
- Links = foreground + underline. Headings = foreground. Separators = `--border`.
- Success is a state (check icon), never a second filled green button.
- No raw hex in pages (`#0f0f0f`, `#181818`, `#5227FF`, `text-green-400` as emphasis).
- Image outline: `outline outline-1 -outline-offset-1 outline-white/10`.
- Recheck text/background pairs. Adjust L only. Keep C and H.

### Type

- Display (hero, page titles, track titles on detail): `font-[family-name:var(--font-custom)]` (Zodiak).
- UI: Inter on `body` (already).
- Sentence case except the wordmark.
- Prices and durations: `tabular-nums`.
- `formatPrice(amount)` in `frontend/lib/price.ts`:

```ts
export function formatPrice(amount: number | string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(amount));
}
```

Every `₽` call site uses this. JSON-LD `priceCurrency` becomes `USD`.

### Surfaces and motion

- Concentric radii: outer = inner + padding. First visible on the checkout card.
- Press: `active:scale-[0.96]`. Never below 0.95.
- Play triangle: `translate-x-[2px]`.
- Named transition properties only. Drop `will-change-transform` on the navbar.
- Stagger only the first hero entrance (~100ms). Catalog/hover/typing: instant or ≤150ms opacity/color.
- Track cards are front-only: cover, title, duration, price, play, add. No `CardFlip`.
- Homepage: CSS grain overlay (`pointer-events-none`, ~4% opacity). No `DarkVeil`.
- lucide, `currentColor`, one stroke. Outline default, fill only for playing / in-cart.
- `Button` variants: `default | outline | ghost | destructive`. Delete unused variants. Delete `LayeredButton` after Navbar stops using it. Delete `MorphyButton`, `DarkVeil`, `SplitText`, `GradientText` when nothing imports them. Keep `framer-motion` (toast, forms). Drop `ogl` and GSAP if unused after deletes.

### Chrome

- **Navbar:** wordmark, text links, language, bag, account. Not a row of outlined buttons. Hide-on-scroll stays.
- **Hero:** locale-owned headline, Zodiak, two lines, existing subtitle. Primary `Listen to tracks`. Secondary `About the studio`.
- **Player:** brass playing state. Cover has the image outline. Buy is the only filled control.
- **Catalog:** no `scale-110` on play. Hover reveals the play disc via opacity.

### Copy

Voice is the about page. Direct, specific, no “oops”, no “we’re having trouble”.

| Place | EN | RU |
| --- | --- | --- |
| Checkout submit | `Pay {price}` | `Оплатить {price}` |
| Card method | `Pay with card` | `Оплатить картой` |
| Crypto method | `Pay with Bitcoin` | `Оплатить биткоином` |
| Email error | `Enter an email so we can send the download link.` | `Укажите почту — на неё придёт ссылка на скачивание.` |
| Payment fail | `Unable to start payment. Try again.` | `Не удалось начать оплату. Попробуйте ещё раз.` |
| Redirect LS | `You will continue on Lemon Squeezy.` | `Дальше откроется Lemon Squeezy.` |
| Redirect BTC | `You will continue on BTCPay.` | `Дальше откроется BTCPay.` |
| Success CTA | `Open the library` | `Открыть библиотеку` |
| View all | `View all` | `Смотреть все` |
| Sign in | `Sign in` | `Войти` |
| Create account | `Create account` | `Создать аккаунт` |

Empty cart already orients and points forward — keep it. Full templated strings around prices. Arrow icons are icons, not characters inside the string.

### Assets

1. Token sheet above.
2. CSS grain. Existing `logo.png` / `logo2.png` at one consistent height.
3. Cover treatment: consistent crop + inner white 10% outline.
4. No new icon pack, no illustration system.
5. Optional later: 3–5 real studio stills. Not a blocker.

### Interface out of scope

New framework, new component library, light mode, replacing WaveSurfer/Djoser/Jazzmin/ffmpeg, a separate marketing site.

---

## Sequence

```
Interface: tokens + formatPrice + chrome + catalog
Payments:  model + fulfill + LS + BTCPay
        \                      /
         checkout/success UI + copy
         delete dead code
```

The two tracks can run in parallel. They meet at checkout UI.

## Ship bar

- Card purchase: pending → paid via LS webhook, email arrives, token works (48h / 3 uses).
- Bitcoin purchase: same via BTCPay `InvoiceSettled`.
- Bad webhook signatures leave the order pending.
- Second webhook is a no-op.
- No `₽` in the UI. Prices print via `formatPrice`.
- Store reads as cinematic studio: brass primary, Zodiak titles, no DarkVeil, no card-flip, no purple borders.
- Browser-checked: home, catalog, track, cart, checkout (both methods), success, mobile and desktop.

## PR Plan

1. **tokens-and-price** — `globals.css`, `formatPrice`, drop `₽`, wire Zodiak. No visual redesign yet beyond tokens taking effect.
2. **chrome** — Button, Navbar, Footer, Player, Hero. Depends on 1.
3. **catalog** — TrackCard without flip, collection cards, grain, DarkVeil off. Depends on 2.
4. **payments-core** — Order fields, `fulfill()`, mock still works, checkout stays pending in live mode. Independent of 1–3.
5. **lemonsqueezy** — create checkout + webhook + HMAC tests. Depends on 4.
6. **btcpay** — create invoice + webhook + HMAC tests. Depends on 4.
7. **checkout-ui** — method picker, new copy, success page. Depends on 3, 5, 6.
8. **delete-dead** — unused components, unused motion deps, yookassa leftovers. Depends on 7.

## Open questions

None that block implementation. BTCPay hosting is an ops default (same VPS). Lemon Squeezy’s quieter 2026 roadmap is accepted risk.

## Implementation plans

- Interface: `docs/superpowers/plans/2026-08-15-proffmusic-v2-interface.md`
- Payments: `docs/superpowers/plans/2026-08-15-proffmusic-v2-payments.md`
