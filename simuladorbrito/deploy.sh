#!/bin/bash

# Script de despliegue para Simulador Brito con Cloudflare Tunnel
# Funciona tanto para despliegue independiente como integrado

set -e

# Colores para mensajes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Iniciando despliegue de Simulador Brito con Cloudflare Tunnel ===${NC}"

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
NEXT_PUBLIC_BASE_URL=https://simulador.britoanzoategui.com
NEXT_PUBLIC_SITE_NAME=Simulador Electoral José Brito
NEXT_PUBLIC_SITE_DESCRIPTION=Simulador de votación para las elecciones regionales de Anzoátegui 2025
EOF
fi

# Dar permisos de ejecución al script build-context.sh
chmod +x build-context.sh

# Ejecutar script para determinar contexto de construcción
./build-context.sh

# Detectar si estamos en la carpeta simuladorbrito o en la raíz del proyecto
CURRENT_DIR=$(basename "$PWD")

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
if [ "$CURRENT_DIR" = "simuladorbrito" ]; then
  docker compose down || true
  
  # Construir y levantar contenedores para despliegue independiente
  echo -e "${GREEN}Construyendo contenedores de Simulador Brito (despliegue independiente)...${NC}"
  docker compose build
  
  echo -e "${GREEN}Iniciando servicios de Simulador Brito...${NC}"
  docker compose up -d
else
  # Estamos en la raíz del proyecto, usar el contexto correcto
  docker compose stop simuladorbrito || true
  
  # Construir y levantar contenedores para despliegue integrado
  echo -e "${GREEN}Construyendo contenedor de Simulador Brito (despliegue integrado)...${NC}"
  docker compose build simuladorbrito
  
  echo -e "${GREEN}Iniciando servicio de Simulador Brito...${NC}"
  docker compose up -d simuladorbrito
fi

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