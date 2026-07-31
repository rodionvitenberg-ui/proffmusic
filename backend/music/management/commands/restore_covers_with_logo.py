import os
from io import BytesIO
from pathlib import Path

from PIL import Image
from django.conf import settings
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.utils import timezone

from music.models import Track, Collection

# Логотип лежит в backend/media/logo2.png
LOGO_REL_PATH = 'logo2.png'


def overlay_logo(cover_path: str, logo: Image.Image) -> ContentFile:
    """Накладывает логотип logo2.png на обложку и возвращает ContentFile."""
    cover = Image.open(cover_path).convert('RGBA')
    W, H = cover.size

    # Масштабируем логотип: ширина 40% от ширины обложки, сохраняя пропорции
    logo_w = int(W * 0.4)
    logo_h = int(logo.height * (logo_w / logo.width))
    resized_logo = logo.resize((logo_w, logo_h), Image.Resampling.LANCZOS)

    # Позиция: по центру внизу, отступ 4% от нижнего края
    x = (W - logo_w) // 2
    y = H - logo_h - int(H * 0.04)

    cover.alpha_composite(resized_logo, (x, y))

    output = BytesIO()
    cover.convert('RGB').save(output, format='JPEG', quality=95)
    output.seek(0)

    # Имя файла: как у исходной обложки, но с суффиксом _logo и расширением .jpg
    base = os.path.basename(cover_path)
    name = os.path.splitext(base)[0] + '_logo.jpg'
    return ContentFile(output.read(), name=name)


class Command(BaseCommand):
    help = 'Накладывает логотип media/logo2.png на обложки всех треков и коллекций'

    def handle(self, *args, **options):
        logo_path = Path(settings.MEDIA_ROOT) / LOGO_REL_PATH
        if not os.path.exists(logo_path):
            self.stderr.write(f'❌ Логотип не найден: {logo_path}')
            return

        logo = Image.open(logo_path).convert('RGBA')

        updated_tracks = 0
        errors = 0
        for track in Track.objects.all():
            if not track.cover_image:
                self.stderr.write(f'  ⚠️ Трек без обложки: {track.title}')
                errors += 1
                continue

            cover_path = track.cover_image.path
            if not os.path.exists(cover_path):
                self.stderr.write(f'  ⚠️ Файл обложки не найден: {cover_path}')
                errors += 1
                continue

            content = overlay_logo(cover_path, logo)
            # save=False: пишем файл и обновляем имя, не вызывая переопределённый Track.save()
            track.cover_image.save(content.name, content, save=False)
            Track.objects.filter(pk=track.pk).update(
                cover_image=track.cover_image.name,
                updated_at=timezone.now(),
            )
            updated_tracks += 1
            self.stdout.write(f'  ✓ Трек: {track.title} -> {track.cover_image.name}')

        updated_collections = 0
        for collection in Collection.objects.all():
            if not collection.cover_image:
                self.stderr.write(f'  ⚠️ Коллекция без обложки: {collection.title}')
                errors += 1
                continue

            cover_path = collection.cover_image.path
            if not os.path.exists(cover_path):
                self.stderr.write(f'  ⚠️ Файл обложки не найден: {cover_path}')
                errors += 1
                continue

            content = overlay_logo(cover_path, logo)
            collection.cover_image.save(content.name, content, save=False)
            Collection.objects.filter(pk=collection.pk).update(
                cover_image=collection.cover_image.name,
                created_at=collection.created_at,
            )
            updated_collections += 1
            self.stdout.write(f'  ✓ Коллекция: {collection.title} -> {collection.cover_image.name}')

        self.stdout.write(self.style.SUCCESS(
            f'\n✅ ГОТОВО! Треков: {updated_tracks}, коллекций: {updated_collections}, ошибок: {errors}'
        ))