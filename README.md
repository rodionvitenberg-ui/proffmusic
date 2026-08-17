# ProffMusic 🎵

Professional original music marketplace. Built with Nuxt 4 (Vue 3) + Django 6 REST Framework + PostgreSQL.

## Architecture

```
proffmusic/
├── backend/           # Django REST API + Admin
│   ├── core/          # Django project settings
│   ├── music/         # Tracks, Collections, Categories, Tags
│   ├── orders/        # Orders, checkout, payments (LS/BTCPay), downloads
│   ├── users/         # Custom User model (email-based auth)
│   └── media_engine/  # ffmpeg preview generation (no models)
├── web/               # Nuxt 4 storefront (Vue 3)
├── vanmorrison/       # Isolated Van Morrison replica (donor CSS)
├── nginx/             # Production Nginx config
├── protected_media/   # Downloaded files (protected by Nginx internal)
├── .env.example
└── setup.sh           # Deployment script
```

## Quick Start (Development)

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp ../.env.example ../.env  # Edit with your settings
python manage.py migrate --noinput
python manage.py runserver
```

### Frontend (Nuxt)

```bash
cd web
npm install
npm run dev -- --port 3002
```

Open http://localhost:3002/ru

### Required services

- PostgreSQL 16+
- ffmpeg (for auto-preview generation)

## Deployment

For Ubuntu 24.04 servers:

```bash
# Clone the repo, then:
chmod +x setup.sh
sudo ./setup.sh
```

Read `setup.sh` for step-by-step deployment details. After running, configure SSL:

```bash
certbot --nginx -d proffmusic.shop -d www.proffmusic.shop
```

## Features

- 🎵 Track catalog with filters
- 🔐 JWT authentication (login/register via email)
- 🛒 Cart, checkout, profile and order history
- 📥 Download purchased tracks (single or ZIP archive)
- 📧 Email delivery of download links
- 🎧 In-browser preview player
- 🌙 Dark Van Morrison skin (Oswald / Inria Serif)
- 🛡️ Protected file storage (Nginx internal)
- ⚡ FFmpeg auto-preview generation from admin panel

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Nuxt 4, Vue 3, TypeScript, Pinia, GSAP, OGL |
| Backend | Django 6, DRF 3.16, PostgreSQL 16 |
| Auth | Djoser + SimpleJWT (email-based) |
| Audio | FFmpeg (preview generation), native `<audio>` player |
| Visual | OGL (WebGL home backdrop), GSAP (motion) |
| Payments | Lemon Squeezy (cards), BTCPay (Bitcoin), mock (dev) |
| Infra | Nginx, Gunicorn (systemd), PM2 (Nuxt) |

## Environment Variables

See `.env.example` for all required variables.