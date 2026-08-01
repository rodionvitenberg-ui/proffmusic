import os
from io import BytesIO
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont
from django.conf import settings
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.utils import timezone
from pytils.translit import translify

from music.models import Track, Collection

# Логотип лежит в backend/media/logo2.png
LOGO_REL_PATH = 'logo2.png'

# Кириллица транслитирируется, латиница/цифры остаются как есть.
# Максимальная ширина текста в пикселях до переноса строки.
MAX_TEXT_WIDTH = 900


def load_font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    """Загружает жирный TTF-шрифт для латиницы (транслит)."""
    candidates = [
        '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
        '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf',
        '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
        '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
    ]
    for fp in candidates:
        if Path(fp).exists():
            try:
                return ImageFont.truetype(str(fp), size)
            except Exception:
                continue
    return ImageFont.load_default()


def draw_gradient(base: Image.Image) -> None:
    """Фирменный тёмный градиент #0f0f0f -> #1a1035 -> #5227FF."""
    W, H = base.size
    draw = ImageDraw.Draw(base)
    colors = [(15, 15, 15), (26, 16, 53), (82, 39, 255)]
    for y in range(H):
        t = y / H
        if t < 0.6:
            local_t = t / 0.6
            c1, c2 = colors[0], colors[1]
        else:
            local_t = (t - 0.6) / 0.4
            c1, c2 = colors[1], colors[2]
        r = int(c1[0] + (c2[0] - c1[0]) * local_t)
        g = int(c1[1] + (c2[1] - c1[1]) * local_t)
        b = int(c1[2] + (c2[2] - c1[2]) * local_t)
        draw.line([(0, y), (W, y)], fill=(r, g, b))


def wrap_title(draw: ImageDraw.ImageDraw, text: str, font, max_width: int) -> list[str]:
    """Переносит длинный заголовок на несколько строк по границам слов."""
    words = text.split()
    lines: list[str] = []
    current = ''

    for word in words:
        trial = f'{current} {word}'.strip()
        bbox = draw.textbbox((0, 0), trial, font=font)
        if (bbox[2] - bbox[0]) <= max_width or not current:
            current = trial
        else:
            lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def generate_poster(title: str, logo: Image.Image) -> ContentFile:
    """
    Создаёт новый постер 1200x630:
    - фирменный тёмный градиент и декоративные кольца;
    - название трека ТРАНСЛИТОМ (латиница) по центру;
    - логотип logo2.png внизу по центру.
    """
    W, H = 1200, 630

    # 1. Фон
    base = Image.new('RGB', (W, H))
    draw_gradient(base)

    base = base.convert('RGBA')

    # Тёмная вуаль для читаемости текста
    veil = Image.new('RGBA', (W, H), (0, 0, 0, 120))
    base.alpha_composite(veil)

    # Декоративные тонкие кольца (фирменный стиль)
    ring = ImageDraw.Draw(base, 'RGBA')
    ring.ellipse([W - 260, -160, W + 160, 260], outline=(255, 255, 255, 25), width=3)
    ring.ellipse([-160, H - 260, 260, H + 160], outline=(255, 255, 255, 20), width=2)

    draw = ImageDraw.Draw(base)

    # 2. Название транслитом
    translit_text = translify(title).strip()
    if not translit_text:
        translit_text = 'TRACK'

    title_font = load_font(52)
    lines = wrap_title(draw, translit_text, title_font, MAX_TEXT_WIDTH)
    lines = lines[:3]  # не более 3 строк

    line_height = 64
    total_h = len(lines) * line_height
    start_y = H / 2 - total_h / 2 - 20

    for i, line in enumerate(lines):
        y = start_y + i * line_height
        draw.text((W / 2, y), line, font=title_font, fill=(255, 255, 255, 255), anchor='mm')

    # 3. Логотип внизу по центру
    logo_w = int(W * 0.32)
    logo_h = int(logo.height * (logo_w / logo.width))
    resized_logo = logo.resize((logo_w, logo_h), Image.Resampling.LANCZOS)
    x = (W - logo_w) // 2
    y = H - logo_h - int(H * 0.05)
    base.alpha_composite(resized_logo, (x, y))

    # 4. Сохранение
    output = BytesIO()
    base.convert('RGB').save(output, format='JPEG', quality=94)
    output.seek(0)

    slug_part = ''
    for ch in translit_text.lower():
        if ch.isalnum():
            slug_part += ch
        elif ch in (' ', '-', '_'):
            slug_part += '_'
    slug_part = slug_part.strip('_')[:40] or 'track'

    return ContentFile(output.read(), name=f'{slug_part}_poster.jpg')


class Command(BaseCommand):
    help = 'Заменяет постеры треков и коллекций: название ТРАНСЛИТОМ + логотип logo2.png из media'

    def add_arguments(self, parser):
        parser.add_argument(
            '--test-output',
            type=str,
            default='',
            help='Локальный тест БЕЗ БД: сгенерировать один постер и сохранить по этому пути.',
        )
        parser.add_argument(
            '--test-title',
            type=str,
            default='Скрипка быстрая 1',
            help='Название для тестового постера (--test-output).',
        )

    def handle(self, *args, **options):
        logo_path = Path(settings.MEDIA_ROOT) / LOGO_REL_PATH
        if not os.path.exists(logo_path):
            self.stderr.write(f'❌ Логотип не найден: {logo_path}')
            return

        logo = Image.open(logo_path).convert('RGBA')

        # --- Локальный тест без БД ---
        test_output = options.get('test_output', '')
        if test_output:
            test_title = options.get('test_title', 'Скрипка быстрая 1')
            content = generate_poster(test_title, logo)
            out = Path(test_output)
            out.parent.mkdir(parents=True, exist_ok=True)
            out.write_bytes(content.read())
            self.stdout.write(self.style.SUCCESS(
                f'✅ Тестовый постер сохранён: {out} '
                f'(размер {out.stat().st_size} байт, название транслитом: "{translify(test_title)}")'
            ))
            return

        # --- Работа с БД (прод) ---
        updated_tracks = 0
        errors = 0

        for track in Track.objects.all():
            title = track.title_ru or track.title_en or 'Track'
            try:
                content = generate_poster(title, logo)
                # save=False: пишем файл и обновляем имя, не вызывая переопределённый Track.save()
                track.cover_image.save(content.name, content, save=False)
                Track.objects.filter(pk=track.pk).update(
                    cover_image=track.cover_image.name,
                    updated_at=timezone.now(),
                )
                updated_tracks += 1
                self.stdout.write(f'  ✓ Трек «{title}» -> {track.cover_image.name}')
            except Exception as e:
                errors += 1
                self.stderr.write(f'  ⚠️ Трек «{title}»: {e}')

        updated_collections = 0
        for collection in Collection.objects.all():
            title = collection.title_ru or collection.title_en or 'Collection'
            try:
                content = generate_poster(title, logo)
                collection.cover_image.save(content.name, content, save=False)
                Collection.objects.filter(pk=collection.pk).update(
                    cover_image=collection.cover_image.name,
                )
                updated_collections += 1
                self.stdout.write(f'  ✓ Коллекция «{title}» -> {collection.cover_image.name}')
            except Exception as e:
                errors += 1
                self.stderr.write(f'  ⚠️ Коллекция «{title}»: {e}')

        self.stdout.write(self.style.SUCCESS(
            f'\n✅ ГОТОВО! Треков: {updated_tracks}, коллекций: {updated_collections}, ошибок: {errors}'
        ))