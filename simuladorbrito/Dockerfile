FROM node:18-alpine AS base

# Instalar dependencias solo cuando se modifique package.json
FROM base AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

# Construir la aplicación
FROM base AS builder
WORKDIR /app

# Definir variables de entorno
ENV NODE_ENV=production
ENV PORT=3005
ENV HOST=0.0.0.0
ENV NEXT_PUBLIC_ASSET_PREFIX=https://ahorasi.online
ENV NEXT_PUBLIC_BASE_URL=https://ahorasi.online
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Construir la aplicación con output standalone configurado en next.config.js
RUN npm run build && \
    if [ ! -d .next/standalone ]; then \
    echo "Error: La compilación no generó la carpeta standalone. Verifica la configuración de Next.js." && \
    exit 1; \
    fi

# Imagen de producción
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3005
ENV HOST=0.0.0.0
ENV NEXT_PUBLIC_ASSET_PREFIX=https://ahorasi.online
ENV NEXT_PUBLIC_BASE_URL=https://ahorasi.online
ENV NEXT_TELEMETRY_DISABLED=1

# Crear un usuario no root para ejecutar la aplicación
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar archivos de public (estáticos)
COPY --from=builder /app/public ./public

# Copiar los archivos de construcción con los permisos adecuados
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Asegurar que los archivos estáticos tengan los permisos adecuados
RUN find ./.next/static -type d -exec chmod 755 {} \;
RUN find ./.next/static -type f -exec chmod 644 {} \;
RUN find ./public -type d -exec chmod 755 {} \;
RUN find ./public -type f -exec chmod 644 {} \;

# Cambiar al usuario nextjs para ejecución segura
USER nextjs

# Exponer el puerto
EXPOSE 3005

# Comando para iniciar la aplicación
CMD ["node", "server.js"]