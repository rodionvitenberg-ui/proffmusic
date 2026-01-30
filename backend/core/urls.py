from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from users.views import UserViewSet

user_router = DefaultRouter()
user_router.register(r'users', UserViewSet, basename='users')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('music.urls')),
    path('api/orders/', include('orders.urls')),
    path('api/auth/', include('djoser.urls')),      # /api/auth/users/
    path('api/auth/', include('djoser.urls.jwt')),  # /api/auth/jwt/create/
    
    # Наши доп. ручки (профиль, история)
    path('api/', include(user_router.urls)),
]

# Раздача медиа-файлов на локалке (для обложек и превью)
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)