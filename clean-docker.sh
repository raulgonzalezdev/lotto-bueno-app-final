#!/bin/bash

# Colores para la salida
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Iniciando limpieza de Docker (preservando PostgreSQL)...${NC}"

# Obtener el ID del contenedor de PostgreSQL
PG_CONTAINER=$(docker ps -a | grep postgres-1 | awk '{print $1}')

if [ -z "$PG_CONTAINER" ]; then
    echo -e "${RED}No se encontró el contenedor de PostgreSQL${NC}"
else
    echo -e "${GREEN}Contenedor PostgreSQL encontrado: $PG_CONTAINER (será preservado)${NC}"
fi

# Detener todos los contenedores excepto PostgreSQL
echo -e "${YELLOW}Deteniendo contenedores (excepto PostgreSQL)...${NC}"
docker ps -q | grep -v "$PG_CONTAINER" | xargs -r docker stop

# Eliminar contenedores detenidos excepto PostgreSQL
echo -e "${YELLOW}Eliminando contenedores detenidos (excepto PostgreSQL)...${NC}"
docker ps -a -q | grep -v "$PG_CONTAINER" | xargs -r docker rm

# Eliminar imágenes no utilizadas
echo -e "${YELLOW}Eliminando imágenes no utilizadas...${NC}"
docker images -q | grep -v $(docker inspect "$PG_CONTAINER" | grep Image | awk -F'"' '{print $4}') | xargs -r docker rmi

# Eliminar volúmenes huérfanos (excepto los de PostgreSQL)
echo -e "${YELLOW}Eliminando volúmenes huérfanos...${NC}"
PG_VOLUMES=$(docker volume ls -q | grep postgres)
docker volume ls -q | grep -v "$PG_VOLUMES" | xargs -r docker volume rm

# Eliminar redes no utilizadas
echo -e "${YELLOW}Eliminando redes no utilizadas...${NC}"
docker network prune -f

# Eliminar caché de construcción
echo -e "${YELLOW}Eliminando caché de construcción...${NC}"
docker builder prune -f

echo -e "${GREEN}¡Limpieza completada!${NC}"
echo -e "${YELLOW}Resumen de recursos preservados:${NC}"
echo -e "Contenedor PostgreSQL: $PG_CONTAINER"
echo -e "Volúmenes PostgreSQL: $PG_VOLUMES"

# Mostrar estado actual de Docker
echo -e "\n${YELLOW}Estado actual de Docker:${NC}"
echo -e "${GREEN}Contenedores activos:${NC}"
docker ps
echo -e "\n${GREEN}Uso de disco:${NC}"
docker system df 