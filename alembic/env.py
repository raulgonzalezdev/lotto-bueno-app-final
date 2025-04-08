from logging.config import fileConfig
from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context
import sys
import os

from sqlalchemy.ext.declarative import declarative_base


# Importa los modelos explícitamente si no se están detectando automáticamente
from app.models import  Elector, Geografico, CentroVotacion, Ticket, Recolector
 # Ajusta según tus modelos

Base = declarative_base()
# Asegúrate de que estás asignando los metadatos correctamente
target_metadata = Base.metadata

# Necesario para asegurar que los módulos de la app puedan ser importados
sys.path.append(os.getcwd())

from app.database import Base  # Asegúrate de que esta es la ruta correcta a tu archivo de base de datos

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Esta línea es crucial: proporciona los metadatos de tus modelos a Alembic para la autogeneración
target_metadata = Base.metadata

def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
