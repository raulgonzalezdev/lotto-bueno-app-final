#!/bin/sh

# Este script se encarga de obtener o renovar certificados SSL para los dominios configurados

# Esperar a que Nginx esté en funcionamiento
echo "Esperando a que Nginx esté listo..."
sleep 10

# Obtener certificados para applottobueno.com
echo "Intentando obtener certificados para applottobueno.com..."
certbot certonly --webroot -w /var/www/certbot \
  --email organizacionparametrica@gmail.com --agree-tos --no-eff-email \
  -d applottobueno.com -d www.applottobueno.com \
  --expand --non-interactive || echo "Error o certificado ya existente para applottobueno.com"

# Obtener certificados para banempre.online  
echo "Intentando obtener certificados para banempre.online..."
certbot certonly --webroot -w /var/www/certbot \
  --email organizacionparametrica@gmail.com --agree-tos --no-eff-email \
  -d banempre.online -d www.banempre.online \
  --expand --non-interactive || echo "Error o certificado ya existente para banempre.online"

# Obtener certificados para ahorasi.online
echo "Intentando obtener certificados para ahorasi.online..."
certbot certonly --webroot -w /var/www/certbot \
  --email organizacionparametrica@gmail.com --agree-tos --no-eff-email \
  -d ahorasi.online -d www.ahorasi.online \
  --expand --non-interactive || echo "Error o certificado ya existente para ahorasi.online"

echo "Certificados SSL procesados. Configurando renovación automática..."

# Mantener el contenedor en ejecución para renovaciones periódicas
trap exit TERM
while :; do
  certbot renew --quiet
  sleep 12h
done 