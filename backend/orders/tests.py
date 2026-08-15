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
