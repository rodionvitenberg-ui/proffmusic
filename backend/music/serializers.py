from rest_framework import serializers
from .models import Track, Category, Tag, Collection

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug', 'tag_type']

class TrackSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    
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
            'is_new'
        ]

    def get_audio_file_preview(self, obj):
        request = self.context.get('request')
        if obj.audio_file_preview:
            return request.build_absolute_uri(obj.audio_file_preview.url)
        return None
    
class CollectionSerializer(serializers.ModelSerializer):
    tracks = TrackSerializer(many=True, read_only=True)

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
            'tracks'
        ]