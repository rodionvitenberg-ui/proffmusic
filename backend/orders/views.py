import os
import zipfile
import io
import hashlib
import hmac

import requests
from django.http import HttpResponse, Http404, HttpResponseForbidden, FileResponse
from django.shortcuts import get_object_or_404
from django.utils.translation import gettext as _
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated

from django.conf import settings as django_settings

from .models import DownloadToken, Order, OrderItem
from music.models import Track, Collection
from .services import create_payment, create_lemonsqueezy_checkout, fulfill, send_order_email

ALLOWED_PROVIDERS = {'lemonsqueezy', 'btcpay'}


@api_view(['POST'])
@permission_classes([AllowAny]) 
def checkout(request):
    """
    Создание заказа. Mock backend fulfills immediately; live waits for a webhook.
    """
    try:
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        ip = x_forwarded_for.split(',')[0] if x_forwarded_for else request.META.get('REMOTE_ADDR')
        
        data = request.data
        email = data.get('email')
        items_data = data.get('items', [])
        provider = data.get('provider', 'lemonsqueezy')
        
        if not items_data:
            return Response({"error": _("Корзина пуста")}, status=400)
        
        if not email and not request.user.is_authenticated:
             return Response({"error": _("Email обязателен для неавторизованных пользователей")}, status=400)

        if provider not in ALLOWED_PROVIDERS:
            return Response({"error": _("Unknown payment method")}, status=400)

        final_email = email if email else (request.user.email if request.user.is_authenticated else '')

        order = Order.objects.create(
            email=final_email,
            user=request.user if request.user.is_authenticated else None,
            amount=0,
            status='pending',
            currency='USD',
            provider='mock' if django_settings.PAYMENTS_BACKEND == 'mock' else provider,
        )

        total_amount = 0

        for item in items_data:
            item_type = item.get('type')
            item_id = item.get('id')
            
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
             return Response({"error": _("Не удалось добавить товары в заказ")}, status=400)

        order.amount = total_amount
        order.save()

        if django_settings.PAYMENTS_BACKEND == 'mock':
            success_url = create_payment(order, ip)
            return Response({
                "order_id": order.id,
                "payment_url": success_url
            })

        locale = data.get('locale', 'en')
        if provider == 'lemonsqueezy':
            try:
                payment_url = create_lemonsqueezy_checkout(order, locale)
            except (requests.RequestException, KeyError, ValueError, TypeError):
                return Response({"error": _("Unable to start payment. Try again.")}, status=502)
            return Response({"order_id": order.id, "payment_url": payment_url})

        return Response({"error": _("Unable to start payment. Try again.")}, status=503)

    except Exception as e:
        print(f"Checkout Error: {e}")
        return Response({"error": _("Ошибка при создании заказа")}, status=500)


def download_file_by_token(request, token):
    """
    Скачивание файлов по токену из письма.
    """
    download_link = get_object_or_404(DownloadToken, token=token)
    
    # Проверка валидности (срок действия + лимит)
    if not download_link.is_valid:
        return HttpResponseForbidden(_("Срок действия ссылки истек или лимит скачиваний исчерпан."))

    order = download_link.order
    items = order.items.all()
    
    # СЦЕНАРИЙ 1: Один трек (отдаем файл напрямую)
    if items.count() == 1 and items[0].track and not items[0].collection:
        track = items[0].track
        
        # Проверка на наличие файла
        if not track.audio_file_full:
            raise Http404(_("Файл трека не загружен на сервер."))
            
        file_path = track.audio_file_full.path
        if not os.path.exists(file_path):
             raise Http404(_("Файл физически отсутствует на диске."))

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
        return HttpResponse(_("Ошибка при создании архива"), status=500)

    if not has_files:
        raise Http404(_("Файлы для скачивания не найдены (возможно, они не загружены в админку)."))

    zip_buffer.seek(0)

    # Увеличиваем счетчик
    download_link.usage_count += 1
    download_link.save()

    filename = f"proffmusic_order_{str(order.id)[:8]}.zip"
    response = HttpResponse(zip_buffer, content_type='application/zip')
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    
    return response


def _valid_ls_sig(body: bytes, header: str) -> bool:
    secret = django_settings.LEMONSQUEEZY_WEBHOOK_SECRET
    if not secret or not header:
        return False
    expected = hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, header)


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def lemonsqueezy_webhook(request):
    body = request.body
    if not _valid_ls_sig(body, request.headers.get('X-Signature', '')):
        return Response({'error': 'Invalid signature'}, status=400)
    payload = request.data
    if payload.get('meta', {}).get('event_name') != 'order_created':
        return Response({'ok': True})
    attrs = payload.get('data', {}).get('attributes', {})
    if attrs.get('status') != 'paid':
        return Response({'ok': True})
    order_id = payload.get('meta', {}).get('custom_data', {}).get('order_id')
    order = Order.objects.filter(id=order_id).first()
    if not order:
        return Response({'error': 'Order not found'}, status=404)
    order.provider_payment_id = str(payload.get('data', {}).get('id', ''))
    order.save(update_fields=['provider_payment_id'])
    fulfill(order)
    return Response({'ok': True})