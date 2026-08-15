from decimal import Decimal

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

    @override_settings(PAYMENTS_BACKEND='live')
    def test_live_checkout_stays_pending(self):
        res = self.client.post('/api/orders/checkout/', {
            'email': 'a@b.com',
            'provider': 'lemonsqueezy',
            'items': [{'type': 'track', 'id': self.track.id}],
        }, format='json')
        self.assertEqual(res.status_code, 503)
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
