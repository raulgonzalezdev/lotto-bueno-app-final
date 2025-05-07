#!/bin/bash

# Script para determinar el contexto de construcción y desplegar correctamente

# Colores para mensajes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Detectar si estamos en la carpeta simuladorbrito o en la raíz del proyecto
CURRENT_DIR=$(basename "$PWD")
PARENT_DIR=$(basename "$(dirname "$PWD")")

echo -e "${YELLOW}Detectando contexto de construcción...${NC}"

if [ "$CURRENT_DIR" = "simuladorbrito" ]; then
    echo -e "${GREEN}Estás en la carpeta simuladorbrito (DESPLIEGUE INDEPENDIENTE)${NC}"
    echo -e "Usando comandos de docker-compose directamente."
    
    # Verificamos si existe la red lotto-bueno-network
    if ! docker network inspect lotto-bueno-network >/dev/null 2>&1; then
        echo -e "${YELLOW}Creando red lotto-bueno-network...${NC}"
        docker network create lotto-bueno-network
    else
        echo -e "${GREEN}La red lotto-bueno-network ya existe.${NC}"
    fi
    
    # Ejecutamos el despliegue independiente
    echo -e "${GREEN}Ejecutando despliegue independiente...${NC}"
    echo -e "Usando: docker compose build"
    echo ""
    
    echo -e "${YELLOW}Comando a ejecutar:${NC}"
    echo -e "docker compose -f docker-compose.yml build"
    echo -e "${YELLOW}Seguido de:${NC}"
    echo -e "docker compose -f docker-compose.yml up -d"
    
elif [ -d "./simuladorbrito" ]; then
    echo -e "${GREEN}Estás en la carpeta raíz del proyecto (DESPLIEGUE INTEGRADO)${NC}"
    echo -e "Necesitas usar comandos con el contexto correcto."
    
    echo -e "${YELLOW}Comando para construir simuladorbrito desde la raíz:${NC}"
    echo -e "docker compose build simuladorbrito"
    echo -e "${YELLOW}Seguido de:${NC}"
    echo -e "docker compose up -d simuladorbrito"
    
else
    echo -e "${RED}No puedo determinar el contexto correctamente.${NC}"
    echo -e "Asegúrate de estar en la carpeta simuladorbrito o en la raíz del proyecto."
    exit 1
fi

echo ""
echo -e "${GREEN}=============================================================${NC}"
echo -e "${GREEN}¡IMPORTANTE! Configuración de Cloudflare:${NC}"
echo -e "${GREEN}=============================================================${NC}"
echo -e "Asegúrate de configurar el túnel en Cloudflare para que apunte a:"
echo -e "${YELLOW}localhost:3005${NC}"
echo -e "En el panel de Cloudflare Zero Trust > Access > Tunnels"
echo -e "${GREEN}=============================================================${NC}" 