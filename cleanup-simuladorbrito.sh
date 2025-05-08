#!/bin/bash

echo "Buscando contenedores relacionados con simuladorbrito..."
CONTAINERS=$(docker ps -a --format "{{.Names}}" | grep -i simuladorbrito)

if [ -z "$CONTAINERS" ]; then
    echo "No se encontraron contenedores con el nombre simuladorbrito."
else
    echo "Se encontraron los siguientes contenedores:"
    echo "$CONTAINERS"
    
    echo "Deteniendo y eliminando contenedores..."
    for CONTAINER in $CONTAINERS; do
        echo "Deteniendo $CONTAINER..."
        docker stop $CONTAINER
        
        echo "Eliminando $CONTAINER..."
        docker rm $CONTAINER
    done
    
    echo "Contenedores de simuladorbrito eliminados correctamente."
fi

# Verificar si hay alguna imagen relacionada con simuladorbrito
IMAGES=$(docker images --format "{{.Repository}}:{{.Tag}}" | grep -i simuladorbrito)

if [ -n "$IMAGES" ]; then
    echo "Se encontraron las siguientes imágenes relacionadas con simuladorbrito:"
    echo "$IMAGES"
    
    read -p "¿Deseas eliminar estas imágenes también? (s/n): " RESPUESTA
    if [ "$RESPUESTA" = "s" ] || [ "$RESPUESTA" = "S" ]; then
        for IMAGE in $IMAGES; do
            echo "Eliminando imagen $IMAGE..."
            docker rmi $IMAGE
        done
        echo "Imágenes eliminadas correctamente."
    else
        echo "Las imágenes no fueron eliminadas."
    fi
fi

echo "Limpieza completada. Ahora puedes ejecutar ./deploy.sh para iniciar el nuevo despliegue." 