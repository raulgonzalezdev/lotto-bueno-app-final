#!/bin/bash

# Script para iniciar y gestionar el simulador electoral Brito
# Este script facilita el despliegue y mantenimiento del simulador

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

# Verificar si estamos en el directorio correcto
if [ ! -d "./simuladorbrito" ]; then
  show_error "No se encontró el directorio del simulador."
  show_error "Ejecuta este script desde el directorio raíz del proyecto."
  exit 1
fi

# Verificar si el servicio principal está en ejecución
if ! docker-compose ps | grep -q "nginx.*Up"; then
  show_warning "El servicio principal de Nginx no está en ejecución."
  show_warning "Es recomendable tenerlo activo para que la redirección funcione."
fi

# Cambiar al directorio del simulador
cd simuladorbrito

# Acciones disponibles
case "$1" in
  start)
    show_message "Iniciando el simulador electoral..."
    docker-compose up -d
    show_message "El simulador está disponible en:"
    show_message "HTTP: http://localhost:8081"
    show_message "HTTPS: https://localhost:8443"
    show_message "O a través de la redirección configurada en:"
    show_message "https://ahorasi.online"
    ;;
  
  stop)
    show_message "Deteniendo el simulador electoral..."
    docker-compose down
    show_message "El simulador se ha detenido."
    ;;
  
  restart)
    show_message "Reiniciando el simulador electoral..."
    docker-compose down
    docker-compose up -d
    show_message "El simulador se ha reiniciado."
    ;;
  
  logs)
    show_message "Mostrando logs del simulador..."
    docker-compose logs -f
    ;;
  
  build)
    show_message "Reconstruyendo los contenedores del simulador..."
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
    show_message "Reconstrucción completada."
    ;;

  status)
    show_message "Estado actual del simulador:"
    docker-compose ps
    ;;
  
  *)
    show_message "Uso: $0 {start|stop|restart|logs|build|status}"
    show_message "  start   - Inicia el simulador electoral"
    show_message "  stop    - Detiene el simulador electoral"
    show_message "  restart - Reinicia el simulador electoral"
    show_message "  logs    - Muestra los logs del simulador"
    show_message "  build   - Reconstruye los contenedores del simulador"
    show_message "  status  - Muestra el estado actual del simulador"
    ;;
esac

# Volver al directorio original
cd .. 