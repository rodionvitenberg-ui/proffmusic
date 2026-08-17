import logging
import os
import uuid

from django.conf import settings
from django.core.files.storage import FileSystemStorage
from django.db import models
from pytils.translit import slugify

from .tools import localized

logger = logging.getLogger(__name__)

protected_storage = FileSystemStorage(location=settings.PROTECTED_MEDIA_ROOT)


class Category(models.Model):
    """Категории: YouTube, Реклама, Корпоратив и т.д."""
    name_ru = models.CharField("Название (RU)", max_length=100, blank=True, default='')
    name_en = models.CharField("Название (EN)", max_length=100, blank=True, default='')
    slug = models.SlugField(unique=True, help_text="URL-адрес категории")
    order = models.PositiveIntegerField("Порядок сортировки", default=0)

    class Meta:
        verbose_name = "Категория"
        verbose_name_plural = "Категории"
        ordering = ['order']

    @property
    def name(self):
        return localized(self.name_ru, self.name_en)

    def __str__(self):
        return self.name


class Tag(models.Model):
    """Теги: Настроение, Инструменты, Назначение"""
    TAG_TYPES = (
        ('usage', 'По назначению'),
        ('instrument', 'По инструментам'),
        ('mood', 'По настроению'),
    )

    name_ru = models.CharField("Тег (RU)", max_length=100, blank=True, default='')
    name_en = models.CharField("Тег (EN)", max_length=100, blank=True, default='')
    slug = models.SlugField(unique=True)
    tag_type = models.CharField("Тип тега", max_length=20, choices=TAG_TYPES, default='mood')

    class Meta:
        verbose_name = "Тег"
        verbose_name_plural = "Теги"
        ordering = ['tag_type', 'name_ru']

    @property
    def name(self):
        return localized(self.name_ru, self.name_en)

    def __str__(self):
        return f"{self.name} ({self.get_tag_type_display()})"


