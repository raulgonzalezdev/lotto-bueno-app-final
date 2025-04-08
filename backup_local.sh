#!/bin/bash

# Variables
CONTAINER_ID="62c22ad7caee"
LOCAL_BACKUP_PATH="/home/soyrauldev/proyectos/Brito/lotto-bueno-app/lottobueno_backup.dump"
REMOTE_BACKUP_PATH="/tmp/lottobueno_backup.dump"

# Crear el script de backup
cat <<EOF > backup.sh
#!/bin/bash

DB_USER="lottobueno"
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="lottobueno"
BACKUP_FILE="$REMOTE_BACKUP_PATH"

PGPASSFILE=~/.pgpass pg_dump -U \$DB_USER -h \$DB_HOST -p \$DB_PORT -d \$DB_NAME -F c -b -v -f \$BACKUP_FILE

echo "Backup completed: \$BACKUP_FILE"
EOF

# Copiar el script al contenedor
docker cp backup.sh $CONTAINER_ID:/tmp/backup.sh

# Ejecutar el script de backup en el contenedor
docker exec -it $CONTAINER_ID bash -c "chmod +x /tmp/backup.sh && /tmp/backup.sh"

# Copiar el archivo de backup del contenedor a la máquina local
docker cp $CONTAINER_ID:$REMOTE_BACKUP_PATH $LOCAL_BACKUP_PATH

# Limpiar el script de backup del contenedor
docker exec -it $CONTAINER_ID bash -c "rm /tmp/backup.sh $REMOTE_BACKUP_PATH"

# Limpiar el script de backup de la máquina local
#rm backup.sh

echo "Backup file copied to: $LOCAL_BACKUP_PATH"
