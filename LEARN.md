# ProffMusic — как устроен проект (взгляд наставника)

В этом документе я объясняю, как ProffMusic работает «под капотом»: от Django-моделей и схемы оплаты до Nuxt-страниц, Pinia-сторов и процесса выкатки на сервер. Цель — чтобы новый человек (или будущий ты) мог читать код с пониманием, а не переоткрывать каждую деталь заново.

## 1. Что это вообще

ProffMusic — магазин профессиональной музыки: живые инструменты, коммерческая лицензия, «без Content ID». Продаётся два типа товара — **трек** (`Track`) и **сборник** (`Collection`). Покупатель платит картой (Lemon Squeezy) или биткоином (BTCPay), получает на почту секретную ссылку, скачивает файл (или ZIP) ограниченное число раз в течение 48 часов.

Ключевая особенность архитектуры: **полные аудиофайлы недоступны напрямую**. В публичной папке `media/` лежат только обложки и урезанные MP3-превью. Оригиналы лежат в `protected_media/` и отдаются либо из Django-представления (после проверки токена), либо через Nginx `internal`-location.

Второй характерный момент: **витрина писалась дважды**. Сначала на Next.js/React (папка `frontend/` уже удалена), потом её целиком переписали на Nuxt 4 (Vue 3) в папке `web/`. Дизайн «скопирован» с сайта Van Morrison — папка `vanmorrison/` это изолированный донор вёрстки, его в проде нет.

---

## 2. Общая карта репозитория

```
proffmusic/
├── backend/            # Django 6 REST API + админка (Jazzmin)
│   ├── core/           # settings, urls, middleware
│   ├── music/          # домен каталога: Track, Collection, Category, Tag
│   ├── orders/         # заказ, оплата, скачивание, вебхуки
│   ├── users/          # кастомный User (вход по email)
│   └── media_engine/   # генерация превью через ffmpeg (моделей нет)
├── web/                # Nuxt 4 витрина (Vue 3 + Pinia + GSAP + OGL)
├── vanmorrison/        # донор CSS (не прод)
├── nginx/nginx.conf    # server-блок прод-домена
├── protected_media/    # оригиналы треков (не в git)
├── .env.example        # шаблон переменных окружения
└── setup.sh            # деплой-скрипт
```

Есть ещё служебные папки `skills*/`, `docs/superpowers/` — это материалы по процессу (скиллы и дизайн-спеки), к рантайму приложения они отношения не имеют.

---

## 3. Бэкенд: Django 6 + DRF

### 3.1. Смысловая раскладка по приложениям

| Приложение | Роль | Что внутри |
|---|---|---|
| `core` | проект | `settings.py`, `urls.py`, `middleware.py` |
| `music` | каталог | модели, сериализаторы, фильтры, viewsets, admin, management-команды |
| `orders` | продажи | заказ, позиции, токен скачивания, оплата, вебхуки, письма |
| `users` | аккаунты | кастомный `User`, Djoser-сериализаторы, профиль/аватар |
| `media_engine` | ffmpeg | одна функция `generate_preview`, без моделей |

### 3.2. Домен: локализация «в лоб»

Важное решение, которое прошивает весь код: контент двуязычный (RU/EN), но **без сложных i18n-абстракций**. В `music/models.py` для каждого переводимого поля сделано по две колонки с суффиксом `_ru` / `_en`:

```python
title_ru = models.CharField(...)
title_en = models.CharField(...)

@property
def title(self):
    return localized(self.title_ru, self.title_en)
```

`localized()` из `music/tools.py` берёт активный язык из `django.utils.translation.get_language()`: если текущий язык `en` и есть английское значение — возвращает его, иначе русское. Тот же helper используется и моделями, и сериализаторами (дубля нет).

**Почему так, а не django-modeltranslation?** Потому что для каталога в 40 треков две явные колонки проще в админке и в снимке `catalog.json`. Это осознанный YAGNI, а не недоработка. Плата — в `search_fields` и описаниях приходится перечислять обе колонки (`['title_ru', 'title_en', ...]`).

