from sqlalchemy import Column, Integer, String, Date, Boolean, ForeignKey, Index, Text, DateTime, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()

class Elector(Base):
    __tablename__ = 'electores'

    id = Column(Integer, primary_key=True, index=True)
    letra_cedula = Column(String(1))
    numero_cedula = Column(Integer, index=True)  # Añadir índice aquí
    p_apellido = Column(String(35))
    s_apellido = Column(String(35))
    p_nombre = Column(String(35))
    s_nombre = Column(String(35))
    sexo = Column(String(1))
    fecha_nacimiento = Column(Date)
    codigo_estado = Column(Integer)
    codigo_municipio = Column(Integer)
    codigo_parroquia = Column(Integer)
    codigo_centro_votacion = Column(Integer)

    __table_args__ = (
        Index('ix_numero_cedula', 'numero_cedula'),
    )

class Geografico(Base):
    __tablename__ = 'geograficos'

    id = Column(Integer, primary_key=True, index=True)
    codigo_estado = Column(Integer)
    codigo_municipio = Column(Integer)
    codigo_parroquia = Column(Integer)
    estado = Column(String(35))
    municipio = Column(String(35))
    parroquia = Column(String(35))

class CentroVotacion(Base):
    __tablename__ = 'centros_votacion'

    id = Column(Integer, primary_key=True, index=True)
    codificacion_vieja_cv = Column(Integer)
    codificacion_nueva_cv = Column(Integer)
    condicion = Column(Integer)
    codigo_estado = Column(Integer)
    codigo_municipio = Column(Integer)
    codigo_parroquia = Column(Integer)
    nombre_cv = Column(String(255))
    direccion_cv = Column(String(755))


class Recolector(Base):
    __tablename__ = 'recolectores'

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100))
    cedula = Column(String(20))
    telefono = Column(String(20))
    es_referido = Column(Boolean, default=False)
    tickets = relationship("Ticket", back_populates="referido")
class Ticket(Base):
    __tablename__ = 'tickets'

    id = Column(Integer, primary_key=True, index=True)
    numero_ticket = Column(String(20), unique=True, index=True)
    qr_ticket = Column(Text)
    cedula = Column(String(20), unique=True, index=True)  # Añadido unique y index
    nombre = Column(String(100))
    telefono = Column(String(20), unique=True, index=True) 
    estado = Column(String(35))
    municipio = Column(String(35))
    parroquia = Column(String(35))
    referido_id = Column(Integer, ForeignKey('recolectores.id'))
    referido = relationship("Recolector", back_populates="tickets")
    validado = Column(Boolean)
    ganador = Column(Boolean)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    __table_args__ = (
        Index('ix_ticket_cedula', 'cedula'),  # Creación de índice
    )
    
# Agregar la columna 'email' a la definición de la tabla users

class Users(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    hashed_password = Column(String(200), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    isAdmin = Column(Boolean, default=False)
    telegram_id = Column(Integer, unique=True, nullable=True)  # Nuevo campo para identificador de Telegram



class LineaTelefonica(Base):
    __tablename__ = 'lineas_telefonicas'

    id = Column(Integer, primary_key=True, index=True)
    numero = Column(String(20), unique=True, index=True)
    operador = Column(String(50))