#!/bin/bash

# Script de despliegue para Simulador Brito con SSL independiente
# Funciona para la nueva configuración con Nginx y certbot

set -e

# Colores para mensajes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Iniciando despliegue de Simulador Brito con certificados SSL ===${NC}"

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
NEXT_PUBLIC_ASSET_PREFIX=https://ahorasi.online
NEXT_PUBLIC_BASE_URL=https://ahorasi.online
NEXT_PUBLIC_SITE_NAME=Simulador Electoral José Brito
NEXT_PUBLIC_SITE_DESCRIPTION=Simulador de votación para las elecciones regionales de Anzoátegui 2025
EOF
fi

# Verificar que existe la configuración de Nginx
if [ ! -f nginx/conf.d/simuladorbrito.conf ]; then
  echo -e "${RED}Error: No se encontró la configuración de Nginx.${NC}" >&2
  echo -e "Asegúrese de que el archivo nginx/conf.d/simuladorbrito.conf existe."
  exit 1
fi

# Crear directorios para certbot si no existen
echo -e "${YELLOW}Creando directorios para certbot...${NC}"
mkdir -p certbot/conf certbot/www certbot/logs

# Detener y eliminar contenedores si existen
echo -e "${YELLOW}Deteniendo contenedores existentes de Simulador Brito...${NC}"
docker compose down --remove-orphans || true

# Limpiar imágenes huérfanas o de versiones anteriores
echo -e "${YELLOW}Limpiando imágenes antiguas...${NC}"
docker image prune -f

# Reconstruir las imágenes sin usar caché
echo -e "${GREEN}Construyendo contenedores de Simulador Brito...${NC}"
docker compose build --no-cache

# Iniciar servicios
echo -e "${GREEN}Iniciando servicios de Simulador Brito...${NC}"
docker compose up -d

# Verificar si los certificados SSL existen
if [ ! -d "certbot/conf/live/ahorasi.online" ]; then
  echo -e "${YELLOW}Obteniendo certificados SSL para ahorasi.online...${NC}"
  chmod +x obtain-cert.sh
  ./obtain-cert.sh
  
  # Reiniciar servicios después de obtener certificados
  echo -e "${YELLOW}Reiniciando servicios con los nuevos certificados...${NC}"
  docker compose restart nginx
else
  echo -e "${GREEN}Certificados SSL ya existen para ahorasi.online.${NC}"
fi

echo -e "${GREEN}=== Despliegue de Simulador Brito completado con éxito ===${NC}"
echo -e "El Simulador Brito ahora está disponible en https://ahorasi.online"
echo ""
echo -e "${YELLOW}Para verificar el estado de los contenedores:${NC} docker compose ps"
echo -e "${YELLOW}Para ver logs:${NC} docker compose logs -f"
echo -e "${YELLOW}Para ver logs de certbot:${NC} docker compose logs -f certbot"

# Mostrar URLs disponibles
echo -e "${GREEN}=============================================================${NC}"
echo -e "${GREEN}¡IMPORTANTE! URLs disponibles:${NC}"
echo -e "${GREEN}=============================================================${NC}"
echo -e "Dominio principal: ${YELLOW}https://ahorasi.online${NC}"
echo -e "URL directa Next.js: ${YELLOW}http://localhost:3005${NC} (para depuración)"
echo -e "${GREEN}=============================================================${NC}"

# Verificar el estado de los contenedores
echo -e "${YELLOW}Verificando el estado de los contenedores...${NC}"
sleep 5
docker compose ps

# Verificar los logs para asegurarse de que todo está funcionando
echo -e "${YELLOW}Mostrando los últimos logs del servicio simuladorbrito...${NC}"
docker logs --tail 10 simuladorbrito

echo -e "${YELLOW}Mostrando los últimos logs del servicio Nginx...${NC}"
docker logs --tail 10 simuladorbrito-nginx 