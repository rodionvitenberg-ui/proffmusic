from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TrackViewSet, CategoryViewSet, TagViewSet, CollectionViewSet, download_collection_zip

router = DefaultRouter()
router.register(r'tracks', TrackViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'tags', TagViewSet)
router.register(r'collections', CollectionViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('collections/<slug:slug>/download/', download_collection_zip, name='collection-download'),
]