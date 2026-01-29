export default function ContactsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center">
      <h1 className="text-3xl font-bold text-white mb-8">Контакты</h1>
      <p className="text-gray-400 mb-8">
        Мы всегда на связи. Если у вас возникли проблемы с оплатой или скачиванием, напишите нам.
      </p>
      <a href="mailto:support@proffmusic.ru" className="text-2xl font-bold text-green-400 hover:text-green-300 transition">
        support@proffmusic.ru
      </a>
      <p className="text-sm text-gray-500 mt-12">
        ИП Иванов И.И. <br/> ОГРНИП 3123456789000
      </p>
    </div>
  );
}