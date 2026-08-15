# ProffMusic v2.0 Payments Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace mock checkout with Lemon Squeezy (cards) and BTCPay Server (Bitcoin + Lightning), keeping the existing download-token email path.

**Architecture:** Checkout creates a pending `Order`, then one of two functions returns a hosted `payment_url`. Webhooks verify HMAC and call one idempotent `fulfill(order)`. No provider registry.

**Tech Stack:** Django 6, DRF, `requests`, Lemon Squeezy Checkout API, BTCPay Greenfield API, existing `DownloadToken` + `send_order_email`.

**Spec:** `docs/superpowers/specs/2026-08-15-proffmusic-v2-design.md`

## Global Constraints

- Store currency is USD. `Order.currency` default `"USD"`.
- Providers: `mock` | `lemonsqueezy` | `btcpay`. No other values.
- `PAYMENTS_BACKEND=mock` when `DEBUG=True`; production must set `live`.
- No PaymentStrategy / ABC / plugin system. Two create functions + `fulfill()`.
- Do not sync the track catalog into Lemon Squeezy. One variant, `custom_price` in cents.
- BTCPay: BTC + Lightning only. No altcoin plugins.
- `fulfill()` is the only function that sets `status='paid'`, creates the token, and sends mail.
- Webhooks: verify HMAC on the raw body, CSRF-exempt, idempotent.
- Copy and checkout UI belong to Task 6; visual tokens belong to the interface plan.
- Never mark an order paid before a verified webhook (except mock backend).

---

### Task 1: Order fields and settings

**Files:**
- Modify: `backend/orders/models.py`
- Modify: `backend/music/models.py` (price field verbose names only)
- Modify: `backend/core/settings.py`
- Modify: `.env.example`
- Create: `backend/orders/migrations/0003_order_provider.py` (via `makemigrations`)
- Modify: `backend/orders/admin.py` (show new fields)
- Test: `backend/orders/tests.py`

**Interfaces:**
- Consumes: existing `Order` model
- Produces: `Order.provider: str`, `Order.provider_payment_id: str`, `Order.currency: str` (default `"USD"`). Removes `yookassa_payment_id`. Settings: `PAYMENTS_BACKEND`, `LEMONSQUEEZY_*`, `BTCPAY_*`.

- [ ] **Step 1: Write the failing model test**

Replace `backend/orders/tests.py` with:

```python
from django.test import TestCase
from orders.models import Order


class OrderModelTests(TestCase):
    def test_new_order_defaults(self):
        order = Order.objects.create(email='a@b.com', amount='10.00')
        self.assertEqual(order.provider, 'mock')
        self.assertEqual(order.currency, 'USD')
        self.assertEqual(order.provider_payment_id, '')
        self.assertEqual(order.status, 'pending')
        self.assertFalse(hasattr(order, 'yookassa_payment_id'))
```

- [ ] **Step 2: Run the test — expect FAIL**

```bash
cd backend && ./venv/bin/python manage.py test orders.tests.OrderModelTests -v 2
```

Expected: `Order` has no `provider` / still has `yookassa_payment_id`.

- [ ] **Step 3: Update the model**

In `backend/orders/models.py`, replace the YooKassa field and add:

```python
PROVIDER_CHOICES = (
    ('mock', 'Mock'),
    ('lemonsqueezy', 'Lemon Squeezy'),
    ('btcpay', 'BTCPay'),
)

provider = models.CharField(max_length=20, choices=PROVIDER_CHOICES, default='mock')
provider_payment_id = models.CharField(max_length=100, blank=True, default='')
currency = models.CharField(max_length=3, default='USD')
```

Delete `yookassa_payment_id`.

In `backend/music/models.py`, change both price field labels from `"Цена (RUB)"` to `"Price (USD)"`.

In `backend/core/settings.py` add:

