-- Script para arreglar la base de datos sin usar Alembic
-- Este script verifica primero si las columnas/tablas existen antes de intentar crearlas

-- 1. Verificar y añadir columnas faltantes a la tabla recolectores
DO $$
BEGIN
    -- Añadir columna email si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'recolectores' AND column_name = 'email'
    ) THEN
        ALTER TABLE recolectores ADD COLUMN email VARCHAR(100);
    END IF;

    -- Añadir columna estado si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'recolectores' AND column_name = 'estado'
    ) THEN
        ALTER TABLE recolectores ADD COLUMN estado VARCHAR(50);
    END IF;

    -- Añadir columna municipio si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'recolectores' AND column_name = 'municipio'
    ) THEN
        ALTER TABLE recolectores ADD COLUMN municipio VARCHAR(50);
    END IF;

    -- Añadir columna organizacion_politica si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'recolectores' AND column_name = 'organizacion_politica'
    ) THEN
        ALTER TABLE recolectores ADD COLUMN organizacion_politica VARCHAR(50);
    END IF;
END
$$;

-- 2. Crear tabla organizaciones_politicas si no existe
CREATE TABLE IF NOT EXISTS organizaciones_politicas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    codigo VARCHAR(20),
    descripcion VARCHAR(200),
    activo BOOLEAN DEFAULT TRUE
);

-- Crear índices para la tabla organizaciones_politicas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'organizaciones_politicas' AND indexname = 'ix_organizaciones_politicas_id'
    ) THEN
        CREATE INDEX ix_organizaciones_politicas_id ON organizaciones_politicas (id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'organizaciones_politicas' AND indexname = 'ix_organizaciones_politicas_nombre'
    ) THEN
        CREATE UNIQUE INDEX ix_organizaciones_politicas_nombre ON organizaciones_politicas (nombre);
    END IF;
END
$$;

-- 3. Insertar datos iniciales en organizaciones_politicas solo si la tabla está vacía
DO $$
BEGIN
    IF (SELECT COUNT(*) FROM organizaciones_politicas) = 0 THEN
        INSERT INTO organizaciones_politicas (nombre, codigo, activo) VALUES 
        ('PV', 'PRIMERO VENEZUELA', true),
        ('AD', 'ACCION DEMOCRATICA', true), 
        ('COPEI', 'COMITE ORGANIZADO POLITICO ELECTORAL INDEPENDIENTE', true),
        ('VOL', 'VOLUNTAD POPULAR', true),
        ('BR', 'BANDERA ROJA', true);
    END IF;
END
$$;

-- 4. Añadir columna telegram_id a la tabla users si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'telegram_id'
    ) THEN
        ALTER TABLE users ADD COLUMN telegram_id BIGINT UNIQUE;
    END IF;
END
$$; 