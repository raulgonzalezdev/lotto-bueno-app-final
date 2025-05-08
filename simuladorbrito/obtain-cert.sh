#!/bin/bash

# Script para obtener certificados SSL para ahorasi.online

# Asegurarse de que certbot está disponible
if ! [ -x "$(command -v docker)" ]; then
  echo "Error: docker no está instalado." >&2
  exit 1
fi

# Crear directorios necesarios si no existen
mkdir -p certbot/conf certbot/www certbot/logs

# Detener el contenedor de certbot anterior si existe
docker stop simuladorbrito-certbot || true
docker rm simuladorbrito-certbot || true

# Obtener certificados
docker run --rm -it \
  -v "$(pwd)/certbot/conf:/etc/letsencrypt" \
  -v "$(pwd)/certbot/www:/var/www/certbot" \
  -v "$(pwd)/certbot/logs:/var/log/letsencrypt" \
  certbot/certbot:latest \
  certonly --webroot -w /var/www/certbot \
  --email organizacionparametrica@gmail.com --agree-tos --no-eff-email \
  -d ahorasi.online -d www.ahorasi.online \
  --expand --force-renewal

echo "¡Certificados obtenidos! Reiniciando Nginx para aplicar los cambios..."
docker exec simuladorbrito-nginx nginx -s reload

echo "Proceso completado. Los certificados se renovarán automáticamente." 