import uuid
import json
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from yookassa import Configuration, Payment
from .models import Order, DownloadToken, OrderItem

Configuration.account_id = settings.YOOKASSA_SHOP_ID
Configuration.secret_key = settings.YOOKASSA_SECRET_KEY

def check_access(user, email, product):
    """
    Проверяет, купил ли пользователь данный продукт (Трек или Сборник).
    product: экземпляр Track или Collection
    """
    # 1. Ищем оплаченные заказы
    orders = Order.objects.filter(status='paid')
    
    # 2. Фильтруем по пользователю (если вошел) или по email (гость)
    if user and user.is_authenticated:
        orders = orders.filter(user=user)
    elif email:
        orders = orders.filter(email=email)
    else:
        return False # Нет ни юзера, ни email

    # 3. Проверяем, есть ли товар внутри этих заказов
    for order in orders:
        for item in order.items.all():
            if item.track == product or item.collection == product:
                return True
                
    return False

def generate_download_links(order):
    """
    Создает ОДНУ мастер-ссылку на весь заказ.
    Возвращает список из одного токена (для совместимости с остальным кодом).
    """
    # Проверяем, может токен уже есть, чтобы не дублировать
    token, created = DownloadToken.objects.get_or_create(
        order=order,
        track=None,      # Важно: эти поля теперь пустые,
        collection=None  # так как ссылка не привязана к конкретному товару
    )
    
    return [token]

def create_payment(order, ip_address):
    """
    Создает платеж в ЮКассе и возвращает URL для перенаправления пользователя.
    """
    idempotence_key = str(uuid.uuid4())
    
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
        "description": f"Заказ №{str(order.id)[:8]} на ProffMusic",
        "metadata": {
            "order_id": str(order.id)
        },
        "receipt": {
            "customer": {
                "email": order.email
            },
            "items": _build_receipt_items(order)
        }
    }, idempotence_key)

    # Сохраняем ID платежа, чтобы потом проверить статус
    order.yookassa_payment_id = payment.id
    order.save()

    return payment.confirmation.confirmation_url

def _build_receipt_items(order):
    """
    Формирует список товаров для чека (требование 54-ФЗ).
    """
    items = []
    for item in order.items.all():
        name = item.track.title if item.track else item.collection.title
        items.append({
            "description": name[:128], # Ограничение ЮКассы
            "quantity": "1.00",
            "amount": {
                "value": str(item.price),
                "currency": "RUB"
            },
            "vat_code": "1", # 1 = без НДС (для ИП/самозанятых часто подходит, уточни у бухгалтера)
            "payment_mode": "full_payment",
            "payment_subject": "service" # Или 'commodity'
        })
    return items

def send_order_email(order):
    """
    Генерирует ссылку и отправляет письмо.
    """
    # 1. Генерируем токен (используем нашу функцию из шага выше)
    # Импорт внутри функции, чтобы избежать циклического импорта
    from .services import generate_download_links 
    tokens = generate_download_links(order)
    master_token = tokens[0] # Мы договорились, что ссылка одна на заказ

    # 2. Формируем ссылку (в продакшене тут будет домен сайта)
    download_url = f"{settings.SITE_URL}/api/orders/download/{master_token.token}/"

    # 3. Отправляем письмо
    subject = f"Ваш заказ №{str(order.id)[:8]} готов!"
    message = f"""
    Спасибо за покупку!
    
    Ваша ссылка для скачивания:
    {download_url}
    
    Ссылка действительна 48 часов.
    """
    
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [order.email],
        fail_silently=False,
    )