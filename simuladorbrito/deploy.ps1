# Script de PowerShell para desplegar el Simulador Electoral Brito
# Compatible con Windows

# Colores para mensajes
$Green = [ConsoleColor]::Green
$Yellow = [ConsoleColor]::Yellow
$Red = [ConsoleColor]::Red

function Show-Message ($Message, $Color = $Green) {
    Write-Host "[INFO] $Message" -ForegroundColor $Color
}

function Show-Warning ($Message) {
    Write-Host "[ADVERTENCIA] $Message" -ForegroundColor $Yellow
}

function Show-Error ($Message) {
    Write-Host "[ERROR] $Message" -ForegroundColor $Red
}

# Encabezado
Show-Message "=== Iniciando despliegue de Simulador Brito ===" $Green

# Verificar Docker
try {
    docker --version | Out-Null
} catch {
    Show-Error "Docker no está instalado o no está en el PATH."
    Show-Error "Instale Docker Desktop para Windows: https://docs.docker.com/desktop/windows/install/"
    exit 1
}

# Verificar Docker Compose
try {
    docker compose version | Out-Null
} catch {
    Show-Error "Docker Compose no está instalado o no está en el PATH."
    Show-Error "Asegúrese de que Docker Desktop está correctamente instalado."
    exit 1
}

# Crear directorios necesarios
Show-Message "Creando directorios necesarios..." $Yellow
if (-not (Test-Path "nginx\conf.d")) {
    New-Item -Path "nginx\conf.d" -ItemType Directory -Force | Out-Null
}
if (-not (Test-Path "nginx\html")) {
    New-Item -Path "nginx\html" -ItemType Directory -Force | Out-Null
}

# Verificar archivo de configuración de nginx
if (-not (Test-Path "nginx\conf.d\simuladorbrito.conf")) {
    Show-Message "No se encontró la configuración de Nginx, creando configuración predeterminada..." $Yellow
    @"
server {
    listen 80;
    
    location / {
        proxy_pass http://simuladorbrito:3005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade `$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host `$host;
        proxy_set_header X-Real-IP `$remote_addr;
        proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto `$scheme;
    }
}

server {
    listen 443 ssl;
    
    ssl_certificate /etc/nginx/ssl/ahorasi.fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/ahorasi.privkey.pem;
    
    location / {
        proxy_pass http://simuladorbrito:3005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade `$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host `$host;
        proxy_set_header X-Real-IP `$remote_addr;
        proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto `$scheme;
    }
}
"@ | Out-File -FilePath "nginx\conf.d\simuladorbrito.conf" -Encoding utf8
    Show-Message "Configuración de Nginx creada correctamente." $Green
}

# Verificar certificados SSL
$CertFound = $false
$ParentPath = (Get-Item -Path "..").FullName
$FullchainPath = Join-Path -Path $ParentPath -ChildPath "nginx\certs\ahorasi.fullchain.pem"
$PrivkeyPath = Join-Path -Path $ParentPath -ChildPath "nginx\certs\ahorasi.privkey.pem"

if ((Test-Path $FullchainPath) -and (Test-Path $PrivkeyPath)) {
    Show-Message "Certificados SSL encontrados en ..\nginx\certs\" $Green
    $CertFound = $true
} else {
    Show-Warning "No se encontraron certificados SSL en la ubicación predeterminada."
    Show-Warning "Buscando certificados en otras ubicaciones..."
    
    # Buscar en ubicaciones alternativas
    $FoundFullchain = Get-ChildItem -Path $ParentPath -Recurse -Filter "ahorasi.fullchain.pem" -ErrorAction SilentlyContinue | Select-Object -First 1
    $FoundPrivkey = Get-ChildItem -Path $ParentPath -Recurse -Filter "ahorasi.privkey.pem" -ErrorAction SilentlyContinue | Select-Object -First 1
    
    if ($FoundFullchain -and $FoundPrivkey) {
        Show-Message "Certificados encontrados en:" $Green
        Show-Message "  Fullchain: $($FoundFullchain.FullName)" $Green
        Show-Message "  Privkey: $($FoundPrivkey.FullName)" $Green
        
        # Crear directorio de certificados si no existe
        $CertDir = Join-Path -Path $ParentPath -ChildPath "nginx\certs"
        if (-not (Test-Path $CertDir)) {
            New-Item -Path $CertDir -ItemType Directory -Force | Out-Null
        }
        
        # Copiar certificados a la ubicación estándar
        Copy-Item -Path $FoundFullchain.FullName -Destination $FullchainPath -Force
        Copy-Item -Path $FoundPrivkey.FullName -Destination $PrivkeyPath -Force
        
        Show-Message "Certificados copiados a la ubicación estándar." $Green
        $CertFound = $true
    } else {
        Show-Warning "No se encontraron certificados SSL en ninguna ubicación."
        Show-Warning "El simulador se iniciará sin soporte HTTPS."
    }
}

# Detener y eliminar contenedores existentes
Show-Message "Deteniendo contenedores existentes de Simulador Brito..." $Yellow
docker compose down --remove-orphans

# Limpiar imágenes antiguas
Show-Message "Limpiando imágenes antiguas..." $Yellow
docker image prune -f

# Reconstruir las imágenes
Show-Message "Construyendo contenedores de Simulador Brito..." $Green
docker compose build --no-cache

# Iniciar servicios
Show-Message "Iniciando servicios de Simulador Brito..." $Green
docker compose up -d

Show-Message "=== Despliegue de Simulador Brito completado con éxito ===" $Green
Show-Message "El Simulador Brito ahora está disponible en https://ahorasi.online" $Green
Write-Host ""
Show-Message "Para verificar el estado: docker compose ps" $Yellow
Show-Message "Para ver logs: docker compose logs -f" $Yellow

# Mostrar URLs disponibles
Write-Host "=============================================================" -ForegroundColor $Green
Write-Host "¡IMPORTANTE! URLs disponibles:" -ForegroundColor $Green
Write-Host "=============================================================" -ForegroundColor $Green
Write-Host "Dominio principal: https://ahorasi.online" -ForegroundColor $Yellow
Write-Host "HTTP local: http://localhost:8081" -ForegroundColor $Yellow
Write-Host "HTTPS local: https://localhost:8443" -ForegroundColor $Yellow
Write-Host "URL directa Next.js: http://localhost:3005 (para depuración)" -ForegroundColor $Yellow
Write-Host "=============================================================" -ForegroundColor $Green

# Verificar estado de los contenedores
Show-Message "Verificando el estado de los contenedores..." $Yellow
Start-Sleep -Seconds 5
docker compose ps

# Verificar logs
Show-Message "Mostrando los últimos logs del servicio simuladorbrito..." $Yellow
docker logs --tail 10 simuladorbrito

Show-Message "Mostrando los últimos logs del servicio Nginx..." $Yellow
docker logs --tail 10 simuladorbrito-nginx 