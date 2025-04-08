# Lotto Bueno App

## Descripción

Esta aplicación es un sistema de gestión de datos electorales utilizando FastAPI, PostgreSQL y Redis.

## Instrucciones para el Backup y Restauración de la Base de Datos

### Backup

Para realizar un backup de la base de datos, utiliza el script `backup.sh`:

```bash
./backup.sh

docker compose --env-file .env up -d --build

uvicorn app.main:app --host 0.0.0.0 --port 8003

copiar el archivo si no existe 

cp id_rsa_1.pem ~/.ssh/id_rsa_1.pem
chmod 600 ~/.ssh/id_rsa_1.pem




ssh -i ~/.ssh/id_rsa_1.pem azureuser@20.233.251.22

-- acceso ssh

ssh -i C:\Users\Dell\.ssh\gcp_lottobueno gqraulpay@34.134.166.180

--copiapr en local desde ssh 
scp -i C:\Users\Dell\.ssh\gcp_lottobueno -r gqraulpay@34.134.166.180:/home/gqraulpay/logs /Users/Dell/Downloads/logs_local



git fetch origin
git reset --hard origin/independiente



git clone https://github.com/raulgonzalezdev/lotto-bueno-app.git

git lfs clone https://github.com/raulgonzalezdev/lotto-bueno-app.git


anexar . env 
docker exec -i b3628ee0f4869b02063474b773a33971208bab4c692f3d618596147cfc567054  sh -c "echo 'POSTGRES_DB=lottobueno\nPOSTGRES_USER=lottobueno\nPOSTGRES_PASSWORD=lottobueno\nDATABASE_URL=postgresql+psycopg://lottobueno:lottobueno@localhost:5432/lottobueno\nAPI_URL_BASE=https://7103.api.greenapi.com/waInstance7103942544\nAPI_TOKEN=1b64dc5c3ccc4d9aa01265ce553b874784d414aa81d64777a0\nREDIS_URL=redis://localhost:6380/0\nFASTAPI_BASE_URL=http://34.134.166.180:8000\nCOMPANY_PHONE_CONTACT=584262837784\nSECRET_KEY=J-yMKNjjVaUJUj-vC-cAun_qlyXH68p55er0WIlgFuo\nALGORITHM=HS256\n0\nHOST=http://34.134.166.180:8000' > /app/.env"


docker exec -i 8a3f28c668181b7317574bfbff717eeadadc76e6cee53fa95fb2fb585515cf25 sh -c "echo 'POSTGRES_DB=lottobueno\nPOSTGRES_USER=lottobueno\nPOSTGRES_PASSWORD=lottobueno\nDATABASE_URL=postgresql+psycopg://lottobueno:lottobueno@localhost:5432/lottobueno\nAPI_URL_BASE=https://7103.api.greenapi.com/waInstance7103942544\nAPI_TOKEN=1b64dc5c3ccc4d9aa01265ce553b874784d414aa81d64777a0\nREDIS_URL=redis://localhost:6380/0\nFASTAPI_BASE_URL=http://34.134.166.180:8000\nCOMPANY_PHONE_CONTACT=584262837784\nSECRET_KEY=J-yMKNjjVaUJUj-vC-cAun_qlyXH68p55er0WIlgFuo\nALGORITHM=HS256\nHOST=http://34.134.166.180:8000' > /app/.env"


echo 'POSTGRES_DB=lottobueno
POSTGRES_USER=lottobueno
POSTGRES_PASSWORD=lottobueno
DATABASE_URL=postgresql+psycopg://lottobueno:lottobueno@postgres:5432/lottobueno
API_URL_BASE=https://7103.api.greenapi.com/waInstance7103942544
API_TOKEN=1b64dc5c3ccc4d9aa01265ce553b874784d414aa81d64
REDIS_URL=redis://localhost:6380/0
FASTAPI_BASE_URL=https://applottobueno.com
COMPANY_PHONE_CONTACT=17867234220
SECRET_KEY=J-yMKNjjVaUJUj-vC-cAun_qlyXH68p55er0WIlgFuo
ALGORITHM=HS256
HOST=https://applottobueno.com
API_TELEGRAM_TOKEN=8187061957:AAEKVKWfBKuECSC7G63qFYzKbZJiFx4N18Q' > .env


echo 'POSTGRES_DB=lottobueno
POSTGRES_USER=lottobueno
POSTGRES_PASSWORD=lottobueno
DATABASE_URL=postgresql+psycopg://lottobueno:lottobueno@postgres:5432/lottobueno
API_URL_BASE=https://7103.api.greenapi.com/waInstance7103942544
API_TOKEN=1b64dc5c3ccc4d9aa01265ce553b874784d414aa81d64777a0
REDIS_URL=redis://localhost:6380/0
FASTAPI_BASE_URL=https://applottobueno.com
COMPANY_PHONE_CONTACT=17867234220
SECRET_KEY=J-yMKNjjVaUJUj-vC-cAun_qlyXH68p55er0WIlgFuo
ALGORITHM=HS256
HOST=https://applottobueno.com
NEXT_PUBLIC_API_URL=https://applottobueno.com
NEXT_PUBLIC_SITE_TITLE=Lotto Bueno
NEXT_PUBLIC_SITE_DESCRIPTION=Participa y Gana con Lotto Bueno
NEXT_PUBLIC_FAVICON_URL=/static/icon.ico
API_TELEGRAM_TOKEN=8187061957:AAEKVKWfBKuECSC7G63qFYzKbZJiFx4N18Q' > .env


   docker exec -it 8fd75fd2984c /bin/bash

https://github.com/raulgonzalezdev/lotto-bueno-app/blob/main/frontend/public/Lottos.png
docker cp /home/soyrauldev/proyectos/Brito/lotto-bueno-app/app/split_csv.py ad3218d05788:/app/app/split_csv.py

aed5f68d9ee6
docker cp .env 215274748a33:/app/app/.env
docker cp /home/soyrauldev/proyectos/Brito/lotto-bueno-app/app/settings.json 8fd75fd2984c:/app/app/settings.json

docker exec -i aaf66128df8d sh -c "PGUSER=lottobueno PGHOST=localhost PGPORT=5432 PGDATABASE=lottobueno PGPASSWORD=lottobueno pg_restore -U lottobueno -h localhost -p 5432 -d lottobueno -v /docker-entrypoint-initdb.d/lottobueno_backup.dump"

docker exec -it 726d2ed68a62 bash

docker system prune -a -f --volumes



chmod -R 755 /apps
chown -R soyrauldev:soyrauldev /apps
ls -ld /apps
cd /apps

# Hacer el script ejecutable
sudo chmod +x /etc/init.d/fix_apps_permissions.sh

# Añadir el script a los scripts de inicio
sudo update-rc.d fix_apps_permissions.sh defaults

# Reiniciar el sistema
sudo reboot

# Verificar los permisos y la propiedad después del reinicio


```

