FROM node:18-alpine AS builder

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración del proyecto
COPY package*.json ./

# Instalar dependencias
RUN npm install --legacy-peer-deps

# Copiar el código de la aplicación
COPY . .

# Establecer variables de entorno necesarias
ENV NODE_ENV=production
ENV PORT=3005
ENV HOST=0.0.0.0
ENV NEXT_PUBLIC_ASSET_PREFIX=https://simuladorparametrica.com

# Construir la aplicación
RUN npm run build

# Segunda etapa de la imagen - más pequeña
FROM node:18-alpine AS runner
WORKDIR /app

# Copiar solo lo necesario
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Establecer variables de entorno
ENV NODE_ENV=production
ENV PORT=3005
ENV HOST=0.0.0.0
ENV NEXT_PUBLIC_ASSET_PREFIX=https://simuladorparametrica.com

# Exponer el puerto 3005
EXPOSE 3005

# Comando para iniciar la aplicación usando server.js generado por standalone
CMD ["node", "server.js"]