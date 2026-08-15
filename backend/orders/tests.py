import hashlib
import hmac
import json
from decimal import Decimal
from unittest.mock import patch

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from rest_framework.test import APITestCase

from music.models import Track
from orders.models import DownloadToken, Order
from orders.services import fulfill

PNG = (
    b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01'
    b'\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\xf8\x0f\x00'
    b'\x00\x01\x01\x00\x05\x18\xd8N\x00\x00\x00\x00IEND\xaeB`\x82'
)


def make_track(**kwargs):
    defaults = {
        'title_en': 'Cue',
        'slug': 'cue',
        'price': Decimal('29.00'),
        'cover_image': SimpleUploadedFile('c.png', PNG, content_type='image/png'),
        'audio_file_full': SimpleUploadedFile('t.wav', b'RIFF', content_type='audio/wav'),
    }
    defaults.update(kwargs)
    return Track.objects.create(**defaults)


class OrderModelTests(TestCase):
    def test_new_order_defaults(self):
        order = Order.objects.create(email='a@b.com', amount='10.00')
        self.assertEqual(order.provider, 'mock')
        self.assertEqual(order.currency, 'USD')
        self.assertEqual(order.provider_payment_id, '')
        self.assertEqual(order.status, 'pending')
        self.assertFalse(hasattr(order, 'yookassa_payment_id'))


@override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
class FulfillTests(TestCase):
    def test_fulfill_is_idempotent(self):
        order = Order.objects.create(email='a@b.com', amount=Decimal('10.00'))
        first = fulfill(order)
        second = fulfill(order)
        order.refresh_from_db()
        self.assertEqual(order.status, 'paid')
        self.assertEqual(DownloadToken.objects.filter(order=order).count(), 1)
        self.assertEqual(first.id, second.id)


@override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
class CheckoutTests(APITestCase):
    def setUp(self):
        self.track = make_track()

    @override_settings(
        PAYMENTS_BACKEND='live',
        LEMONSQUEEZY_API_KEY='k',
        LEMONSQUEEZY_STORE_ID='1',
        LEMONSQUEEZY_VARIANT_ID='1',
    )
    @patch('orders.services.requests.post')
    def test_live_checkout_stays_pending(self, mock_post):
        mock_post.return_value.raise_for_status = lambda: None
        mock_post.return_value.json.return_value = {
            'data': {'attributes': {'url': 'https://ls.example/c'}},
        }
        res = self.client.post('/api/orders/checkout/', {
            'email': 'a@b.com',
            'provider': 'lemonsqueezy',
            'items': [{'type': 'track', 'id': self.track.id}],
        }, format='json')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['payment_url'], 'https://ls.example/c')
        order = Order.objects.get()
        self.assertEqual(order.status, 'pending')
        self.assertEqual(order.currency, 'USD')
        self.assertEqual(order.provider, 'lemonsqueezy')

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


def _ls_sig(body: bytes, secret: str) -> str:
    return hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()


@override_settings(
    PAYMENTS_BACKEND='live',
    LEMONSQUEEZY_WEBHOOK_SECRET='s3cret',
    EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
)
class LemonSqueezyWebhookTests(APITestCase):
    def setUp(self):
        self.order = Order.objects.create(
            email='a@b.com', amount='29.00', provider='lemonsqueezy',
        )

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
            'meta': {
                'event_name': 'order_created',
                'custom_data': {'order_id': str(self.order.id)},
            },
            'data': {'id': 'ls_1', 'attributes': {'status': 'paid'}},
        }
        res = self._post(payload, secret='wrong')
        self.assertEqual(res.status_code, 400)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, 'pending')

    def test_paid_event_fulfills_once(self):
        payload = {
            'meta': {
                'event_name': 'order_created',
                'custom_data': {'order_id': str(self.order.id)},
            },
            'data': {'id': 'ls_1', 'attributes': {'status': 'paid'}},
        }
        self.assertEqual(self._post(payload).status_code, 200)
        self.assertEqual(self._post(payload).status_code, 200)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, 'paid')
        self.assertEqual(self.order.provider_payment_id, 'ls_1')
        self.assertEqual(self.order.download_tokens.count(), 1)


@override_settings(
    PAYMENTS_BACKEND='live',
    BTCPAY_WEBHOOK_SECRET='btcsecret',
    EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
)
class BtcpayWebhookTests(APITestCase):
    def setUp(self):
        self.order = Order.objects.create(
            email='a@b.com', amount='29.00', provider='btcpay',
        )

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
        payload = {
            'type': 'InvoiceSettled',
            'invoiceId': 'inv1',
            'metadata': {'orderId': str(self.order.id)},
        }
        res = self._post(payload, secret='wrong')
        self.assertEqual(res.status_code, 400)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, 'pending')

    def test_settled_fulfills_once(self):
        payload = {
            'type': 'InvoiceSettled',
            'invoiceId': 'inv1',
            'metadata': {'orderId': str(self.order.id)},
        }
        self.assertEqual(self._post(payload).status_code, 200)
        self.assertEqual(self._post(payload).status_code, 200)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, 'paid')
        self.assertEqual(self.order.provider_payment_id, 'inv1')
        self.assertEqual(self.order.download_tokens.count(), 1)

    def test_processing_is_ignored(self):
        payload = {
            'type': 'InvoiceProcessing',
            'invoiceId': 'inv1',
            'metadata': {'orderId': str(self.order.id)},
        }
        self.assertEqual(self._post(payload).status_code, 200)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, 'pending')
