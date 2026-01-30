from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from orders.models import Order
from orders.serializers import OrderSerializer # Сейчас создадим его
from .models import User
from .serializers import UserSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    # Только текущий юзер может видеть/менять себя
    def get_queryset(self):
        return User.objects.filter(id=self.request.user.id)

    @action(detail=False, methods=['GET'])
    def orders(self, request):
        """История покупок текущего пользователя"""
        orders = Order.objects.filter(user=request.user, status='paid').order_by('-created_at')
        # Нам нужен простой сериализатор для списка заказов
        serializer = OrderHistorySerializer(orders, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['POST'], parser_classes=[MultiPartParser, FormParser])
    def upload_avatar(self, request):
        """Загрузка аватарки"""
        user = request.user
        file = request.data.get('avatar')
        if file:
            user.avatar = file
            user.save()
            return Response(UserSerializer(user).data)
        return Response({"error": "Файл не предоставлен"}, status=400)

# --- Вспомогательный сериализатор для истории (прямо тут или вынеси в orders/serializers.py) ---
from rest_framework import serializers

class OrderItemHistorySerializer(serializers.Serializer):
    title = serializers.SerializerMethodField()
    price = serializers.DecimalField(max_digits=10, decimal_places=2)
    
    def get_title(self, obj):
        return obj.track.title if obj.track else (obj.collection.title if obj.collection else "Unknown")

class OrderHistorySerializer(serializers.ModelSerializer):
    items_display = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = ('id', 'amount', 'created_at', 'items_display')

    def get_items_display(self, obj):
        # Возвращаем упрощенный список названий товаров
        return [
            (item.track.title if item.track else item.collection.title)
            for item in obj.items.all()
        ]