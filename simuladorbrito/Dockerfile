FROM node:18-alpine

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

# Construir la aplicación
RUN npm run build

# Exponer el puerto 3005
EXPOSE 3005

# Comando para iniciar la aplicación
CMD ["npm", "run", "start"]