class Track(models.Model):
    """Основной товар: Музыкальный трек"""
    title_ru = models.CharField("Название трека (RU)", max_length=200, blank=True, default='')
    title_en = models.CharField("Название трека (EN)", max_length=200, blank=True, default='')
    slug = models.SlugField(unique=True, blank=True)

    duration = models.DurationField("Длительность", blank=True, null=True, help_text="Вычисляется автоматически")
    category = models.ForeignKey('Category', on_delete=models.SET_NULL, null=True, related_name='tracks', verbose_name="Категория")
    tags = models.ManyToManyField('Tag', related_name='tracks', verbose_name="Теги", blank=True)
    description_short_ru = models.TextField("Краткое описание (RU)", blank=True, help_text="Для превью")
    description_short_en = models.TextField("Краткое описание (EN)", blank=True, help_text="Для превью")
    description_full_ru = models.TextField("Полное описание (RU)", blank=True)
    description_full_en = models.TextField("Полное описание (EN)", blank=True)

    cover_image = models.ImageField("Обложка", upload_to='covers/%Y/%m/', help_text="квадрат, тёмная эстетика")

    audio_file_preview = models.FileField(
        "Аудиопример (MP3)",
        upload_to='previews/',
        help_text="Публичный файл, 60 сек, с водяным знаком или урезанный",
        blank=True,
        null=True
    )
    audio_file_full = models.FileField(
        "Полный файл (ZIP/WAV)",
        storage=protected_storage,
        upload_to='tracks/',
        help_text="Файл, который получит клиент после оплаты"
    )

    price = models.DecimalField("Price (USD)", max_digits=10, decimal_places=2)
    purchases_count = models.PositiveIntegerField("Куплено раз", default=0)
    is_new = models.BooleanField("Выводить в новинках", default=True, help_text="Галочка для блока Новинки")
    is_popular = models.BooleanField("Выводить в популярном", default=False, help_text="Галочка для блока Популярное")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # --- Настройки для авто-нарезки ---
    auto_generate_preview = models.BooleanField(
        "Сгенерировать превью авто?",
        default=False,
        help_text="Если стоит галочка, система возьмет полный трек и обрежет его согласно настройкам ниже."
    )
    preview_start_time = models.PositiveIntegerField(
        "Начало превью (сек)",
        default=0,
        help_text="С какой секунды начинать обрезку"
    )
    preview_duration = models.PositiveIntegerField(
        "Длительность (сек)",
        default=30,
        help_text="Сколько секунд длится превью"
    )

    # --- Локализованные свойства (для совместимости и API) ---
    @property
    def title(self):
        return localized(self.title_ru, self.title_en)

    @property
    def description_short(self):
        return localized(self.description_short_ru, self.description_short_en)

    @property
    def description_full(self):
        return localized(self.description_full_ru, self.description_full_en)

    class Meta:
        verbose_name = "Трек"
        verbose_name_plural = "Треки"
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        # 1. Генерация слага (из актуального заголовка)
        if not self.slug:
            base = self.title_ru or self.title_en
            if not base:
                base = "track"
            base_slug = slugify(base)
            unique_suffix = uuid.uuid4().hex[:6]
            self.slug = f"{base_slug}-{unique_suffix}"

        # 2. Сохраняем оригинал на диск
        super().save(*args, **kwargs)
        logger.debug("Оригинал сохранен. Путь: %s", self.audio_file_full.path if self.audio_file_full else 'NET FILE')

        need_update = False

        # 3. Проверка условий
        if self.auto_generate_preview and self.audio_file_full:
            try:
                from media_engine.services import generate_preview

                # Проверяем путь перед отправкой
                full_path = self.audio_file_full.path
                if not os.path.exists(full_path):
                    logger.error("Файл не найден по пути: %s", full_path)
                    raise FileNotFoundError("Файл физически отсутствует на диске!")

                # Генерируем
                preview_content = generate_preview(
                    full_path,
                    start_sec=self.preview_start_time,
                    duration_sec=self.preview_duration
                )

                if preview_content:
                    # Сохраняем файл в поле
                    self.audio_file_preview.save(preview_content.name, preview_content, save=False)
                    self.auto_generate_preview = False
                    need_update = True
                else:
                    logger.error("Сервис вернул None (пустой файл)")

            except Exception:
                logger.exception("Ошибка внутри генерации превью")

        # 4. Вторичное сохранение
        if need_update:
            super().save(update_fields=['audio_file_preview', 'auto_generate_preview', 'duration'])


class Collection(models.Model):
    """Сборники музыки (альбомы)"""
    title_ru = models.CharField("Название сборника (RU)", max_length=200, blank=True, default='')
    title_en = models.CharField("Название сборника (EN)", max_length=200, blank=True, default='')
    slug = models.SlugField(unique=True, blank=True)
    cover_image = models.ImageField("Обложка", upload_to='collections/%Y/%m/', help_text="квадрат, тёмная эстетика")
    description_ru = models.TextField("Описание (RU)", blank=True, default='')
    description_en = models.TextField("Описание (EN)", blank=True, default='')
    price = models.DecimalField("Price (USD)", max_digits=10, decimal_places=2)

    # Связь с треками (Many-to-Many)
    tracks = models.ManyToManyField(Track, related_name='collections', verbose_name="Треки в сборнике")

    is_new = models.BooleanField("В новинках", default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    # --- Локализованные свойства ---
    @property
    def title(self):
        return localized(self.title_ru, self.title_en)

    @property
    def description(self):
        return localized(self.description_ru, self.description_en)

    class Meta:
        verbose_name = "Сборник"
        verbose_name_plural = "Сборники"

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            base = self.title_ru or self.title_en
            if not base:
                base = "collection"
            base_slug = slugify(base)
            unique_suffix = uuid.uuid4().hex[:6]
            self.slug = f"{base_slug}-{unique_suffix}"
        super().save(*args, **kwargs)