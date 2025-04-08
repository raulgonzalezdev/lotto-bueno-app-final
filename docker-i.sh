#!/bin/bash

# Actualizar la lista de paquetes y sus versiones
sudo apt-get update

# Instalar paquetes requeridos para agregar un nuevo repositorio sobre HTTPS
sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common

# Agregar la clave GPG oficial del repositorio de Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

# Agregar el repositorio de Docker a las fuentes de APT
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"

# Actualizar la lista de paquetes luego de agregar el repositorio de Docker
sudo apt-get update

# Instalar Docker CE (Community Edition)
sudo apt-get install -y docker-ce

# Agregar el usuario al grupo de Docker para ejecutar comandos de Docker sin sudo
sudo usermod -aG docker $USER

# Descargar la versión actual de Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Dar permisos de ejecución al binario de Docker Compose
sudo chmod +x /usr/local/bin/docker-compose

# Instalar paquetes previos necesarios para agregar un repositorio PPA
sudo apt-get install -y software-properties-common

# Agregar el repositorio PPA para Python 3.8
sudo add-apt-repository -y ppa:deadsnakes/ppa

# Actualizar nuevamente después de agregar el repositorio PPA
sudo apt-get update

# Instalar Python 3.8
sudo apt-get install -y python3.8 python3.8-venv python3.8-dev

# Mostrar las versiones instaladas de Docker, Docker Compose y Python
docker --version
docker-compose --version
python3.8 --version

echo "Instalación completada con éxito."
