#!/bin/bash

# Script de despliegue para Simulador Brito con Cloudflare Tunnel
# Despliegue individual sin afectar otros servicios

set -e

# Colores para mensajes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Iniciando despliegue individual de Simulador Brito con Cloudflare Tunnel ===${NC}"

# Verificar si docker está instalado
if ! [ -x "$(command -v docker)" ]; then
  echo -e "${RED}Error: Docker no está instalado.${NC}" >&2
  echo -e "Instale Docker: https://docs.docker.com/get-docker/"
  exit 1
fi

# Verificar si docker compose está instalado
if ! [ -x "$(command -v docker)" ] || ! docker compose version > /dev/null 2>&1; then
  echo -e "${RED}Error: Docker Compose no está instalado.${NC}" >&2
  echo -e "Instale Docker Compose: https://docs.docker.com/compose/install/"
  exit 1
fi

# Crear archivo .env si no existe
if [ ! -f .env ]; then
  echo -e "${YELLOW}Creando archivo .env para Simulador Brito...${NC}"
  cat > .env << EOF
NODE_ENV=production
PORT=3005
EOF
fi

# Verificar si existe la red lotto-bueno-network
echo -e "${YELLOW}Verificando si existe la red lotto-bueno-network...${NC}"
if ! docker network inspect lotto-bueno-network >/dev/null 2>&1; then
  echo -e "${YELLOW}Creando red lotto-bueno-network...${NC}"
  docker network create lotto-bueno-network
else
  echo -e "${GREEN}La red lotto-bueno-network ya existe.${NC}"
fi

# Detener y eliminar contenedores si existen
echo -e "${YELLOW}Deteniendo contenedores existentes de Simulador Brito...${NC}"
docker compose down || true

# Construir y levantar contenedores
echo -e "${GREEN}Construyendo contenedores de Simulador Brito...${NC}"
docker compose build

echo -e "${GREEN}Iniciando servicios de Simulador Brito...${NC}"
docker compose up -d

echo -e "${GREEN}=== Despliegue de Simulador Brito completado con éxito ===${NC}"
echo -e "El Simulador Brito ahora está disponible a través del túnel de Cloudflare"
echo -e "ID del túnel: 2b59f68e-27b4-4738-afa9-12894418b128"
echo ""
echo -e "${YELLOW}Para verificar el estado de los contenedores:${NC} docker compose ps"
echo -e "${YELLOW}Para ver logs:${NC} docker compose logs -f"
echo -e "${YELLOW}Para ver logs del túnel:${NC} docker compose logs -f cloudflared"

# Mostrar URL de Cloudflare
echo -e "${GREEN}=============================================================${NC}"
echo -e "${GREEN}¡IMPORTANTE! Configuración de Cloudflare:${NC}"
echo -e "${GREEN}=============================================================${NC}"
echo -e "Asegúrate de configurar el túnel en Cloudflare para que apunte a:"
echo -e "${YELLOW}localhost:3005${NC}"
echo -e "En el panel de Cloudflare Zero Trust > Access > Tunnels"
echo -e "${GREEN}=============================================================${NC}" 