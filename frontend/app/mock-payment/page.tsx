'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { Button } from '@/components/ui/Button';
import { Loader2, CreditCard, AlertTriangle } from 'lucide-react';
import api from '@/lib/api'; // Твой настроенный axios

// Обертка Suspense обязательна для useSearchParams в Next.js App Router
export default function MockPaymentPage() {
  return (
    <Suspense fallback={<div className="text-white text-center pt-20">Загрузка терминала...</div>}>
      <MockPaymentContent />
    </Suspense>
  );
}

function MockPaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const orderId = searchParams.get('order_id');
  const amount = searchParams.get('amount');
  
  const [loading, setLoading] = useState(false);

  const handleSuccessPayment = async () => {
    setLoading(true);
    try {
      // ИМИТАЦИЯ ВЕБХУКА ОТ ЮКАССЫ
      // Мы отправляем ровно тот JSON, который шлет реальная ЮКасса при успехе
      const mockWebhookData = {
        event: "payment.succeeded",
        object: {
          id: "mock_payment_" + Math.random().toString(36).substr(2, 9),
          status: "succeeded",
          amount: {
            value: amount,
            currency: "RUB"
          },
          metadata: {
            order_id: orderId // Самое важное: передаем ID заказа обратно
          },
          paid: true
        }
      };

      // Шлем запрос на наш же бэкенд
      await api.post('/api/orders/webhook/', mockWebhookData);

      // Если все ок — редирект на страницу успеха
      router.push('/success');

    } catch (error) {
      console.error("Ошибка имитации платежа:", error);
      alert("Ошибка связи с сервером");
    } finally {
      setLoading(false);
    }
  };

  if (!orderId) return <div className="text-white text-center pt-20">Ошибка: Нет номера заказа</div>;

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl overflow-hidden">
        
        {/* Шапка "Банка" */}
        <div className="bg-gray-100 p-6 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="text-yellow-600" size={20} />
            <span className="text-xs font-bold text-yellow-600 uppercase tracking-wider">Тестовый режим</span>
          </div>
          <h1 className="text-xl font-bold text-gray-800">Эмулятор Платежного Шлюза</h1>
          <p className="text-sm text-gray-500">ProffMusic Dev Environment</p>
        </div>

        {/* Тело */}
        <div className="p-8 space-y-6">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-1">Сумма к списанию</p>
            <p className="text-4xl font-extrabold text-gray-900">{amount} ₽</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Заказ №:</span>
              <span className="font-mono font-medium text-gray-900">{orderId.slice(0, 8)}...</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Получатель:</span>
              <span className="font-medium text-gray-900">ProffMusic LLC</span>
            </div>
          </div>

          <Button 
            onClick={handleSuccessPayment}
            className="w-full h-14 text-lg bg-green-600 hover:bg-green-700 text-white"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin" /> Обработка...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CreditCard /> Успешная оплата (Simulate)
              </span>
            )}
          </Button>
          
          <button 
             onClick={() => router.push('/')}
             className="w-full text-center text-sm text-gray-400 hover:text-gray-600 mt-4"
          >
             Отменить и вернуться в магазин
          </button>
        </div>
      </div>
    </div>
  );
}