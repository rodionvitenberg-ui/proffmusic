import os
import zipfile
import io
import json
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse, Http404, HttpResponseForbidden, FileResponse
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated

from .models import DownloadToken, Order, OrderItem
from music.models import Track, Collection
from .services import create_payment, send_order_email

@api_view(['POST'])
# Разрешаем создавать заказ кому угодно (даже анонимам), но если юзер есть - он привяжется
@permission_classes([AllowAny]) 
def checkout(request):
    """
    Создание заказа и получение ссылки на оплату.
    """
    try:
        # Получаем IP (важно для ЮКассы)
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        ip = x_forwarded_for.split(',')[0] if x_forwarded_for else request.META.get('REMOTE_ADDR')
        
        data = request.data
        email = data.get('email')
        items_data = data.get('items', []) # [{type: 'track', id: 1}, ...]
        
        if not items_data:
            return Response({"error": "Корзина пуста"}, status=400)
        
        if not email and not request.user.is_authenticated:
             return Response({"error": "Email обязателен для неавторизованных пользователей"}, status=400)

        # 1. Создаем заказ
        # Если email не пришел, но юзер авторизован - берем email юзера
        final_email = email if email else (request.user.email if request.user.is_authenticated else '')

        order = Order.objects.create(
            email=final_email,
            user=request.user if request.user.is_authenticated else None,
            amount=0,
            status='pending'
        )

        total_amount = 0

        # 2. Создаем позиции заказа
        for item in items_data:
            item_type = item.get('type')
            item_id = item.get('id')
            
            # Используем filter().first() вместо get_object_or_404, чтобы не крашить весь заказ из-за одного битого ID
            if item_type == 'track':
                product = Track.objects.filter(id=item_id).first()
                if product:
                    OrderItem.objects.create(order=order, track=product, price=product.price)
                    total_amount += product.price
            
            elif item_type == 'collection':
                product = Collection.objects.filter(id=item_id).first()
                if product:
                    OrderItem.objects.create(order=order, collection=product, price=product.price)
                    total_amount += product.price

        if total_amount == 0:
             order.delete()
             return Response({"error": "Не удалось добавить товары в заказ"}, status=400)

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


# --- ВАЖНО: УБРАЛИ @api_view и @permission_classes ---
@csrf_exempt
def yookassa_webhook(request):
    """
    Принимает уведомления от ЮКассы.
    Работает на чистом Django (HttpResponse), чтобы избежать проблем с DRF-парсерами.
    """
    # Проверяем метод вручную
    if request.method != 'POST':
        return HttpResponse('Method Not Allowed', status=405)

    try:
        # Читаем сырое тело запроса
        body_unicode = request.body.decode('utf-8')
        event_json = json.loads(body_unicode)
    except json.JSONDecodeError:
        return HttpResponse('Invalid JSON', status=400)
    
    # Логирование события (будет видно в docker logs)
    print(f"🔔 WEBHOOK: {event_json.get('event')}")

    try:
        if event_json.get('event') == 'payment.succeeded':
            payment_object = event_json['object']
            # ЮКасса передает metadata внутри object
            metadata = payment_object.get('metadata', {})
            order_id = metadata.get('order_id')
            yookassa_id = payment_object.get('id')
            
            if order_id:
                try:
                    order = Order.objects.get(id=order_id)
                    # Проверка идемпотентности (чтобы не обрабатывать дважды)
                    if order.status != 'paid':
                        order.status = 'paid'
                        order.yookassa_payment_id = yookassa_id
                        order.save()
                        print(f"✅ ЗАКАЗ {order_id} ОПЛАЧЕН. Отправляем письмо...")
                        
                        try:
                            send_order_email(order)
                        except Exception as mail_error:
                            print(f"❌ Ошибка отправки письма: {mail_error}")
                            
                    else:
                        print(f"ℹ️ Заказ {order_id} уже был оплачен ранее.")
                        
                except Order.DoesNotExist:
                    print(f"❌ Заказ {order_id} не найден в базе.")
            else:
                print("⚠️ В уведомлении нет order_id metadata")
                    
        return HttpResponse('OK', status=200)
        
    except Exception as e:
        print(f"❌ Webhook Global Error: {e}")
        return HttpResponse('Internal Server Error', status=500)


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
    if items.count() == 1 and items[0].track and not items[0].collection:
        track = items[0].track
        
        # Проверка на наличие файла
        if not track.audio_file_full:
            raise Http404("Файл трека не загружен на сервер.")
            
        file_path = track.audio_file_full.path
        if not os.path.exists(file_path):
             raise Http404("Файл физически отсутствует на диске.")

        # Увеличиваем счетчик
        download_link.usage_count += 1
        download_link.save()
        
        # Имя файла для скачивания (транслит slug + оригинальное расширение)
        ext = os.path.splitext(file_path)[1]
        filename = f"{track.slug}{ext}"
        
        return FileResponse(open(file_path, 'rb'), as_attachment=True, filename=filename)

    # СЦЕНАРИЙ 2: Несколько товаров или Сборник (генерируем ZIP)
    zip_buffer = io.BytesIO()
    has_files = False

    try:
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            for item in items:
                # Если это ТРЕК
                if item.track and item.track.audio_file_full:
                    fpath = item.track.audio_file_full.path
                    if os.path.exists(fpath):
                        ext = os.path.splitext(fpath)[1]
                        fname = f"{item.track.slug}{ext}"
                        zip_file.write(fpath, arcname=fname)
                        has_files = True
                
                # Если это СБОРНИК (достаем все треки внутри)
                elif item.collection:
                    collection_slug = item.collection.slug
                    # Если у сборника есть треки (m2m связь)
                    tracks = item.collection.tracks.all()
                    
                    for track in tracks:
                        if track.audio_file_full:
                            fpath = track.audio_file_full.path
                            if os.path.exists(fpath):
                                ext = os.path.splitext(fpath)[1]
                                fname = f"{track.slug}{ext}"
                                # Кладем в папку с именем сборника
                                zip_file.write(fpath, arcname=f"{collection_slug}/{fname}")
                                has_files = True
    except Exception as e:
        print(f"Zip Error: {e}")
        return HttpResponse("Ошибка при создании архива", status=500)

    if not has_files:
        raise Http404("Файлы для скачивания не найдены (возможно, они не загружены в админку).")

    zip_buffer.seek(0)

    # Увеличиваем счетчик
    download_link.usage_count += 1
    download_link.save()

    filename = f"proffmusic_order_{str(order.id)[:8]}.zip"
    response = HttpResponse(zip_buffer, content_type='application/zip')
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    
    return response