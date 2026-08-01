#!/bin/bash
# ============================================
# ProffMusic Deployment Script
# Ubuntu 24.04 / Python 3.12 / Node.js 22
#
# Схема процессов:
#   - Backend:  Django + Gunicorn (systemd: proffmusic-backend)
#   - Frontend: Next.js (PM2: proffmusic-frontend)
#   - Nginx:    отдельный server-блок для proffmusic.shop
# ============================================

set -e

PROJECT_DIR="/var/www/proffmusic"
PROJECT_USER="www-data"
DOMAIN="proffmusic.shop"
GITHUB_REPO="https://github.com/rodionvitenberg-ui/proffmusic.git"
PM2_HOME="/var/www/.pm2"

echo "🚀 Starting ProffMusic deployment..."

# 0. Проверка, что запущены от root
if [ "$(id -u)" -ne 0 ]; then
    echo "❌ Запустите скрипт от root: sudo bash setup.sh"
    exit 1
fi

# 1. Создание структуры каталогов
echo "📁 Creating directories..."
mkdir -p $PROJECT_DIR
mkdir -p $PROJECT_DIR/backend/media
mkdir -p $PROJECT_DIR/backend/staticfiles
mkdir -p $PROJECT_DIR/protected_media/tracks
mkdir -p $PROJECT_DIR/frontend

# 2. Клонирование проекта
echo "📦 Pulling project from GitHub..."
if [ -d "$PROJECT_DIR/.git" ]; then
    cd $PROJECT_DIR && git pull
else
    git clone $GITHUB_REPO $PROJECT_DIR
fi

cd $PROJECT_DIR

# 3. Файл окружения
echo "🔐 Setting up environment..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "⚠️  .env создан из .env.example. Заполните реальные значения!"
    echo "    Особенно: SECRET_KEY, DB_PASSWORD, EMAIL_HOST_PASSWORD"
fi

# 4. PostgreSQL
# ВАЖНО: пароль берём из .env (он создан на шаге 3 из .env.example).
# ALTER USER выполняется ВСЕГДА, чтобы пароль БД гарантированно
# совпадал с DB_PASSWORD из .env (иначе — password authentication failed).
echo "🐘 Setting up PostgreSQL..."
# Читаем DB_PASSWORD из .env
DB_PW=$(grep -E '^DB_PASSWORD=' $PROJECT_DIR/.env | cut -d'=' -f2- | tr -d '"' | tr -d "'")
if [ -z "$DB_PW" ] || [ "$DB_PW" = "your-db-password" ]; then
    echo "⚠️  DB_PASSWORD в .env не заполнен или остался заглушкой!"
    echo "    Сгенерируйте пароль и пропишите его в $PROJECT_DIR/.env (DB_PASSWORD=...)"
    echo "    Затем перезапустите: sudo bash setup.sh"
    exit 1
fi

sudo -u postgres psql -c "CREATE DATABASE proffmusic;" 2>/dev/null || echo "Database already exists"
sudo -u postgres psql -c "CREATE USER proffmusic WITH PASSWORD '$DB_PW';" 2>/dev/null || sudo -u postgres psql -c "ALTER USER proffmusic WITH PASSWORD '$DB_PW';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE proffmusic TO proffmusic;" 2>/dev/null

# 5. Права на каталог (сервисы работают от www-data)
echo "🔧 Setting ownership..."
chown -R www-data:www-data $PROJECT_DIR

# 6. Backend
echo "🐍 Setting up Python backend..."
cd $PROJECT_DIR/backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# 7. Frontend
echo "⚛️ Setting up Next.js frontend..."
cd $PROJECT_DIR/frontend
npm ci
npm run build

# 8. Django: миграции, статика, суперпользователь
echo "🗄️ Running Django migrations..."
cd $PROJECT_DIR/backend
source venv/bin/activate
python manage.py migrate --noinput
python manage.py collectstatic --noinput
python manage.py createsuperuser --noinput 2>/dev/null || echo "Superuser already exists (или не создан — создайте вручную)"

# 9. Systemd-сервис для Gunicorn (backend)
echo "⚙️ Creating Gunicorn systemd service..."
cat > /etc/systemd/system/proffmusic-backend.service << 'EOF'
[Unit]
Description=ProffMusic Django Backend (Gunicorn)
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/proffmusic/backend
EnvironmentFile=/var/www/proffmusic/.env
ExecStart=/var/www/proffmusic/backend/venv/bin/gunicorn core.wsgi:application --workers 4 --bind 127.0.0.1:8000 --timeout 120
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable proffmusic-backend
systemctl restart proffmusic-backend

# 10. PM2 для Next.js (frontend)
echo "⚡ Setting up PM2 for frontend..."
export PM2_HOME=$PM2_HOME
mkdir -p $PM2_HOME
chown -R www-data:www-data $PM2_HOME

# Запускаем PM2 от www-data (может понадобиться --unsafe-perm при установке)
cd $PROJECT_DIR/frontend
sudo -u www-data env PM2_HOME=$PM2_HOME pm2 start npm --name proffmusic-frontend -- start -- -p 3000
sudo -u www-data env PM2_HOME=$PM2_HOME pm2 save
sudo -u www-data env PM2_HOME=$PM2_HOME pm2 startup systemd -u www-data --hp /var/www 2>/dev/null || echo "PM2 startup уже настроен"

# 11. Nginx: отдельный server-блок для proffmusic.shop
echo "🌐 Setting up Nginx (server block)..."
cp $PROJECT_DIR/nginx/nginx.conf /etc/nginx/sites-available/$DOMAIN
ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/$DOMAIN
nginx -t
systemctl reload nginx

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Дальнейшие шаги:"
echo "   1. Заполните /var/www/proffmusic/.env реальными значениями"
echo "   2. Перезапустите backend: systemctl restart proffmusic-backend"
echo "   3. Скопируйте медиафайлы: rsync -av backend/media/ <server>:/var/www/proffmusic/backend/media/"
echo "   4. Скопируйте защищённые файлы: rsync -av protected_media/ <server>:/var/www/proffmusic/protected_media/"
echo "   5. Загрузите каталог: cd /var/www/proffmusic/backend && source venv/bin/activate && python manage.py load_music"
echo "   6. Настройте SSL: certbot --nginx -d $DOMAIN -d www.$DOMAIN"
echo ""
echo "🌍 Сайт будет доступен по адресу: https://$DOMAIN"