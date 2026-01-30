from django.contrib import admin
from .models import Category, Tag, Track, Collection
from django.utils.html import format_html

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'order')
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ('name', 'tag_type', 'slug')
    list_filter = ('tag_type',)
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name',)

@admin.register(Track)
class TrackAdmin(admin.ModelAdmin):
    # Поля, которые видны в списке
    list_display = ('title', 'category', 'price', 'is_new', 'created_at', 'play_audio')
    
    # Фильтры справа (очень удобно для управления каталогом)
    list_filter = ('is_new', 'category', 'tags__tag_type')
    
    # Поиск
    search_fields = ('title', 'description_full')
    
    # Автозаполнение слага
    prepopulated_fields = {'slug': ('title',)}
    
    # Удобный выбор тегов (горизонтальный фильтр)
    filter_horizontal = ('tags',)

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
    list_display = ('title', 'price', 'is_new', 'get_tracks_count', 'created_at')
    list_filter = ('is_new',)
    search_fields = ('title',)
    prepopulated_fields = {'slug': ('title',)}
    
    # ВОТ ЭТО - магия для удобного выбора треков
    filter_horizontal = ('tracks',) 

    def get_tracks_count(self, obj):
        return obj.tracks.count()
    get_tracks_count.short_description = 'Кол-во треков'
    
    