```python
PAYMENTS_BACKEND = os.getenv(
    'PAYMENTS_BACKEND',
    'mock' if DEBUG else 'live',
)

LEMONSQUEEZY_API_KEY = os.getenv('LEMONSQUEEZY_API_KEY', '')
LEMONSQUEEZY_STORE_ID = os.getenv('LEMONSQUEEZY_STORE_ID', '')
LEMONSQUEEZY_VARIANT_ID = os.getenv('LEMONSQUEEZY_VARIANT_ID', '')
LEMONSQUEEZY_WEBHOOK_SECRET = os.getenv('LEMONSQUEEZY_WEBHOOK_SECRET', '')

BTCPAY_URL = os.getenv('BTCPAY_URL', '').rstrip('/')
BTCPAY_API_KEY = os.getenv('BTCPAY_API_KEY', '')
BTCPAY_STORE_ID = os.getenv('BTCPAY_STORE_ID', '')
BTCPAY_WEBHOOK_SECRET = os.getenv('BTCPAY_WEBHOOK_SECRET', '')
```

Append to `.env.example`:

```
PAYMENTS_BACKEND=mock
LEMONSQUEEZY_API_KEY=
LEMONSQUEEZY_STORE_ID=
LEMONSQUEEZY_VARIANT_ID=
LEMONSQUEEZY_WEBHOOK_SECRET=
BTCPAY_URL=
BTCPAY_API_KEY=
BTCPAY_STORE_ID=
BTCPAY_WEBHOOK_SECRET=
```

Show the three new fields on `Order` in `admin.py`.

- [ ] **Step 4: Migrate and run the test**

```bash
cd backend && ./venv/bin/python manage.py makemigrations orders --name order_provider
./venv/bin/python manage.py migrate
./venv/bin/python manage.py test orders.tests.OrderModelTests -v 2
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/orders/models.py backend/orders/migrations backend/orders/tests.py backend/orders/admin.py backend/music/models.py backend/core/settings.py .env.example
git commit -m "feat(orders): USD provider fields, drop yookassa"
```

---

### Task 2: Extract `fulfill()` and stop auto-paying

**Files:**
- Modify: `backend/orders/services.py`
- Modify: `backend/orders/views.py`
- Test: `backend/orders/tests.py`

**Interfaces:**
- Consumes: `Order`, `DownloadToken`, `send_order_email`
- Produces:
  - `fulfill(order: Order) -> DownloadToken` — no-op if `order.status == 'paid'`
  - `create_payment(order, ip, locale='en') -> str` — mock path only when `PAYMENTS_BACKEND == 'mock'`; otherwise must not be used to mark paid

- [ ] **Step 1: Write the failing checkout tests**

Append to `backend/orders/tests.py`:

```python
from decimal import Decimal
from django.test import override_settings
from rest_framework.test import APITestCase
from music.models import Track
from orders.models import Order, DownloadToken
from orders.services import fulfill


class FulfillTests(TestCase):
    def test_fulfill_is_idempotent(self):
        order = Order.objects.create(email='a@b.com', amount=Decimal('10.00'))
        first = fulfill(order)
        second = fulfill(order)
        self.assertEqual(order.status, 'paid')
        self.assertEqual(DownloadToken.objects.filter(order=order).count(), 1)
        self.assertEqual(first.id, second.id)


class CheckoutTests(APITestCase):
    def setUp(self):
        self.track = Track.objects.create(
            title_en='Cue', slug='cue', price=Decimal('29.00'),
            audio_file_full='tracks/x.wav',
        )

    @override_settings(PAYMENTS_BACKEND='live')
    def test_live_checkout_stays_pending(self):
        # provider functions land in later tasks; live + unknown provider → 400
        res = self.client.post('/api/orders/checkout/', {
            'email': 'a@b.com',
            'provider': 'lemonsqueezy',
            'items': [{'type': 'track', 'id': self.track.id}],
        }, format='json')
        self.assertIn(res.status_code, (200, 502, 503))
        order = Order.objects.get()
        self.assertEqual(order.status, 'pending')
        self.assertEqual(order.currency, 'USD')

    @override_settings(PAYMENTS_BACKEND='mock')
    def test_mock_checkout_still_pays(self):
        res = self.client.post('/api/orders/checkout/', {
            'email': 'a@b.com',
            'items': [{'type': 'track', 'id': self.track.id}],
        }, format='json')
        self.assertEqual(res.status_code, 200)
        order = Order.objects.get()
        self.assertEqual(order.status, 'paid')
        self.assertIn('payment_url', res.data)

    def test_empty_cart_is_400(self):
        res = self.client.post('/api/orders/checkout/', {
            'email': 'a@b.com', 'items': [],
        }, format='json')
        self.assertEqual(res.status_code, 400)
```

