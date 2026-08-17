from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from django.utils.translation import gettext as _
from .models import Track, Category, Tag, Collection
from .serializers import TrackSerializer, CategorySerializer, TagSerializer, CollectionSerializer
from .filters import TrackFilter
from django.http import HttpResponse, Http404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAdminUser
from django.shortcuts import get_object_or_404
from orders.zip_utils import build_order_zip
from orders.models import OrderItem

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
    queryset = Track.objects.all().distinct()
    serializer_class = TrackSerializer
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    filterset_class = TrackFilter 
    
    search_fields = ['title_ru', 'title_en', 'description_full_ru', 'description_full_en']
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
    search_fields = ['title_ru', 'title_en', 'description_ru', 'description_en']
    ordering_fields = ['price', 'created_at']
    lookup_field = 'slug'

@api_view(['GET'])
@permission_classes([IsAdminUser])
def download_collection_zip(request, slug):
    """
    Генерирует ZIP-архив со всеми треками сборника на лету.
    """
    collection = get_object_or_404(Collection, slug=slug)

    if not collection.tracks.exists():
        raise Http404(_("В этом сборнике нет треков."))

    # Переиспользуем общий хелпер: коллекция описывается как один коллекционный item
    item = OrderItem(track=None, collection=collection)
    zip_buffer = build_order_zip([item])

    if zip_buffer is None:
        raise Http404(_("Файлы для скачивания не найдены."))

    filename = f"{collection.slug}.zip"
    response = HttpResponse(zip_buffer, content_type='application/zip')
    response['Content-Disposition'] = f'attachment; filename="{filename}"'

    return response

