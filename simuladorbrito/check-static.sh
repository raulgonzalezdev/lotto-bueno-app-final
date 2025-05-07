#!/bin/bash

# Script para diagnosticar problemas con recursos estáticos
set -e

# Colores para mensajes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Diagnóstico de recursos estáticos en Simulador Brito ===${NC}"

# Verificar contenedores en ejecución
echo -e "${YELLOW}Verificando contenedores en ejecución:${NC}"
docker compose ps

# Verificar estructura de archivos estáticos dentro del contenedor
echo -e "\n${YELLOW}Verificando estructura de archivos estáticos dentro del contenedor:${NC}"
docker exec simuladorbrito ls -la /app/.next/static || echo -e "${RED}No se pudo acceder a la carpeta de estáticos${NC}"

# Verificar permisos de archivos
echo -e "\n${YELLOW}Verificando permisos de archivos estáticos:${NC}"
docker exec simuladorbrito find /app/.next/static -type f -name "*.js" | head -n 3 | xargs docker exec simuladorbrito ls -la

# Verificar estructura de public
echo -e "\n${YELLOW}Verificando estructura de carpeta public:${NC}"
docker exec simuladorbrito ls -la /app/public || echo -e "${RED}No se pudo acceder a la carpeta public${NC}"

# Verificar headers de respuesta para tipos MIME
echo -e "\n${YELLOW}Verificando headers de respuesta para CSS:${NC}"
curl -I http://localhost:3005/_next/static/css/ 2>/dev/null || echo -e "${RED}No se pudo obtener headers para CSS${NC}"

echo -e "\n${YELLOW}Verificando headers de respuesta para JS:${NC}"
curl -I http://localhost:3005/_next/static/chunks/ 2>/dev/null || echo -e "${RED}No se pudo obtener headers para JS${NC}"

# Verificar configuración de Nginx
echo -e "\n${YELLOW}Verificando configuración de Nginx:${NC}"
docker exec simuladorbrito-nginx nginx -t 2>/dev/null || echo -e "${RED}Error en la configuración de Nginx${NC}"

# Sugerencias para solucionar problemas
echo -e "\n${GREEN}=== Sugerencias para solucionar problemas ===${NC}"
echo -e "1. Reconstruir completamente la aplicación: ${YELLOW}./rebuild.sh${NC}"
echo -e "2. Modificar manualmente los Content-Type en Nginx: ${YELLOW}docker exec -it simuladorbrito-nginx vi /etc/nginx/conf.d/simuladorbrito.conf${NC}"
echo -e "3. Verificar los logs de Nginx: ${YELLOW}docker logs simuladorbrito-nginx${NC}"
echo -e "4. Verificar los logs de la aplicación: ${YELLOW}docker logs simuladorbrito${NC}"
echo -e "5. Comprobar que los recursos estáticos están siendo servidos: ${YELLOW}curl -v http://localhost:3005/_next/static/chunks/main.js${NC}" 