`Track` may require more required fields — read `music/models.py` and pass every non-null field the model actually needs (`cover_image` can be skipped if blank is not allowed; use a dummy `SimpleUploadedFile` only if the field is required). If `audio_file_full` is required, keep a tiny bytes file.

- [ ] **Step 2: Run tests — expect FAIL** on `fulfill` missing and live checkout auto-paying.

```bash
cd backend && ./venv/bin/python manage.py test orders.tests -v 2
```

- [ ] **Step 3: Implement `fulfill` and gate mock**

`backend/orders/services.py`:

```python
from django.conf import settings
from .models import Order, DownloadToken


def fulfill(order: Order) -> DownloadToken:
    token, _ = DownloadToken.objects.get_or_create(order=order)
    if order.status == 'paid':
        return token
    order.status = 'paid'
    order.save(update_fields=['status'])
    download_url = f"{settings.SITE_URL}/api/orders/download/{token.token}/"
    send_order_email(order, download_url)
    return token


def create_payment(order, ip, locale='en'):
    """Mock only. Live backends use create_lemonsqueezy_checkout / create_btcpay_invoice."""
    fulfill(order)
    return f"/{locale}/success?order_id={order.id}"
```

Keep the existing `send_order_email` and `generate_download_links`. `generate_download_links` can call the same `get_or_create`.

In `checkout` (`views.py`):

- Read `provider = data.get('provider', 'lemonsqueezy')`.
- Reject unknown provider with 400 `{"error": "Unknown payment method"}`.
- Set `order.currency = 'USD'` and `order.provider = provider` (or `'mock'` when backend is mock).
- After saving amount:
  - if `settings.PAYMENTS_BACKEND == 'mock'`: `url = create_payment(order, ip)`
  - elif `provider == 'lemonsqueezy'`: call `create_lemonsqueezy_checkout` when it exists; until Task 3, return 503 `{"error": "Unable to start payment. Try again."}` without fulfilling
  - elif `provider == 'btcpay'`: same with `create_btcpay_invoice`
- Never call `fulfill` from the view.

Adjust `test_live_checkout_stays_pending` to expect 503 until Task 3, then update it in Task 3 to 200. Prefer writing the test now as:

```python
self.assertEqual(res.status_code, 503)
self.assertEqual(Order.objects.get().status, 'pending')
```

- [ ] **Step 4: Run tests — expect PASS** for mock + empty cart + fulfill. Live 503 is correct.

- [ ] **Step 5: Commit**

```bash
git add backend/orders/services.py backend/orders/views.py backend/orders/tests.py
git commit -m "feat(orders): fulfill() is the only path to paid"
```

---

### Task 3: Lemon Squeezy checkout + webhook

**Files:**
- Modify: `backend/orders/services.py`
- Modify: `backend/orders/views.py`
- Modify: `backend/orders/urls.py`
- Test: `backend/orders/tests.py`

**Interfaces:**
- Consumes: `Order`, LS settings
- Produces:
  - `create_lemonsqueezy_checkout(order: Order, locale: str = 'en') -> str` — returns hosted checkout URL, sets `order.provider='lemonsqueezy'`
  - `lemonsqueezy_webhook(request)` — POST, CSRF-exempt

- [ ] **Step 1: Write webhook tests**

