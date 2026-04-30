import os
from django.db import models
from django.conf import settings
from django.core.files.storage import FileSystemStorage
from pytils.translit import slugify
import uuid
from django.core.files.uploadedfile import TemporaryUploadedFile
import mutagen
from datetime import timedelta
from django.core.files.base import ContentFile

protected_storage = FileSystemStorage(location=settings.PROTECTED_MEDIA_ROOT)

class Category(models.Model):
    """Категории: YouTube, Реклама, Корпоратив и т.д."""
    name = models.CharField("Название", max_length=100)
    slug = models.SlugField(unique=True, help_text="URL-адрес категории")
    order = models.PositiveIntegerField("Порядок сортировки", default=0)

    class Meta:
        verbose_name = "Категория"
        verbose_name_plural = "Категории"
        ordering = ['order']

    def __str__(self):
        return self.name


class Tag(models.Model):
    """Теги: Настроение, Инструменты, Назначение"""
    TAG_TYPES = (
        ('usage', 'По назначению'),  
        ('instrument', 'По инструментам'), 
        ('mood', 'По настроению'),    
    )

    name = models.CharField("Тег", max_length=100)
    slug = models.SlugField(unique=True)
    tag_type = models.CharField("Тип тега", max_length=20, choices=TAG_TYPES, default='mood')

    class Meta:
        verbose_name = "Тег"
        verbose_name_plural = "Теги"
        ordering = ['tag_type', 'name']

    def __str__(self):
        return f"{self.name} ({self.get_tag_type_display()})"


class Track(models.Model):
    """Основной товар: Музыкальный трек"""
    title = models.CharField("Название трека", max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    
    duration = models.DurationField("Длительность", blank=True, null=True, help_text="Вычисляется автоматически")
    category = models.ForeignKey('Category', on_delete=models.SET_NULL, null=True, related_name='tracks', verbose_name="Категория")
    tags = models.ManyToManyField('Tag', related_name='tracks', verbose_name="Теги", blank=True)
    description_short = models.TextField("Краткое описание", blank=True, help_text="Для превью")
    description_full = models.TextField("Полное описание", blank=True)
    
    cover_image = models.ImageField("Обложка", upload_to='covers/%Y/%m/', help_text="1200x630px, темная эстетика")
    
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

    price = models.DecimalField("Цена (RUB)", max_digits=10, decimal_places=2)
    is_new = models.BooleanField("Выводить в новинках", default=True, help_text="Галочка для блока Новинки")
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

    class Meta:
        verbose_name = "Трек"
        verbose_name_plural = "Треки"
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        # 1. Генерация слага
        if not self.slug:
            base_slug = slugify(self.title)
            unique_suffix = uuid.uuid4().hex[:6]
            self.slug = f"{base_slug}-{unique_suffix}"

        # 2. Сохраняем оригинал на диск
        print(">>> [DEBUG] Начало сохранения. Записываем оригинал...")
        super().save(*args, **kwargs)
        print(f">>> [DEBUG] Оригинал сохранен. Путь: {self.audio_file_full.path if self.audio_file_full else 'NET FILE'}")

        need_update = False

        # 3. Проверка условий
        print(f">>> [DEBUG] Галочка: {self.auto_generate_preview}, Файл есть: {bool(self.audio_file_full)}")

        if self.auto_generate_preview and self.audio_file_full:
            try:
                print(">>> [DEBUG] Заходим в блок генерации...")
                from media_engine.services import generate_preview
                
                # Проверяем путь перед отправкой
                full_path = self.audio_file_full.path
                if not os.path.exists(full_path):
                    print(f">>> [ERROR] Файл не найден по пути: {full_path}")
                    raise FileNotFoundError("Файл физически отсутствует на диске!")

                print(f">>> [DEBUG] Отправляем в ffmpeg: {full_path}")
                
                # Генерируем
                preview_content = generate_preview(
                    full_path, 
                    start_sec=self.preview_start_time, 
                    duration_sec=self.preview_duration
                )
                
                if preview_content:
                    print(f">>> [DEBUG] Превью успешно создано! Размер: {len(preview_content)} байт")
                    
                    # Сохраняем файл в поле
                    self.audio_file_preview.save(preview_content.name, preview_content, save=False)
                    print(">>> [DEBUG] Превью привязано к модели")
                    
                    self.auto_generate_preview = False
                    need_update = True
                else:
                    print(">>> [ERROR] Сервис вернул None (пустой файл)")

            except Exception as e:
                # ВОТ ЭТО МЫ ИЩЕМ:
                print(f">>> [CRITICAL ERROR] Ошибка внутри генерации: {e}")
                import traceback
                print(traceback.format_exc())

        # 4. Вторичное сохранение
        if need_update:
            print(">>> [DEBUG] Обновляем запись в БД...")
            super().save(update_fields=['audio_file_preview', 'auto_generate_preview', 'duration'])
            print(">>> [DEBUG] УСПЕХ!")

class Collection(models.Model):
    """Сборники музыки (альбомы)"""
    title = models.CharField("Название сборника", max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    cover_image = models.ImageField("Обложка", upload_to='collections/%Y/%m/')
    description = models.TextField("Описание")
    price = models.DecimalField("Цена (RUB)", max_digits=10, decimal_places=2)
    
    # Связь с треками (Many-to-Many)
    tracks = models.ManyToManyField(Track, related_name='collections', verbose_name="Треки в сборнике")
    
    is_new = models.BooleanField("В новинках", default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Сборник"
        verbose_name_plural = "Сборники"

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            unique_suffix = uuid.uuid4().hex[:6]
            self.slug = f"{base_slug}-{unique_suffix}"
        super().save(*args, **kwargs)