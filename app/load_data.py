import os
import csv
from datetime import datetime
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Elector, Geografico, CentroVotacion
import chardet
import logging
from tqdm import tqdm

# Configuración de logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def detect_encoding(file_path):
    with open(file_path, 'rb') as f:
        result = chardet.detect(f.read())
        return result['encoding']

def load_electors(filepath: str, db: Session):
    encoding = detect_encoding(filepath)
    logging.info(f"Loading electors from {filepath} with encoding {encoding}")
    try:
        with open(filepath, 'r', encoding=encoding) as file:
            reader = csv.reader(file)
            next(reader)  # Skip the header

            for row in tqdm(reader, desc=f"Loading Electors from {os.path.basename(filepath)}", unit=" lines"):
                numero_cedula = int(row[1])
                # Verificar si el elector ya existe
                exists = db.query(Elector).filter(Elector.numero_cedula == numero_cedula).first()
                if not exists:
                    elector = Elector(
                        letra_cedula=row[0],
                        numero_cedula=numero_cedula,
                        p_apellido=row[2],
                        s_apellido=row[3],
                        p_nombre=row[4],
                        s_nombre=row[5],
                        sexo=row[6],
                        fecha_nacimiento=datetime.strptime(row[7], '%Y-%m-%d'),
                        codigo_estado=int(row[8]),
                        codigo_municipio=int(row[9]),
                        codigo_parroquia=int(row[10]),
                        codigo_centro_votacion=int(row[11])
                    )
                    db.add(elector)
            db.commit()
    except Exception as e:
        logging.error(f"Error loading electors: {e}")
        db.rollback()

def load_geographic_data(filepath: str, db: Session):
    encoding = detect_encoding(filepath)
    logging.info(f"Loading geographic data from {filepath} with encoding {encoding}")
    try:
        with open(filepath, 'r', encoding=encoding) as file:
            reader = csv.reader(file)
            next(reader)  # Skip the header

            for row in tqdm(reader, desc="Loading Geographic Data", unit=" lines"):
                geographic = Geografico(
                    codigo_estado=int(row[0]),
                    codigo_municipio=int(row[1]),
                    codigo_parroquia=int(row[2]),
                    estado=row[3],
                    municipio=row[4],
                    parroquia=row[5]
                )
                db.add(geographic)
            db.commit()
    except Exception as e:
        logging.error(f"Error loading geographic data: {e}")
        db.rollback()

def load_voting_centers(filepath: str, db: Session):
    encoding = detect_encoding(filepath)
    logging.info(f"Loading voting centers from {filepath} with encoding {encoding}")
    try:
        with open(filepath, 'r', encoding=encoding) as file:
            reader = csv.reader(file)
            next(reader)  # Skip the header

            for row in tqdm(reader, desc="Loading Voting Centers", unit=" lines"):
                center = CentroVotacion(
                    codificacion_vieja_cv=int(row[0]),
                    codificacion_nueva_cv=int(row[1]),
                    condicion=int(row[2]),
                    codigo_estado=int(row[3]),
                    codigo_municipio=int(row[4]),
                    codigo_parroquia=int(row[5]),
                    nombre_cv=row[6],
                    direccion_cv=row[7]
                )
                db.add(center)
            db.commit()
    except Exception as e:
        logging.error(f"Error loading voting centers: {e}")
        db.rollback()

# Inicializar la sesión de la base de datos y cargar datos
if __name__ == '__main__':
    db = SessionLocal()
    try:
        # Cargar los archivos divididos de electores
        input_dir = 'data/split_files'
        for filename in os.listdir(input_dir):
            filepath = os.path.join(input_dir, filename)
            if filename.endswith('.csv'):
                load_electors(filepath, db)
        
        # Cargar los datos geográficos
        load_geographic_data('data/geo20240416_pp.txt', db)
        
        # Cargar los centros de votación
        load_voting_centers('data/cva20240416.txt', db)
    finally:
        db.close()
