#!/bin/bash

# Datos de conexión al contenedor PostgreSQL
CONTAINER_NAME="pgvector"
DB_NAME="lottobueno"
DB_USER="lottobueno"
DB_PASS="lottobueno"
PG_PORT="5532" # El puerto expuesto en el host

echo "Checking for existing database and user..."

# Comprobación de la existencia de la base de datos
if [ "$(docker exec $CONTAINER_NAME psql -U ai -d ai -p 5432 -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'")" == '1' ]; then
    echo "Database '$DB_NAME' already exists."
else
    echo "Creating database '$DB_NAME'..."
    docker exec $CONTAINER_NAME psql -U ai -d ai -p 5432 -c "CREATE DATABASE $DB_NAME"
    echo "Database '$DB_NAME' created."
fi

# Comprobación de la existencia del usuario
if [ "$(docker exec $CONTAINER_NAME psql -U ai -d ai -p 5432 -tAc "SELECT 1 FROM pg_user WHERE usename='$DB_USER'")" == '1' ]; then
    echo "User '$DB_USER' already exists."
else
    echo "Creating user '$DB_USER' with password..."
    docker exec $CONTAINER_NAME psql -U ai -d ai -p 5432 -c "CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASS'"
    echo "User '$DB_USER' created."
fi

# Otorgar privilegios
echo "Granting privileges to user '$DB_USER' on database '$DB_NAME'..."
docker exec $CONTAINER_NAME psql -U ai -d ai -p 5432 -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER"
echo "Privileges granted."

# Otorgar permisos de superusuario
echo "Granting SUPERUSER role to user '$DB_USER'..."
docker exec $CONTAINER_NAME psql -U ai -d ai -p 5432 -c "ALTER USER $DB_USER WITH SUPERUSER;"
echo "SUPERUSER role granted."

# Otorgar permisos sobre el esquema public
echo "Granting ALL PRIVILEGES on schema public to '$DB_USER'..."
docker exec $CONTAINER_NAME psql -U ai -d ai -p 5432 -c "GRANT ALL PRIVILEGES ON SCHEMA public TO $DB_USER;"
docker exec $CONTAINER_NAME psql -U ai -d ai -p 5432 -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $DB_USER;"
echo "ALL PRIVILEGES on schema public granted."
