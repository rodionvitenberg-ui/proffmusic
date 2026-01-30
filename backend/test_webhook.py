import requests
import json
import sys

# Настройки
WEBHOOK_URL = "http://127.0.0.1:8000/api/orders/webhook/"

def simulate_payment(order_id):
    print(f"🚀 Эмулируем оплату для заказа: {order_id}")
    
    # Структура JSON, которую реально шлет ЮКасса
    payload = {
        "type": "notification",
        "event": "payment.succeeded",
        "object": {
            "id": "22d6d597-000f-5000-9000-1c6c59c55a30", # Фейковый ID платежа
            "status": "succeeded",
            "paid": True,
            "amount": {
                "value": "500.00",
                "currency": "RUB"
            },
            "description": f"Заказ №{order_id}",
            "metadata": {
                "order_id": order_id  # <--- Самое важное: наш ID заказа
            },
            "payment_method": {
                "type": "bank_card",
                "id": "22d6d597-000f-5000-9000-1c6c59c55a30",
                "saved": False,
                "title": "Bank card *4444"
            }
        }
    }

    try:
        response = requests.post(WEBHOOK_URL, json=payload)
        
        print(f"📡 Статус ответа сервера: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ УСПЕХ! Сервер принял оплату.")
            print("Теперь проверь консоль Django — там должно появиться 'письмо'.")
        else:
            print("❌ ОШИБКА! Сервер вернул что-то не то.")
            print("Ответ сервера:", response.text)
            
    except Exception as e:
        print(f"💀 Не удалось соединиться с сервером: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Использование: python test_webhook.py <UUID_ЗАКАЗА>")
        print("Пример: python test_webhook.py a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11")
    else:
        simulate_payment(sys.argv[1])