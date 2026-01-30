from django.urls import path
from .views import download_file_by_token, checkout, yookassa_webhook

urlpatterns = [
    path('download/<uuid:token>/', download_file_by_token, name='download-token'),
    path('checkout/', checkout, name='checkout'),
    path('webhook/', yookassa_webhook, name='yookassa-webhook'),
]