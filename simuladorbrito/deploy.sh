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
HOST=0.0.0.0
NEXT_PUBLIC_ASSET_PREFIX=https://simuladorparametrica.com
NEXT_PUBLIC_BASE_URL=https://simuladorparametrica.com
NEXT_PUBLIC_SITE_NAME=Simulador Electoral José Brito
NEXT_PUBLIC_SITE_DESCRIPTION=Simulador de votación para las elecciones regionales de Anzoátegui 2025
EOF
fi

# Dar permisos de ejecución al script build-context.sh si existe
if [ -f build-context.sh ]; then
  chmod +x build-context.sh
  # Ejecutar script para determinar contexto de construcción
  ./build-context.sh
fi

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
  # Detener y eliminar completamente
  docker compose down --remove-orphans
  
  # Limpiar imágenes huérfanas o de versiones anteriores
  echo -e "${YELLOW}Limpiando imágenes antiguas...${NC}"
  docker image prune -f
  
  # Reconstruir las imágenes sin usar caché
  echo -e "${GREEN}Construyendo contenedores de Simulador Brito (despliegue independiente)...${NC}"
  docker compose build --no-cache
  
  echo -e "${GREEN}Iniciando servicios de Simulador Brito...${NC}"
  docker compose up -d
else
  # Estamos en la raíz del proyecto, usar el contexto correcto
  docker compose stop simuladorbrito cloudflared || true
  docker compose rm -f simuladorbrito cloudflared || true
  
  # Construir y levantar contenedores para despliegue integrado
  echo -e "${GREEN}Construyendo contenedor de Simulador Brito (despliegue integrado)...${NC}"
  docker compose build --no-cache simuladorbrito
  
  echo -e "${GREEN}Iniciando servicio de Simulador Brito...${NC}"
  docker compose up -d simuladorbrito cloudflared
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
echo -e "El túnel está configurado para conectarse al simulador en el puerto 3005"
echo -e "Dominio configurado: ${YELLOW}simuladorparametrica.com${NC}"
echo -e "${GREEN}=============================================================${NC}"

# Verificar el estado de los contenedores
echo -e "${YELLOW}Verificando el estado de los contenedores...${NC}"
sleep 5
docker compose ps

# Verificar los logs para asegurarse de que todo está funcionando
echo -e "${YELLOW}Mostrando los últimos logs del servicio simuladorbrito...${NC}"
docker logs --tail 10 simuladorbrito

echo -e "${YELLOW}Mostrando los últimos logs del túnel de Cloudflare...${NC}"
docker logs --tail 10 simuladorbrito-cloudflared 