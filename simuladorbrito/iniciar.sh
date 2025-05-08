#!/bin/bash

# Script simplificado para iniciar el Simulador Electoral Brito
# Usa: ./iniciar.sh [start|stop|restart|logs|status]

# Colores para mensajes
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

# Verificar que estamos en el directorio correcto
if [ ! -f "docker-compose.yml" ]; then
  show_error "No se encontró el archivo docker-compose.yml."
  show_error "Ejecuta este script desde el directorio simuladorbrito."
  exit 1
fi

# Acción a ejecutar según el parámetro
case "$1" in
  start)
    show_message "Iniciando el simulador electoral..."
    docker-compose up -d
    show_message "El simulador está disponible en:"
    show_message "- HTTP local: http://localhost:8081"
    show_message "- HTTPS local: https://localhost:8443"
    show_message "- Dominio: https://ahorasi.online"
    ;;
  
  stop)
    show_message "Deteniendo el simulador electoral..."
    docker-compose down
    show_message "Simulador detenido."
    ;;
  
  restart)
    show_message "Reiniciando el simulador electoral..."
    docker-compose down
    docker-compose up -d
    show_message "Simulador reiniciado."
    ;;
  
  logs)
    show_message "Mostrando logs del simulador..."
    docker-compose logs -f
    ;;
  
  status)
    show_message "Estado actual del simulador:"
    docker-compose ps
    ;;
  
  *)
    show_message "Uso: $0 {start|stop|restart|logs|status}"
    show_message "  start   - Inicia el simulador"
    show_message "  stop    - Detiene el simulador"
    show_message "  restart - Reinicia el simulador"
    show_message "  logs    - Muestra los logs"
    show_message "  status  - Muestra el estado actual"
    ;;
esac 