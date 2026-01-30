from djoser.serializers import UserCreateSerializer as BaseUserCreateSerializer
from djoser.serializers import UserSerializer as BaseUserSerializer
from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserCreateSerializer(BaseUserCreateSerializer):
    class Meta(BaseUserCreateSerializer.Meta):
        model = User
        # Убираем 'username' из списка полей, которые мы ждем от фронтенда
        fields = ('id', 'email', 'password', 'first_name', 'last_name')

    def validate(self, attrs):
        if 'email' in attrs:
            attrs['username'] = attrs['email']
        return super().validate(attrs)

class UserSerializer(BaseUserSerializer):
    """Сериализатор для профиля (GET /auth/users/me/)"""
    avatar = serializers.ImageField(read_only=True)
    
    class Meta(BaseUserSerializer.Meta):
        model = User
        fields = ('id', 'email', 'username', 'first_name', 'last_name', 'avatar')