Тонкость: `@property` локализованное поле **не подходит для ORM-запросов**. Фильтровать `Track.objects.filter(title=...)` нельзя — надо `title_ru`/`title_en` напрямую. Именно поэтому `views.py` ищет по обеим колонкам, а не по `title`.

### 3.3. Модели каталога

- **`Category`** — `name_ru`, `name_en`, `slug`, `order`. Категория — это «семейство» треков: YouTube, Кино, Корпоратив, Медитация, Реклама.
- **`Tag`** — `name_ru`, `name_en`, `slug`, `tag_type`. Три типа: `usage` (назначение), `instrument` (инструменты), `mood` (настроение). Это не фасеты-таблицы, а обычные строки с выбором типа — для фильтра «Настроение/Инструменты/Назначение» этого достаточно.
- **`Track`** — основной товар. Обрати внимание на три вещи:
  1. `audio_file_preview` — файл в `MEDIA_ROOT` (публичный, урезанный MP3).
  2. `audio_file_full` — файл в `PROTECTED_MEDIA_ROOT` через отдельный `protected_storage = FileSystemStorage(location=...)`.
  3. Поля авто-нарезки: `auto_generate_preview`, `preview_start_time`, `preview_duration`.
- **`Collection`** — сборник, M2M на `Track`, со своей ценой и обложкой.

### 3.4. Магия в `Track.save()` — автогенерация превью

Самый «хитрый» кусок бэкенда. `Track.save()` не просто сохраняет запись, а делает двухпроходную логику:

1. Генерирует `slug` (транслит + короткий UUID), если его нет.
2. Сохраняет оригинал на диск (`super().save()`).
3. Если стоит галочка `auto_generate_preview` и есть полный файл — вызывает `media_engine.services.generate_preview()`, кладёт результат в `audio_file_preview`, снимает галочку и делает второе сохранение только нужных полей.

```python
if self.auto_generate_preview and self.audio_file_full:
    preview_content = generate_preview(path, start_sec, duration_sec)
    self.audio_file_preview.save(preview_content.name, preview_content, save=False)
    self.auto_generate_preview = False
    need_update = True

if need_update:
    super().save(update_fields=['audio_file_preview', 'auto_generate_preview', 'duration'])
```

**Урок ментора.** Видишь `print(">>> [DEBUG] ...")`? Это не мусор — логи сюда добавлены намеренно, потому что ffmpeg-процесс в фоне «молчит», и без вывода в консоль было невозможно понять, на каком шаге падает. Важно другое: `save(update_fields=[...])` во втором проходе — это сделано намеренно, чтобы не зациклить рекурсию. Если бы вторичный вызов был обычным `save()`, авто-генерация снова запустилась бы.

**Распространённая ловушка.** `Track.save()` переопределён, поэтому любой код, который хочет обновить только обложку, должен **обходить** `save()`. `seed_catalog` делает `field.save(..., save=False)`, а затем `Track.objects.filter(pk=...).update(...)` — именно чтобы не дёргать авто-генерацию превью.

### 3.5. ffmpeg через `media_engine`

В `media_engine/services.py` одна функция `generate_preview(file_path, start_sec, duration_sec, fade_sec)`. Она запускает системный `ffmpeg` через `subprocess.run` и возвращает `ContentFile` с готовым MP3.

Главный урок здесь: **порядок аргументов ffmpeg критичен**. `-ss` и `-t` поставлены **до** `-i`, потому что это «быстрый» seek с обнулением таймстампов. Если поставить `-ss` после `-i`, то фильтры `afade` отсчитывают время от исходного файла, а не от точки обрезки — и превью получается с тишиной в начале. На этом когда-то ловили баг.

Ещё деталь: выход идёт в трубу (`'-'`, `stdout=subprocess.PIPE`), а не во временный файл. Так не нужно убирать за собой темп.

### 3.6. Заказы и покупки (`orders`)

Три модели:

- **`Order`** — заказ. Поля `user` (nullable FK), `email`, `provider`, `provider_payment_id`, `currency`, `status` (`pending`/`paid`/`cancelled`), `amount`.
- **`OrderItem`** — позиция в заказе. Два nullable FK: `track` и `collection`, заполнено ровно одно. Плюс `price` — **цена на момент покупки** (на случай, если цена товара позже изменится).
- **`DownloadToken`** — секретная ссылка. `token` (UUID), `usage_count`, `max_usages` (по умолчанию 3), `expires_at` (по умолчанию 48 часов), плюс nullable `track`/`collection`.

Логика валидности токена — в `@property is_valid`:

```python
return self.usage_count < self.max_usages and now < self.expires_at
```

Это «одна мастер-ссылка на заказ», а не «по ссылке на трек»: `DownloadToken.objects.get_or_create(order=order)` создаёт один токен на весь заказ.

### 3.7. Флоу оплаты — самое важное

Входная точка — `orders.views.checkout` (`POST /api/orders/checkout/`). Дальше всё решает переменная `PAYMENTS_BACKEND` из settings:

- **`mock`** (по умолчанию при `DEBUG=True`) — заказ сразу вызывается `fulfill()`, т.е. мгновенно помечается оплаченным и шлёт письмо. Это только для локальной разработки.
- **`live`** — заказ создаётся со статусом `pending`, а `checkout` в зависимости от `provider` вызывает `create_lemonsqueezy_checkout()` или `create_btcpay_invoice()` и возвращает `payment_url` на внешнюю страницу оплаты.

Дальше платежный провайдер дёргает **вебхук**:

```
POST /api/orders/webhooks/lemonsqueezy/   # событие order_created + status=paid
POST /api/orders/webhooks/btcpay/         # событие InvoiceSettled
```

Каждый вебхук:
1. Проверяет HMAC-SHA256 подпись сырого тела (`X-Signature` у LS hex, `BTCPay-Sig` у BTCPay c префиксом `sha256=`).
2. Достаёт `order_id` из метаданных, находит `Order`.
3. Вызывает `fulfill(order)`.

**`fulfill()` — единственная точка, переводящая заказ в `paid`.** Это ключевой инвариант системы:

```python
def fulfill(order):
    token, _ = DownloadToken.objects.get_or_create(order=order)
    if order.status == 'paid':
        return token
    order.status = 'paid'
    order.save(update_fields=['status'])
    download_url = f"{settings.SITE_URL}/api/orders/download/{token.token}/"
    send_order_email(order, download_url)
    return token
```

Повторный вебхук — это no-op (если заказ уже `paid`, просто отдаём токен). Благодаря этому вебхуки идемпотентны.

### 3.8. Скачивание

`orders/views.py:download_file_by_token` обрабатывает два сценария:

1. **Один трек** — отдаёт файл напрямую через `FileResponse` (потоковая передача).
2. **Несколько позиций или сборник** — собирает всё в ZIP в памяти (`io.BytesIO`), раскладывая треки сборника по подпапке с именем сборника.

Счётчик `usage_count` инкрементируется после успешной сборки. Ссылка с истёкшим сроком или исчерпанным лимитом получает `HttpResponseForbidden`.

### 3.9. Защита файлов: Nginx `internal` vs FileResponse

Важное расхождение между девом и продом:

- **Локально** `core/urls.py` раздаёт `media/` через `static()` (только при `DEBUG=True`).
- **В проде** Nginx раздаёт `media/` и `static/`, а `protected_media/` объявлен как `internal` — напрямую снаружи его получить нельзя, только если Django явно отдаст файл.

Сейчас Django отдаёт защищённые файлы через `FileResponse`/ZIP (проксирует поток сам). Это работает, но для больших файлов правильнее было бы отдавать их через Nginx с заголовком `X-Accel-Redirect` — Django проверяет токен, а сам файл стримит Nginx. Это осознанный следующий шаг, не баг.

### 3.10. Пользователи: вход по email

`users/models.py` переопределяет `AbstractUser`:

```python
USERNAME_FIELD = 'email'
REQUIRED_FIELDS = []
```

и принудительно делает `username = email` в менеджере, потому что колонка `username` осталась в таблице (абстрактный юзер Django её создаёт). Это стандартный приём миграции на email-аутентификацию **без** удаления колонки и без ломки существующих данных.

