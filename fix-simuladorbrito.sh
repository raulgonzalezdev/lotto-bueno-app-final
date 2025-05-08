#!/bin/bash

echo "Iniciando proceso de reparación para simuladorbrito..."

echo "1. Verificando el archivo package.json..."
if [ ! -f "simuladorbrito/package.json" ]; then
    echo "ERROR: No se encuentra el archivo package.json. Verifique la estructura de directorios."
    exit 1
fi

echo "2. Verificando script de inicio en package.json..."
grep -q "\"start\":" simuladorbrito/package.json
if [ $? -ne 0 ]; then
    echo "ERROR: No se encuentra el script 'start' en package.json."
    exit 1
fi

echo "3. Deteniendo y eliminando el contenedor de simuladorbrito..."
docker-compose stop simuladorbrito
docker-compose rm -f simuladorbrito

echo "4. Eliminando la imagen de simuladorbrito para reconstruirla..."
docker images --format "{{.Repository}}:{{.Tag}}" | grep simuladorbrito | xargs -r docker rmi

echo "5. Reconstruyendo la imagen de simuladorbrito..."
docker-compose build simuladorbrito

echo "6. Iniciando el servicio simuladorbrito..."
docker-compose up -d simuladorbrito

echo "7. Esperando a que el servicio esté disponible (30 segundos)..."
sleep 30

echo "8. Verificando logs de simuladorbrito..."
docker-compose logs --tail=50 simuladorbrito

echo "9. Verificando si el servicio está escuchando en el puerto 3005..."
docker-compose exec simuladorbrito netstat -tulpn | grep 3005 || echo "ADVERTENCIA: No se detecta que simuladorbrito esté escuchando en el puerto 3005."

echo "10. Verificando rutas en NGINX para ahorasi.online..."
docker-compose exec nginx cat /etc/nginx/conf.d/default.conf | grep -A 20 "server_name ahorasi.online"

echo "11. Probando conexión desde NGINX a simuladorbrito..."
docker-compose exec nginx wget --spider -q http://simuladorbrito:3005 && echo "Conexión exitosa desde NGINX a simuladorbrito" || echo "ERROR: No se puede conectar desde NGINX a simuladorbrito"

echo "12. Reiniciando NGINX..."
docker-compose restart nginx

echo "Proceso de reparación completado. Intente acceder a https://ahorasi.online nuevamente." 