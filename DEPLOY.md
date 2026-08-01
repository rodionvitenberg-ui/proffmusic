# Deploy ProffMusic на сервер

> Документация по развёртыванию проекта на Ubuntu-сервере, где уже работает другой сайт (например, `daerdreee`).

## Архитектура

```
Домен: proffmusic.shop
       │
       ▼
    Nginx ── server-блок proffmusic.shop (добавляется рядом с daerdreee)
       ├── /static/           → /var/www/proffmusic/backend/staticfiles/
       ├── /media/            → /var/www/proffmusic/backend/media/
       ├── /protected_media/  → /var/www/proffmusic/protected_media/ (internal)
       ├── /api/, /admin/     → Gunicorn 127.0.0.1:8000  (systemd: proffmusic-backend)
       └── /                  → Next.js :3000            (PM2: proffmusic-frontend)
```

---

## Шаг 1. Подготовка DNS

У провайдера DNS создайте A-записи, указывающие на IP сервера (`91.229.91.223`):

| Тип | Имя | Значение |
|-----|-----|----------|
| A   | proffmusic.shop      | 91.229.91.223 |
| A   | www.proffmusic.shop  | 91.229.91.223 |

Дождитесь распространения (обычно 5–30 минут).

---

## Шаг 2. Убедитесь, что установлены базовые пакеты

```bash
sudo apt update
sudo apt install -y python3 python3-venv python3-pip nodejs npm postgresql postgresql-client nginx ffmpeg git curl
```

Проверьте PM2 (если уже стоит от daerdreee — пропустите установку):

```bash
pm2 --version
# Если нет:
sudo npm install -g pm2
```

---

## Шаг 3. Запуск деплоя

Используйте готовый скрипт из репозитория:

```bash
cd /var/www 2>/dev/null || sudo mkdir -p /var/www && cd /var/www
sudo git clone https://github.com/rodionvitenberg-ui/proffmusic.git proffmusic
cd proffmusic
sudo bash setup.sh
```

**Важно:** при первом запуске скрипт скопирует `.env.example` → `.env` и остановится, если `DB_PASSWORD` не заполнен. Поэтому сразу откройте `.env` и заполните обязательные поля (см. шаг 4), затем запустите `sudo bash setup.sh` ещё раз — теперь он выполнит всё до конца.

> 💡 Если `proffmusic` уже существует в PostgreSQL (например, от прерванного запуска) — пароль будет принудительно синхронизирован с `DB_PASSWORD` из `.env` (команда `ALTER USER`), ошибка password authentication failed не возникнет.

Скрипт выполнит:
1. ✳️ Создание каталогов
2. 📦 Клонирование/обновление проекта
3. 🔐 Копирование `.env.example` → `.env`
4. 🐘 Создание БД `proffmusic` и пользователя (пароль берётся из `.env`)
5. 🐍 Virtualenv + `pip install -r requirements.txt`
6. ⚛️ `npm ci` + `npm run build`
7. 🗄️ Миграции + `collectstatic`
8. ⚙️ Systemd-сервис `proffmusic-backend` (Gunicorn)
9. ⚡ PM2-процесс `proffmusic-frontend` (Next.js)
10. 🌐 Nginx server-блок для `proffmusic.shop`

---

## Шаг 4. Заполните .env

```bash
sudo nano /var/www/proffmusic/.env
```

Обязательно заполните (минимум — три поля, отмечены ⭐):

```ini
# --- Django ---
SECRET_KEY=⭐ сгенерируйте: python -c "import secrets; print(secrets.token_urlsafe(50))"
DEBUG=False
ALLOWED_HOSTS=proffmusic.shop,www.proffmusic.shop,localhost,127.0.0.1
CSRF_TRUSTED_ORIGINS=https://proffmusic.shop,https://www.proffmusic.shop,http://localhost:3000
CORS_ALLOWED_ORIGINS=https://proffmusic.shop,https://www.proffmusic.shop,http://localhost:3000,http://127.0.0.1:3000

# --- Database (PostgreSQL) ---
DB_NAME=proffmusic
DB_USER=proffmusic
DB_PASSWORD=⭐ придумайте надёжный пароль

# --- Email (Gmail SMTP) ---
EMAIL_HOST_USER=⭐ ваш-email@gmail.com
EMAIL_HOST_PASSWORD=⭐ ваш-app-password

# --- Site ---
SITE_URL=https://proffmusic.shop

# --- Frontend (Next.js) ---
NEXT_PUBLIC_API_URL=https://proffmusic.shop
NEXT_PUBLIC_SITE_URL=https://proffmusic.shop
```

