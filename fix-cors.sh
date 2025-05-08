#!/bin/bash

echo "=== SOLUCIÓN DE PROBLEMAS DE CORS PARA AHORASI.ONLINE ==="

echo "1. Reiniciando NGINX con configuración CORS actualizada..."
docker-compose restart nginx

echo "2. Verificando configuración CORS en NGINX..."
docker-compose exec nginx grep -B 5 -A 5 "Access-Control-Allow-Origin" /etc/nginx/conf.d/default.conf

echo "3. Reconstruyendo la aplicación simuladorbrito con la nueva configuración CORS..."
docker-compose build simuladorbrito
docker-compose stop simuladorbrito
docker-compose rm -f simuladorbrito
docker-compose up -d simuladorbrito

echo "4. Esperando a que el servicio esté disponible (20 segundos)..."
sleep 20

echo "5. Verificando configuración CORS en simuladorbrito..."
echo "   Logs de simuladorbrito:"
docker-compose logs --tail=20 simuladorbrito

echo "6. Haciendo una prueba de solicitud OPTIONS para verificar encabezados CORS..."
docker-compose exec nginx curl -i -X OPTIONS -H "Origin: https://ahorasi.online" http://simuladorbrito:3005/

echo "7. Verificando conexión directa a simuladorbrito..."
echo "   Intenta acceder a http://34.134.166.180:3005 directamente"

echo "8. Reiniciando NGINX para aplicar todos los cambios..."
docker-compose restart nginx

echo "Proceso de corrección de CORS completado. Intenta acceder nuevamente a https://ahorasi.online" 