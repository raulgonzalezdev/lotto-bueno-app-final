#!/bin/bash

# Script unificado de despliegue para Simulador Electoral Brito
# Esta versión usa certificados existentes si están disponibles

set -e

# Colores para mensajes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Iniciando despliegue de Simulador Brito ===${NC}"

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

# Crear directorios necesarios
echo -e "${YELLOW}Creando directorios necesarios...${NC}"
mkdir -p nginx/conf.d nginx/html

# Verificar si existe el archivo de configuración de nginx y crearlo si no existe
if [ ! -f nginx/conf.d/simuladorbrito.conf ]; then
  echo -e "${YELLOW}No se encontró la configuración de Nginx, creando configuración predeterminada...${NC}"
  cat > nginx/conf.d/simuladorbrito.conf << 'EOF'
server {
    listen 80;
    
    location / {
        proxy_pass http://simuladorbrito:3005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 443 ssl;
    
    ssl_certificate /etc/nginx/ssl/ahorasi.fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/ahorasi.privkey.pem;
    
    location / {
        proxy_pass http://simuladorbrito:3005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
  echo -e "${GREEN}Configuración de Nginx creada correctamente.${NC}"
fi

# Verificar si existen certificados en la raíz del proyecto
CERT_FOUND=false
if [ -f "../nginx/certs/ahorasi.fullchain.pem" ] && [ -f "../nginx/certs/ahorasi.privkey.pem" ]; then
  echo -e "${GREEN}Certificados SSL encontrados en ../nginx/certs/${NC}"
  CERT_FOUND=true
fi

# Detener y eliminar contenedores si existen
echo -e "${YELLOW}Deteniendo contenedores existentes de Simulador Brito...${NC}"
docker compose down --remove-orphans || true

# Limpiar imágenes huérfanas o de versiones anteriores
echo -e "${YELLOW}Limpiando imágenes antiguas...${NC}"
docker image prune -f

# Editar docker-compose.yml si se encontraron certificados
if [ "$CERT_FOUND" = true ]; then
  echo -e "${YELLOW}Actualizando docker-compose.yml para usar certificados existentes...${NC}"
  # Verificar si el archivo es compatible con yq o jq, sino usar método alternativo
  if [ -x "$(command -v sed)" ]; then
    # Método alternativo con sed para líneas específicas
    sed -i -e 's|./certbot/conf:/etc/letsencrypt|../nginx/certs/ahorasi.fullchain.pem:/etc/nginx/ssl/ahorasi.fullchain.pem:ro|g' docker-compose.yml
    sed -i -e 's|./certbot/www:/var/www/certbot|../nginx/certs/ahorasi.privkey.pem:/etc/nginx/ssl/ahorasi.privkey.pem:ro|g' docker-compose.yml
    echo -e "${YELLOW}docker-compose.yml actualizado para usar certificados existentes.${NC}"
  else
    echo -e "${RED}No se pudo actualizar automáticamente docker-compose.yml.${NC}"
    echo -e "${YELLOW}Por favor, asegúrese de que el archivo docker-compose.yml contiene las líneas adecuadas:${NC}"
    echo -e "- ../nginx/certs/ahorasi.fullchain.pem:/etc/nginx/ssl/ahorasi.fullchain.pem:ro"
    echo -e "- ../nginx/certs/ahorasi.privkey.pem:/etc/nginx/ssl/ahorasi.privkey.pem:ro"
  fi
fi

# Reconstruir las imágenes sin usar caché
echo -e "${GREEN}Construyendo contenedores de Simulador Brito...${NC}"
docker compose build --no-cache

# Iniciar servicios
echo -e "${GREEN}Iniciando servicios de Simulador Brito...${NC}"
docker compose up -d

echo -e "${GREEN}=== Despliegue de Simulador Brito completado con éxito ===${NC}"
echo -e "El Simulador Brito ahora está disponible en https://ahorasi.online"
echo ""
echo -e "${YELLOW}Para verificar el estado de los contenedores:${NC} docker compose ps"
echo -e "${YELLOW}Para ver logs:${NC} docker compose logs -f"

# Mostrar URLs disponibles
echo -e "${GREEN}=============================================================${NC}"
echo -e "${GREEN}¡IMPORTANTE! URLs disponibles:${NC}"
echo -e "${GREEN}=============================================================${NC}"
echo -e "Dominio principal: ${YELLOW}https://ahorasi.online${NC}"
echo -e "HTTP local: ${YELLOW}http://localhost:8081${NC}"
echo -e "HTTPS local: ${YELLOW}https://localhost:8443${NC}"
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