import logging

import requests
from django.conf import settings
from django.core.mail import send_mail
from django.db.models import F

from music.models import Track

from .models import DownloadToken

logger = logging.getLogger(__name__)


def fulfill(order):
    token, _ = DownloadToken.objects.get_or_create(order=order)
    if order.status == 'paid':
        return token
    order.status = 'paid'
    order.save(update_fields=['status'])
    for item in order.items.all():
        if item.track_id:
            Track.objects.filter(id=item.track_id).update(purchases_count=F('purchases_count') + 1)
    download_url = f"{settings.SITE_URL}/api/orders/download/{token.token}/"
    send_order_email(order, download_url)
    return token


def create_payment(order, ip, locale='en'):
    """Mock only. Live backends use create_lemonsqueezy_checkout / create_btcpay_invoice."""
    fulfill(order)
    return f"/{locale}/success?order_id={order.id}"


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
                    'background_color': '#121018',
                    'button_color': '#4E8CFF',
                    'button_text_color': '#0B1020',
                },
                'checkout_data': {
                    'email': order.email,
                    'custom': {'order_id': str(order.id)},
                },
            },
            'relationships': {
                'store': {
                    'data': {'type': 'stores', 'id': str(settings.LEMONSQUEEZY_STORE_ID)},
                },
                'variant': {
                    'data': {'type': 'variants', 'id': str(settings.LEMONSQUEEZY_VARIANT_ID)},
                },
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


def send_order_email(order, download_url=None):
    """
    Генерирует ссылку и отправляет письмо.
    """
    if download_url is None:
        master_token, _ = DownloadToken.objects.get_or_create(order=order)
        download_url = f"{settings.SITE_URL}/api/orders/download/{master_token.token}/"

    subject = f"Your order #{str(order.id)[:8]} is ready!"
    message = f"""
Thank you for your purchase!

Your download link:
{download_url}

The link is valid for 48 hours.
"""
    
    try:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [order.email],
            fail_silently=False,
        )
        logger.info("Email sent to %s", order.email)
    except Exception as e:
        logger.error("Error sending email: %s", e)