```python
import hashlib
import hmac
import json
from django.test import override_settings
from rest_framework.test import APITestCase
from orders.models import Order


def _ls_sig(body: bytes, secret: str) -> str:
    return hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()


@override_settings(
    PAYMENTS_BACKEND='live',
    LEMONSQUEEZY_WEBHOOK_SECRET='s3cret',
)
class LemonSqueezyWebhookTests(APITestCase):
    def setUp(self):
        self.order = Order.objects.create(email='a@b.com', amount='29.00', provider='lemonsqueezy')

    def _post(self, payload, secret='s3cret'):
        body = json.dumps(payload).encode()
        return self.client.post(
            '/api/orders/webhooks/lemonsqueezy/',
            data=body,
            content_type='application/json',
            HTTP_X_SIGNATURE=_ls_sig(body, secret),
        )

    def test_bad_signature_leaves_pending(self):
        payload = {
            'meta': {'event_name': 'order_created', 'custom_data': {'order_id': str(self.order.id)}},
            'data': {'id': 'ls_1', 'attributes': {'status': 'paid'}},
        }
        res = self._post(payload, secret='wrong')
        self.assertEqual(res.status_code, 400)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, 'pending')

    def test_paid_event_fulfills_once(self):
        payload = {
            'meta': {'event_name': 'order_created', 'custom_data': {'order_id': str(self.order.id)}},
            'data': {'id': 'ls_1', 'attributes': {'status': 'paid'}},
        }
        self.assertEqual(self._post(payload).status_code, 200)
        self.assertEqual(self._post(payload).status_code, 200)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, 'paid')
        self.assertEqual(self.order.provider_payment_id, 'ls_1')
        self.assertEqual(self.order.download_tokens.count(), 1)
```

- [ ] **Step 2: Run — expect FAIL** (URL missing).

- [ ] **Step 3: Implement**

`create_lemonsqueezy_checkout` in `services.py`:

```python
import requests
from django.conf import settings


def create_lemonsqueezy_checkout(order, locale='en'):
    cents = int(order.amount * 100)
    payload = {
        'data': {
            'type': 'checkouts',
            'attributes': {
                'custom_price': cents,
                'product_options': {
                    'name': f"ProffMusic · order {str(order.id)[:8]}",
                    'redirect_url': f"{settings.SITE_URL}/{locale}/success?order_id={order.id}",
                    'receipt_button_text': 'Download',
                    'enabled_variants': [int(settings.LEMONSQUEEZY_VARIANT_ID)],
                },
                'checkout_options': {
                    'locale': locale if locale in ('en', 'ru') else 'en',
                    'background_color': '#1C1913',
                    'button_color': '#D4A84B',
                    'button_text_color': '#241C0F',
                },
                'checkout_data': {
                    'email': order.email,
                    'custom': {'order_id': str(order.id)},
                },
            },
            'relationships': {
                'store': {'data': {'type': 'stores', 'id': str(settings.LEMONSQUEEZY_STORE_ID)}},
                'variant': {'data': {'type': 'variants', 'id': str(settings.LEMONSQUEEZY_VARIANT_ID)}},
            },
        }
    }
    res = requests.post(
        'https://api.lemonsqueezy.com/v1/checkouts',
        json=payload,
        headers={
            'Accept': 'application/vnd.api+json',
            'Content-Type': 'application/vnd.api+json',
            'Authorization': f'Bearer {settings.LEMONSQUEEZY_API_KEY}',
        },
        timeout=20,
    )
    res.raise_for_status()
    url = res.json()['data']['attributes']['url']
    order.provider = 'lemonsqueezy'
    order.save(update_fields=['provider'])
    return url
```

Webhook view (CSRF-exempt, `AllowAny`, read `request.body`):

