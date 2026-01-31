#!/bin/sh

echo "Waiting for postgres..."
while ! nc -z $DB_HOST $DB_PORT; do
  sleep 0.1
done
echo "PostgreSQL started"

python manage.py migrate
python manage.py collectstatic --noinput
# Заполняем базу категориями и тегами (если пусто)
python manage.py init_data

exec gunicorn core.wsgi:application --bind 0.0.0.0:8000