```
apagar las lineas del respaldo antes para luego hacer el respaldo manual

      - ./lottobueno_backup.dump:/docker-entrypoint-initdb.d/lottobueno_backup.dump
      - ./init-db.sh:/docker-entrypoint-initdb.d/init-db.sh
      - ./wait-for-it.sh:/docker-entrypoint-initdb.d/wait-for-it.sh
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql

Instalar Git LFS:

curl -s https://packagecloud.io/install/repositories/github/git-lfs/script.deb.sh | sudo bash

sudo apt-get install git-lfs

git lfs install


1. Dar permisos de sudo a azureuser
Abre una terminal y ejecuta el siguiente comando para agregar azureuser al grupo sudo:

bash
Copiar código
sudo usermod -aG sudo azureuser
2. Dar permisos de Docker a azureuser
Agrega azureuser al grupo docker:

bash
Copiar código
sudo usermod -aG docker azureuser
Reinicia tu sesión para que los cambios surtan efecto:

bash
Copiar código
su - azureuser
3. Asegurar que Docker y Docker Compose se levanten automáticamente
Habilitar el servicio Docker para que inicie automáticamente:

bash
Copiar código
sudo systemctl enable docker
Crear un archivo docker-compose.yml en el directorio donde se encuentra tu proyecto. Asegúrate de que el archivo docker-compose.yml tenga la configuración adecuada para tus contenedores.

Crear un servicio systemd para Docker Compose:

Crea un archivo llamado docker-compose-app.service en /etc/systemd/system/ con el siguiente contenido. Asegúrate de reemplazar /path/to/your/docker-compose con la ruta correcta a tu archivo docker-compose.yml:

bash
Copiar código
sudo nano /etc/systemd/system/docker-compose-app.service
Y agrega el siguiente contenido:

ini
Copiar código
[Unit]
Description=Docker Compose Application Service
Requires=docker.service
After=docker.service

[Service]
WorkingDirectory=/path/to/your/docker-compose
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
Restart=always
User=azureuser

[Install]
WantedBy=multi-user.target
Habilitar el nuevo servicio para que se inicie automáticamente:

bash
Copiar código
sudo systemctl enable docker-compose-app.service
Iniciar el servicio manualmente por primera vez:

bash
Copiar código
sudo systemctl start docker-compose-app.service
```


sudo apt update
sudo apt upgrade -y
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx

sudo nano /etc/nginx/sites-available/default


copiar mi config


sudo ln -s /etc/nginx/sites-available/default /etc/nginx/sites-enabled/

sudo apt install certbot python3-certbot-nginx -y

sudo certbot --nginx -d app.lottobueno.com


docker system prune -a -f --volumes




# hacer un restore local
```
docker cp /apps/lotto-bueno-app/lottobueno_backup.dump 4b7569f1f0e4:/tmp/lottobueno_backup.dump






docker exec -it 4b7569f1f0e4 psql -U lottobueno -d lottobueno -c "DROP TABLE IF EXISTS electores CASCADE;"
docker exec -it 4b7569f1f0e4 psql -U lottobueno -d lottobueno -c "DROP TABLE IF EXISTS centros_votacion CASCADE;"
docker exec -it 4b7569f1f0e4 psql -U lottobueno -d lottobueno -c "DROP TABLE IF EXISTS geograficos CASCADE;"

docker exec -i 4b7569f1f0e4 sh -c "PGUSER=lottobueno PGHOST=localhost PGPORT=5432 PGDATABASE=lottobueno PGPASSWORD=lottobueno pg_restore -U lottobueno -h localhost -p 5432 -d lottobueno -t electores -t centros_votacion -t geograficos -v /tmp/lottobueno_backup.dump"

```
