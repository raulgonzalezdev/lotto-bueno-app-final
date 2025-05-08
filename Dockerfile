FROM phidata/pgvector:16 as db

ENV POSTGRES_DB=lottobueno
ENV POSTGRES_USER=lottobueno
ENV POSTGRES_PASSWORD=lottobueno

# Copiar el archivo de backup y los scripts de inicialización al contenedor
#COPY lottobueno_backup.dump /docker-entrypoint-initdb.d/
#COPY init-db.sh /docker-entrypoint-initdb.d/
#COPY wait-for-it.sh /docker-entrypoint-initdb.d/
#COPY init.sql /docker-entrypoint-initdb.d/

#RUN chmod +x /docker-entrypoint-initdb.d/init-db.sh
#RUN chmod +x /docker-entrypoint-initdb.d/wait-for-it.sh

# Etapa de certificados SSL
FROM certbot/certbot:latest as certbot
RUN mkdir -p /etc/letsencrypt
WORKDIR /app
COPY ./ssl-init.sh /app/
RUN chmod +x /app/ssl-init.sh

# Etapa 2: Configuración de la aplicación backend
FROM python:3.10-slim as app

WORKDIR /app

# Instalar curl para healthchecks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Eliminar intentos de instalar Bombardier

COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copia solo el código de la aplicación backend
COPY ./app /app/app
COPY ./whatsapp_chatbot_python /app/whatsapp_chatbot_python
COPY ./alembic /app/alembic
COPY ./alembic.ini /app/

# Asegurar que todas las dependencias de Alembic están instaladas
RUN pip install alembic psycopg2-binary

# Crear el archivo .env directamente en el contenedor
# Considera usar variables de entorno de Docker Compose en su lugar para mayor seguridad y flexibilidad
# RUN echo "POSTGRES_DB=lottobueno\\nPOSTGRES_USER=lottobueno\\nPOSTGRES_PASSWORD=lottobueno\\nDATABASE_URL=postgresql://lottobueno:lottobueno@postgres:5432/lottobueno\\nREDIS_URL=redis://redis:6379/0" > /app/.env

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]


# Etapa 3: Configuración de la aplicación frontend
FROM node:18-alpine as frontend

# Argumento de build para la URL de la API
ARG NEXT_PUBLIC_API_URL
# Establecer la variable de entorno DENTRO del build
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

WORKDIR /frontend

# Copia los archivos de configuración del frontend y el código fuente
COPY ./frontend/package.json ./frontend/package-lock.json* ./
COPY ./frontend/.env ./
COPY ./frontend /frontend

# Instala dependencias del frontend
RUN npm install --force or --legacy-peer-deps

# Construye la aplicación frontend
RUN npm run build:standalone

# Expone el puerto que usa Next.js por defecto (o el que definas en start script)
EXPOSE 3000

# Comando para iniciar la aplicación Next.js
CMD ["npm", "run", "start"]

# Etapa 4: Configuración de la aplicación banempre
FROM node:18-alpine as banempre

# Argumento de build para la URL de la API
ARG NEXT_PUBLIC_API_URL
# Establecer la variable de entorno DENTRO del build
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-https://banempre.online/api}
ENV PORT=3002
ENV NODE_ENV=production
ENV WEBSITE_URL=${WEBSITE_URL:-https://banempre.online}
ENV TELEGRAM_CHANNEL=${TELEGRAM_CHANNEL:-https://t.me/applottobueno}

WORKDIR /banempre

# Copia los archivos de configuración de banempre y el código fuente
COPY ./banempre/package.json ./banempre/package-lock.json* ./
COPY ./banempre/.env ./
COPY ./banempre /banempre

# Instala dependencias sin plugins problemáticos
RUN npm install --legacy-peer-deps

# Construye la aplicación banempre
RUN npm run build:standalone

# Expone el puerto que usa la aplicación banempre
EXPOSE 3002

# Comando para iniciar la aplicación
CMD ["npm", "run", "start"]

# Etapa 5: Configuración de la aplicación simuladorbrito
FROM node:18-alpine as simuladorbrito

# Configuración de variables de entorno
ENV NODE_ENV=production
ENV PORT=3005
ENV NEXT_PUBLIC_ASSET_PREFIX=https://ahorasi.online
ENV NEXT_PUBLIC_BASE_URL=https://ahorasi.online

WORKDIR /simuladorbrito

# Copia los archivos de configuración y el código fuente
COPY ./simuladorbrito/package.json ./simuladorbrito/package-lock.json* ./
COPY ./simuladorbrito /simuladorbrito

# Instala dependencias
RUN npm install --legacy-peer-deps

# Construye la aplicación
RUN npm run build

# Expone el puerto 3005
EXPOSE 3005

# Comando para iniciar la aplicación
CMD ["npm", "run", "start"]