```python
import hashlib, hmac
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import Order
from .services import fulfill


def _valid_ls_sig(body: bytes, header: str) -> bool:
    secret = settings.LEMONSQUEEZY_WEBHOOK_SECRET
    if not secret or not header:
        return False
    expected = hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, header)


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def lemonsqueezy_webhook(request):
    body = request.body
    if not _valid_ls_sig(body, request.headers.get('X-Signature', '')):
        return Response({'error': 'Invalid signature'}, status=400)
    payload = request.data
    if payload.get('meta', {}).get('event_name') != 'order_created':
        return Response({'ok': True})
    attrs = payload.get('data', {}).get('attributes', {})
    if attrs.get('status') != 'paid':
        return Response({'ok': True})
    order_id = payload.get('meta', {}).get('custom_data', {}).get('order_id')
    order = Order.objects.filter(id=order_id).first()
    if not order:
        return Response({'error': 'Order not found'}, status=404)
    order.provider_payment_id = str(payload.get('data', {}).get('id', ''))
    order.save(update_fields=['provider_payment_id'])
    fulfill(order)
    return Response({'ok': True})
```

Wire `path('webhooks/lemonsqueezy/', lemonsqueezy_webhook)` in `orders/urls.py`.

In `checkout`, when live + `provider=='lemonsqueezy'`, call `create_lemonsqueezy_checkout`. Catch `requests.HTTPError` / `requests.RequestException` → 502 with `{"error": "Unable to start payment. Try again."}` and leave the order pending.

- [ ] **Step 4: Run webhook tests — expect PASS.**

```bash
cd backend && ./venv/bin/python manage.py test orders.tests.LemonSqueezyWebhookTests -v 2
```

- [ ] **Step 5: Commit**

```bash
git add backend/orders/services.py backend/orders/views.py backend/orders/urls.py backend/orders/tests.py
git commit -m "feat(orders): Lemon Squeezy checkout and webhook"
```

---

### Task 4: BTCPay invoice + webhook

**Files:**
- Modify: `backend/orders/services.py`
- Modify: `backend/orders/views.py`
- Modify: `backend/orders/urls.py`
- Test: `backend/orders/tests.py`

**Interfaces:**
- Consumes: `Order`, BTCPay settings
- Produces:
  - `create_btcpay_invoice(order: Order, locale: str = 'en') -> str`
  - `btcpay_webhook(request)`

- [ ] **Step 1: Write webhook tests**

```python
@override_settings(PAYMENTS_BACKEND='live', BTCPAY_WEBHOOK_SECRET='btcsecret')
class BtcpayWebhookTests(APITestCase):
    def setUp(self):
        self.order = Order.objects.create(email='a@b.com', amount='29.00', provider='btcpay')

    def _post(self, payload, secret='btcsecret'):
        body = json.dumps(payload).encode()
        sig = 'sha256=' + hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()
        return self.client.post(
            '/api/orders/webhooks/btcpay/',
            data=body,
            content_type='application/json',
            HTTP_BTCPAY_SIG=sig,
        )

    def test_bad_signature_leaves_pending(self):
        payload = {'type': 'InvoiceSettled', 'invoiceId': 'inv1',
                   'metadata': {'orderId': str(self.order.id)}}
        res = self._post(payload, secret='wrong')
        self.assertEqual(res.status_code, 400)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, 'pending')

    def test_settled_fulfills_once(self):
        payload = {'type': 'InvoiceSettled', 'invoiceId': 'inv1',
                   'metadata': {'orderId': str(self.order.id)}}
        self.assertEqual(self._post(payload).status_code, 200)
        self.assertEqual(self._post(payload).status_code, 200)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, 'paid')
        self.assertEqual(self.order.provider_payment_id, 'inv1')
        self.assertEqual(self.order.download_tokens.count(), 1)

    def test_processing_is_ignored(self):
        payload = {'type': 'InvoiceProcessing', 'invoiceId': 'inv1',
                   'metadata': {'orderId': str(self.order.id)}}
        self.assertEqual(self._post(payload).status_code, 200)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, 'pending')
```

- [ ] **Step 2: Run — expect FAIL.**

