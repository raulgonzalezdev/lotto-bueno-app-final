from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date, datetime

class ElectorBase(BaseModel):
    letra_cedula: Optional[str]
    numero_cedula: Optional[int]
    p_apellido: Optional[str]
    s_apellido: Optional[str]
    p_nombre: Optional[str]
    s_nombre: Optional[str]
    sexo: Optional[str]
    fecha_nacimiento: Optional[date]
    codigo_estado: Optional[int]
    codigo_municipio: Optional[int]
    codigo_parroquia: Optional[int]
    codigo_centro_votacion: Optional[int]

class ElectorCreate(ElectorBase):
    pass

class ElectorList(ElectorBase):
    id: int

    class Config:
        orm_mode = True

class GeograficoBase(BaseModel):
    codigo_estado: Optional[int]
    codigo_municipio: Optional[int]
    codigo_parroquia: Optional[int]
    estado: Optional[str]
    municipio: Optional[str]
    parroquia: Optional[str]

class GeograficoCreate(GeograficoBase):
    pass

class GeograficoList(GeograficoBase):
    id: int

    class Config:
        orm_mode = True

class CentroVotacionBase(BaseModel):
    codificacion_vieja_cv: Optional[int]
    codificacion_nueva_cv: Optional[int]
    condicion: Optional[int]
    codigo_estado: Optional[int]
    codigo_municipio: Optional[int]
    codigo_parroquia: Optional[int]
    nombre_cv: Optional[str]
    direccion_cv: Optional[str]

class CentroVotacionCreate(CentroVotacionBase):
    pass

class CentroVotacionList(CentroVotacionBase):
    id: int

    class Config:
        orm_mode = True

class ElectorDetail(BaseModel):
    elector: ElectorList
    centro_votacion: Optional[CentroVotacionList]
    geografico: Optional[GeograficoList]

    class Config:
        orm_mode = True

class TicketBase(BaseModel):
    numero_ticket: Optional[str]
    qr_ticket: Optional[str]
    cedula: Optional[str]
    nombre: Optional[str]
    telefono: Optional[str]
    estado: Optional[str]
    municipio: Optional[str]
    parroquia: Optional[str]
    referido_id: Optional[int]
    validado: Optional[bool]
    ganador: Optional[bool]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

class TicketCreate(TicketBase):
    pass

class TicketList(TicketBase):
    id: int

    class Config:
        orm_mode = True

class TicketUpdate(BaseModel):
    validado: Optional[bool]
    ganador: Optional[bool]
    telefono: Optional[str]
    referido_id: Optional[int]

class RecolectorBase(BaseModel):
    nombre: Optional[str]
    cedula: Optional[str]
    telefono: Optional[str]
    es_referido: Optional[bool]

class RecolectorCreate(RecolectorBase):
    pass

class RecolectorList(RecolectorBase):
    id: int

    class Config:
        orm_mode = True

class RecolectorUpdate(BaseModel):
    nombre: Optional[str]
    cedula: Optional[str]
    telefono: Optional[str]
    es_referido: Optional[bool]

class RecolectorEstadisticas(BaseModel):
    recolector_id: int
    nombre: str
    tickets_count: int

    class Config:
        orm_mode = True

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserList(UserBase):
    id: int
    hashed_password: str
    isAdmin: bool
    created_at: datetime
    updated_at: datetime
    telegram_id: Optional[int] = None

    class Config:
        orm_mode = True

class LineaTelefonicaBase(BaseModel):
    numero: str
    operador: str

class LineaTelefonicaCreate(LineaTelefonicaBase):
    pass

class LineaTelefonicaUpdate(BaseModel):
    numero: str
    operador: str

class LineaTelefonicaList(LineaTelefonicaBase):
    id: int

    class Config:
        orm_mode = True
        
class CedulaRequest(BaseModel):
    numero_cedula: str