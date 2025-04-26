FROM node:18-alpine as builder

WORKDIR /app

# Copiar archivos de configuración primero para optimizar capas de Docker
COPY package.json package-lock.json ./
COPY jsconfig.json next.config.js postcss.config.js tailwind.config.js ./

# Configurar npm para manejar dependencias conflictivas
RUN echo 'legacy-peer-deps=true' > .npmrc

# Instalar dependencias primero
RUN npm install --legacy-peer-deps && \
    npm install --legacy-peer-deps -D @tailwindcss/typography daisyui

# Luego copiar el resto del código
COPY . .

# Construir la aplicación
RUN npm run build:standalone

# Imagen de producción
FROM node:18-alpine as runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3002
ENV NEXT_PUBLIC_API_URL=https://applottobueno.com/api

# Copiar dependencias y archivos compilados
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Exponer puerto
EXPOSE 3002

# Comando para iniciar
CMD ["npm", "start"] 