- [ ] **Step 3: Implement**

```python
def create_btcpay_invoice(order, locale='en'):
    res = requests.post(
        f"{settings.BTCPAY_URL}/api/v1/stores/{settings.BTCPAY_STORE_ID}/invoices",
        json={
            'amount': str(order.amount),
            'currency': 'USD',
            'metadata': {'orderId': str(order.id)},
            'checkout': {
                'redirectURL': f"{settings.SITE_URL}/{locale}/success?order_id={order.id}",
            },
        },
        headers={'Authorization': f'token {settings.BTCPAY_API_KEY}'},
        timeout=20,
    )
    res.raise_for_status()
    data = res.json()
    url = data.get('checkoutLink') or data.get('url')
    order.provider = 'btcpay'
    order.provider_payment_id = data.get('id', '')
    order.save(update_fields=['provider', 'provider_payment_id'])
    return url
```

Webhook: parse `BTCPay-Sig` as `sha256=<hex>`, `compare_digest`. On `type == 'InvoiceSettled'`, load `metadata.orderId`, set `provider_payment_id` from `invoiceId`, `fulfill()`. Other types return 200 without fulfilling. Missing order → 404.

Wire `path('webhooks/btcpay/', btcpay_webhook)`. Checkout live + `provider=='btcpay'` calls `create_btcpay_invoice`, same 502 handling.

- [ ] **Step 4: Run tests — expect PASS.**

```bash
cd backend && ./venv/bin/python manage.py test orders.tests -v 2
```

- [ ] **Step 5: Commit**

```bash
git add backend/orders/services.py backend/orders/views.py backend/orders/urls.py backend/orders/tests.py
git commit -m "feat(orders): BTCPay invoice and webhook"
```

---

### Task 5: Checkout UI — two methods, new copy

Depends on interface plan `formatPrice` if that file exists; otherwise inline `Intl.NumberFormat` here and switch to `formatPrice` at join.

**Files:**
- Modify: `frontend/app/[locale]/checkout/page.tsx`
- Modify: `frontend/app/[locale]/success/page.tsx`
- Modify: `frontend/messages/en.json` (`checkout`, `success`)
- Modify: `frontend/messages/ru.json` (`checkout`, `success`)

**Interfaces:**
- Consumes: `POST /api/orders/checkout/` with `{ email, items, provider }`
- Produces: checkout form with `provider: 'lemonsqueezy' | 'btcpay'`

- [ ] **Step 1: Replace copy keys**

`en.json` `checkout` + `success`:

```json
"checkout": {
  "title": "Checkout",
  "totalToPay": "Total",
  "email": "Email",
  "emailPlaceholder": "name@studio.com",
  "emailHint": "The download link will be sent here.",
  "emailError": "Enter an email so we can send the download link.",
  "payWithCard": "Pay with card",
  "payWithBitcoin": "Pay with Bitcoin",
  "pay": "Pay {price}",
  "redirectCard": "You will continue on Lemon Squeezy.",
  "redirectBitcoin": "You will continue on BTCPay.",
  "processing": "Starting payment…",
  "errorCreating": "Unable to start payment. Try again."
},
"success": {
  "title": "Payment received",
  "description": "The download link is on its way to your email.",
  "spamNote": "Nothing yet? Check spam, or write to support.",
  "backToMusic": "Open the library"
}
```

`ru.json`:

```json
"checkout": {
  "title": "Оплата",
  "totalToPay": "Итого",
  "email": "Почта",
  "emailPlaceholder": "name@studio.com",
  "emailHint": "Сюда придёт ссылка на скачивание.",
  "emailError": "Укажите почту — на неё придёт ссылка на скачивание.",
  "payWithCard": "Оплатить картой",
  "payWithBitcoin": "Оплатить биткоином",
  "pay": "Оплатить {price}",
  "redirectCard": "Дальше откроется Lemon Squeezy.",
  "redirectBitcoin": "Дальше откроется BTCPay.",
  "processing": "Открываем оплату…",
  "errorCreating": "Не удалось начать оплату. Попробуйте ещё раз."
},
"success": {
  "title": "Оплата прошла",
  "description": "Ссылка на скачивание уже идёт на почту.",
  "spamNote": "Письма нет? Проверьте спам или напишите в поддержку.",
  "backToMusic": "Открыть библиотеку"
}
```

