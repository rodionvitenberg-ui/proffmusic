from django.contrib import admin
from .models import Category, Tag, Track, Collection
from django.utils.html import format_html

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'name_ru', 'name_en', 'slug', 'order')
    prepopulated_fields = {'slug': ('name_ru',)}

@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ('name', 'name_ru', 'name_en', 'tag_type', 'slug')
    list_filter = ('tag_type',)
    prepopulated_fields = {'slug': ('name_ru',)}
    search_fields = ('name_ru', 'name_en')

@admin.register(Track)
class TrackAdmin(admin.ModelAdmin):
    # Поля, которые видны в списке
    list_display = ('title', 'category', 'price', 'is_new', 'created_at', 'play_audio')

    # Фильтры справа (очень удобно для управления каталогом)
    list_filter = ('is_new', 'category', 'tags__tag_type')

    # Поиск
    search_fields = ('title_ru', 'title_en', 'description_full_ru', 'description_full_en')

    # Автозаполнение слага
    prepopulated_fields = {'slug': ('title_ru',)}

    # Удобный выбор тегов (горизонтальный фильтр)
    filter_horizontal = ('tags',)

    fieldsets = (
        ("Названия", {
            "fields": ("title_ru", "title_en", "slug", "category", "tags", "is_new")
        }),
        ("Цена и описание", {
            "fields": ("price", "description_short_ru", "description_short_en", "description_full_ru", "description_full_en", "cover_image")
        }),
        ("Аудио файлы", {
            "fields": ("audio_file_full", "audio_file_preview", "duration")
        }),
        ("⚡️ Авто-генерация превью", {
            "fields": ("auto_generate_preview", "preview_start_time", "preview_duration"),
            "classes": ("collapse",),  # Можно свернуть, если не нужно
            "description": "Загрузите полный трек выше, поставьте галочку 'Сгенерировать' и нажмите Сохранить."
        }),
    )

    def play_audio(self, obj):
        if obj.audio_file_preview:
            return format_html(
                '<audio controls style="height: 30px; width: 200px;">'
                '<source src="{}" type="audio/mpeg">'
                '</audio>',
                obj.audio_file_preview.url
            )
        return "-"
    play_audio.short_description = "Превью"

@admin.register(Collection)
class CollectionAdmin(admin.ModelAdmin):
    list_display = ('title', 'title_ru', 'title_en', 'price', 'is_new', 'get_tracks_count', 'created_at')
    list_filter = ('is_new',)
    search_fields = ('title_ru', 'title_en')
    prepopulated_fields = {'slug': ('title_ru',)}

    # ВОТ ЭТО - магия для удобного выбора треков
    filter_horizontal = ('tracks',)

    fieldsets = (
        ("Названия", {
            "fields": ("title_ru", "title_en", "slug", "cover_image", "is_new")
        }),
        ("Описание", {
            "fields": ("description_ru", "description_en", "price", "tracks")
        }),
    )

    def get_tracks_count(self, obj):
        return obj.tracks.count()
    get_tracks_count.short_description = 'Кол-во треков'