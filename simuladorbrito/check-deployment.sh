#!/bin/bash

# Script para verificar el estado del despliegue
# Ejecutar después de deploy.sh para validar que todo funciona correctamente

set -e

# Colores para mensajes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Verificando estado del despliegue de Simulador Brito ===${NC}"

# Verificar estado de los contenedores
echo -e "${YELLOW}Estado de los contenedores:${NC}"
docker compose ps

# Verificar logs del simulador
echo -e "\n${YELLOW}Últimos logs del simulador:${NC}"
docker logs --tail 20 simuladorbrito

# Verificar logs de Cloudflare Tunnel
echo -e "\n${YELLOW}Últimos logs del túnel de Cloudflare:${NC}"
docker logs --tail 20 simuladorbrito-cloudflared

# Verificar si el servicio responde localmente
echo -e "\n${YELLOW}Verificando si el simulador responde localmente:${NC}"
if curl -s http://localhost:3005 > /dev/null; then
  echo -e "${GREEN}✓ El simulador responde localmente en el puerto 3005${NC}"
else
  echo -e "${RED}✗ El simulador NO responde localmente en el puerto 3005${NC}"
fi

# Verificar si el dominio está accesible
echo -e "\n${YELLOW}Verificando si el dominio simuladorparametrica.com es accesible:${NC}"
if curl -s https://simuladorparametrica.com > /dev/null; then
  echo -e "${GREEN}✓ El dominio simuladorparametrica.com es accesible${NC}"
else
  echo -e "${RED}✗ El dominio simuladorparametrica.com NO es accesible${NC}"
  echo -e "${YELLOW}Nota: Si el dominio no responde, verifica los logs de Cloudflare para más detalles.${NC}"
fi

echo -e "\n${GREEN}=== Verificación completada ===${NC}"
echo -e "Si encuentras problemas, revisa los logs completos con: docker logs simuladorbrito | less"
echo -e "Para ver logs en tiempo real: docker logs -f simuladorbrito" 