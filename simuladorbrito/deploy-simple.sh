#!/bin/bash

# Script simple para desplegar el Simulador Electoral con Cloudflare Tunnel
echo "=== Iniciando despliegue del Simulador Electoral ==="

# Detener contenedores existentes
echo "Deteniendo contenedores existentes..."
cd "$(dirname "$0")"
docker compose down --remove-orphans

# Limpiar imágenes antiguas
echo "Limpiando imágenes antiguas..."
docker image prune -f

# Reconstruir e iniciar los servicios
echo "Construyendo e iniciando servicios..."
docker compose up -d --build

echo "=== Despliegue completado ==="
echo "Accede al simulador en: https://simuladorparametrica.com"
echo "URL local para pruebas: http://localhost:8090"
echo "Para ver los logs: docker compose logs -f" 