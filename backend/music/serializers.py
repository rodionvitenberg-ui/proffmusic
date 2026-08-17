from rest_framework import serializers

from .models import Track, Category, Tag, Collection
from .tools import localized


class CategorySerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']

    def get_name(self, obj):
        return localized(obj.name_ru, obj.name_en)


class TagSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug', 'tag_type']

    def get_name(self, obj):
        return localized(obj.name_ru, obj.name_en)


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
            'purchases_count',
            'cover_image',
            'audio_file_preview',
            'category',
            'tags',
            'description_short',
            'description_full',
            'is_new',
            'is_popular',
            'duration',
        ]

    def get_title(self, obj):
        return localized(obj.title_ru, obj.title_en)

    def get_description_short(self, obj):
        return localized(obj.description_short_ru, obj.description_short_en)

    def get_description_full(self, obj):
        return localized(obj.description_full_ru, obj.description_full_en)

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
        return localized(obj.title_ru, obj.title_en)

    def get_description(self, obj):
        return localized(obj.description_ru, obj.description_en)
