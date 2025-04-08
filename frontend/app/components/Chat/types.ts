import { DocumentChunk } from "../Document/types";

export interface Message {
  type: "user" | "system";
  content: string;
  cached?: boolean;
  distance?: string;
}

export type QueryPayload = {
  chunks: DocumentChunk[];
  context: string;
  error: string;
  took: number;
};

export type Segment =
  | { type: "text"; content: string }
  | { type: "code"; language: string; content: string };


  export interface elector {
    
      id: number;
      letra_cedula: string;
      numero_cedula: number;
      p_apellido: string;
      s_apellido: string;
      p_nombre: string;
      s_nombre: string;
      sexo: string;
      fecha_nacimiento: string; // Formato de fecha ISO como string o usar Date
      codigo_estado: number;
      codigo_municipio: number;
      codigo_parroquia: number;
    }

  // Definiciones de tipos para los modelos usados en el componente
export interface Elector {
  id: number;
  letra_cedula: string;
  numero_cedula: string;
  p_apellido: string;
  s_apellido: string;
  p_nombre: string;
  s_nombre: string;
  sexo: string;
  fecha_nacimiento: string; // Formato de fecha ISO como string o usar Date
  codigo_estado: number;
  codigo_municipio: number;
  codigo_parroquia: number;
  codigo_centro_votacion: number;
  
  elector: {
    id: number;
    letra_cedula: string;
    numero_cedula: string;
    p_apellido: string;
    s_apellido: string;
    p_nombre: string;
    s_nombre: string;
    sexo: string;
    fecha_nacimiento: string; // Formato de fecha ISO como string o usar Date
    codigo_estado: number;
    codigo_municipio: number;
    codigo_parroquia: number;
    codigo_centro_votacion: number;
    
  },
  centro_votacion: {
    codificacion_vieja_cv: number;
    codificacion_nueva_cv: number;
    condicion: number;
    codigo_estado: number;
    codigo_municipio: number;
    codigo_parroquia: number;
    nombre_cv: string;
    direccion_cv: string;
    id: number;
  },
  geografico: {
    codigo_estado: number;
    codigo_municipio: number;
    codigo_parroquia: number;
    estado: string;
    municipio: string;
    parroquia: string;
    id: number;
  }
}


// Interface principal que encapsula la información completa de un elector,
// su centro de votación y datos geográficos.
interface ElectorCompleteInfo {
  elector: ElectorDetails;
  centro_votacion: CentroVotacionDetails;
  geografico: GeograficoDetails;
}

// Detalles específicos del elector
interface ElectorDetails {
  id: number;
  letra_cedula: string;
  numero_cedula: number;
  p_apellido: string;
  s_apellido: string;
  p_nombre: string;
  s_nombre: string;
  sexo: string;
  fecha_nacimiento: string; // Usar Date si necesitas manipular fechas
}

// Información sobre el centro de votación asociado al elector
interface CentroVotacionDetails {
  codificacion_vieja_cv: number;
  codificacion_nueva_cv: number;
  condicion: number;
  nombre_cv: string;
  direccion_cv: string;
}

// Información geográfica detallada del elector
interface GeograficoDetails {
  estado: string;
  municipio: string;
  parroquia: string;
}


export interface Estado {
  codigo_estado: string;
  estado: string;
}

export interface Municipio {
  codigo_municipio: string;
  municipio: string;
}

export interface Parroquia {
  codigo_parroquia: string;
  parroquia: string;
}

export interface CentroVotacion {
  codificacion_nueva_cv: string;
  nombre_cv: string;
}