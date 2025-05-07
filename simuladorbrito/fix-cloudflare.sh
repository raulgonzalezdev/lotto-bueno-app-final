#!/bin/bash

# Script para solucionar problemas con Cloudflare Tunnel
set -e

# Colores para mensajes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Solucionando problemas de conexión con Cloudflare Tunnel ===${NC}"

# Detener todos los contenedores
echo -e "${YELLOW}Deteniendo todos los contenedores...${NC}"
docker compose down --remove-orphans

# Limpiar imágenes de Docker
echo -e "${YELLOW}Limpiando imágenes Docker antiguas...${NC}"
docker image prune -f

# Verificar la existencia del archivo de configuración de Cloudflare
if [ ! -f "config.yaml" ]; then
  echo -e "${RED}El archivo config.yaml no existe, creándolo...${NC}"
  cat > config.yaml << EOF
tunnel: 2b59f68e-27b4-4738-afa9-12894418b128
ingress:
  - hostname: simuladorparametrica.com
    service: http://nginx:80
    originRequest:
      connectTimeout: 30s
      timeout: 60s
      noTLSVerify: true
      disableChunkedEncoding: true
  - service: http_status:404
EOF
fi

# Configurar correctamente los permisos
echo -e "${YELLOW}Configurando permisos de archivos...${NC}"
chmod 644 config.yaml
chmod +x *.sh

# Reiniciar servicios
echo -e "${GREEN}Iniciando servicios...${NC}"
docker compose up --build -d

# Esperar a que los servicios estén disponibles
echo -e "${YELLOW}Esperando a que los servicios estén disponibles...${NC}"
sleep 20

# Verificar el estado de los contenedores
echo -e "${YELLOW}Verificando estado de los contenedores:${NC}"
docker compose ps

# Prueba básica de conectividad
echo -e "\n${YELLOW}Verificando conexión local al simulador:${NC}"
curl -I http://localhost:3005 2>/dev/null || echo -e "${RED}No se pudo conectar al simulador${NC}"

echo -e "\n${YELLOW}Verificando conexión local a nginx:${NC}"
curl -I http://localhost:8080 2>/dev/null || echo -e "${RED}No se pudo conectar a nginx en puerto 8080${NC}"

echo -e "\n${YELLOW}Verificando conexión local a nginx (puerto alternativo):${NC}"
curl -I http://localhost:8090 2>/dev/null || echo -e "${RED}No se pudo conectar a nginx en puerto 8090${NC}"

# Mostrar logs de cada servicio
echo -e "\n${YELLOW}Revisando logs del simulador:${NC}"
docker logs --tail 10 simuladorbrito

echo -e "\n${YELLOW}Revisando logs de nginx:${NC}"
docker logs --tail 10 simuladorbrito-nginx

echo -e "\n${YELLOW}Revisando logs de cloudflared:${NC}"
docker logs --tail 20 simuladorbrito-cloudflared

echo -e "\n${GREEN}=== Proceso completado ===${NC}"
echo -e "Prueba el sitio en: ${YELLOW}https://simuladorparametrica.com${NC}"
echo -e "Es posible que tardes unos minutos en ver los cambios debido a la propagación DNS y caché de Cloudflare."
echo -e "Si sigues teniendo problemas, prueba accediendo directamente a: ${YELLOW}http://localhost:8090${NC}\n"
echo -e "Para mostrar más logs del túnel: ${YELLOW}docker logs -f simuladorbrito-cloudflared${NC}" 