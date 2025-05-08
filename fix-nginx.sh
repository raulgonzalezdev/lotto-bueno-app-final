#!/bin/bash

echo "Creando directorio para archivos estáticos en NGINX..."
docker-compose exec nginx mkdir -p /usr/share/nginx/html

echo "Copiando página de mantenimiento a NGINX..."
docker cp maintenance.html $(docker-compose ps -q nginx):/usr/share/nginx/html/maintenance.html

echo "Verificando la configuración de NGINX..."
docker-compose exec nginx nginx -t

echo "Recargando configuración de NGINX..."
docker-compose exec nginx nginx -s reload

echo "Reiniciando servicio simuladorbrito..."
docker-compose restart simuladorbrito

echo "Verificando logs de simuladorbrito..."
docker-compose logs --tail=50 simuladorbrito

echo "Verificando logs de NGINX para el dominio ahorasi.online..."
docker-compose exec nginx tail -n 50 /var/log/nginx/ahorasi.error.log

echo "Información del contenedor simuladorbrito:"
docker-compose ps simuladorbrito

echo "=== VERIFICANDO CONECTIVIDAD DESDE NGINX A SIMULADORBRITO ==="
docker-compose exec nginx wget --spider -q http://simuladorbrito:3005 || echo "Error: No se puede conectar al servicio simuladorbrito desde NGINX" 