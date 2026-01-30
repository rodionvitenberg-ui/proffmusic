import os
import zipfile
import io
import json
from django.http import HttpResponse, Http404, HttpResponseForbidden
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.conf import settings
from .models import DownloadToken, Order, OrderItem
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .services import create_payment, send_order_email
from music.models import Track, Collection

def download_file_by_token(request, token):
    download_link = get_object_or_404(DownloadToken, token=token)
    
    if not download_link.is_valid:
        return HttpResponseForbidden("Срок действия ссылки истек или лимит скачиваний исчерпан.")

    order = download_link.order
    items = order.items.all()
    
    # Сценарий 1: В заказе всего один трек. Отдаем файл без архивации.
    if items.count() == 1 and items[0].track:
        track = items[0].track
        if not track.audio_file_full:
            raise Http404("Файл трека не найден.")
        
        # Увеличиваем счетчик и отдаем файл
        download_link.usage_count += 1
        download_link.save()
        
        file_path = track.audio_file_full.path
        filename = f"{track.slug}.{file_path.split('.')[-1]}"
        
        with open(file_path, 'rb') as f:
            response = HttpResponse(f.read(), content_type='audio/mpeg')
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response

    # Сценарий 2: В заказе много товаров или Сборник. Генерируем ZIP.
    # Создаем буфер в памяти
    zip_buffer = io.BytesIO()
    
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        for item in items:
            # Если это ТРЕК
            if item.track and item.track.audio_file_full:
                path = item.track.audio_file_full.path
                if os.path.exists(path):
                    # Кладем в корень архива: "TrackTitle.wav"
                    fname = f"{item.track.slug}.{path.split('.')[-1]}"
                    zip_file.write(path, arcname=fname)
            
            # Если это СБОРНИК
            elif item.collection:
                # Для сборника создаем папку внутри ZIP: "CollectionName/Track.wav"
                folder_name = item.collection.slug
                for col_track in item.collection.tracks.all():
                    if col_track.audio_file_full:
                        c_path = col_track.audio_file_full.path
                        if os.path.exists(c_path):
                            fname = f"{folder_name}/{col_track.slug}.{c_path.split('.')[-1]}"
                            zip_file.write(c_path, arcname=fname)

    # Финализируем
    zip_buffer.seek(0)
    download_link.usage_count += 1
    download_link.save()

    filename = f"order_{str(order.id)[:8]}.zip"
    response = HttpResponse(zip_buffer, content_type='application/zip')
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    
    return response

@api_view(['POST'])
@permission_classes([AllowAny])
def checkout_view(request):
    """
    Создание заказа и инициализация оплаты.
    Ожидает JSON: {
        "email": "user@example.com",
        "items": [
            {"type": "track", "id": 1},
            {"type": "collection", "id": 5}
        ]
    }
    """
    data = request.data
    email = data.get('email')
    items_data = data.get('items', [])

    if not email or not items_data:
        return Response({"error": "Email и товары обязательны"}, status=400)

    # 1. Создаем заказ
    order = Order.objects.create(email=email, user=request.user if request.user.is_authenticated else None)
    
    total_amount = 0

    # 2. Наполняем товарами
    for item in items_data:
        if item['type'] == 'track':
            product = get_object_or_404(Track, id=item['id'])
            price = product.price
            OrderItem.objects.create(order=order, track=product, price=price)
        elif item['type'] == 'collection':
            product = get_object_or_404(Collection, id=item['id'])
            price = product.price
            OrderItem.objects.create(order=order, collection=product, price=price)
        
        total_amount += price

    order.amount = total_amount
    order.save()

    # 3. Генерируем ссылку на оплату через ЮКассу
    try:
        # Получаем IP юзера (нужен иногда для фрод-мониторинга)
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        ip = x_forwarded_for.split(',')[0] if x_forwarded_for else request.META.get('REMOTE_ADDR')
        
        payment_url = create_payment(order, ip)
        
        return Response({
            "order_id": order.id,
            "payment_url": payment_url
        })
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(['POST'])
@permission_classes([AllowAny])
def yookassa_webhook(request):
    """
    Принимает уведомления от ЮКассы.
    """
    event_json = json.loads(request.body)
    
    # Логируем для отладки (в продакшене используй logging)
    print("WEBHOOK RECEIVED:", event_json)

    try:
        # Проверяем тип события
        if event_json['event'] == 'payment.succeeded':
            payment_object = event_json['object']
            metadata = payment_object.get('metadata', {})
            order_id = metadata.get('order_id')
            
            if order_id:
                order = Order.objects.get(id=order_id)
                
                # Идемпотентность: если уже оплачен, не дублируем письмо
                if order.status != 'paid':
                    order.status = 'paid'
                    order.save()
                    
                    # Отправляем письмо с ссылкой
                    send_order_email(order)
                    
        return Response(status=200) # ЮКасса ждет 200 OK
    except Exception as e:
        print(f"Webhook Error: {e}")
        return Response(status=500)