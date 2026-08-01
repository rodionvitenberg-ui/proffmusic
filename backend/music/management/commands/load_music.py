import os
import io
import uuid
import re
from pathlib import Path
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from django.conf import settings
from PIL import Image, ImageDraw, ImageFont
from pytils.translit import slugify
from music.models import Category, Tag, Track, Collection

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent  # backend/
MUSIC_SOURCE = BASE_DIR / 'ДЛЯ САЙТА'

# --- Категории и цены (RU + EN) ---
CATEGORY_CONFIG = {
    'Youtube': {'name_ru': 'Для YouTube', 'name_en': 'For YouTube', 'price': 990, 'order': 0},
    'Кино': {'name_ru': 'Кино и Трейлеры', 'name_en': 'Cinema & Trailers', 'price': 1490, 'order': 1},
    'Корпоратив': {'name_ru': 'Корпоратив и Мероприятия', 'name_en': 'Corporate & Events', 'price': 1490, 'order': 2},
    'Медитация': {'name_ru': 'Медитация и Релакс', 'name_en': 'Meditation & Relax', 'price': 790, 'order': 3},
    'Реклама и промо': {'name_ru': 'Реклама и Промо', 'name_en': 'Advertising & Promo', 'price': 990, 'order': 4},
}

# --- Словари для автоподбора тегов (RU + EN) ---
MOOD_RULES = [
    (['фанфар', 'выход', 'звезда'], [('торжественный', 'solemn'), ('вдохновляющий', 'inspiring')]),
    (['задорн'], [('зажигательный', 'fiery'), ('энергичный', 'energetic')]),
    (['атмосферн'], [('атмосферный', 'atmospheric'), ('загадочный', 'mysterious'), ('мечтательный', 'dreamy')]),
    (['величествен'], [('величественный', 'majestic'), ('эпический', 'epic'), ('вдохновляющий', 'inspiring')]),
    (['напорист'], [('энергичный', 'energetic'), ('динамичный', 'dynamic'), ('мощный', 'powerful')]),
    (['скрипк'], [('эмоциональный', 'emotional'), ('драматический', 'dramatic'), ('струнный', 'strings')]),
    (['медитац', 'релакс', 'сон', 'туман', 'путь', 'весны', 'звёзд'], [('спокойный', 'calm'), ('расслабляющий', 'relaxing'), ('светлый', 'bright')]),
    (['афро'], [('зажигательный', 'fiery'), ('летний', 'summer'), ('ритмичный', 'rhythmic')]),
    (['бизнес', 'подвиж', 'пульс'], [('деловой', 'business'), ('динамичный', 'dynamic'), ('технологичный', 'tech')]),
]

INSTRUMENT_RULES = [
    (['скрипк'], [('скрипка', 'violin'), ('струнные', 'strings')]),
    (['орган'], [('орган', 'organ'), ('клавишные', 'keys')]),
    (['оркестр'], [('оркестр', 'orchestra'), ('струнные', 'strings')]),
    (['рок'], [('рок-гитара', 'rock-guitar'), ('ударные', 'drums')]),
    (['афро'], [('афро-перкуссия', 'afro-percussion'), ('перкуссия', 'percussion')]),
    (['фанфар'], [('медные духовые', 'brass'), ('труба', 'trumpet')]),
]

USAGE_RULES = {
    'Youtube': [('youtube-видео', 'youtube-video'), ('влог', 'vlog'), ('обзор', 'review')],
    'Кино': [('кино', 'cinema'), ('трейлер', 'trailer'), ('документальный', 'documentary'), ('заставка', 'intro')],
    'Корпоратив': [('презентация', 'presentation'), ('корпоративное видео', 'corporate-video'), ('конференция', 'conference'), ('событие', 'event')],
    'Медитация': [('медитация', 'meditation'), ('йога', 'yoga'), ('релакс', 'relax'), ('сон', 'sleep'), ('фон', 'background')],
    'Реклама и промо': [('реклама', 'advertising'), ('промо-ролик', 'promo-video'), ('соцсети', 'social-media'), ('презентация', 'presentation')],
}

