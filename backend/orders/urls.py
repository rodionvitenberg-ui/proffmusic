from django.urls import path
from .views import download_file_by_token, checkout, lemonsqueezy_webhook, btcpay_webhook

urlpatterns = [
    path('download/<uuid:token>/', download_file_by_token, name='download-token'),
    path('checkout/', checkout, name='checkout'),
    path('webhooks/lemonsqueezy/', lemonsqueezy_webhook, name='lemonsqueezy-webhook'),
    path('webhooks/btcpay/', btcpay_webhook, name='btcpay-webhook'),
]
