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

# Verificar los logs del túnel
echo -e "\n${YELLOW}Últimos logs del túnel de Cloudflare:${NC}"
docker logs --tail 30 simuladorbrito-cloudflared

# Verificar si el servicio responde localmente
echo -e "\n${YELLOW}Verificando si el simulador responde localmente:${NC}"
if curl -s http://localhost:3005 > /dev/null; then
  echo -e "${GREEN}✓ El simulador responde localmente en el puerto 3005${NC}"
else
  echo -e "${RED}✗ El simulador NO responde localmente en el puerto 3005${NC}"
fi

# Verificar conexión con Cloudflare
echo -e "\n${YELLOW}Verificando conexión con Cloudflare usando traceroute:${NC}"
tracert -h 3 simuladorparametrica.com

# Verificar resolución DNS
echo -e "\n${YELLOW}Verificando resolución DNS del dominio:${NC}"
nslookup simuladorparametrica.com

echo -e "\n${YELLOW}Si el túnel sigue sin funcionar, verifica los siguientes puntos:${NC}"
echo -e "1. Que el token del túnel sea válido"
echo -e "2. Que el dominio esté correctamente configurado en el panel de Cloudflare"
echo -e "3. Que no haya un firewall bloqueando la conexión saliente"
echo -e "4. Que el servicio simuladorbrito esté funcionando correctamente"

echo -e "\n${GREEN}Para solucionar problemas de túnel:${NC}"
echo -e "- Reiniciar el contenedor: docker restart simuladorbrito-cloudflared"
echo -e "- Ver logs en tiempo real: docker logs -f simuladorbrito-cloudflared" 