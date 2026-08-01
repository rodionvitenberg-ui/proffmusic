from rest_framework import serializers
from django.utils.translation import get_language
from .models import Track, Category, Tag, Collection


def _pick_localized(ru_value, en_value):
    """Возвращает значение по активному языку."""
    lang = get_language() or 'ru'
    if lang == 'en' and en_value:
        return en_value
    return ru_value


class CategorySerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']

    def get_name(self, obj):
        return _pick_localized(obj.name_ru, obj.name_en) or obj.name_ru


class TagSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug', 'tag_type']

    def get_name(self, obj):
        return _pick_localized(obj.name_ru, obj.name_en) or obj.name_ru


class TrackSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)

    title = serializers.SerializerMethodField()
    description_short = serializers.SerializerMethodField()
    description_full = serializers.SerializerMethodField()
    audio_file_preview = serializers.SerializerMethodField()

    class Meta:
        model = Track
        fields = [
            'id',
            'title',
            'slug',
            'price',
            'cover_image',
            'audio_file_preview',
            'category',
            'tags',
            'description_short',
            'description_full',
            'is_new',
            'duration',
        ]

    def get_title(self, obj):
        return _pick_localized(obj.title_ru, obj.title_en) or obj.title_ru

    def get_description_short(self, obj):
        return _pick_localized(obj.description_short_ru, obj.description_short_en) or obj.description_short_ru

    def get_description_full(self, obj):
        return _pick_localized(obj.description_full_ru, obj.description_full_en) or obj.description_full_ru

    def get_audio_file_preview(self, obj):
        request = self.context.get('request')
        if obj.audio_file_preview:
            return request.build_absolute_uri(obj.audio_file_preview.url)
        return None


class CollectionSerializer(serializers.ModelSerializer):
    tracks = TrackSerializer(many=True, read_only=True)

    title = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()

    class Meta:
        model = Collection
        fields = [
            'id',
            'title',
            'slug',
            'cover_image',
            'description',
            'price',
            'is_new',
            'tracks',
        ]

    def get_title(self, obj):
        return _pick_localized(obj.title_ru, obj.title_en) or obj.title_ru

    def get_description(self, obj):
        return _pick_localized(obj.description_ru, obj.description_en) or obj.description_ru