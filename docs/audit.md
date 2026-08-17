# Аудит ProffMusic: реестр косяков и недоработок

> Этот файл — живой реестр. Каждый найденный косяк получает статус и ссылку на фазу роадмапа.
> Формат строки: `- [ ] id — описание | файлы | фаза`.

---

## Критические (ломают прод)

- [x] A1 — `NUXT_PUBLIC_API_URL` пустой в проде: `nuxt.config.ts` при `NODE_ENV === 'production'` ставит `apiUrl = ''`, а `web/app/pages/tracks/[slug].vue` и `web/app/pages/collections/[slug].vue` дёргают `$fetch(`${config.public.apiUrl}/api/...`)` напрямую → в проде запросы уходят на тот же хост без `/api`-прокси. | `web/nuxt.config.ts`, `web/app/pages/tracks/[slug].vue`, `web/app/pages/collections/[slug].vue` | Фаза 7
- [x] A2 — `useApi().list()` глотает все ошибки и возвращает `[]`. Сетевой сбой выглядит как «каталог пуст». | `web/app/composables/useApi.ts` | Фаза 7

## HTML-валидность / семантика

- [x] A3 — Вложенные интерактивные элементы в карточках: `<article class="cat-card"><NuxtLink class="cat-card">` содержит `<button>` (play/cart). Кнопка внутри ссылки — невалидный HTML, двойная срабатываемость, проблемы скринридеров. | `web/app/components/catalog/TrackCard.vue`, `web/app/pages/collections/index.vue` | Фаза 7
- [x] A4 — Дублирование класса `cat-card` на `<article>` и `<NuxtLink>` — путаница в стилях и семантике. | те же файлы | Фаза 7
- [x] A5 — `cat-card__play` скрыт до hover (`opacity: 0`) — на тач-устройствах и при клавиатурной навигации кнопка невидима. | `web/app/assets/css/catalog.css` | Фаза 7

## Пагинация / API

- [x] A6 — `hasMore.value = chunk.length >= 12` — хрупкая эвристика. DRF отдаёт `{count, next, previous, results}`; надо `hasMore = Boolean(data.next)`. | `web/app/pages/music.vue`, `web/app/composables/useApi.ts` | Фаза 7
- [x] A7 — `useApi().list()` не возвращает `count`/`next` — нужно для честной пагинации. Расширить `list<T>` до `{ results, next }` или добавить `getPage<T>()`. | `web/app/composables/useApi.ts`, `web/app/pages/music.vue` | Фаза 7

## Контент / i18n

- [ ] A8 — «Смотреть музыку» — бессмысленное словосочетание. Заменить на «Смотреть каталог». | `web/i18n/locales/ru.json`, `en.json` | Фаза 2
- [ ] A9 — «О нас», «Библиотека», примитивные about/license/contacts — канцелярит, не отражает бутик Проффа. | `web/app/pages/about.vue`, `license.vue`, `contacts.vue`, локали | Фаза 2
- [ ] A10 — Секция «МУЗЫКА» на главной безликая (веер карточек), нет текста о создателе и кнопки «Связаться». | `web/app/components/home/TheMusicFan.vue` | Фаза 3
- [ ] A11 — Нет страниц правил пользования, GDPR, политики конфиденциальности. В футере ссылок нет. | `web/app/pages/*`, `web/app/components/SiteFooter.vue` | Фаза 6
- [ ] A12 — Нет статей/журнала о музыке. | `web/app/pages/journal/*` | Фаза 5

## Визуал / вейл

- [ ] A13 — Вейл сине-голубой (hue 210, синие градиенты), нужен фиолетовый переливающийся. | `web/app/components/home/DarkVeil.client.vue`, `web/app/components/home/SiteHero.vue` | Фаза 4
- [ ] A14 — Вейл виден только в hero: `body.is-homepage main.pm-main { background: #0f0f0f }` перекрывает анимацию на остальной главной. | `web/app/assets/css/overrides.css`, `web/app/pages/index.vue` | Фаза 4
- [ ] A15 — Секции главной (`.home-rail`, `.the-music`) имеют непрозрачный `#0f0f0f` фон — вейл за ними не просвечивает. | `web/app/assets/css/catalog.css`, `vm.css` | Фаза 4

## Счётчик покупок (нет вообще)

- [ ] A16 — Модель `Track` не хранит счётчик покупок; на карточках его нет. | `backend/music/models.py`, `backend/orders/services.py`, `backend/music/serializers.py`, `backend/music/admin.py`, `web/app/components/catalog/TrackCard.vue`, `web/app/types/catalog.ts` | Фаза 1

---

## Статус

| ID | Статус | Фаза | Комментарий |
|----|--------|------|-------------|
| A1 | ✅ | 7 | useApi().get() вместо прямого $fetch |
| A2 | ✅ | 7 | list() принимает throwOnError |
| A3 | ✅ | 7 | ссылка на обложку/название, кнопки вне ссылки |
| A4 | ✅ | 7 | класс cat-card только на article, ссылки — cat-card__link |
| A5 | ✅ | 7 | :focus-within уже был, кнопка видна с клавиатуры |
| A6 | ✅ | 7 | hasMore = Boolean(data.next) |
| A7 | ✅ | 7 | добавлен getPage<T>() → { results, next } |
| A8 | ⬜ | 2 | — |
| A9 | ⬜ | 2 | — |
| A10 | ⬜ | 3 | — |
| A11 | ⬜ | 6 | — |
| A12 | ⬜ | 5 | — |
| A13 | ⬜ | 4 | — |
| A14 | ⬜ | 4 | — |
| A15 | ⬜ | 4 | — |
| A16 | ⬜ | 1 | — |