#!/bin/sh

# Este script se encarga de obtener o renovar certificados SSL para los dominios configurados

# Esperar a que Nginx esté en funcionamiento
echo "Esperando a que Nginx esté listo..."
sleep 10

# Dominios a certificar
DOMAINS=("applottobueno.com" "www.applottobueno.com" "banempre.online" "www.banempre.online" "ahorasi.online" "www.ahorasi.online")

# Correo para notificaciones
EMAIL="organizacionparametrica@gmail.com"

# Comprobar si los certificados ya existen
for DOMAIN in "${DOMAINS[@]}"
do
  # Extraer el dominio principal (sin www)
  MAIN_DOMAIN=$(echo $DOMAIN | sed -E 's/^www\.//')
  
  # Verificar si ya existe el certificado
  if [ ! -d "/etc/letsencrypt/live/$MAIN_DOMAIN" ]; then
    echo "Obteniendo certificado para $DOMAIN..."
    
    # Usar el método webroot para validación
    certbot certonly --webroot -w /var/www/certbot \
      --email $EMAIL --agree-tos --no-eff-email \
      -d $DOMAIN --expand
      
    echo "Certificado obtenido para $DOMAIN"
  else
    echo "El certificado para $DOMAIN ya existe"
  fi
done

# Configurar renovación automática
echo "Configurando renovación automática de certificados..."
echo "0 0,12 * * * certbot renew --quiet" > /etc/crontabs/root

echo "Inicialización de certificados SSL completada."

# Mantener el contenedor en ejecución para renovaciones
while :; do
  certbot renew --quiet
  sleep 12h
done 