-- Crear la base de datos
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'lottobueno') THEN
        PERFORM dblink_exec('dbname=' || current_database(), 'CREATE DATABASE lottobueno');
    END IF;
END
$$;

-- Crear el usuario
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'lottobueno') THEN
        CREATE USER lottobueno WITH ENCRYPTED PASSWORD 'lottobueno';
    END IF;
END
$$;

-- Otorgar privilegios
GRANT ALL PRIVILEGES ON DATABASE lottobueno TO lottobueno;

-- Otorgar rol de superusuario
ALTER USER lottobueno WITH SUPERUSER;

-- Otorgar privilegios sobre el esquema public
GRANT ALL PRIVILEGES ON SCHEMA public TO lottobueno;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO lottobueno;


