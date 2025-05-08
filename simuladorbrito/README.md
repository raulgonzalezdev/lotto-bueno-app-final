# Simulador Electoral José Brito

Aplicación para simular procesos electorales regionales en Anzoátegui.

## Requisitos

- Docker
- Docker Compose

## Estructura de archivos

- `Dockerfile`: Configuración para construir la imagen de Docker
- `docker-compose.yml`: Configuración de servicios (simulador, nginx, etc.)
- `deploy.sh`: Script principal para el despliegue completo (Linux/Mac)
- `deploy.ps1`: Script principal para el despliegue completo (Windows)
- `iniciar.sh`: Script simple para gestionar el simulador (start, stop, logs, etc.)

## Scripts disponibles

### 1. Script de despliegue completo

#### En Linux/Mac:
```bash
# Hacer el script ejecutable
chmod +x deploy.sh

# Ejecutar el despliegue completo
./deploy.sh
```

#### En Windows:
```powershell
# Abrir PowerShell y ejecutar
.\deploy.ps1
```

Los scripts realizan las siguientes tareas:
- Crean los directorios necesarios
- Detectan si hay certificados SSL existentes y los utilizan
- Construyen y despliegan la aplicación
- Muestran logs y estado

### 2. Script de gestión (Linux/Mac)

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

### 3. Comandos para Windows:

```powershell
# Iniciar el simulador
docker-compose up -d

# Detener el simulador
docker-compose down

# Ver los logs
docker-compose logs -f

# Ver el estado
docker-compose ps

# Reconstruir e iniciar
docker-compose up -d --build
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

Los scripts de despliegue buscarán automáticamente los certificados en varias ubicaciones y los copiarán al lugar correcto si los encuentran.

## Solución de problemas

Si tienes problemas con los argumentos de construcción, verifica que el formato en `docker-compose.yml` sea correcto:

```yaml
build:
  context: .
  dockerfile: Dockerfile
  args:
    NEXT_PUBLIC_ASSET_PREFIX: "https://ahorasi.online"
    NEXT_PUBLIC_BASE_URL: "https://ahorasi.online"
    NEXT_PUBLIC_SITE_NAME: "Simulador Electoral José Brito"
```

Observa que los argumentos usan el formato `NOMBRE: "valor"` y no `- NOMBRE=valor`.