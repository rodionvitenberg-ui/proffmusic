from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Track, Category, Tag, Collection
from .serializers import TrackSerializer, CategorySerializer, TagSerializer, CollectionSerializer
from .filters import TrackFilter
import os
import zipfile
import io
from django.http import HttpResponse, Http404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAdminUser
from django.shortcuts import get_object_or_404

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    pagination_class = None

class TagViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    pagination_class = None
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['tag_type']

class TrackViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Каталог треков с фильтрацией.
    """
    queryset = Track.objects.all()
    serializer_class = TrackSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category__slug', 'tags__slug', 'is_new']
    search_fields = ['title', 'description_full']
    ordering_fields = ['price', 'created_at']
    lookup_field = 'slug'

class CollectionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API для сборников.
    """
    queryset = Collection.objects.all().prefetch_related('tracks')
    serializer_class = CollectionSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    filterset_fields = ['is_new']
    search_fields = ['title', 'description']
    ordering_fields = ['price', 'created_at']
    lookup_field = 'slug'

@api_view(['GET'])
@permission_classes([IsAdminUser])
def download_collection_zip(request, slug):
    """
    Генерирует ZIP-архив со всеми треками сборника на лету.
    """
    collection = get_object_or_404(Collection, slug=slug)
    tracks = collection.tracks.all()

    if not tracks.exists():
        raise Http404("В этом сборнике нет треков.")

    zip_buffer = io.BytesIO()

    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        for track in tracks:
            if track.audio_file_full:
                file_path = track.audio_file_full.path
                if os.path.exists(file_path):
                    filename = f"{track.slug}.{file_path.split('.')[-1]}"
                    zip_file.write(file_path, arcname=filename)

    zip_buffer.seek(0)

    filename = f"{collection.slug}.zip"
    response = HttpResponse(zip_buffer, content_type='application/zip')
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    
    return response

class TrackViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Каталог треков с фильтрацией.
    """
    queryset = Track.objects.all().distinct()
    serializer_class = TrackSerializer
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    filterset_class = TrackFilter 
    
    search_fields = ['title', 'description_full']
    ordering_fields = ['price', 'created_at']
    lookup_field = 'slug'