Ручки регистрации/логина отданы **Djoser** (`/api/auth/`): `users/` — регистрация, `jwt/create/` — логин, `users/me/` — профиль. Кастомные сериализаторы заданы в `settings.DJOSER`:

```python
'user_create': 'users.serializers.UserCreateSerializer',
'current_user': 'users.serializers.UserSerializer',
```

Дополнительные ручки профиля — во `users/views.py` `UserViewSet`:
- `GET /api/users/orders/` — история оплаченных заказов;
- `POST /api/users/upload_avatar/` — загрузка аватарки (multipart).

---

## 4. API-поверхность (сводно)

| Метод/путь | Что делает |
|---|---|
| `GET /api/tracks/` | каталог треков, фильтры/поиск/сортировка |
| `GET /api/tracks/{slug}/` | карточка трека |
| `GET /api/categories/`, `GET /api/tags/` | справочники для фильтров |
| `GET /api/collections/`, `GET /api/collections/{slug}/` | сборники |
| `GET /api/collections/{slug}/download/` | ZIP сборника (только админ) |
| `POST /api/auth/users/` | регистрация |
| `POST /api/auth/jwt/create/` | логин |
| `GET /api/auth/users/me/` | свой профиль |
| `GET /api/users/orders/` | история заказов |
| `POST /api/users/upload_avatar/` | аватар |
| `POST /api/orders/checkout/` | создать заказ + получить ссылку на оплату |
| `GET /api/orders/download/{token}/` | скачать купленное |
| `POST /api/orders/webhooks/lemonsqueezy/` | вебхук LS |
| `POST /api/orders/webhooks/btcpay/` | вебхук BTCPay |

Фильтрация треков (смотри `music/filters.py`): `category__slug` (точное), `tags__slug` (список через запятую, `in`), `is_new`, `is_popular`, `price_min`/`price_max`.

---

## 5. Фронтенд: Nuxt 4 + Vue 3

### 5.1. Почему Nuxt

Nuxt даёт «из коробки» то, что пришлось бы руками делать в Vue-SPA:

- **роутинг** — страницы просто лежат в `web/app/pages/`;
- **server-side rendering** — `useAsyncData` на странице трека ходит в Django ещё до отдачи HTML;
- **i18n с префиксом локали** — `/ru/...` и `/en/...` из одного файла;
- **автоимпорт** — компоненты из `app/components/` и composables не импортируются явно.

### 5.2. Структура `web/app/`

```
app/
├── pages/          # маршруты (index, music, cart, checkout, login, ...)
├── components/     # SiteHeader, SiteFooter, PlayerBar, catalog/, home/
├── stores/         # Pinia: auth, cart, player
├── composables/    # useApi()
├── types/          # интерфейсы каталога
├── utils/          # formatPrice
├── layouts/        # default.vue
└── plugins/        # auth.client.ts, cart.client.ts
```

### 5.3. Три Pinia-стора

- **`auth`** — JWT-токен в `localStorage` (ключ `accessToken`), `login`/`register`/`fetchMe`/`uploadAvatar`. Геттер `isAuthenticated` проверяет наличие токена.
- **`cart`** — массив `CartItem`, персистится в `localStorage` (ключ `pm-cart`). `hydrate()` читает, `persist()` пишет. Корзина живёт только на клиенте.
- **`player`** — текущий трек + плейлист + `playing`. Чистый UI-стор, без сети.

**Ключевая разница Pinia vs React Context.** Стор — это один общий инстанс. Любой компонент вызывает `useCartStore()` и видит те же данные. Нет прокидывания пропсов вниз и нет провайдера.

### 5.4. Идемпотентная гидратация из localStorage

В `cart.ts` и `auth.ts` есть одинаковый паттерн:

```typescript
hydrate() {
  if (!import.meta.client || this.ready) return
  ...
  this.ready = true
}
```

`import.meta.client` — это «мы в браузере?» (а не на сервере во время SSR). Флаг `ready` защищает от двойной инициализации. Плагины `auth.client.ts` и `cart.client.ts` вызывают `hydrate()` один раз при старте клиента, а страницы вроде `cart.vue` вызывают её снова на `onMounted` — повторный вызов становится no-op.

