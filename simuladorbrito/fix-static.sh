#!/bin/bash

# Script para solucionar problemas con recursos estáticos
set -e

# Colores para mensajes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Reparando configuración de recursos estáticos en Simulador Brito ===${NC}"

# Detener todos los contenedores
echo -e "${YELLOW}Deteniendo todos los contenedores...${NC}"
docker compose down --remove-orphans

# Limpiar imágenes antiguas
echo -e "${YELLOW}Limpiando imágenes antiguas...${NC}"
docker image prune -f

# Eliminar carpetas de construcción
echo -e "${YELLOW}Eliminando carpetas de construcción...${NC}"
if [ -d ".next" ]; then
  rm -rf .next
fi

if [ -d "node_modules" ]; then
  rm -rf node_modules
fi

# Reinstalar dependencias
echo -e "${YELLOW}Reinstalando dependencias...${NC}"
npm install --legacy-peer-deps

# Construir la aplicación
echo -e "${GREEN}Construyendo la aplicación...${NC}"
docker compose build --no-cache

# Iniciar los servicios
echo -e "${GREEN}Iniciando servicios...${NC}"
docker compose up -d

# Esperar a que los servicios estén disponibles
echo -e "${YELLOW}Esperando a que los servicios estén disponibles...${NC}"
sleep 10

# Verificar estado de los contenedores
echo -e "${YELLOW}Verificando estado de los contenedores:${NC}"
docker compose ps

# Mostrar logs del simulador
echo -e "\n${YELLOW}Mostrando logs del simulador:${NC}"
docker logs --tail 20 simuladorbrito

# Mostrar logs de Nginx
echo -e "\n${YELLOW}Mostrando logs de Nginx:${NC}"
docker logs --tail 20 simuladorbrito-nginx

# Mostrar logs de Cloudflare Tunnel
echo -e "\n${YELLOW}Mostrando logs de Cloudflare Tunnel:${NC}"
docker logs --tail 20 simuladorbrito-cloudflared

echo -e "\n${GREEN}=== Proceso completado ===${NC}"
echo -e "Verifica si el sitio ya está funcionando correctamente en ${YELLOW}https://simuladorparametrica.com${NC}"
echo -e "Para depuración adicional: ${YELLOW}./check-static.sh${NC}" 