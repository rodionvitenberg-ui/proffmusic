from rest_framework import serializers
from .models import Order

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