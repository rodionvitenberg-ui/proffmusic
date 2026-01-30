import uuid
from django.core.management.base import BaseCommand
from music.models import Category, Tag, Collection
from pytils.translit import slugify

class Command(BaseCommand):
    help = 'Заполняет базу данных категориями, тегами и тестовыми сборниками из ТЗ'

    def handle(self, *args, **options):
        # 1. Категории 
        categories = [
            "Для YouTube",
            "Реклама и промо",
            "Корпоратив",
            "Подкасты",
            "Стартапы",
            "Кино",
            "Медитации",
        ]

        self.stdout.write("--- 1. Создаем категории ---")
        for index, cat_name in enumerate(categories):
            slug = slugify(cat_name)
            Category.objects.update_or_create(
                slug=slug,
                defaults={'name': cat_name, 'order': index}
            )
            self.stdout.write(f"✓ {cat_name}")

        # 2. Теги 
        tags_data = {
            'usage': [
                "youtube", "реклама", "подкаст", "презентация", 
                "монетизация", "без content id", "корпоратив", 
                "стартап", "кино", "медитация"
            ],
            'instrument': [
                "скрипка", "фортепиано", "дарбука", "струнные", 
                "percussion", "ethnic", "minimal piano", "ambient strings"
            ],
            'mood': [
                "вдохновляющий", "спокойный", "динамичный", "эмоциональный", 
                "технологичный", "человечный", "без ai", "вживую"
            ]
        }

        self.stdout.write("\n--- 2. Создаем теги ---")
        for tag_type, names in tags_data.items():
            for name in names:
                slug = slugify(name)
                Tag.objects.update_or_create(
                    slug=slug,
                    defaults={'name': name, 'tag_type': tag_type}
                )
            self.stdout.write(f"✓ Теги типа {tag_type} загружены")

        # 3. Сборники (Новое!) 
        # Создадим пару пустых сборников, чтобы проверить модель
        collections = [
            ("Best Corporate Music 2024", 2500.00),
            ("Cinematic Trailers Pack", 5000.00),
            ("YouTube Starter Kit", 1500.00),
        ]

        self.stdout.write("\n--- 3. Создаем тестовые сборники ---")
        for title, price in collections:
            # Генерируем слаг с хэшем, как в модели
            base_slug = slugify(title)
            # В скрипте просто проверим, есть ли такой, по title, чтобы не плодить дубли
            # Но для уникальности слага при создании добавим suffix, если создаем с нуля
            
            if not Collection.objects.filter(title=title).exists():
                unique_suffix = uuid.uuid4().hex[:6]
                slug = f"{base_slug}-{unique_suffix}"
                
                Collection.objects.create(
                    title=title,
                    slug=slug,
                    price=price,
                    description=f"Тестовый сборник: {title}. Отличный выбор для ваших проектов.",
                    is_new=True
                )
                self.stdout.write(f"✓ Создан сборник: {title}")
            else:
                self.stdout.write(f"- Сборник уже есть: {title}")

        self.stdout.write(self.style.SUCCESS('\nУСПЕШНО: Данные (Категории, Теги, Сборники) обновлены!'))