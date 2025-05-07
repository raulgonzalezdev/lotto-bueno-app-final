#!/bin/bash

# Script para diagnosticar problemas de rendimiento y carga
set -e

# Colores para mensajes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Diagnóstico de rendimiento del Simulador Brito ===${NC}"

# Verificar el estado de recursos del sistema
echo -e "${YELLOW}Verificando recursos del sistema:${NC}"
echo -e "CPU y memoria:"
top -b -n 1 | head -n 20

echo -e "\n${YELLOW}Espacio en disco:${NC}"
df -h

# Verificar el estado de los contenedores
echo -e "\n${YELLOW}Estado de los contenedores:${NC}"
docker compose ps

# Verificar el uso de recursos por contenedor
echo -e "\n${YELLOW}Uso de recursos por contenedor:${NC}"
docker stats --no-stream simuladorbrito simuladorbrito-nginx simuladorbrito-cloudflared

# Verificar los logs de nginx para errores comunes
echo -e "\n${YELLOW}Buscando errores comunes en logs de nginx:${NC}"
docker logs simuladorbrito-nginx 2>&1 | grep -E "error|failed|warn" | tail -n 10

# Verificar los registros de cloudflared para problemas de conexión
echo -e "\n${YELLOW}Buscando problemas de conexión en cloudflared:${NC}"
docker logs simuladorbrito-cloudflared 2>&1 | grep -E "error|failed|warn|unable" | tail -n 10

# Prueba de latencia a la aplicación
echo -e "\n${YELLOW}Prueba de latencia a la aplicación:${NC}"
time curl -s -o /dev/null http://localhost:3005/ || echo -e "${RED}No se pudo conectar al simulador${NC}"

echo -e "\n${YELLOW}Prueba de latencia a nginx:${NC}"
time curl -s -o /dev/null http://localhost:8080/ || echo -e "${RED}No se pudo conectar a nginx${NC}"

# Verificar archivos estáticos importantes
echo -e "\n${YELLOW}Verificando tamaño de archivos estáticos:${NC}"
docker exec simuladorbrito du -sh /app/.next/static/* /app/public/*

echo -e "\n${BLUE}Recomendaciones para mejorar rendimiento:${NC}"
echo -e "1. Si el sitio carga intermitentemente, considera limpiar la caché de Cloudflare para tu dominio"
echo -e "   Puedes hacerlo desde el panel de Cloudflare en la sección 'Caché' -> 'Purgar caché'"
echo -e "2. Si el tráfico es alto, considera aumentar los recursos asignados al contenedor nginx"
echo -e "3. En algunos casos, deshabilitar JavaScript en el navegador y volver a habilitarlo puede ayudar"
echo -e "4. Prueba acceder desde diferentes redes (móvil, otra conexión) para descartar problemas de red local"
echo -e "5. Verifica si hay problemas en la infraestructura de Cloudflare desde: https://www.cloudflarestatus.com/"

echo -e "\n${YELLOW}Para limpiar la caché del navegador:${NC}"
echo -e "- Chrome: Presiona Ctrl+Shift+Del, selecciona 'Imágenes y archivos almacenados en caché' y haz clic en 'Borrar datos'"
echo -e "- Firefox: Presiona Ctrl+Shift+Del, selecciona 'Caché' y haz clic en 'Limpiar ahora'"
echo -e "- Edge: Presiona Ctrl+Shift+Del, selecciona 'Archivos e imágenes en caché' y haz clic en 'Borrar ahora'" 