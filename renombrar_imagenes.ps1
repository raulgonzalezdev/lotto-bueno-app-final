# Script para renombrar las imágenes descargadas a los nombres que requiere el simulador
$partidosDir = "D:\lotto-bueno-clean\simuladorbrito\public\partidos"

# Mapeo de nombres originales a los nombres requeridos por el simulador
$mapeoNombres = @{
    "copei.png" = "copei.png"  # Este ya coincide
    "psuv.png" = "psuv.png"  # Este nombre podría no existir, usar alguna alternativa
    "mr.png" = "ppt.png"  # Asumiendo que este es el Partido Patria Para Todos
    "primero_justicia.png" = "tupamaro.png"  # Asignación temporal
    "union_cambio.png" = "futuro.png"  # Asignación temporal
    "arepa_digital.png" = "somos.png"  # Asignación temporal
    "min_unidad.png" = "mep.png"  # Asignación temporal
    "fuerza_vecinal.png" = "podemos.png"  # Asignación temporal
    "bandera_roja.png" = "pcv.png"  # Asignación temporal
    "un_nuevo_tiempo.png" = "alianza.png"  # Asignación temporal
    "soluciones.png" = "upv.png"  # Asignación temporal
    "ecologico.png" = "enamorate.png"  # Asignación temporal
    "avanzada.png" = "ora.png"  # Asignación temporal
    "lapiz.png" = "verde.png"  # Asignación temporal
    "unidad_venezuela.png" = "udp.png"  # Asignación temporal
}

# Verificar si existe el directorio
if (-not (Test-Path $partidosDir)) {
    Write-Host "El directorio $partidosDir no existe. Ejecuta primero el script de descarga de imágenes." -ForegroundColor Red
    exit
}

# Renombrar las imágenes
foreach ($original in $mapeoNombres.Keys) {
    $rutaOriginal = Join-Path $partidosDir $original
    $nuevaRuta = Join-Path $partidosDir $mapeoNombres[$original]
    
    if (Test-Path $rutaOriginal) {
        # Si el archivo destino ya existe, hacer copia de respaldo
        if ((Test-Path $nuevaRuta) -and ($original -ne $mapeoNombres[$original])) {
            $respaldo = "$nuevaRuta.bak"
            Copy-Item -Path $nuevaRuta -Destination $respaldo -Force
            Write-Host "Se ha creado una copia de respaldo: $respaldo" -ForegroundColor Yellow
        }
        
        # Si el origen y destino son diferentes, copiar el archivo
        if ($original -ne $mapeoNombres[$original]) {
            Copy-Item -Path $rutaOriginal -Destination $nuevaRuta -Force
            Write-Host "✓ Se copió $original como $($mapeoNombres[$original])" -ForegroundColor Green
        } else {
            Write-Host "✓ El archivo $original ya tiene el nombre correcto" -ForegroundColor Green
        }
    } else {
        Write-Host "✗ No se encontró el archivo $original" -ForegroundColor Red
    }
}

# Buscar archivos adicionales para completar los que faltan
$nombresFaltantes = @()
foreach ($nombreRequerido in $mapeoNombres.Values) {
    $rutaRequerida = Join-Path $partidosDir $nombreRequerido
    if (-not (Test-Path $rutaRequerida)) {
        $nombresFaltantes += $nombreRequerido
    }
}

if ($nombresFaltantes.Count -gt 0) {
    Write-Host "`nLos siguientes archivos no se han encontrado y deberás agregarlos manualmente:" -ForegroundColor Yellow
    foreach ($faltante in $nombresFaltantes) {
        Write-Host "- $faltante" -ForegroundColor Yellow
    }
}

Write-Host "`nProceso completado. Revisa los archivos en $partidosDir" -ForegroundColor Cyan 