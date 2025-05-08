# Simulador Electoral José Brito

Aplicación para simular procesos electorales regionales en Anzoátegui.

## Requisitos

- Docker
- Docker Compose

## Estructura de archivos

- `Dockerfile`: Configuración para construir la imagen de Docker
- `docker-compose.yml`: Configuración de servicios (simulador, nginx, etc.)
- `deploy.sh`: Script principal para el despliegue completo
- `iniciar.sh`: Script simple para gestionar el simulador (start, stop, logs, etc.)

## Scripts disponibles

### 1. Script de despliegue completo

```bash
# Hacer el script ejecutable
chmod +x deploy.sh

# Ejecutar el despliegue completo
./deploy.sh
```

Este script:
- Crea los directorios necesarios
- Detecta si hay certificados SSL existentes y los utiliza
- Construye y despliega la aplicación
- Muestra logs y estado

### 2. Script de gestión

```bash
# Hacer el script ejecutable
chmod +x iniciar.sh

# Iniciar el simulador
./iniciar.sh start

# Detener el simulador
./iniciar.sh stop

# Ver los logs
./iniciar.sh logs

# Ver el estado
./iniciar.sh status

# Reiniciar el simulador
./iniciar.sh restart
```

## Acceso a la aplicación

Una vez desplegada, la aplicación estará disponible en:

- **HTTP local**: http://localhost:8081
- **HTTPS local**: https://localhost:8443
- **Dominio principal**: https://ahorasi.online

## Estructura de Docker

- **simuladorbrito**: Servidor Next.js (puerto 3005)
- **nginx**: Proxy inverso con SSL (puertos 8081 y 8443)

## Uso de certificados SSL

El sistema está configurado para usar certificados existentes ubicados en:
```
/nginx/certs/ahorasi.fullchain.pem
/nginx/certs/ahorasi.privkey.pem
```

Si estos certificados no existen, se deben obtener antes del despliegue.

## Estructura del proyecto

- `nginx/conf.d/` - Configuración de Nginx
- `