Delete `mockPayment`, `completePurchase`, `errorServer`.

- [ ] **Step 2: Checkout page**

State: `email`, `provider` (`'lemonsqueezy'` default), `isLoading`, `error`.

Radio group of two buttons (not a third-party widget): card is `variant="default"` when selected, bitcoin is `variant="outline"`. Labels from the table above. No green buttons.

Submit:

```ts
const res = await api.post('/api/orders/checkout/', {
  email,
  provider,
  items: items.map(({ type, id }) => ({ type, id })),
});
if (res.data.payment_url) {
  window.location.href = res.data.payment_url;
} else {
  setError(t('errorCreating'));
}
```

Client-side empty email: `setError(t('emailError'))` next to the field. Button label: `t('pay', { price: formatPrice(total) })`. Helper line under the button switches on `provider`.

Use tokens (`bg-card`, `text-foreground`, `shadow-[var(--shadow-border)]`), not `#181818`. Outer radius `rounded-2xl`, inner inputs `rounded-lg` (concentric with `p-8`).

Success page: drop the green circle; use a check icon in `text-foreground`. CTA `t('backToMusic')` → `/music`, `variant="default"`.

- [ ] **Step 3: Typecheck**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors in the files you touched.

- [ ] **Step 4: Manual check** (mock backend)

Open `/en/checkout` with a cart item. Submit card → lands on `/en/success?order_id=`. Repeat is not required for bitcoin until BTCPay is configured. Confirm the mock disclaimer is gone.

- [ ] **Step 5: Commit**

```bash
git add frontend/app/[locale]/checkout/page.tsx frontend/app/[locale]/success/page.tsx frontend/messages/en.json frontend/messages/ru.json
git commit -m "feat(checkout): card and bitcoin methods, USD copy"
```

---

### Task 6: Nginx + env notes (ops, same PR as deploy)

**Files:**
- Modify: `DEPLOY.md` (short section, no essay)
- Modify: `nginx/nginx.conf` only if BTCPay is reverse-proxied on the same host

**Interfaces:**
- Produces: documented webhook URLs

- [ ] **Step 1: Document the three production values a human must paste**

Add to `DEPLOY.md`:

```
## Payments (v2)

Lemon Squeezy
- One hidden product, one variant. Paste VARIANT_ID and STORE_ID into .env.
- Webhook URL: https://proffmusic.shop/api/orders/webhooks/lemonsqueezy/
- Events: order_created
- Signing secret → LEMONSQUEEZY_WEBHOOK_SECRET
- PAYMENTS_BACKEND=live

BTCPay
- Create a store, API key with `btcpay.store.cancreateinvoice`.
- Webhook URL: https://proffmusic.shop/api/orders/webhooks/btcpay/
- Event: InvoiceSettled
- Secret → BTCPAY_WEBHOOK_SECRET
```

If BTCPay runs on the same VPS, add an Nginx `location /btcpay/` (or a dedicated host) pointing at the Docker port. Do not invent a new domain in code — use `BTCPAY_URL`.

- [ ] **Step 2: Commit**

```bash
git add DEPLOY.md nginx/nginx.conf
git commit -m "docs: Lemon Squeezy and BTCPay webhook setup"
```

---

## Self-review

- Spec coverage: model, fulfill, LS, BTCPay, checkout UI, copy, ops — all tasked. `formatPrice` / dropping `₽` on catalog lives in the interface plan.
- No placeholders.
- Names match across tasks: `fulfill`, `create_lemonsqueezy_checkout`, `create_btcpay_invoice`, `provider`, `provider_payment_id`.
