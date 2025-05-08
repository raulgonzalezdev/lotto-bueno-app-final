#!/bin/bash

# Script para obtener certificados SSL para ahorasi.online
# usando certbot en modo standalone

# Detener el contenedor Nginx temporalmente para liberar el puerto 80
echo "Deteniendo el servicio Nginx para liberar el puerto 80..."
docker-compose stop nginx

# Usar certbot para obtener los certificados
echo "Obteniendo certificados SSL para ahorasi.online..."
certbot certonly --standalone \
  --preferred-challenges http \
  --email organizacionparametrica@gmail.com \
  --agree-tos \
  --no-eff-email \
  -d ahorasi.online \
  -d www.ahorasi.online

# Crear directorio para los certificados en nginx si no existe
mkdir -p nginx/certs

# Copiar los certificados al directorio de Nginx
echo "Copiando certificados al directorio de Nginx..."
cp /etc/letsencrypt/live/ahorasi.online/fullchain.pem nginx/certs/ahorasi.fullchain.pem
cp /etc/letsencrypt/live/ahorasi.online/privkey.pem nginx/certs/ahorasi.privkey.pem

# Ajustar permisos
chmod 644 nginx/certs/ahorasi.fullchain.pem
chmod 644 nginx/certs/ahorasi.privkey.pem

# Reiniciar Nginx
echo "Reiniciando el servicio Nginx..."
docker-compose start nginx

echo "Certificados SSL para ahorasi.online configurados correctamente."
echo "Ahora debes asegurarte de que el servicio simuladorbrito esté en ejecución." 