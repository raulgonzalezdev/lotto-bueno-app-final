#!/bin/bash

# Variables de conexión a la base de datos
DB_USER="lottobueno"
DB_HOST="localhost"
DB_PORT="5532"
DB_NAME="lottobueno"
BACKUP_FILE="lottobueno_backup.dump"

# Comando de restauración
PGPASSFILE=~/.pgpass pg_restore -U $DB_USER -h $DB_HOST -p $DB_PORT -d $DB_NAME -v $BACKUP_FILE

echo "Restoration completed from: $BACKUP_FILE"