### 5.5. JWT в query-параметрах и SSR-problem

Профиль — единственная страница с `definePageMeta({ ssr: false })`. Причина: Nuxt рендерит на сервере, но JWT-токен лежит в `localStorage` браузера, и сервер его не видит. Если бы профиль рендерился на сервере, он всегда был бы «разлогинен». Поэтому профиль грузится только на клиенте: сначала `auth.hydrate()`, затем `$fetch` с заголовком `Authorization: Bearer ...`.

Это фундаментальное отличие JWT от cookie-сессий: токен надо добавлять вручную к каждому запросу.

### 5.6. `useApi()` и абсолютные URL обложек

`app/composables/useApi.ts` — тонкий хелпер:

```typescript
const base = String(config.public.apiUrl || 'http://127.0.0.1:8000').replace(/\/$/, '')
function coverSrc(url?: string | null) { ... }
```

Бэкенд возвращает `cover_image` и `audio_file_preview` как относительные URL (например, `/media/covers/...jpg`), а превью — как абсолютный URL (в `TrackSerializer.get_audio_file_preview` вызывается `request.build_absolute_uri`). `coverSrc()` нормализует: если URL уже начинается с `http`, оставляет как есть, иначе приклеивает `base`. Без этого при SSR (где `window.location` нет) картинки ломались бы.

### 5.7. Страницы

- **`index.vue`** — главная. Забирает параллельно 4 списка (коллекции, все треки, новинки, популярное) через `Promise.all`, собирает splash, hero, «веер» коллекций и две полки треков.
- **`music.vue`** — каталог с пагинацией «Ещё». Фильтры кладёт в **query-string** (`?category__slug=`, `?tags__slug=`), а не в скрытый стейт — чтобы ссылку можно было скопировать и открыть заново с теми же фильтрами.
- **`tracks/[slug].vue`** и `collections/[slug].vue` — деталки на `useAsyncData` (SSR). Если бэкенд недоступен, возвращается `null` и рисуется «не найдено», страница не падает.
- **`cart.vue` / `checkout.vue` / `login.vue` / `register.vue` / `success.vue` / `profile.vue`** — типовые экраны.
- **`about.vue`, `license.vue`, `contacts.vue`** — статичные страницы, текст из i18n-файлов.

### 5.8. Checkout и смена протокола ответа

В `checkout.vue` есть важная логика:

```typescript
const res = await $fetch(..., { method: 'POST', body: payload, headers: auth.authHeaders() })
if (res.payment_url) {
  window.location.href = res.payment_url
  return
}
await navigateTo(localePath(`/success${res.order_id ? `?order_id=${res.order_id}` : ''}`))
```

Бэкенд в режиме `mock` **не** возвращает `payment_url` — он возвращает сразу `{order_id, payment_url: '/ru/success?order_id=...'}` (локальный путь). В live-режиме возвращается полная внешняя ссылка (`https://api.lemonsqueezy.com/...` или checkout-страница BTCPay). Nuxt-код различает: если пришёл внешний `payment_url` — редиректит на него, иначе — внутренняя навигация на success.

### 5.9. Визуал: GSAP + OGL

- **GSAP** — анимации: шторы на hero, меню-панель, splash. Везде уважается `prefers-reduced-motion` (если включено, анимации пропускаются).
- **OGL** — `DarkVeil.client.vue` рисует WebGL-фон на canvas (шум с сдвигом оттенка). Обрати внимание на суффикс `.client` — это **client-only** компонент, WebGL не может работать на сервере. Внутри — ресайз через `ResizeObserver`, пауза рендера когда canvas вне вьюпорта (`IntersectionObserver`), остановка при `prefers-reduced-motion`.

Файлы шрифтов — в `web/public/fonts/` (Oswald и Inria Serif).

### 5.10. i18n

`nuxt.config.ts` настраивает `@nuxtjs/i18n`:

```typescript
strategy: 'prefix',         // /ru, /en
detectBrowserLanguage: false, // не переключать автоматически
defaultLocale: 'ru',
```

