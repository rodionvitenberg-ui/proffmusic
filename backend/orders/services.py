import uuid
import logging
from django.conf import settings
from django.core.mail import send_mail
from yookassa import Configuration, Payment
from .models import DownloadToken

# Настраиваем логгер
logger = logging.getLogger(__name__)

def generate_download_links(order):
    """
    Создает ОДНУ мастер-ссылку на весь заказ.
    """
    token, created = DownloadToken.objects.get_or_create(order=order)
    return [token]

def create_payment(order, ip):
    """
    Создает платеж в ЮКассе.
    """
    # 1. Проверяем ключи. Если их нет - режим эмуляции.
    if not settings.YOOKASSA_SHOP_ID or not settings.YOOKASSA_SECRET_KEY:
        print("⚠️ [MOCK] Ключи ЮКассы не найдены. Включаем эмулятор.")
        frontend_url = settings.SITE_URL if settings.SITE_URL else "http://localhost:3000"
        return f"{frontend_url}/mock-payment?order_id={order.id}&amount={order.amount}"

    # 2. Инициализируем ЮКассу прямо перед запросом (для надежности)
    Configuration.account_id = settings.YOOKASSA_SHOP_ID
    Configuration.secret_key = settings.YOOKASSA_SECRET_KEY

    # 3. Формируем список товаров для чека
    items = []
    for item in order.items.all():
        # Название товара (обрезаем до 128 символов, требование ЮК)
        name = (item.track.title if item.track else item.collection.title)[:128]
        items.append({
            "description": name,
            "quantity": "1.00",
            "amount": {
                "value": str(item.price),
                "currency": "RUB"
            },
            "vat_code": "1", # Ставка НДС (1 = 20%, 4 = без НДС). Если ты самозанятый/ИП без НДС - поставь 4? Но обычно 1 работает.
            "payment_mode": "full_payment",
            "payment_subject": "service" # Или "commodity" для товаров
        })

    # 4. Делаем запрос в ЮКассу
    try:
        idempotence_key = str(uuid.uuid4())
        print(f"🚀 Отправляем запрос в ЮКассу... Сумма: {order.amount}, IP: {ip}")
        
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
            },
            # client_ip не является обязательным полем SDK, но иногда полезен
            # "client_ip": ip 
        }, idempotence_key)

        print(f"✅ Ответ от ЮКассы получен. ID платежа: {payment.id}")

        # Сохраняем ID платежа
        order.yookassa_payment_id = payment.id
        order.save()

        return payment.confirmation.confirmation_url

    except Exception as e:
        print(f"❌ ОШИБКА ЮКАССЫ (services.py): {e}")
        # Выводим детали, если это ошибка API
        if hasattr(e, 'response'):
             print(f"Details: {e.response.text}")
        raise e # Пробрасываем ошибку выше, чтобы checkout упал и мы увидели трейсбек

def send_order_email(order):
    """
    Генерирует ссылку и отправляет письмо.
    """
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
        print(f"📧 Письмо отправлено на {order.email}")
    except Exception as e:
        print(f"❌ Ошибка отправки письма: {e}")