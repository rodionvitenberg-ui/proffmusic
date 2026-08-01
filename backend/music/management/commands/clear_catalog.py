from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from music.models import Category, Tag, Track, Collection


class Command(BaseCommand):
    help = (
        'Удаляет ВСЕ данные каталога (категории, теги, треки, сборники), '
        'не снося таблицы и не трогая файлы в media/.'
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--yes',
            action='store_true',
            help='Подтвердить удаление без интерактивного запроса',
        )

    def handle(self, *args, **options):
        counts = {
            'категорий': Category.objects.count(),
            'тегов': Tag.objects.count(),
            'треков': Track.objects.count(),
            'сборников': Collection.objects.count(),
        }

        if not any(counts.values()):
            self.stdout.write(self.style.WARNING('Каталог уже пуст — удалять нечего.'))
            return

        self.stdout.write('Будет удалено:')
        for label, count in counts.items():
            self.stdout.write(f'  • {label}: {count}')

        if not options['yes']:
            confirm = input(
                '\nУдалить все записи каталога? Файлы в media/ не будут затронуты. [y/N]: '
            )
            if confirm.strip().lower() not in ('y', 'yes', 'д', 'да'):
                raise CommandError('Операция отменена пользователем.')

        with transaction.atomic():
            # Порядок важен: сначала сборники (снимаем M2M с треками),
            # затем треки, теги и категории.
            deleted_collections, _ = Collection.objects.all().delete()
            deleted_tracks, _ = Track.objects.all().delete()
            deleted_tags, _ = Tag.objects.all().delete()
            deleted_categories, _ = Category.objects.all().delete()

        self.stdout.write(self.style.SUCCESS(
            '\n✅ ГОТОВО! Каталог очищен:\n'
            f'  • Категории: {deleted_categories}\n'
            f'  • Теги: {deleted_tags}\n'
            f'  • Треки: {deleted_tracks}\n'
            f'  • Сборники: {deleted_collections}\n'
            '\nФайлы в media/ не затронуты. Таблицы сохранены.'
        ))