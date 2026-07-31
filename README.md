# ProffMusic 🎵

Professional original music marketplace. Built with Next.js 16 + Django 6 REST Framework + PostgreSQL.

## Architecture

```
proffmusic/
├── backend/           # Django REST API + Admin
│   ├── core/          # Django project settings
│   ├── music/         # Tracks, Collections, Categories, Tags
│   ├── orders/        # Orders, Checkout, Mock payment, Downloads
│   ├── users/         # Custom User model (email-based auth)
│   └── media_engine/  # Preview generation via ffmpeg
├── frontend/          # Next.js 16 storefront
│   └── app/           # Pages & components
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

### Frontend

```bash
cd frontend
npm install
npm run dev
```

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

- 🎵 Track catalog with infinite scroll, filters, and search
- 🔐 JWT authentication (login/register via email)
- 🛒 Cart & mock checkout (no real payment)
- 📥 Download purchased tracks (single or ZIP archive)
- 📧 Email delivery of download links
- 🎧 In-browser audio player (WaveSurfer.js)
- 🖼️ Card-flip UI for track details
- 🌙 Dark theme with custom Zodiak font
- 📊 Yandex.Metrika analytics
- 🛡️ Protected file storage (Nginx internal)
- ⚡ FFmpeg auto-preview generation from admin panel

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind 4 |
| Backend | Django 6, DRF 3.16, PostgreSQL 16 |
| Auth | Djoser + SimpleJWT (email-based) |
| Audio | WaveSurfer.js, Mutagen, FFmpeg |
| Infra | Nginx, Gunicorn, systemd |

## Environment Variables

See `.env.example` for all required variables.