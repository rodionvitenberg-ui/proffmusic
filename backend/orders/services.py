import uuid
import requests
from django.conf import settings
from django.core.mail import send_mail
from .models import Order, DownloadToken

def check_access(user, email, product):
    """
    Проверяет, купил ли пользователь данный продукт (Трек или Сборник).
    """
    orders = Order.objects.filter(status='paid')
    
    if user and user.is_authenticated:
        orders = orders.filter(user=user)
    elif email:
        orders = orders.filter(email=email)
    else:
        return False

    for order in orders:
        for item in order.items.all():
            if item.track == product or item.collection == product:
                return True
                
    return False

def generate_download_links(order):
    """
    Создаёт ОДНУ мастер-ссылку на весь заказ.
    """
    token, created = DownloadToken.objects.get_or_create(order=order)
    return [token]


def fulfill(order):
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


def send_order_email(order, download_url=None):
    """
    Генерирует ссылку и отправляет письмо.
    """
    if download_url is None:
        from .services import generate_download_links
        tokens = generate_download_links(order)
        master_token = tokens[0]
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
        print(f"✅ Email sent to {order.email}")
    except Exception as e:
        print(f"❌ Error sending email: {e}")