USAGE_ALWAYS = [('без content id', 'no-content-id'), ('роялти-фри', 'royalty-free')]


def generate_cover(title: str, category_name: str) -> ContentFile:
    """Генерирует тёмную обложку 1200x630 в фирменном стиле сайта."""
    W, H = 1200, 630
    # Фирменный тёмный фон с фиолетово-синим градиентом
    base = Image.new('RGB', (W, H))
    draw = ImageDraw.Draw(base)

    # Градиент: #0f0f0f → #1a1035 → #5227FF (угол)
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

    # Тёмная вуаль сверху для читаемости
    veil = Image.new('RGBA', (W, H), (0, 0, 0, 120))
    base = base.convert('RGBA')
    base.alpha_composite(veil)

    # Тонкое кольцо-декорация
    ring = ImageDraw.Draw(base, 'RGBA')
    ring.ellipse([W-260, -160, W+160, 260], outline=(255, 255, 255, 25), width=3)
    ring.ellipse([-160, H-260, 260, H+160], outline=(255, 255, 255, 20), width=2)

    # Пытаемся загрузить шрифты (Zodiak)
    font_paths = [
        settings.BASE_DIR / '..' / 'frontend' / 'app' / 'fonts' / 'Zodiak-Bold.woff2',
        '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
        '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf',
    ]
    font = None
    for fp in font_paths:
        if Path(fp).exists():
            try:
                font = ImageFont.truetype(str(fp), 48)
                break
            except Exception:
                continue
    if font is None:
        font = ImageFont.load_default()

    draw = ImageDraw.Draw(base)

    # Категория (мелкий текст сверху)
    cat_text = category_name.upper()
    cat_font = ImageFont.load_default()
    cat_bbox = draw.textbbox((0, 0), cat_text, font=cat_font)
    cat_w = cat_bbox[2] - cat_bbox[0]
    cat_x = (W - cat_w) / 2
    draw.text((cat_x, 130), cat_text, fill=(200, 200, 220, 200), font=cat_font)

    # Заголовок по центру (перенос на 2 строки)
    title_text = title
    max_title_len = 32
    if len(title_text) > max_title_len:
        mid = title_text.rfind(' ', 0, max_title_len)
        if mid == -1:
            mid = max_title_len
        line1 = title_text[:mid]
        line2 = title_text[mid:].strip()
    else:
        line1 = title_text
        line2 = None

    draw.text((W/2, 280), line1, font=font, fill=(255, 255, 255, 255), anchor='mm')
    if line2:
        draw.text((W/2, 270 + 60), line2, font=font, fill=(255, 255, 255, 255), anchor='mm')

    # Логотип-подпись внизу
    watermark_font = ImageFont.load_default()
    draw.text((W/2, H-90), 'PROFFMUSIC', font=watermark_font, fill=(180, 180, 200, 120), anchor='mm')

    output = io.BytesIO()
    base.convert('RGB').save(output, format='JPEG', quality=90)
    output.seek(0)

    slug_part = slugify(title)[:30]
    return ContentFile(output.read(), name=f'{slug_part}.jpg')


def pick_tags(title: str, category_key: str) -> list:
    """Автоподбор тегов (список кортежей (ru, en)) по названию и категории."""
    result = []
    title_lower = title.lower()

    # Настроение
    for keywords, moods in MOOD_RULES:
        for kw in keywords:
            if kw in title_lower:
                result.extend(moods)
                break

    # Инструменты
    for keywords, instruments in INSTRUMENT_RULES:
        for kw in keywords:
            if kw in title_lower:
                result.extend(instruments)
                break

    # Назначение из категории
    result.extend(USAGE_RULES.get(category_key, []))

    # Всегда
    result.extend(USAGE_ALWAYS)

    return result


