# ROADMAP: Великий Редизайн ProffMusic

> Исполнительский документ. Каждая фаза — набор конкретных шагов с файлами.
> Отмечай `[x]` по мере выполнения. Работаем слева направо, без прыжков.

Легенда по средам:
- `backend/` — Django + DRF
- `web/` — Nuxt 3 + Vue 3 (фронтенд)
- `docs/` — документы
- Контекст персонажа: бутик Коцарта Хайпроффлекса (коротко — Профф), композитора. Все тексты — музыкально-возвышенные, никакой канцеляритины.

---

## ФАЗА 0 — Фундамент (выполнена)

- [x] Создан `docs/ROADMAP.md` (этот файл)
- [x] Создан `docs/audit.md` — реестр косяков
- [x] Запись в `WORK.md` о начале большой сессии

## ФАЗА 1 — Бэкенд: счётчик покупок (выполнена)

Цель: на карточке трека показывать, сколько раз трек куплен.

### 1.1 Модель
Файл: `backend/music/models.py`, класс `Track`.
- Добавить поле: `purchases_count = models.PositiveIntegerField("Куплено раз", default=0)`
- Создать миграцию: `cd backend && python manage.py makemigrations music`

### 1.2 Инкремент при оплате
Файл: `backend/orders/services.py`, функция `fulfill(order)`.
- Внутри функции, после `order.status = 'paid'` и `order.save(...)`, добавить проход по `order.items`:

```python
from django.db.models import F
from .models import DownloadToken, OrderItem  # OrderItem уже импортирован неявно

# внутри fulfill, после order.save(update_fields=['status'])
for item in order.items.all():
    if item.track_id:
        Track.objects.filter(id=item.track_id).update(purchases_count=F('purchases_count') + 1)
```

- Импорт `Track` из `music.models` в `orders/services.py`.

### 1.3 API
Файл: `backend/music/serializers.py`, `TrackSerializer.Meta.fields`.
- Добавить `'purchases_count'` в список полей.

### 1.4 Админка
Файл: `backend/music/admin.py`, `TrackAdmin`.
- В `list_display` добавить `purchases_count`.
- В fieldsets: поле `purchases_count` — readonly, добавить в секцию «Цена и описание» через `readonly_fields` на уровне админки (не в fieldsets, чтобы нельзя было редактировать):
```python
readonly_fields = ('purchases_count',)
```

### 1.5 TypeScript
Файл: `web/app/types/catalog.ts`, тип `Track`.
- Добавить `purchases_count?: number`.

### 1.6 Отображение на карточке
Файлы: `web/app/components/catalog/TrackCard.vue`.
- Под ценой/рядом с ценой вывести счётчик, например: `{{ track.purchases_count ?? 0 }} {{ t('track.purchases', ...) }}`.
- Добавить ключ i18n: `ru: "приобрёл(и) ценитель(и)"`, `en: "collectors acquired"` — вариант: `Куплено раз: N`.
- Страница трека `web/app/pages/tracks/[slug].vue` — тоже показать счётчик (опционально).

---

## ФАЗА 2 — Язык и тексты (музыкально-возвышенные) (выполнена)

Цель: убрать всю «канцеляритину», «Смотреть музыку», «О нас», «Библиотека».

### 2.1 Файлы локалей
- [x] `web/i18n/locales/ru.json`
- [x] `web/i18n/locales/en.json`

Требования:
- [x] **Убрать** `nav.exploreMusic: "Смотреть музыку"` → заменить на `"Смотреть каталог"` / `"Explore the Catalog"`.
- [x] **Убрать** `home.fanTitle: "Музыка"` → секция превращается в «О создателе» (см. Фазу 3).
- [x] Выровнять структуру ru/en (одинаковый порядок и набор ключей).
- [x] Новые ключи для: счётчика покупок (уже был — сохранён), статей (`journal.*`), правил/GDPR (`legal.*`), кнопки «Связаться с создателем» (`home.fanCta`, `static.contactsTitle`).
- [x] Тон: возвышенный. Пример: `"Новинки: свежие вдохновения мастера"`, `"Избранное ценителей"`.

