# frontend/Dockerfile

# 1. Образ Node.js
FROM node:24.12.0-alpine

# 2. Рабочая директория
WORKDIR /app

# 3. Копируем package.json и устанавливаем зависимости
COPY package.json package-lock.json ./
RUN npm ci

# 4. Копируем исходный код
COPY . .

# 5. Собираем приложение
RUN npm run build

# 6. Запускаем сервер Next.js
CMD ["npm", "start"]