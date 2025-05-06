# Simulador Electoral 2025 - José Brito Gobernador

Simulador de votación para las elecciones regionales de Anzoátegui 2025.

## Estructura del proyecto

Este simulador está desarrollado con Next.js y muestra una papeleta electoral interactiva con los partidos que respaldan a José Brito como candidato a gobernador de Anzoátegui.

## Imágenes requeridas

Para que el simulador funcione correctamente, debes agregar las siguientes imágenes:

### Carpeta `/public/partidos/`

Agrega los logos de los partidos políticos con estos nombres:
- `copei.png` - Logo de COPEI
- `psuv.png` - Logo de PSUV
- `tupamaro.png` - Logo de TUPAMARO
- `ppt.png` - Logo de PPT
- `futuro.png` - Logo de FUTURO
- `somos.png` - Logo de SOMOS VENEZUELA
- `mep.png` - Logo de MEP
- `podemos.png` - Logo de PODEMOS
- `pcv.png` - Logo de PCV
- `alianza.png` - Logo de ALIANZA PARA EL CAMBIO
- `upv.png` - Logo de UPV
- `enamorate.png` - Logo de ENAMÓRATE
- `ora.png` - Logo de ORA
- `verde.png` - Logo de PARTIDO VERDE
- `udp.png` - Logo de UDP

### Carpeta `/public/candidatos/`

Agrega la foto del candidato:
- `brito.jpg` - Foto de José Brito

### Carpeta `/public/`

Agrega la imagen del tarjetón electoral:
- `tarjeton-electoral.png` - Imagen del tarjetón electoral completo

## Cómo ejecutar el simulador

1. Asegúrate de tener Node.js instalado (versión 14 o superior)
2. Instala las dependencias: `npm install`
3. Ejecuta el servidor de desarrollo: `npm run dev`
4. Abre tu navegador en [http://localhost:3000](http://localhost:3000)

## Personalización

Puedes personalizar el simulador modificando los siguientes archivos:
- `pages/index.js` - Página principal con mensaje de bienvenida
- `pages/simulador.js` - Página del simulador de votación
- `styles/globals.css` - Estilos globales del simulador

## Despliegue

Para generar una versión optimizada para producción:

```bash
npm run build
npm start
```

O si prefieres exportar una versión estática:

```bash
npm run build
npm run export
```

Los archivos generados estarán en la carpeta `out` y podrás subirlos a cualquier servidor web. 