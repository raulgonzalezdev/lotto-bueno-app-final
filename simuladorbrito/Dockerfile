FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Determinar el contexto de construcción
# Si estamos construyendo desde la raíz del proyecto, usaremos ./simuladorbrito
# Si estamos construyendo desde la carpeta simuladorbrito, usaremos ./
COPY package*.json ./

# Instalar dependencias
RUN npm install --legacy-peer-deps

# Copiar el código de la aplicación
COPY . .

# Construir la aplicación
RUN npm run build

# Exponer el puerto 3005
EXPOSE 3005

# Comando para iniciar la aplicación
CMD ["npm", "run", "start"]