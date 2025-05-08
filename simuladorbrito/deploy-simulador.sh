#!/bin/bash

# Script para desplegar el simulador electoral
# Incluye pasos para construir, configurar y ejecutar el simulador

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

# Verifica la existencia del Dockerfile
if [ ! -f "Dockerfile" ]; then
  show_error "No se encontró el Dockerfile en el directorio actual."
  exit 1
fi

# Verifica si Docker está instalado
if ! command -v docker >/dev/null 2>&1; then
  show_error "Docker no está instalado. Por favor, instala Docker antes de continuar."
  exit 1
fi

# Verifica si docker-compose está instalado
if ! command -v docker-compose >/dev/null 2>&1; then
  show_error "Docker Compose no está instalado. Por favor, instala Docker Compose antes de continuar."
  exit 1
fi

# Función para comprobar las configuraciones de nginx
check_nginx_config() {
  if [ ! -d "nginx/conf.d" ]; then
    show_warning "El directorio nginx/conf.d no existe. Creándolo..."
    mkdir -p nginx/conf.d
  fi

  if [ ! -f "nginx/conf.d/simuladorbrito.conf" ]; then
    show_warning "El archivo de configuración de nginx no existe."
    show_warning "Asegúrate de configurar correctamente el archivo nginx/conf.d/simuladorbrito.conf"
  fi
}

# Función para comprobar directorio de certbot
check_certbot_dir() {
  if [ ! -d "certbot/conf" ]; then
    show_warning "El directorio certbot/conf no existe. Creándolo..."
    mkdir -p certbot/conf
  fi

  if [ ! -d "certbot/www" ]; then
    show_warning "El directorio certbot/www no existe. Creándolo..."
    mkdir -p certbot/www
  fi

  if [ ! -d "certbot/logs" ]; then
    show_warning "El directorio certbot/logs no existe. Creándolo..."
    mkdir -p certbot/logs
  fi
}

# Limpiar contenedores anteriores
cleanup() {
  show_message "Limpiando instalaciones anteriores..."
  docker-compose down -v
  show_message "Limpieza completada."
}

# Construir los contenedores
build_containers() {
  show_message "Construyendo los contenedores del simulador..."
  docker-compose build --no-cache
  show_message "Construcción completada."
}

# Iniciar los servicios
start_services() {
  show_message "Iniciando los servicios del simulador..."
  docker-compose up -d
  show_message "Servicios iniciados correctamente."
}

# Verificar estado de servicios
check_services() {
  show_message "Verificando el estado de los servicios..."
  docker-compose ps
  
  # Verificar si el servicio de simulador está en ejecución
  if docker-compose ps | grep -q "simuladorbrito.*Up"; then
    show_message "El simulador está en ejecución correctamente."
  else
    show_error "El simulador no está en ejecución. Verifica los logs con 'docker-compose logs simuladorbrito'."
  fi
  
  # Verificar si nginx está en ejecución
  if docker-compose ps | grep -q "simuladorbrito-nginx.*Up"; then
    show_message "El servidor Nginx está en ejecución correctamente."
  else
    show_error "El servidor Nginx no está en ejecución. Verifica los logs con 'docker-compose logs nginx'."
  fi
}

# Mostrar información de acceso
show_access_info() {
  show_message "El simulador electoral está disponible en:"
  show_message "HTTP local: http://localhost:8081"
  show_message "HTTPS local: https://localhost:8443"
  show_message "Dominio público: https://ahorasi.online"
  
  show_message "\nPara ver los logs del simulador:"
  show_message "docker-compose logs -f simuladorbrito"
  
  show_message "\nPara detener el simulador:"
  show_message "docker-compose down"
}

# Función principal
main() {
  show_message "Iniciando el despliegue del simulador electoral..."
  
  # Comprobar directorios necesarios
  check_nginx_config
  check_certbot_dir
  
  # Preguntar si desea limpiar instalaciones anteriores
  read -p "¿Deseas limpiar instalaciones anteriores? (s/n): " clean_option
  if [ "$clean_option" = "s" ] || [ "$clean_option" = "S" ]; then
    cleanup
  fi
  
  # Construir e iniciar servicios
  build_containers
  start_services
  
  # Verificar estado y mostrar información
  check_services
  show_access_info
}

# Ejecutar función principal
main 