class Command(BaseCommand):
    help = 'Загружает музыку из папки ДЛЯ САЙТА: категории, теги, треки, обложки, коллекции'

    def handle(self, *args, **options):
        if not MUSIC_SOURCE.exists():
            self.stderr.write(f'❌ Папка {MUSIC_SOURCE} не найдена!')
            return

        self.stdout.write('🎵 ЗАГРУЗКА МУЗЫКИ ДЛЯ PROFFMUSIC\n')

        # --- 1. Категории ---
        self.stdout.write('\n--- 1. Категории ---')
        categories = {}
        for key, config in CATEGORY_CONFIG.items():
            cat, created = Category.objects.update_or_create(
                slug=slugify(config['name_ru']),
                defaults={'name_ru': config['name_ru'], 'name_en': config['name_en'], 'order': config['order']}
            )
            categories[key] = cat
            self.stdout.write(f"{'✓ Создана' if created else '• Обновлена'}: {config['name_ru']} / {config['name_en']}")

        # --- 2. Теги ---
        self.stdout.write('\n--- 2. Теги ---')
        tag_cache = {}  # (ru, en) -> Tag
        all_tags = set()
        for _, config in CATEGORY_CONFIG.items():
            for pair in USAGE_RULES.get(config['name_ru'], []):
                all_tags.add(pair)

        mood_pairs = []
        instrument_pairs = []
        for keywords, moods in MOOD_RULES:
            mood_pairs.extend(moods)
        for keywords, instruments in INSTRUMENT_RULES:
            instrument_pairs.extend(instruments)

        tags_to_create = []
        for pair in all_tags:
            tags_to_create.append((pair, 'usage'))
        for pair in mood_pairs:
            tags_to_create.append((pair, 'mood'))
        for pair in instrument_pairs:
            tags_to_create.append((pair, 'instrument'))
        for pair in USAGE_ALWAYS:
            tags_to_create.append((pair, 'usage'))

        for pair, tag_type in tags_to_create:
            ru_name, en_name = pair
            tag, _ = Tag.objects.get_or_create(
                slug=slugify(ru_name),
                defaults={'name_ru': ru_name, 'name_en': en_name, 'tag_type': tag_type}
            )
            tag_cache[pair] = tag
            self.stdout.write(f'  ✓ Тег: {ru_name} ({tag_type})')

        self.stdout.write(f'  Всего тегов: {Tag.objects.count()}')

        # --- 3. Треки ---
        self.stdout.write('\n--- 3. Треки ---')
        created_tracks = 0
        all_tracks = []

        for folder_name, config in CATEGORY_CONFIG.items():
            folder = MUSIC_SOURCE / folder_name
            if not folder.exists():
                self.stderr.write(f'  ⚠️ Папка {folder_name} не найдена')
                continue

            category = categories[folder_name]
            wav_files = sorted([f for f in folder.iterdir() if f.suffix.lower() == '.wav'])

            self.stdout.write(f'\n  [{config["name_ru"]}] — {len(wav_files)} треков')

            for wav_path in wav_files:
                raw_name = wav_path.stem

                # Извлекаем приставку из скобок: "Скрипка (быстрая)" -> "Скрипка быстрая"
                paren_match = re.search(r'\(([^)]+)\)', raw_name)
                paren_suffix = paren_match.group(1).strip() if paren_match else ''
                # Нормализация опечаток в исходных именах файлов
                paren_suffix = paren_suffix.replace('бстрая', 'быстрая').replace('бстры', 'быстры')

                # Базовое имя без скобок
                base_title = re.sub(r'\s*\([^)]*\)', '', raw_name).strip()

                # Серийные номера делаем читаемыми
                series = re.search(r'(\d+)$', base_title)
                series_num = int(series.group(1)) if series else None
                clean_title = re.sub(r'\s*\d+$', '', base_title).strip()

                title = clean_title
                if series_num is not None:
                    title = f'{clean_title} {series_num}'
                elif paren_suffix:
                    # Например: "Скрипка (быстрая)" -> "Скрипка быстрая"
                    title = f'{clean_title} {paren_suffix}'

                slug = slugify(f'{title}-{uuid.uuid4().hex[:6]}')

                # Проверка на дубликат по названию в этой категории
                if Track.objects.filter(title_ru=title, category=category).exists():
                    self.stdout.write(f'  • Пропуск (дубликат): {title}')
                    continue

                # --- Теги ---
                picked_tag_names = pick_tags(title, folder_name)
                tags = [tag_cache[pair] for pair in picked_tag_names if pair in tag_cache]

                # --- Описания ---
                category_label = config['name_ru']
                mood_hint_ru = ', '.join(t.name_ru for t in tags if t.tag_type == 'mood') or 'уникальная'
                instrument_hint_ru = ', '.join(t.name_ru for t in tags if t.tag_type == 'instrument') or 'инструментальная'
                mood_hint_en = ', '.join(t.name_en for t in tags if t.tag_type == 'mood') or 'unique'
                instrument_hint_en = ', '.join(t.name_en for t in tags if t.tag_type == 'instrument') or 'instrumental'

                descriptions = {
                    'Атмосферный': 'Погружающая атмосферная композиция с глубоким звуковым пространством. Идеально для фонового сопровождения видео, обзоров и творческих проектов.',
                    'Величественный': 'Масштабная торжественная композиция с мощным оркестровым звучанием. Отличный выбор для эпичных сцен, открытий и пафосных моментов.',
                    'Напористый': 'Энергичный драйвовый трек с плотным рок-звучанием. Заряжает динамикой и подходит для спортивных, экшн- и мотивационных видео.',
                    'Скрипка': 'Эмоциональная струнная композиция с выразительной партией скрипки. Создаёт драматическую атмосферу, идеальна для кино и короткометражек.',
                    'Выход': 'Торжественная композиция для важного момента. Подчеркнёт выход на сцену, награждение или открытие мероприятия.',
                    'Задорный': 'Живая энергичная композиция с позитивным настроением. Идеальна для корпоративов, вечеринок и праздничных мероприятий.',
                    'Звезда': 'Яркая сценическая композиция в стиле поп-звезды. Создаёт атмосферу шоу и больших концертов.',
                    'Фанфары': 'Классические фанфары с медными духовыми. Торжественный акцент для открытия, награждения и официальных событий.',
                    'Звёздный сон': 'Космическая медитативная композиция, уносящая в мир грёз. Идеальна для ночных плейлистов и глубокой релаксации.',
                    'Релаксация': 'Мягкая расслабляющая музыка для снятия стресса и восстановления. Подходит для спа, йоги и медитации.',
                    'Светлый путь': 'Светлая вдохновляющая композиция с обнадёживающим настроением. Хороша для мотивационных и духовных практик.',
                    'Утренний туман': 'Нежная воздушная композиция, похожая на рассвет в тумане. Идеальна для канала о природе и медитаций.',
                    'Эхо весны': 'Лирическая весенняя композиция с тёплым настроением и надеждой на обновление.',
                    'Афро': 'Зажигательные афро-ритмы с перкуссией. Летнее настроение для рекламы, путешествий и lifestyle-контента.',
                    'Фон бизнес': 'Сдержанная деловая композиция для презентаций, стартап-видео и корпоративной рекламы.',
                    'Фон подвижный': 'Динамичный подвижный фон для энергичных промо-роликов и соцсетей.',
                    'Фон пульс': 'Технологичный трек с пульсирующим битом. Современный звук для технологических и IT-проектов.',
                }

                description_short_ru = None
                for key, text in descriptions.items():
                    if key.lower() in title.lower():
                        description_short_ru = text
                        break
                if not description_short_ru:
                    description_short_ru = f'Готовая музыкальная композиция «{title}» для категории «{category_label}». Создаст нужное настроение в вашем проекте.'
                description_short_en = (
                    f'A ready-made music composition “{title}” for the “{config["name_en"]}” category. '
                    f'It will create the right mood for your project.'
                )

                description_full_ru = (
                    f'Композиция «{title}» — {mood_hint_ru} музыка с ярким характером. '
                    f'Инструментальный состав: {instrument_hint_ru}. '
                    f'Композиция подойдёт для: {", ".join(t.name_ru for t in tags if t.tag_type == "usage")}. '
                    f'Создана профессиональными музыкантами для коммерческого использования. '
                    f'Полная лицензия без Content ID — используйте в своих проектах, монетизируйте и не беспокойтесь о блокировках.'
                )
                description_full_en = (
                    f'The composition “{title}” — {mood_hint_en} music with a bright character. '
                    f'Instrumentation: {instrument_hint_en}. '
                    f'The composition is suitable for: {", ".join(t.name_en for t in tags if t.tag_type == "usage")}. '
                    f'Created by professional musicians for commercial use. '
                    f'Full license without Content ID — use in your projects, monetize and do not worry about blocks.'
                )

                # --- Создание трека ---
                track = Track(
                    title_ru=title,
                    title_en=title,
                    slug=slug,
                    category=category,
                    price=config['price'],
                    description_short_ru=description_short_ru,
                    description_short_en=description_short_en,
                    description_full_ru=description_full_ru,
                    description_full_en=description_full_en,
                    is_new=len(all_tracks) < 10,
                    auto_generate_preview=True,
                    preview_start_time=20,
                    preview_duration=30,
                )

                # Обложка
                track.cover_image = generate_cover(title, category_label)

                # Полный файл (WAV)
                with open(wav_path, 'rb') as f:
                    track.audio_file_full.save(wav_path.name, ContentFile(f.read()), save=True)

                track.tags.set(tags)
                track.save()

                all_tracks.append(track)
                created_tracks += 1
                self.stdout.write(f'  ✓ {title} ({config["price"]} ₽) — {len(tags)} тегов')

        self.stdout.write(f'\n  Итого создано треков: {created_tracks}')

        # --- 4. Коллекции ---
        self.stdout.write('\n--- 4. Коллекции ---')
        collection_config = [
            ('Youtube', 'Для YouTube', 'For YouTube', 'Лучшие треки для YouTube-каналов, влогов и обзоров. Без Content ID, можно монетизировать.', 'Best tracks for YouTube channels, vlogs and reviews. No Content ID, monetizable.'),
            ('Кино', 'Для кино', 'For Cinema', 'Эмоциональные кинематографичные композиции для фильмов, трейлеров и короткометражек.', 'Emotional cinematic compositions for films, trailers and short films.'),
            ('Корпоратив', 'Корпоративная музыка', 'Corporate Music', 'Торжественные и деловые композиции для корпоративов, презентаций и официальных событий.', 'Solemn and business compositions for corporate events, presentations and official occasions.'),
            ('Медитация', 'Медитации и релакс', 'Meditation & Relax', 'Спокойная медитативная музыка для релакса, йоги, сна и духовных практик.', 'Calm meditative music for relaxation, yoga, sleep and spiritual practices.'),
            ('Реклама и промо', 'Реклама и промо', 'Advertising & Promo', 'Энергичные и деловые треки для рекламных роликов, промо и соцсетей.', 'Energetic and business tracks for advertising videos, promos and social media.'),
        ]

        for folder_key, title_ru, title_en, desc_ru, desc_en in collection_config:
            category = categories.get(folder_key)
            if not category:
                self.stdout.write(f'  ⚠️ Категория {folder_key} не найдена, пропуск: {title_ru}')
                continue
            tracks = Track.objects.filter(category=category)
            if not tracks.exists():
                continue

            total_price = sum(t.price for t in tracks)
            col, created = Collection.objects.update_or_create(
                slug=slugify(f'{title_ru}-{uuid.uuid4().hex[:4]}'),
                defaults={
                    'title_ru': title_ru,
                    'title_en': title_en,
                    'description_ru': desc_ru,
                    'description_en': desc_en,
                    'price': total_price,
                    'is_new': True,
                }
            )
            col.tracks.set(tracks)
            # Обложка коллекции
            col.cover_image = generate_cover(title_ru, 'Сборник')
            col.save()
            self.stdout.write(f"{'✓ Создан' if created else '• Обновлён'}: {title_ru} — {tracks.count()} треков, {total_price} ₽")

        self.stdout.write(self.style.SUCCESS('\n✅ ГОТОВО! Музыка успешно загружена!'))