Тексты — в `web/i18n/locales/{ru,en}.json`. Компоненты используют `useI18n()` (`t`, `locale`) и `useLocalePath()`/`useSwitchLocalePath()`.

**Известная ловушка** (зафиксирована в WORK.md): символ `@` в строках vue-i18n распознаётся как «linked message», поэтому писать `shop@mail` в JSON напрямую нельзя — либо `shop{'@'}mail`, либо обходной текст.

---

## 6. Как данные текут сквозь систему

### 6.1. Каталог

```
Админ → загружает WAV + обложку
  └─> Track.save() может сгенерировать MP3-превью (ffmpeg)
        └─> GET /api/tracks/  →  Nuxt `music.vue`  →  CatalogTrackCard
              └─> превью стримится в PlayerBar (native <audio>)
```

### 6.2. Покупка (live)

```
checkout.vue (корзина из Pinia)
  └─> POST /api/orders/checkout/ { email, items, provider }
        └─> Django создаёт Order(status=pending)
              ├─> LS:  create_lemonsqueezy_checkout → POST /v1/checkouts → external URL
              └─> BTC: create_btcpay_invoice        → POST /api/v1/.../invoices → external URL
                    └─> фронт редиректит на payment_url
                          └─> оплата на стороне провайдера
                                └─> вебхук (HMAC-проверка)
                                      └─> fulfill(order)
                                            ├─> Order.status = paid
                                            ├─> DownloadToken создан
                                            └─> письмо со ссылкой на скачивание
                                                  └─> GET /api/orders/download/{token}/
                                                        ├─> один трек → FileResponse
                                                        └─> несколько/сборник → ZIP в памяти
```

---

## 7. Management-команды (повседневные операции)

| Команда | Назначение |
|---|---|
| `python manage.py seed_catalog` | Единственный импортёр каталога. Отыгрывает снимок `music/data/catalog.json` + JPEG из `covers/` и `collection_covers/`. Не рисует постеры и не пишет заводские описания. |
| `python manage.py export_catalog` | Перезаписывает снимок из живой БД (после правки текстов/цен/состава). |
| `python manage.py clear_catalog` | Полная очистка каталога (не трогая файлы в `media/`). Есть флаг `--yes`. Не для деплоя. |
| `python manage.py send_test_email` | Проверка SMTP-настроек (шлёт тестовое письмо). |

### Логика `seed_catalog`

1. Читает `backend/music/data/catalog.json` (27 треков, 5 сборников, категории, теги — с замороженными id и слагами).
2. Upsert по primary key. Слаг из JSON — это URL на сервере.
3. Кладёт квадратные кадры из `music/data/covers/{id}.jpg` и `collection_covers/{id}.jpg` в `MEDIA_ROOT`.
4. Если на диске есть превью (`media/previews/`) и полный файл (`protected_media/tracks/`) — прикрепляет. Если нет — строка всё равно есть, в логе `missing_audio=N`.
5. `auto_generate_preview=False`. Pillow не вызывается.

Тяжёлое аудио вне git. На чистом сервере: `rsync` превью и `protected_media/tracks/`, затем `seed_catalog`. Обложки приезжают с `git pull`.

---

## 8. Инфраструктура и деплой

### 8.1. Три процесса

| Процесс | Технология | Управление | Адрес |
|---|---|---|---|
| Backend | Gunicorn + Django | systemd (`proffmusic-backend`) | `127.0.0.1:8000` |
| Frontend | Nuxt (`.output/server/index.mjs`) | PM2 (`proffmusic-web`) | `127.0.0.1:3000` |
| Статика/прокси | Nginx | systemd | `:80`/`:443` |

### 8.2. Nginx-маршрутизация (`nginx/nginx.conf`)

```
/static/           → backend/staticfiles/   (админка/статика Django)
/media/            → backend/media/          (обложки, превью)
/protected_media/  → protected_media/ (internal — только из Django)
/api/  и /admin/   → 127.0.0.1:8000 (Gunicorn)
/ (всё остальное) → 127.0.0.1:3000 (Nuxt)
```

