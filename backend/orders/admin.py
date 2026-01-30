from django.contrib import admin
from .models import Order, OrderItem, DownloadToken

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    raw_id_fields = ('track', 'collection')
    extra = 0

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'email', 'status', 'amount', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('email', 'id')
    inlines = [OrderItemInline]
    readonly_fields = ('created_at',)

@admin.register(DownloadToken)
class DownloadTokenAdmin(admin.ModelAdmin):
    list_display = ('token', 'order', 'usage_count', 'max_usages', 'is_valid')
    readonly_fields = ('token', 'usage_count')