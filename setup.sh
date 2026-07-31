#!/bin/bash
# ============================================
# ProffMusic Deployment Script
# Ubuntu 24.04 / Python 3.12 / Node.js 22
# ============================================

set -e

PROJECT_DIR="/home/www/proffmusic"
PROJECT_USER="www-data"
DOMAIN="proffmusic.shop"

echo "🚀 Starting ProffMusic deployment..."

# 0. Create project directory structure
echo "📁 Creating directories..."
mkdir -p $PROJECT_DIR
mkdir -p $PROJECT_DIR/backend/media
mkdir -p $PROJECT_DIR/backend/staticfiles
mkdir -p $PROJECT_DIR/protected_media/tracks
mkdir -p $PROJECT_DIR/frontend

# 1. System dependencies
echo "🔧 Installing system dependencies..."
apt-get update
apt-get install -y python3 python3-venv python3-pip nodejs npm postgresql postgresql-client nginx ffmpeg git curl

# 2. Clone/pull project
echo "📦 Pulling project from GitHub..."
if [ -d "$PROJECT_DIR/.git" ]; then
  cd $PROJECT_DIR && git pull
else
  git clone https://github.com/rodionvitenberg-ui/proffmusic.git $PROJECT_DIR
fi

cd $PROJECT_DIR

# 3. Copy environment file
echo "🔐 Setting up environment..."
if [ ! -f .env ]; then
  cp .env.example .env
  echo "⚠️  .env file created from .env.example. Edit it with your settings!"
fi

# 4. Setup PostgreSQL
echo "🐘 Setting up PostgreSQL..."
sudo -u postgres psql -c "CREATE DATABASE proffmusic;" 2>/dev/null || echo "Database already exists"
sudo -u postgres psql -c "CREATE USER proffmusic WITH PASSWORD 'your-password-here';" 2>/dev/null || echo "User already exists"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE proffmusic TO proffmusic;" 2>/dev/null

# 5. Backend setup
echo "🐍 Setting up Python backend..."
cd $PROJECT_DIR/backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# 6. Frontend setup
echo "⚛️ Setting up Next.js frontend..."
cd $PROJECT_DIR/frontend
npm ci

# 7. Build frontend
echo "🏗️ Building frontend..."
npm run build

# 8. Django migrations & static
echo "🗄️ Running Django migrations..."
cd $PROJECT_DIR/backend
source venv/bin/activate
python manage.py migrate --noinput
python manage.py collectstatic --noinput
python manage.py createsuperuser --noinput 2>/dev/null || echo "Superuser already exists"

# 9. Setup Nginx
echo "🌐 Setting up Nginx..."
cp $PROJECT_DIR/nginx/nginx.conf /etc/nginx/sites-available/$DOMAIN
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

# 10. Setup systemd services
echo "⚙️ Creating systemd services..."

# Gunicorn service
cat > /etc/systemd/system/proffmusic-backend.service << 'EOF'
[Unit]
Description=ProffMusic Django Backend
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/home/www/proffmusic/backend
EnvironmentFile=/home/www/proffmusic/.env
ExecStart=/home/www/proffmusic/backend/venv/bin/gunicorn core.wsgi:application --workers 4 --bind 127.0.0.1:8000 --timeout 120
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# Next.js service
cat > /etc/systemd/system/proffmusic-frontend.service << 'EOF'
[Unit]
Description=ProffMusic Next.js Frontend
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/home/www/proffmusic/frontend
EnvironmentFile=/home/www/proffmusic/.env
ExecStart=/usr/bin/npm run start -- -p 3000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable proffmusic-backend proffmusic-frontend
systemctl restart proffmusic-backend proffmusic-frontend

echo ""
echo "✅ Deployment complete!"
echo "📝 Don't forget to:"
echo "   1. Edit /home/www/proffmusic/.env with real credentials"
echo "   2. Setup SSL: certbot --nginx -d $DOMAIN -d www.$DOMAIN"
echo "   3. Restart services: systemctl restart proffmusic-backend proffmusic-frontend"
echo ""
echo "🌍 Site should be available at: https://$DOMAIN"