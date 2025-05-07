#!/bin/bash

# Script para reconstruir el simulador sin dependencias innecesarias
set -e

# Colores para mensajes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Iniciando reconstrucción limpia del Simulador Brito ===${NC}"

# Detener y eliminar contenedores existentes
echo -e "${YELLOW}Deteniendo y eliminando contenedores existentes...${NC}"
docker compose down --remove-orphans

# Eliminar node_modules y carpeta .next
echo -e "${YELLOW}Limpiando node_modules y carpeta .next...${NC}"
if [ -d "node_modules" ]; then
  rm -rf node_modules
fi

if [ -d ".next" ]; then
  rm -rf .next
fi

# Limpiar imágenes de Docker antiguas
echo -e "${YELLOW}Limpiando imágenes Docker antiguas...${NC}"
docker image prune -f

# Instalar dependencias frescas
echo -e "${YELLOW}Instalando dependencias...${NC}"
npm install --legacy-peer-deps

# Reconstruir la imagen Docker sin caché
echo -e "${GREEN}Reconstruyendo la imagen Docker...${NC}"
docker compose build --no-cache

# Iniciar los servicios
echo -e "${GREEN}Iniciando servicios...${NC}"
docker compose up -d

echo -e "${GREEN}=== Reconstrucción completada ===${NC}"
echo -e "Para verificar el estado de los contenedores: docker compose ps"
echo -e "Para ver logs: docker compose logs -f"

# Mostrar estado de contenedores
echo -e "${YELLOW}Estado actual de los contenedores:${NC}"
docker compose ps 