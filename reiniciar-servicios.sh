#!/bin/bash

# Script para reiniciar los servicios y aplicar las nuevas configuraciones

echo "===== Reiniciando servicios para aplicar nuevas configuraciones ====="

# Asegurarse de estar en el directorio correcto
cd "$(dirname "$0")"

echo "1. Deteniendo servicios actuales..."
docker compose down

echo "2. Limpiando recursos no utilizados..."
docker system prune -f

echo "3. Verificando configuraciones..."
if grep -q "pool_size=20" app/database.py; then
  echo "✓ Configuración del pool de conexiones aplicada correctamente"
else
  echo "✗ Error: No se encontró la configuración del pool en app/database.py"
  exit 1
fi

echo "4. Iniciando servicios con nuevas configuraciones..."
docker compose up -d

echo "5. Esperando a que los servicios estén disponibles..."
sleep 10

echo "6. Verificando estado de los servicios..."
docker compose ps

echo "===== Proceso completado ====="
echo "Puedes verificar los logs con: docker compose logs -f"
echo "Para verificar específicamente el bot: docker compose logs -f whatsapp-bot" 