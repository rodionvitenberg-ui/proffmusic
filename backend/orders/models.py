import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from music.models import Track, Collection

class Order(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Ожидает оплаты'),
        ('paid', 'Оплачено'),
        ('cancelled', 'Отменено'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # Если юзер авторизован - привязываем, если нет - полагаемся на email
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders')
    email = models.EmailField("Email для доставки", help_text="Сюда придет ссылка")
    
    # Данные от ЮКассы
    yookassa_payment_id = models.CharField("ID платежа ЮКассы", max_length=100, blank=True)
    status = models.CharField("Статус", max_length=20, choices=STATUS_CHOICES, default='pending')
    
    amount = models.DecimalField("Сумма", max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Заказ"
        verbose_name_plural = "Заказы"
        ordering = ['-created_at']

    def __str__(self):
        return f"Заказ #{str(self.id)[:8]} ({self.get_status_display()})"


class OrderItem(models.Model):
    """Позиция в заказе (Трек или Сборник)"""
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    
    # Ссылка может быть либо на Трек, либо на Сборник.
    # Делаем два поля, одно из них будет заполнено.
    track = models.ForeignKey(Track, on_delete=models.SET_NULL, null=True, blank=True)
    collection = models.ForeignKey(Collection, on_delete=models.SET_NULL, null=True, blank=True)
    
    price = models.DecimalField("Цена на момент покупки", max_digits=10, decimal_places=2)

    def __str__(self):
        if self.track:
            return f"Трек: {self.track.title}"
        if self.collection:
            return f"Сборник: {self.collection.title}"
        return "Удаленный товар"
    
class DownloadToken(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='download_tokens')
    
    # Ссылка ведет либо на трек, либо на сборник
    track = models.ForeignKey(Track, on_delete=models.CASCADE, null=True, blank=True)
    collection = models.ForeignKey(Collection, on_delete=models.CASCADE, null=True, blank=True)
    
    token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, help_text="Секретный ключ ссылки")
    
    # Ограничения
    usage_count = models.PositiveIntegerField("Кол-во скачиваний", default=0)
    max_usages = models.PositiveIntegerField("Лимит скачиваний", default=3, help_text="Сколько раз можно скачать по одной ссылке")
    expires_at = models.DateTimeField("Срок действия")
    
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # Если срок не установлен, даем 48 часов по умолчанию
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(hours=48)
        super().save(*args, **kwargs)

    @property
    def is_valid(self):
        """Проверка: ссылка жива и лимит не исчерпан"""
        now = timezone.now()
        return self.usage_count < self.max_usages and now < self.expires_at

    def __str__(self):
        product = self.track.title if self.track else (self.collection.title if self.collection else "Unknown")
        return f"Token for {product} ({self.usage_count}/{self.max_usages})"