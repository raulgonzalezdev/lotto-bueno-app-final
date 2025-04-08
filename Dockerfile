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

# Etapa 2: Configuración de la aplicación backend
FROM python:3.10-slim as app

WORKDIR /app

# Instalar curl para healthchecks y wget/unzip para Bombardier
RUN apt-get update && apt-get install -y curl wget unzip && rm -rf /var/lib/apt/lists/*

# Instalar Bombardier
RUN wget https://github.com/codesenberg/bombardier/releases/download/v1.2.6/bombardier-linux-amd64.zip && \
    unzip bombardier-linux-amd64.zip && \
    mv bombardier-linux-amd64 /usr/local/bin/bombardier && \
    rm bombardier-linux-amd64.zip

COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copia solo el código de la aplicación backend
COPY ./app /app/app
COPY ./whatsapp_chatbot_python /app/whatsapp_chatbot_python

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