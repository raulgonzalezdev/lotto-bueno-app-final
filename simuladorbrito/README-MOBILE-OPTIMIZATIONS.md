# Optimizaciones para Dispositivos Móviles - Simulador Electoral José Brito

Este documento describe las optimizaciones realizadas para mejorar la experiencia en dispositivos móviles en el Simulador Electoral de José Brito.

## Cambios implementados

### 1. Diseño responsivo mejorado
- Implementación de tarjetas con proporción 2:1 para los partidos políticos
- Optimización del espacio vertical en móviles para mostrar todas las tarjetas
- Reducción del espacio entre filas para aprovechar mejor la pantalla

### 2. Componentes adaptables
- Actualización del componente `PartidoCard` para aceptar un prop `isMobile`
- Modificación de `PartidosList` para adaptarse mejor a pantallas pequeñas
- Ajuste de tamaños de fuentes y espaciados en modo móvil

### 3. Optimización de imágenes
- Mejora en la visualización de logos de partidos en tarjetas adaptando el `object-fit`
- Implementación de contenedores con proporciones fijas para mostrar correctamente las imágenes
- Ajustes en la resolución de imágenes para cargas más rápidas en móviles

### 4. Mejoras de UI/UX
- Adición de un botón X para cerrar/regresar
- Implementación de la tecla Escape para navegación alternativa
- Eliminación de la rotación automática, reemplazada por un diseño responsivo
- Reducción del tamaño de cabeceras y pie de página en móviles

### 5. Optimizaciones técnicas
- Corregido problema de duplicación en middleware.js
- Prevención de zoom no deseado en dispositivos móviles
- Mejora en el manejo de eventos táctiles
- Aplicación de los colores institucionales consistentemente (#25346d azul y #ffcc00 amarillo)

### 6. Estilos globales
- Adición de media queries específicas para dispositivos móviles
- Eliminación del highlight al tocar en dispositivos táctiles
- Optimización de las transiciones para un rendimiento más fluido

## Uso del simulador

El simulador ahora funciona de manera óptima tanto en dispositivos de escritorio como móviles:

1. En pantallas grandes: se muestra una matriz completa 7x7 de partidos
2. En pantallas móviles: se muestra una versión optimizada con menos espacios vacíos

El diseño mantiene los colores institucionales y el eslogan "JOSÉ BRITO BIENESTAR • PROGRESO • DESARROLLO" en todas las resoluciones.

## Notas adicionales

- No se requiere rotación del dispositivo, la aplicación se adapta automáticamente
- El modo oscuro está preparado en la estructura de estilos pero no está activado
- El simulador está optimizado para todas las resoluciones de dispositivos modernos 