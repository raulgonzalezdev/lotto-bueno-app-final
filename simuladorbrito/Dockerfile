# Etapa base para el simulador electoral
FROM node:18-alpine as simuladorbrito

# Argumentos de build y variables de entorno
ARG NEXT_PUBLIC_ASSET_PREFIX
ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_SITE_NAME
ARG NEXT_PUBLIC_SITE_DESCRIPTION

# Establecer variables de entorno
ENV NODE_ENV=production
ENV PORT=3005
ENV HOST=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_ASSET_PREFIX=${NEXT_PUBLIC_ASSET_PREFIX:-https://ahorasi.online}
ENV NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL:-https://ahorasi.online}
ENV NEXT_PUBLIC_SITE_NAME=${NEXT_PUBLIC_SITE_NAME:-Simulador Electoral José Brito}
ENV NEXT_PUBLIC_SITE_DESCRIPTION=${NEXT_PUBLIC_SITE_DESCRIPTION:-Simulador de votación para las elecciones regionales de Anzoátegui 2025}

# Directorio de trabajo
WORKDIR /app

# Copia los archivos de configuración y dependencias
COPY package.json package-lock.json* ./
COPY .npmrc ./

# Instala dependencias
RUN npm install --legacy-peer-deps

# Copia el código fuente completo
COPY . .

# Construye la aplicación
RUN npm run build

# Expone el puerto que usa la aplicación
EXPOSE 3005

# Comando para iniciar la aplicación
CMD ["node", "server.js"]