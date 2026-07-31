import Link from 'next/link';
import { FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen w-full px-2 md:px-0">
      <div className="mx-auto max-w-4xl min-h-screen bg-secondary border-x border-white/5 shadow-2xl pt-32 pb-20 px-6 md:px-16">
        
        <div className="text-center mb-14">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
            <FileText size={32} className="text-gray-300" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
            Условия использования
          </h1>
          <p className="text-gray-400">Последнее обновление: 31 июля 2026 года</p>
        </div>

        <div className="space-y-10 text-gray-300 leading-relaxed">
          
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Принятие условий</h2>
            <p>
              Используя сайт <span className="text-white font-medium">proffmusic.shop</span> (далее — «Сайт»), 
              вы подтверждаете, что ознакомились с настоящими Условиями использования (далее — «Условия») 
              и соглашаетесь с ними. Если вы не согласны с Условиями, пожалуйста, прекратите использование Сайта.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Предмет соглашения</h2>
            <p>
              Сайт предоставляет доступ к каталогу музыкальных композиций и их демо-версий для прослушивания, 
              а также возможность приобретения лицензий на использование композиций в ваших проектах.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Лицензия на музыку</h2>
            <p>
              Приобретая композицию на Сайте, вы получаете неисключительную коммерческую лицензию на её использование. 
              Подробности лицензирования описаны на странице <Link href="/license" className="text-green-400 hover:text-green-300 transition-colors">Лицензия</Link>.
            </p>
            <p className="mt-4"><strong className="text-white">Запрещается:</strong></p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Перепродавать, передавать или распространять приобретённые композиции третьим лицам в исходном или изменённом виде;</li>
              <li>Размещать композиции на файлообменниках, торрент-трекерах или иных открытых ресурсах;</li>
              <li>Использовать композиции таким образом, который подразумевает их отдельную реализацию.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Регистрация и аккаунт</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Вы несёте ответственность за сохранность данных вашего аккаунта;</li>
              <li>Вы обязуетесь предоставлять достоверные данные при регистрации;</li>
              <li>Вы имеете право на один аккаунт. Создание множественных аккаунтов может привести к блокировке.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Оплата и доставка</h2>
            <p>
              Оплата производится в рублях. После успешной оплаты вы получаете ссылку на скачивание файлов 
              на указанный адрес электронной почты. Ссылка действительна в течение 48 часов и позволяет 
              скачать файлы до 3 раз.
            </p>
            <p className="mt-4">
              В настоящее время Сайт работает в тестовом режиме оплаты — реальные денежные средства не списываются.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Интеллектуальная собственность</h2>
            <p>
              Все музыкальные композиции, представленные на Сайте, являются интеллектуальной собственностью 
              их авторов и правообладателей. Дизайн Сайта, его структура, тексты и графика также защищены 
              законодательством об интеллектуальной собственности.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Ответственность</h2>
            <p>
              Сайт предоставляется «как есть». Администрация не гарантирует бесперебойную работу Сайта, 
              однако прилагает все усилия для обеспечения его стабильности и доступности.
            </p>
            <p className="mt-4">
              Администрация не несёт ответственности за убытки, возникшие в результате неправомерных действий 
              пользователей, перебоев в работе сети Интернет или действий третьих лиц.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Изменение Условий</h2>
            <p>
              Мы можем обновлять настоящие Условия в любое время. Актуальная версия всегда доступна на этой странице. 
              Продолжение использования Сайта после изменений означает ваше согласие с обновлёнными Условиями.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Контакты</h2>
            <p>
              По всем вопросам, связанным с Условиями использования, обращайтесь: 
              <a href="mailto:shop@proffmusic.shop" className="text-green-400 hover:text-green-300 transition-colors ml-1">shop@proffmusic.shop</a>
            </p>
          </section>

          <section className="border-t border-white/10 pt-8">
            <div className="flex gap-6 text-sm">
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Политика конфиденциальности</Link>
              <Link href="/refund" className="text-gray-400 hover:text-white transition-colors">Политика возврата</Link>
              <Link href="/license" className="text-gray-400 hover:text-white transition-colors">Лицензия</Link>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
