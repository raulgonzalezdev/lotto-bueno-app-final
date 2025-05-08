#!/bin/bash

# Script para iniciar el simulador electoral usando certificados existentes
# Este script no intenta generar certificados nuevos

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

# Verificar si estamos en el directorio raíz del proyecto
if [ ! -d "./simuladorbrito" ]; then
  show_error "No se encontró el directorio del simulador."
  show_error "Ejecuta este script desde el directorio raíz del proyecto."
  exit 1
fi

# Verificar si existen los certificados
if [ ! -f "./nginx/certs/ahorasi.fullchain.pem" ] || [ ! -f "./nginx/certs/ahorasi.privkey.pem" ]; then
  show_warning "No se encontraron los certificados en los directorios esperados."
  show_warning "Verificando si existen en otra ubicación..."
  
  # Intentar buscar los certificados en ubicaciones alternativas
  fullchain_path=$(find . -name "ahorasi.fullchain.pem" -type f 2>/dev/null | head -n 1)
  privkey_path=$(find . -name "ahorasi.privkey.pem" -type f 2>/dev/null | head -n 1)
  
  if [ -n "$fullchain_path" ] && [ -n "$privkey_path" ]; then
    show_message "Se encontraron certificados en:"
    show_message "Fullchain: $fullchain_path"
    show_message "Privkey: $privkey_path"
  else
    show_error "No se pudieron encontrar los certificados SSL necesarios."
    show_error "Asegúrate de que los archivos ahorasi.fullchain.pem y ahorasi.privkey.pem existen."
    exit 1
  fi
fi

# Verificar si el servicio principal de Nginx está en ejecución
if ! docker-compose ps | grep -q "nginx.*Up"; then
  show_warning "El servicio principal de Nginx no está en ejecución."
  show_warning "Es recomendable tenerlo activo para la redirección."
  
  read -p "¿Deseas iniciar el servicio principal de Nginx? (s/n): " start_nginx
  if [ "$start_nginx" = "s" ] || [ "$start_nginx" = "S" ]; then
    show_message "Iniciando el servicio principal de Nginx..."
    docker-compose up -d nginx
  fi
fi

# Entrar al directorio del simulador
cd simuladorbrito

# Verificar y crear directorios necesarios de nginx si no existen
if [ ! -d "./nginx/conf.d" ]; then
  show_message "Creando directorios para la configuración de nginx..."
  mkdir -p ./nginx/conf.d
  mkdir -p ./nginx/html
fi

# Construir e iniciar los servicios del simulador
show_message "Construyendo e iniciando el simulador..."
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Verificar estado de los servicios
show_message "Verificando estado de los servicios..."
docker-compose ps

# Mostrar información de acceso
show_message "\n=== SIMULADOR ELECTORAL DESPLEGADO ==="
show_message "El simulador está disponible en:"
show_message "- HTTP local: http://localhost:8081"
show_message "- HTTPS local: https://localhost:8443"
show_message "- Dominio público: https://ahorasi.online"
show_message "\nPara ver los logs del simulador:"
show_message "cd simuladorbrito && docker-compose logs -f"

# Volver al directorio original
cd .. 