Файл содержит **только server-блок** (без `events`/`http`), потому что подключается в конфиг многодоменного сервера рядом с другим сайтом.

### 8.3. `setup.sh`

Идемпотентный деплой-скрипт для Ubuntu 24.04. Что делает:

1. Клонирует/обновляет репозиторий в `/var/www/proffmusic`.
2. Создаёт `.env` из шаблона.
3. Создаёт БД/пользователя PostgreSQL, **принудительно синхронизируя пароль** через `ALTER USER` (чтобы не ловить `password authentication failed` при повторных запусках).
4. Ставит venv + зависимости, `npm ci` + `npm run build`.
5. Прогоняет миграции и `collectstatic`.
6. Прописывает systemd-сервис Gunicorn и PM2-процесс Nuxt под `www-data`.
7. Копирует Nginx-блок, проверяет конфиг, перезагружает Nginx.

Пароль БД читается из самого `.env` (grep по `DB_PASSWORD=`), поэтому скрипт просит заполнить его до конца первого запуска.

### 8.4. Переменные окружения

Все настройки — в `.env` (подхватывается `python-dotenv`). Ключевые группы: Django (`SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`), БД, SMTP (Gmail App Password), `SITE_URL`, CORS/CSRF-ориджины, `NUXT_PUBLIC_API_URL`, и платежи (`PAYMENTS_BACKEND`, LS/BTCPay ключи и секреты вебхуков).

Важная деталь: `NUXT_PUBLIC_API_URL` пустой в проде означает «тот же origin» (Nuxt и Django за одним доменом через Nginx). Локально указывают `http://127.0.0.1:8000`.

---

## 9. Болевые точки и замечания ментора (честно)

1. **`Track.save()` с side-effect'ами** — мощно, но коварно. Обновление обложки в обход `save()` — неочевидный паттерн; его надо помнить (иначе случайная повторная генерация превью). Это кандидат на вынос в сигнал или сервис.

2. **README устарел частично** — до сегодняшнего исправления таблица стека описывала Next.js/React/WaveSurfer, хотя фронтенд давно Nuxt. Век живи — проверяй документацию по факту.

3. **`OrderHistorySerializer.items_display`** — нетривиальный `SerializerMethodField`. Мелочь, но если менять формат заказов, не забыть обновить и его, и фронтовый `profile.vue`.

4. **Скачивание файлов идёт через Django** (`FileResponse`/ZIP), а не через `X-Accel-Redirect` Nginx. Для больших WAV это узкое место; правильный следующий шаг — Django проверяет токен и отдаёт Nginx через internal-location, а Nginx уже стримит файл.

5. **Защищённые `protected_media/` в проде отдаются только Django**, но `download_collection_zip` в `music/views.py` доступен админу и собирает ZIP на лету — если файлов станет много, это займёт память и время.

6. ✅ **Локализация вынесена в единый `music.tools.localized()`** (модели и сериализаторы используют один helper). ZIP-сборка тоже унифицирована: `orders/zip_utils.py` (`build_order_zip`) общий для скачивания заказа и админского `download_collection_zip`. `print()`-логи переведены на `logging`, удалены мёртвые `OrderSerializer`/`OrderItemSerializer`/`OrderItemHistorySerializer`, `check_access`, `generate_download_links`, зависимость `mutagen` (0 импортов), пустые скаффолды и видео `hero.mp4`. Планы на `X-Accel-Redirect` и покрытие тестами остаются открытыми шагами.

---

## 10. Полезный маршрут для «въезда» в кодовую базу

Если читать код впервые, порядок такой:

1. `backend/core/settings.py` — как всё сконфигурировано.
2. `backend/music/models.py` — домен каталога (и магия `save()`).
3. `backend/orders/models.py` + `backend/orders/views.py` + `backend/orders/services.py` — флоу продажи.
4. `backend/core/urls.py` — как собраны все API-роуты.
5. `web/nuxt.config.ts` + `web/app/stores/*.ts` — как настроен фронт и его стейт.
6. `web/app/pages/` — сами экраны.
7. `setup.sh` + `nginx/nginx.conf` + `DEPLOY.md` — как всё выкатывается.