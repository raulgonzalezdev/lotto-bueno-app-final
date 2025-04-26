#!/bin/bash

echo "Creating necessary .env files..."
echo "NEXT_PUBLIC_API_URL=https://applottobueno.com/api
PORT=3002
NODE_ENV=production" > banempre/.env

echo "Building Docker images and starting containers..."

# Construir las imágenes de Docker
docker compose --env-file .env up -d --build

# Verificar el estado de los servicios
echo "Waiting for services to become healthy..."
docker-compose ps

echo "Applying Alembic migrations to create new table and fields..."
# Ejecutar migraciones de Alembic dentro del contenedor 'app'
docker-compose exec app alembic upgrade head

echo "All services are up and running with latest database schema."

