#!/bin/bash

echo "Verificando certificados de ahorasi.online..."
ls -la nginx/certs/ahorasi.*

echo "Verificando servicio de simuladorbrito en docker-compose..."
grep -A 10 "simuladorbrito:" docker-compose.yml

echo "Verificando configuración de nginx para ahorasi.online..."
grep -A 30 "server_name ahorasi.online" nginx.conf

echo "Verificando que el archivo .env existe para simuladorbrito..."
if [ -f "simuladorbrito/.env" ]; then
    echo "El archivo .env existe"
    cat simuladorbrito/.env
else
    echo "ERROR: El archivo .env no existe en simuladorbrito/"
fi

echo "Todo parece estar configurado correctamente para ahorasi.online. Puedes ejecutar './deploy.sh' para iniciar el despliegue." 