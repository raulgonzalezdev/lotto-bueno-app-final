# Script para descargar imágenes para el simulador electoral
# URL base
$baseUrl = "https://yosigoconmorel.com/simulador/img"

# Lista de imágenes a descargar
$imagenes = @(
    "logo_morel.png",
    "logo_cne.png",
    "union_cambio.png",
    "mra.png",
    "conde.png",
    "fuerza_vecinal.png",
    "un_nuevo_tiempo.png",
    "ecologico.png",
    "avanzada.png",
    "arepa_digital.png",
    "min_unidad.png",
    "bandera_roja.png",
    "primero_justicia.png",
    "lapiz.png",
    "une.png",
    "soluciones.png",
    "copei.png",
    "mr.png",
    "primero_venezuela.png",
    "ad.png",
    "unidad_venezuela.png",
    "el_cambio.png",
    "cambiemos.png",
    "venezuela_unidad.png",
    "voluntad_popular.png"
)

# Crear directorio de destino si no existe
$partidosDir = "D:\lotto-bueno-clean\simuladorbrito\public\partidos"
if (-not (Test-Path $partidosDir)) {
    New-Item -ItemType Directory -Path $partidosDir -Force
}

# Descargar cada imagen
foreach ($imagen in $imagenes) {
    $url = "$baseUrl/$imagen"
    $destino = Join-Path $partidosDir $imagen
    
    Write-Host "Descargando $url a $destino"
    try {
        Invoke-WebRequest -Uri $url -OutFile $destino
        Write-Host "✓ Descargada: $imagen" -ForegroundColor Green
    } catch {
        Write-Host "✗ Error al descargar: $imagen - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`nProceso completado. Revisa la carpeta $partidosDir para ver las imágenes descargadas." -ForegroundColor Cyan 