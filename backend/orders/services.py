import uuid
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