### 2.2 Статические страницы
- [x] `web/app/pages/about.vue` → «О создателе», развёрнутый текст о Проффе (см. Фазу 3).
- [x] `web/app/pages/license.vue` → полные условия лицензии (музыкально-возвышенно, но юридически внятно).
- [x] `web/app/pages/contacts.vue` → «Связаться с создателем», email + призыв заказать мелодию.

---

## ФАЗА 3 — Главная: секция Хайпроффлекса + кнопки (выполнена)

Цель: секция МУЗЫКА становится очерком о держателе бутика.

### 3.1 Перестройка `TheMusicFan.vue`
Файл: `web/app/components/home/TheMusicFan.vue` + стили из `vm.css` (класс `.the-music`).
- [x] Заголовок секции — не «МУЗЫКА», а «Создатель» / "The Creator" (`home.fanTitle`).
- [x] Под заголовком — 3 абзаца о Коцарте Хайпроффлексе (коротко — Профф): кто такой, зачем и кому нужны его мелодии, что редкие как метеорит, что будоражат тело и укрепляют дух.
- [x] Абзац о том, что к нему можно обратиться лично и заказать мелодию.
- [x] Две кнопки рядом:
  1. **«СМОТРЕТЬ КАТАЛОГ»** → `localePath('/music')`
  2. **«СВЯЗАТЬСЯ С СОЗДАТЕЛЕМ»** → `localePath('/contacts')`
- [x] Подложка секции: собственная, **rgba(15,15,15,0.5)** (50% прозрачности), чтобы просвечивал вейл. Сейчас `.the-music { background: #0f0f0f }` — сделана полупрозрачной.
- [x] Новые ключи i18n `home.fanParas` (ru/en).

### 3.2 CTA в Hero
Файл: `web/app/components/home/SiteHero.vue`.
- [x] Текст кнопки промо (`nav.exploreMusic`) автоматически поменяется через i18n (Фаза 2). Проверено: хардкода нет — используется `t('nav.exploreMusic')`.

---

## ФАЗА 4 — Вейл: фиолетовый фон всей главной (выполнена)

Цель: переливающийся фиолет вейл как единственный фон главной.

### 4.1 Палитра шейдера
Файл: `web/app/components/home/DarkVeil.client.vue`.
- [x] База шейдера — фиолетовая: `vec3(0.06, 0.03, 0.10)`, мажорные тона `vec3(0.35, 0.18, 0.55)` / `vec3(0.55, 0.25, 0.72)`.
- [x] Перелив: в `mainImage` плавно меняется `uHueShift`: `uHueShift + 20.0 * sin(uTime*0.05)`.
- [x] CSS-фолбэк `.site-hero__veil` в `SiteHero.vue` — радиальные градиенты фиолетовые, база `#0a0512`, `hueShift` выставлен в `0`.

### 4.2 Вейл = фон всей главной
- [x] `web/app/pages/index.vue`: контент обёрнут в слой `.home-page`.
- [x] Вейл (CSS + WebGL) фиксирован на уровне окна (`position: fixed`) — остаётся фоном при скролле.
- [x] `web/app/assets/css/overrides.css`:
  - [x] `body.is-homepage main.pm-main { background: transparent }` — убран непрозрачный `#0f0f0f`.
  - [x] `.home-page { position: relative; z-index: 2 }` — контент выше канваса.
  - [x] `.home-page .home-rail { background: rgba(15,15,15,0.55) }` — секции полупрозрачны.
  - [x] `.home-page .site-hero { background: transparent }` — убран непрозрачный фон hero из vm.css.
- [x] Канвас и CSS-вейлы — `pointer-events: none`, контент выше по z-index.

### 4.3 Производительность
- [x] Сохранено: пониженное разрешение, адаптивное качество, пауза при скрытии вкладки.
- [x] `npm run build` проходит без ошибок.

---

## ФАЗА 5 — Статьи: журнал о музыке (5 статей)

Цель: 5 страниц-статей о возвышенных свойствах музыки.

### 5.1 Структура
- Создать `web/app/pages/journal/index.vue` — список статей (заголовки + лиды + ссылки).
- Создать `web/app/pages/journal/[slug].vue` — страница статьи (динамическая по slug).

