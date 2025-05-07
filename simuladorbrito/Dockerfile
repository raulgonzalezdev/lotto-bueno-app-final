FROM node:18-alpine

WORKDIR /app

# Copiar archivos de configuración del proyecto
COPY package*.json ./

# Instalar dependencias
RUN npm install --legacy-peer-deps

# Copiar el resto del código
COPY . .

# Construir la aplicación
RUN npm run build

# Exponer el puerto 3005
EXPOSE 3005

# Comando para iniciar la aplicación
CMD ["npm", "start"] 