#!/bin/bash

# Script completo para inicializar, configurar y desplegar el simulador electoral
# Este script combina el proceso de configuración SSL con el despliegue del simulador

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

# Verificar si el servicio principal de Nginx está en ejecución
if ! docker-compose ps | grep -q "nginx.*Up"; then
  show_warning "El servicio principal de Nginx no está en ejecución."
  show_warning "Es recomendable iniciarlo para que la redirección funcione correctamente."
  
  read -p "¿Deseas iniciar el servicio principal de Nginx? (s/n): " start_nginx
  if [ "$start_nginx" = "s" ] || [ "$start_nginx" = "S" ]; then
    docker-compose up -d nginx
    show_message "Servicio Nginx iniciado."
  else
    show_warning "Continuando sin iniciar el servicio principal de Nginx."
    show_warning "La redirección desde ahorasi.online no funcionará correctamente."
  fi
fi

# Función para configurar SSL utilizando el script ssl-ahorasi.sh
configure_ssl() {
  show_message "Configurando certificados SSL para ahorasi.online..."
  
  # Verificar si existe el script ssl-ahorasi.sh
  if [ ! -f "./ssl-ahorasi.sh" ]; then
    show_error "No se encontró el script ssl-ahorasi.sh."
    return 1
  fi
  
  # Ejecutar el script de configuración SSL
  chmod +x ./ssl-ahorasi.sh
  ./ssl-ahorasi.sh
  
  # Verificar el resultado
  if [ $? -eq 0 ]; then
    show_message "Configuración SSL completada correctamente."
    return 0
  else
    show_error "Ha ocurrido un error durante la configuración SSL."
    return 1
  fi
}

# Función para desplegar el simulador
deploy_simulator() {
  show_message "Iniciando el despliegue del simulador..."
  
  # Cambiar al directorio del simulador
  cd simuladorbrito
  
  # Verificar si existe el script deploy-simulador.sh
  if [ -f "./deploy-simulador.sh" ]; then
    chmod +x ./deploy-simulador.sh
    ./deploy-simulador.sh
  else
    show_warning "No se encontró el script deploy-simulador.sh."
    show_message "Realizando el despliegue manual..."
    
    # Crear directorios necesarios
    mkdir -p nginx/conf.d
    mkdir -p nginx/html
    mkdir -p certbot/conf
    mkdir -p certbot/www
    mkdir -p certbot/logs
    
    # Construir e iniciar los contenedores
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
    
    # Verificar el estado
    docker-compose ps
  fi
  
  # Volver al directorio raíz
  cd ..
}

# Función principal
main() {
  show_message "=== INICIALIZACIÓN DEL SIMULADOR ELECTORAL ==="
  
  # Preguntar si desea configurar SSL
  read -p "¿Deseas configurar los certificados SSL? (s/n): " configure_ssl_option
  if [ "$configure_ssl_option" = "s" ] || [ "$configure_ssl_option" = "S" ]; then
    configure_ssl
  else
    show_warning "Omitiendo la configuración SSL."
    show_warning "El simulador funcionará pero puede tener advertencias de seguridad en el navegador."
  fi
  
  # Desplegar el simulador
  deploy_simulator
  
  # Mostrar información final
  show_message "=== CONFIGURACIÓN COMPLETADA ==="
  show_message "El simulador electoral debería estar disponible en:"
  show_message "- HTTP local: http://localhost:8081"
  show_message "- HTTPS local: https://localhost:8443"
  show_message "- Dominio público: https://ahorasi.online"
  
  show_message "\nPara verificar el estado:"
  show_message "./iniciar-simulador.sh status"
  
  show_message "\nPara ver los logs:"
  show_message "./iniciar-simulador.sh logs"
}

# Ejecutar la función principal
main 