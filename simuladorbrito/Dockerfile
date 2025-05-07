FROM node:18-alpine

WORKDIR /simuladorbrito

# Copia los archivos de configuración y el código fuente
COPY ./simuladorbrito/package.json ./simuladorbrito/package-lock.json* ./
COPY ./simuladorbrito /simuladorbrito

# Instalar dependencias
RUN npm install --legacy-peer-deps

# Copiar el resto del código
COPY . .

# Construir la aplicación
RUN npm run build

# Exponer el puerto 3005
EXPOSE 3005

# Comando para iniciar la aplicación
CMD ["npm", "run", "start"]