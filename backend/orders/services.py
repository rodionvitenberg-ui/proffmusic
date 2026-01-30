import uuid
import json
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from yookassa import Configuration, Payment
from .models import Order, DownloadToken, OrderItem

# Настраиваем ЮКассу только если есть ключи (чтобы не падало при старте)
if settings.YOOKASSA_SHOP_ID and settings.YOOKASSA_SECRET_KEY:
    Configuration.account_id = settings.YOOKASSA_SHOP_ID
    Configuration.secret_key = settings.YOOKASSA_SECRET_KEY

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
    Создает ОДНУ мастер-ссылку на весь заказ.
    """
    token, created = DownloadToken.objects.get_or_create(order=order)
    return [token]

def create_payment(order, ip):
    """
    Создает платеж. 
    ЕСЛИ DEBUG=True и нет ключей ЮКассы -> возвращает ссылку на локальный эмулятор.
    """
    
    # --- MOCK MODE (ЭМУЛЯТОР) ---
    # Если мы в разработке и ключи не заданы (или специально хотим мок)
    if settings.DEBUG:
        print("⚠️ MOCK PAYMENT MODE ACTIVATED")
        # Возвращаем ссылку на нашу страницу-заглушку на фронте
        # Предполагаем, что фронт крутится на localhost:3000
        frontend_url = "http://localhost:3000" 
        return f"{frontend_url}/mock-payment?order_id={order.id}&amount={order.amount}"

    # --- REAL MODE (БОЕВОЙ) ---
    idempotence_key = str(uuid.uuid4())
    
    items = []
    for item in order.items.all():
        name = item.track.title if item.track else item.collection.title
        items.append({
            "description": name[:128],
            "quantity": "1.00",
            "amount": {
                "value": str(item.price),
                "currency": "RUB"
            },
            "vat_code": "1",
            "payment_mode": "full_payment",
            "payment_subject": "service"
        })

    payment = Payment.create({
        "amount": {
            "value": str(order.amount),
            "currency": "RUB"
        },
        "confirmation": {
            "type": "redirect",
            "return_url": settings.YOOKASSA_RETURN_URL
        },
        "capture": True,
        "description": f"Заказ №{order.id}",
        "metadata": {
            "order_id": str(order.id)
        },
        "receipt": {
            "customer": {
                "email": order.email
            },
            "items": items
        }
    }, idempotence_key)

    # Сохраняем ID платежа, чтобы потом проверять статус
    order.yookassa_payment_id = payment.id
    order.save()

    return payment.confirmation.confirmation_url

def send_order_email(order):
    """
    Генерирует ссылку и отправляет письмо.
    """
    from .services import generate_download_links 
    tokens = generate_download_links(order)
    master_token = tokens[0]

    download_url = f"{settings.SITE_URL}/api/orders/download/{master_token.token}/"

    subject = f"Ваш заказ №{str(order.id)[:8]} готов!"
    message = f"""
    Спасибо за покупку!
    
    Ваша ссылка для скачивания файлов:
    {download_url}
    
    Ссылка действительна 48 часов.
    """
    
    try:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [order.email],
            fail_silently=False,
        )
    except Exception as e:
        print(f"Ошибка отправки письма: {e}")