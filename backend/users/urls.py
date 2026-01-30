from django.contrib import admin
from django.urls import path, include
from users.views import UserViewSet
from rest_framework.routers import DefaultRouter

# Роутер для наших кастомных ручек (история, аватар)
user_router = DefaultRouter()
user_router.register(r'users', UserViewSet, basename='users')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/music/', include('music.urls')),
    path('api/orders/', include('orders.urls')),
    
    # Djoser (Регистрация, Логин, Смена пароля)
    path('api/auth/', include('djoser.urls')),
    path('api/auth/', include('djoser.urls.jwt')),
    
    # Наши доп. ручки (users/orders, users/upload_avatar)
    path('api/', include(user_router.urls)),
]