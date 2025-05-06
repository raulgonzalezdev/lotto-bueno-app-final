# Script para descargar imágenes adicionales para el simulador electoral
# URL base
$baseUrl = "https://yosigoconmorel.com/simulador/img"

# Crear directorios de destino si no existen
$candidatosDir = "D:\lotto-bueno-clean\simuladorbrito\public\candidatos"
$publicDir = "D:\lotto-bueno-clean\simuladorbrito\public"

if (-not (Test-Path $candidatosDir)) {
    New-Item -ItemType Directory -Path $candidatosDir -Force
}

# Intentar descargar la imagen del candidato
$urlCandidato = "$baseUrl/brito.jpg"
if (-not (Test-Path $urlCandidato)) {
    # Intentar variaciones del nombre de archivo
    $variaciones = @("brito.jpg", "brito.png", "candidato.jpg", "candidato.png", "morel.jpg", "morel.png")
    $encontrado = $false
    
    foreach ($variacion in $variaciones) {
        $url = "$baseUrl/$variacion"
        $destino = Join-Path $candidatosDir "brito.jpg"
        
        try {
            Write-Host "Intentando descargar $url"
            Invoke-WebRequest -Uri $url -OutFile $destino -ErrorAction Stop
            Write-Host "✓ Imagen de candidato descargada como: brito.jpg" -ForegroundColor Green
            $encontrado = $true
            break
        } catch {
            Write-Host "No se encontró $variacion" -ForegroundColor Yellow
        }
    }
    
    if (-not $encontrado) {
        Write-Host "⚠️ No se pudo encontrar la imagen del candidato. Deberás agregarla manualmente." -ForegroundColor Red
    }
} else {
    $destino = Join-Path $candidatosDir "brito.jpg"
    Invoke-WebRequest -Uri $urlCandidato -OutFile $destino
    Write-Host "✓ Imagen de candidato descargada: brito.jpg" -ForegroundColor Green
}

# Intentar descargar el tarjetón electoral
$urlTarjeton = "$baseUrl/tarjeton-electoral.png"
if (-not (Test-Path $urlTarjeton)) {
    # Intentar variaciones del nombre de archivo
    $variaciones = @("tarjeton-electoral.png", "tarjeton.png", "tarjeton_electoral.png", "tarjeton-completo.png", "papeleta.png")
    $encontrado = $false
    
    foreach ($variacion in $variaciones) {
        $url = "$baseUrl/$variacion"
        $destino = Join-Path $publicDir "tarjeton-electoral.png"
        
        try {
            Write-Host "Intentando descargar $url"
            Invoke-WebRequest -Uri $url -OutFile $destino -ErrorAction Stop
            Write-Host "✓ Tarjetón electoral descargado como: tarjeton-electoral.png" -ForegroundColor Green
            $encontrado = $true
            break
        } catch {
            Write-Host "No se encontró $variacion" -ForegroundColor Yellow
        }
    }
    
    if (-not $encontrado) {
        Write-Host "⚠️ No se pudo encontrar el tarjetón electoral. Deberás agregarlo manualmente." -ForegroundColor Red
    }
} else {
    $destino = Join-Path $publicDir "tarjeton-electoral.png"
    Invoke-WebRequest -Uri $urlTarjeton -OutFile $destino
    Write-Host "✓ Tarjetón electoral descargado: tarjeton-electoral.png" -ForegroundColor Green
}

Write-Host "`nProceso completado. Verifica que tengas todas las imágenes necesarias." -ForegroundColor Cyan 