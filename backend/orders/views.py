import os
import zipfile
import io
import json
from django.http import HttpResponse, Http404, HttpResponseForbidden, FileResponse
from django.shortcuts import get_object_or_404
from django.conf import settings
from .models import DownloadToken, Order
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .services import create_payment, send_order_email

@api_view(['POST'])
def checkout(request):
    """
    Создание заказа и получение ссылки на оплату.
    """
    try:
        # Получаем IP пользователя (для ЮКассы)
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        ip = x_forwarded_for.split(',')[0] if x_forwarded_for else request.META.get('REMOTE_ADDR')
        
        # Передаем данные в сервис (валидация и создание там)
        # Примечание: предполагается, что create_payment сама разбирает request.data
        # Но судя по прошлому коду, create_payment принимает order object.
        # Поэтому здесь нам нужен сериалайзер.
        
        from .serializers import OrderSerializer
        from .models import OrderItem
        from music.models import Track, Collection
        
        data = request.data
        email = data.get('email')
        items_data = data.get('items', []) # [{type: 'track', id: 1}, ...]
        
        if not items_data:
            return Response({"error": "Корзина пуста"}, status=400)

        # 1. Создаем заказ
        order = Order.objects.create(
            email=email,
            user=request.user if request.user.is_authenticated else None,
            amount=0, # Посчитаем ниже
            status='pending'
        )

        total_amount = 0

        # 2. Создаем позиции заказа
        for item in items_data:
            item_type = item.get('type')
            item_id = item.get('id')
            
            if item_type == 'track':
                product = get_object_or_404(Track, id=item_id)
                price = product.price
                OrderItem.objects.create(order=order, track=product, price=price)
            elif item_type == 'collection':
                product = get_object_or_404(Collection, id=item_id)
                price = product.price
                OrderItem.objects.create(order=order, collection=product, price=price)
            else:
                continue
                
            total_amount += price

        order.amount = total_amount
        order.save()

        # 3. Генерируем ссылку на оплату
        payment_url = create_payment(order, ip)
        
        return Response({
            "order_id": order.id,
            "payment_url": payment_url
        })

    except Exception as e:
        print(f"Checkout Error: {e}")
        return Response({"error": "Ошибка при создании заказа"}, status=500)


@api_view(['POST'])
@permission_classes([AllowAny])
def yookassa_webhook(request):
    """
    Принимает уведомления от ЮКассы.
    """
    try:
        event_json = json.loads(request.body)
    except json.JSONDecodeError:
        return Response(status=400)
    
    # Логируем (в продакшене используй logger)
    print("WEBHOOK RECEIVED:", event_json)

    try:
        if event_json.get('event') == 'payment.succeeded':
            payment_object = event_json['object']
            metadata = payment_object.get('metadata', {})
            order_id = metadata.get('order_id')
            
            if order_id:
                try:
                    order = Order.objects.get(id=order_id)
                    # Идемпотентность
                    if order.status != 'paid':
                        order.status = 'paid'
                        order.save()
                        # Отправляем письмо
                        send_order_email(order)
                except Order.DoesNotExist:
                    pass
                    
        return Response(status=200)
    except Exception as e:
        print(f"Webhook Error: {e}")
        return Response(status=500)


def download_file_by_token(request, token):
    """
    Скачивание файлов по токену из письма.
    """
    download_link = get_object_or_404(DownloadToken, token=token)
    
    # Проверка валидности (срок действия + лимит)
    if not download_link.is_valid:
        return HttpResponseForbidden("Срок действия ссылки истек или лимит скачиваний исчерпан.")

    order = download_link.order
    items = order.items.all()
    
    # СЦЕНАРИЙ 1: Один трек (отдаем файл напрямую)
    if items.count() == 1 and items[0].track:
        track = items[0].track
        if not track.audio_file_full:
            raise Http404("Файл трека не найден на сервере.")
        
        file_path = track.audio_file_full.path
        if not os.path.exists(file_path):
             raise Http404("Файл физически отсутствует.")

        # Увеличиваем счетчик
        download_link.usage_count += 1
        download_link.save()
        
        # Имя файла для скачивания (транслит slug)
        filename = f"{track.slug}.{file_path.split('.')[-1]}"
        
        # ОПТИМИЗАЦИЯ: FileResponse вместо open().read()
        response = FileResponse(open(file_path, 'rb'), as_attachment=True, filename=filename)
        return response

    # СЦЕНАРИЙ 2: Несколько товаров или Сборник (генерируем ZIP)
    zip_buffer = io.BytesIO()
    has_files = False

    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        for item in items:
            # Если это ТРЕК
            if item.track and item.track.audio_file_full:
                fpath = item.track.audio_file_full.path
                if os.path.exists(fpath):
                    fname = f"{item.track.slug}.{fpath.split('.')[-1]}"
                    zip_file.write(fpath, arcname=fname)
                    has_files = True
            
            # Если это СБОРНИК (достаем все треки внутри)
            elif item.collection:
                collection_slug = item.collection.slug
                for track in item.collection.tracks.all():
                    if track.audio_file_full:
                        fpath = track.audio_file_full.path
                        if os.path.exists(fpath):
                            fname = f"{track.slug}.{fpath.split('.')[-1]}"
                            # Кладем в папку с именем сборника внутри архива
                            zip_file.write(fpath, arcname=f"{collection_slug}/{fname}")
                            has_files = True

    if not has_files:
        raise Http404("Файлы для скачивания не найдены.")

    zip_buffer.seek(0)

    # ВАЖНО: Увеличиваем счетчик и для ZIP тоже!
    download_link.usage_count += 1
    download_link.save()

    filename = f"proffmusic_order_{str(order.id)[:8]}.zip"
    response = HttpResponse(zip_buffer, content_type='application/zip')
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    
    return response