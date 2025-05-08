import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.declarative import declarative_base

# Cargar las variables de entorno desde el archivo .env
from dotenv import load_dotenv
load_dotenv()

# Definir las posibles URLs de conexión
DATABASE_URLS = [
    "postgresql+psycopg2://lottobueno:lottobueno@postgres:5432/lottobueno"
    #"postgresql+psycopg2://lottobueno:lottobueno@172.18.0.3:5437/lottobueno"
]

engine = None
SessionLocal = None

for db_url in DATABASE_URLS:
    try:
        # Aumentar el tamaño del pool y timeout para evitar errores de conexión
        engine = create_engine(
            db_url,
            pool_size=20,           # Aumentar el tamaño del pool (default: 5)
            max_overflow=20,        # Aumentar el overflow máximo (default: 10)
            pool_timeout=60,        # Aumentar el timeout del pool (default: 30)
            pool_recycle=1800,      # Reciclar conexiones cada 30 minutos
            pool_pre_ping=True      # Verificar conexiones antes de usarlas
        )
        # Probar la conexión
        with engine.connect() as conn:
            print(f"Conectado exitosamente usando: {db_url}")
            break  # Salir del bucle si la conexión es exitosa
    except SQLAlchemyError as e:
        print(f"Fallo al conectar usando {db_url}: {e}")

if engine is not None:
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
else:
    print("No se pudo establecer conexión con ninguna de las bases de datos proporcionadas.")
    os._exit(1)

# Base declarativa para los modelos
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
