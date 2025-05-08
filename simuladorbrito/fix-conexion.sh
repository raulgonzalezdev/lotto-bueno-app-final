#!/bin/bash

# Script para solucionar problemas de conexión con Cloudflare Tunnel
echo "=== Solucionando problemas de conexión con Cloudflare Tunnel ==="

# Detener todos los contenedores existentes
echo "Deteniendo todos los contenedores..."
cd "$(dirname "$0")"
docker compose down --remove-orphans

# Limpiar imágenes antiguas
echo "Limpiando imágenes Docker antiguas..."
docker image prune -f

# Reiniciar servicios
echo "Reiniciando servicios con la nueva configuración..."
docker compose up -d --build

# Esperar a que los servicios inicien
echo "Esperando a que los servicios inicien..."
sleep 15

# Verificar estado de los contenedores
echo "Verificando estado de los contenedores:"
docker compose ps

# Verificar logs del túnel
echo "Mostrando logs del túnel de Cloudflare (ctrl+c para salir):"
docker logs --follow simuladorbrito-cloudflared 