### 5.2 Контент (заимствован и адаптирован, стиль — возвышенный)
Темы (по 1 статье):
1. Почему мелодии будоражат тело: физиология звука.
2. Музыка и дух: как звук укрепляет дух.
3. Тишина как материал: паузы между нотами.
4. Редкость как ценность: почему метеоритные треки бесценны.
5. Как заказать мелодию у мастера: путь от замысла к звуку.

Каждая: заголовок, лид, 3-5 абзацев, подпись «Коцарт Хайпроффлекс».

### 5.3 Навигация
- `SiteHeader.vue`: добавить пункт меню «Журнал» / "Journal" → `/journal`.
- `web/i18n`: ключи `nav.journal`, `journal.title`, `journal.readMore`, заголовки статей, лиды (можно в отдельных ключах `journal.articles`).

---

## ФАЗА 6 — Базовые страницы: правила, GDPR, политика (выполнена)

Цель: легальные страницы, ссылки в футере.

### 6.1 Страницы
- [x] `web/app/pages/rules.vue` — правила пользования сайтом.
- [x] `web/app/pages/privacy.vue` — политика конфиденциальности.
- [x] `web/app/pages/gdpr.vue` — права субъектов данных (GDPR).
- [x] `web/app/pages/terms.vue` — условия продажи цифровых товаров / лицензии.

Двуязычные через i18n. Тон — деловой, но без сухости.

### 6.2 Футер
- [x] `web/app/components/SiteFooter.vue`: в `.site-footer__legal` добавить ссылки: Правила · Конфиденциальность · GDPR · Условия.

---

## ФАЗА 7 — Аудит фронтенда: исправление косяков (выполнена)

Полный реестр — в `docs/audit.md`. Здесь — приоритетные:

### 7.1 Вложенные ссылки/кнопки (валидность HTML)
- [x] `web/app/components/catalog/TrackCard.vue`: сейчас `<article class="cat-card"><NuxtLink class="cat-card">` + внутри кнопки. Перестроить: ссылка — на обложку (отдельный NuxtLink) + название, кнопки play/cart — **вне** ссылки. Сетка карточки — флекс/grid.
- [x] `web/app/pages/collections/index.vue`: та же структура — починить аналогично.

### 7.2 API-клиент
- [x] `web/app/composables/useApi.ts`: `list()` глотает ошибки → добавить опцию `throwOnError` или проброс; на страницах `tracks/[slug].vue` и `collections/[slug].vue` — не использовать `config.public.apiUrl` напрямую, а ходить через `useApi()` (в проде `apiUrl` пустой — сломано).

### 7.3 Пагинация
- [x] `web/app/pages/music.vue`: `hasMore.value = chunk.length >= 12` — хрупко. DRF возвращает `{count, next, previous, results}`. Использовать `next` из ответа: `hasMore = Boolean(data.next)`.

### 7.4 A11y
- [x] `cat-card__play` невидим до hover — на тач-устройствах проблема. Добавить `:focus-within` видимость (уже есть в части стилей — проверить).
- [x] Кнопки в карточках — `aria-label` (текст из i18n — ок).

### 7.5 Стили
- [x] Убрать дублирование класса `cat-card` на двух элементах — оставить один.
- [x] Проверить контраст фиолетового вейла с белым текстом.

---

## ФАЗА 8 — Полировка, сборка, проверка

- [ ] `cd backend && python manage.py check && python manage.py migrate`
- [ ] `cd web && npm run build`
- [ ] Проверить `/ru` и `/en` на всех новых страницах
- [ ] Проверить адаптив главной (вейл на мобильных)
- [ ] Обновить `README.md`, `DEPLOY.md` новыми страницами
- [ ] Закрыть все пункты `docs/audit.md`

---

## Что НЕ делаем (YAGNI)

- Не трогаем гигантский `vm.css` из донора (кроме точечных переопределений в `overrides.css` / `catalog.css`).
- Не ставим CMS для статей — статические страницы.
- Не трогаем платёжные интеграции (Lemon Squeezy, BTCPay).
- Не переписываем плеер.