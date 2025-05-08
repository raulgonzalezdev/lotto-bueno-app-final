# Etapa base para el simulador electoral
FROM node:18-alpine as simuladorbrito

# Establecer variables de entorno
ENV NODE_ENV=production
ENV PORT=3005
ENV HOST=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

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

# Comando para iniciar la aplicación correctamente para output: standalone
CMD ["node", ".next/standalone/server.js"]