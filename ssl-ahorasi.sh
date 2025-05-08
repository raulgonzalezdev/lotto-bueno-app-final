#!/bin/bash

# Script para obtener certificados SSL para ahorasi.online
# usando certbot en modo standalone a través de Docker

# Colores para la salida
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Función para mostrar mensajes
show_message() {
  echo -e "${GREEN}[INFO]${NC} $1"
}

show_warning() {
  echo -e "${YELLOW}[ADVERTENCIA]${NC} $1"
}

show_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# Crear directorios necesarios
mkdir -p nginx/certs
mkdir -p certbot/conf
mkdir -p certbot/www
mkdir -p certbot/logs

# Detener el contenedor Nginx temporalmente para liberar el puerto 80
show_message "Deteniendo el servicio Nginx para liberar el puerto 80..."
docker-compose stop nginx

# Usar Docker para ejecutar certbot 
show_message "Obteniendo certificados SSL para ahorasi.online..."
docker run --rm \
  -v "$(pwd)/certbot/conf:/etc/letsencrypt" \
  -v "$(pwd)/certbot/logs:/var/log/letsencrypt" \
  -v "$(pwd)/certbot/www:/var/www/certbot" \
  --net=host \
  certbot/certbot certonly --standalone \
  --preferred-challenges http \
  --email admin@ahorasi.online \
  --agree-tos \
  --no-eff-email \
  -d ahorasi.online \
  -d www.ahorasi.online

# Verificar si se obtuvieron los certificados
if [ -d "$(pwd)/certbot/conf/live/ahorasi.online" ]; then
  show_message "Certificados obtenidos correctamente."
  
  # Copiar los certificados al directorio de Nginx
  show_message "Copiando certificados al directorio de Nginx..."
  cp "$(pwd)/certbot/conf/live/ahorasi.online/fullchain.pem" "$(pwd)/nginx/certs/ahorasi.fullchain.pem"
  cp "$(pwd)/certbot/conf/live/ahorasi.online/privkey.pem" "$(pwd)/nginx/certs/ahorasi.privkey.pem"

  # Ajustar permisos
  chmod 644 "$(pwd)/nginx/certs/ahorasi.fullchain.pem"
  chmod 644 "$(pwd)/nginx/certs/ahorasi.privkey.pem"
  
  show_message "Certificados copiados correctamente."
else
  show_error "No se pudieron obtener los certificados SSL."
  show_error "Verifica la configuración DNS para ahorasi.online."
  show_error "Asegúrate de que el dominio apunte a esta IP y que el puerto 80 esté abierto."
fi

# Reiniciar Nginx
show_message "Reiniciando el servicio Nginx..."
docker-compose start nginx

# Verificar si Nginx está en funcionamiento
if docker-compose ps | grep -q "nginx.*Up"; then
  show_message "Nginx reiniciado correctamente."
else
  show_error "Nginx no se pudo reiniciar. Verifica la configuración y los logs."
fi

show_message "Proceso de configuración de certificados SSL completado."
show_message "Ahora debes asegurarte de que el servicio simuladorbrito esté en ejecución." 