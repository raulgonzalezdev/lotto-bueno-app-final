#!/bin/bash

# Script para verificar el estado del túnel de Cloudflare
set -e

# Colores para mensajes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Verificando el estado del túnel de Cloudflare ===${NC}"

# Verificar si los contenedores están ejecutándose
echo -e "${YELLOW}Estado de los contenedores:${NC}"
docker compose ps

# Verificar los logs de cada servicio
echo -e "\n${YELLOW}Verificando logs de simulador:${NC}"
docker logs --tail 10 simuladorbrito

echo -e "\n${YELLOW}Verificando logs de nginx:${NC}"
docker logs --tail 10 simuladorbrito-nginx

echo -e "\n${YELLOW}Verificando logs del túnel:${NC}"
docker logs --tail 20 simuladorbrito-cloudflared

# Verificar si los servicios responden
echo -e "\n${YELLOW}Verificando si el simulador responde directamente:${NC}"
if curl -s http://localhost:3005 > /dev/null; then
  echo -e "${GREEN}✓ El simulador responde localmente en el puerto 3005${NC}"
else
  echo -e "${RED}✗ El simulador NO responde localmente en el puerto 3005${NC}"
fi

echo -e "\n${YELLOW}Verificando si nginx responde:${NC}"
if curl -s http://localhost:8090 > /dev/null; then
  echo -e "${GREEN}✓ Nginx responde localmente en el puerto 8090${NC}"
else
  echo -e "${RED}✗ Nginx NO responde localmente en el puerto 8090${NC}"
fi

# Verificar conexión con Cloudflare y resolución DNS del dominio
echo -e "\n${YELLOW}Verificando conexión con Cloudflare (esto puede tardar unos segundos):${NC}"
ping -n 2 simuladorparametrica.com || echo -e "${YELLOW}No se pudo hacer ping, pero esto puede ser normal debido a configuraciones de firewall.${NC}"

echo -e "\n${YELLOW}Verificando DNS del dominio simuladorparametrica.com:${NC}"
nslookup simuladorparametrica.com

echo -e "\n${YELLOW}Si el túnel no funciona, verifique:${NC}"
echo -e "1. Configuración del token de Cloudflare"
echo -e "2. Conectividad de red (puertos salientes)"
echo -e "3. Configuración de Nginx"
echo -e "4. Estado del servicio simuladorbrito"

echo -e "\n${GREEN}Para reiniciar los servicios:${NC}"
echo -e "- Reiniciar todo: ${YELLOW}docker compose restart${NC}"
echo -e "- Reiniciar solo el túnel: ${YELLOW}docker restart simuladorbrito-cloudflared${NC}"
echo -e "- Reconstruir todo desde cero: ${YELLOW}./rebuild.sh${NC}" 