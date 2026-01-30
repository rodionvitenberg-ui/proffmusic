from rest_framework import serializers
from .models import Order, OrderItem
from music.serializers import TrackSerializer, CollectionSerializer

class OrderItemSerializer(serializers.ModelSerializer):
    """
    Сериализатор для одной позиции в заказе.
    Показывает либо трек, либо сборник.
    """
    # Вложенные сериализаторы, чтобы видеть детали трека (название, картинку)
    track = TrackSerializer(read_only=True)
    collection = CollectionSerializer(read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'track', 'collection', 'price']

class OrderSerializer(serializers.ModelSerializer):
    """
    Полный сериализатор заказа с вложенными товарами.
    """
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 
            'email', 
            'status', 
            'amount', 
            'created_at', 
            'items'
        ]
        read_only_fields = ['id', 'status', 'created_at', 'amount']

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