После заполнения **перезапустите `setup.sh`**, если ещё не запускали его с корректным паролем:

```bash
cd /var/www/proffmusic && sudo bash setup.sh
```

Если бэкенд уже запущен — перезапустите:

```bash
sudo systemctl restart proffmusic-backend
sudo systemctl status proffmusic-backend
```

---

## Шаг 5. Проверка процессов

**Backend (Gunicorn):**

```bash
sudo systemctl status proffmusic-backend
curl -I http://127.0.0.1:8000/api/
```

**Frontend (Next.js через PM2):**

```bash
sudo -u www-data env PM2_HOME=/var/www/.pm2 pm2 status
sudo -u www-data env PM2_HOME=/var/www/.pm2 pm2 logs proffmusic-frontend --lines 20
curl -I http://127.0.0.1:3000
```

---

## Шаг 6. Копирование медиафайлов и исходников

Папки `backend/media/`, `protected_media/` и `backend/ДЛЯ САЙТА/` **не находятся в git** (они в `.gitignore`). Скопируйте их с локальной машины:

```bash
# С локального компьютера:
rsync -av backend/media/ user@server:/var/www/proffmusic/backend/media/
rsync -av protected_media/ user@server:/var/www/proffmusic/protected_media/
rsync -av "backend/ДЛЯ САЙТА/" "user@server:/var/www/proffmusic/backend/ДЛЯ САЙТА/"
```

После копирования восстановите права:

```bash
sudo chown -R www-data:www-data /var/www/proffmusic
```

---

## Шаг 7. Загрузка каталога музыки

```bash
cd /var/www/proffmusic/backend
sudo -u www-data env PATH="/var/www/proffmusic/backend/venv/bin:$PATH" python manage.py load_music
```

---

## Шаг 8. SSL (Let's Encrypt)

```bash
sudo certbot --nginx -d proffmusic.shop -d www.proffmusic.shop
```

После этого nginx-конфиг будет обновлён автоматически (добавится блок `listen 443 ssl`).

---

## Шаг 9. Финальные проверки

```bash
# Nginx
sudo nginx -t && sudo systemctl reload nginx

# Сайт
curl -I https://proffmusic.shop
curl -I https://proffmusic.shop/api/tracks/

# Админка
curl -I https://proffmusic.shop/admin/

# Логи (при проблемах)
sudo journalctl -u proffmusic-backend -n 30
sudo tail -f /var/www/.pm2/logs/proffmusic-frontend-error.log
```

---

## Обновление проекта в будущем

```bash
cd /var/www/proffmusic
sudo git pull
cd backend && sudo -u www-data env PATH="/var/www/proffmusic/backend/venv/bin:$PATH" pip install -r requirements.txt
sudo -u www-data env PATH="/var/www/proffmusic/backend/venv/bin:$PATH" python manage.py migrate --noinput
sudo -u www-data env PATH="/var/www/proffmusic/backend/venv/bin:$PATH" python manage.py collectstatic --noinput
cd ../frontend && sudo npm ci && sudo npm run build
sudo systemctl restart proffmusic-backend
sudo -u www-data env PM2_HOME=/var/www/.pm2 pm2 restart proffmusic-frontend
```

---

## Troubleshooting

| Симптом | Решение |
|---------|---------|
| `curl` к `http://127.0.0.1:8000` не отвечает | `sudo systemctl status proffmusic-backend`, `sudo journalctl -u proffmusic-backend -n 50` |
| `curl` к `http://127.0.0.1:3000` не отвечает | `sudo -u www-data env PM2_HOME=/var/www/.pm2 pm2 status`, проверьте логи PM2 |
| 502 Bad Gateway на сайте | Один из процессов (backend/frontend) не запущен — проверьте выше |
| 403 при обращении к static/media | Проверьте права: `sudo chown -R www-data:www-data /var/www/proffmusic` |
| Есть ошибка про host | Проверьте `ALLOWED_HOSTS` в `.env` |
| Админка без стилей | Перезапустите `collectstatic` и проверьте `alias` в nginx-конфиге |
| `password authentication failed for user "proffmusic"` | Выполните: `sudo -u postgres psql -c "ALTER USER proffmusic WITH PASSWORD '<пароль из DB_PASSWORD в .env>';"` затем `sudo systemctl restart proffmusic-backend` |
