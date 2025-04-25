'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api';

// --- Interfaces --- //
// Asegúrate de que estas interfaces coincidan con tu schema de FastAPI
interface Elector {
    id: number;
    letra_cedula: string;
    numero_cedula: number;
    p_nombre: string;
    s_nombre?: string;
    p_apellido: string;
    s_apellido?: string;
    fecha_nacimiento: string; // O Date
    sexo?: string;
    codigo_estado: number;
    codigo_municipio: number;
    codigo_parroquia: number;
    codigo_centro_votacion: number;
}

interface Geografico {
    estado: string;
    municipio: string;
    parroquia: string;
    // ... otros campos geográficos si existen
}

interface CentroVotacion {
    nombre_cv: string;
    direccion_cv: string;
     // ... otros campos del centro si existen
}

interface ElectorDetail {
    elector: Elector;
    centro_votacion: CentroVotacion;
    geografico: Geografico;
}

interface ElectoresResponse {
    // Asumiendo que el endpoint /api/electores/ devuelve directamente un array
    // Si devuelve un objeto con { items: [], total: number }, ajusta esto
    items: Elector[]; 
    // Si necesitas el total aquí, la API debería devolverlo
}

interface FetchElectoresParams {
  currentPage: number;
  electoresPerPage: number;
  codigoEstado?: string;
  codigoMunicipio?: string;
  codigoParroquia?: string;
  codigoCentroVotacion?: string;
  // searchTerm?: string; // Si tu API soporta búsqueda general de electores
}

// Tipo básico para evitar errores de linter
interface ElectorResult {
  elector?: {
    p_nombre?: string;
    s_nombre?: string;
    p_apellido?: string;
    s_apellido?: string;
    codigo_estado?: number;
    codigo_municipio?: number;
  };
  geografico?: {
    municipio?: string;
    estado?: string;
  };
}

// Tipo para el resultado
interface ElectorSimple {
  nombre: string;
  municipio?: string;
  estado?: string;
  codigoEstado?: number;
  codigoMunicipio?: number;
}

// --- Funciones para operaciones con electores (usando apiClient) --- //

const fetchElectores = async ({ currentPage, electoresPerPage, ...filters }: FetchElectoresParams): Promise<Elector[]> => {
  const queryParams: Record<string, string> = {
    skip: ((currentPage - 1) * electoresPerPage).toString(),
    limit: electoresPerPage.toString(),
  };

  // Añadir filtros a los parámetros
  if (filters.codigoEstado) queryParams.codigo_estado = filters.codigoEstado;
  if (filters.codigoMunicipio) queryParams.codigo_municipio = filters.codigoMunicipio;
  if (filters.codigoParroquia) queryParams.codigo_parroquia = filters.codigoParroquia;
  if (filters.codigoCentroVotacion) queryParams.codigo_centro_votacion = filters.codigoCentroVotacion;

  const data = await apiClient.get<any[]>('api/electores/', queryParams);
  
  // Asegurar que codigo_centro_votacion sea un número
  if (Array.isArray(data)) {
    return data.map(elector => ({
      ...elector,
      codigo_centro_votacion: typeof elector.codigo_centro_votacion === 'string' 
        ? Number(elector.codigo_centro_votacion) 
        : elector.codigo_centro_votacion
    }));
  }
  
  return [];
};

const fetchTotalElectores = async (filters: Omit<FetchElectoresParams, 'currentPage' | 'electoresPerPage'>): Promise<number> => {
  const queryParams: Record<string, string> = {};

  if (filters.codigoEstado) queryParams.codigo_estado = filters.codigoEstado;
  if (filters.codigoMunicipio) queryParams.codigo_municipio = filters.codigoMunicipio;
  if (filters.codigoParroquia) queryParams.codigo_parroquia = filters.codigoParroquia;
  if (filters.codigoCentroVotacion) queryParams.codigo_centro_votacion = filters.codigoCentroVotacion;

  return apiClient.get<number>('api/total/electores', queryParams);
};

const fetchElectorDetail = async (numeroCedula: string): Promise<ElectorDetail | null> => {
  if (!numeroCedula) {
    return null;
  }
  
  try {
    return await apiClient.get<ElectorDetail>(`api/electores/cedula/${encodeURIComponent(numeroCedula)}`);
  } catch (error) {
    if ((error as Error).message.includes('404')) {
      return null; // Considerar 404 como no encontrado, no un error de fetch
    }
    throw error;
  }
};

// --- Hooks --- //

export const useElectores = (params: FetchElectoresParams) => {
  return useQuery<Elector[], Error>({
    queryKey: ['electores', params],
    queryFn: () => fetchElectores(params),
    placeholderData: (oldData) => oldData,
  });
};

export const useTotalElectores = (filters: Omit<FetchElectoresParams, 'currentPage' | 'electoresPerPage'>) => {
    // Clonar filtros para evitar problemas de mutabilidad en la queryKey
    const stableFilters = { ...filters }; 
    
    return useQuery<number, Error>({
        queryKey: ['totalElectores', stableFilters],
        queryFn: () => fetchTotalElectores(stableFilters),
    });
};

export const useElectorDetail = (numeroCedula: string) => {
  return useQuery<ElectorDetail | null, Error>({
    queryKey: ['electorDetail', numeroCedula],
    queryFn: () => fetchElectorDetail(numeroCedula),
    enabled: !!numeroCedula, // Solo ejecutar si hay cédula
  });
};

// Función para buscar elector por cédula - sin Zod
export const fetchElectorByCedulaSimple = async (cedula: string): Promise<ElectorSimple | null> => {
  if (!cedula || cedula.length < 3) {
    return null;
  }
  
  try {
    // Limpiamos la cédula
    const numeroCedula = cedula.replace(/[^0-9]/g, '');
    
    const data = await apiClient.get<ElectorResult>(`api/electores/cedula/${encodeURIComponent(numeroCedula)}`);
    
    if (!data || !data.elector) {
      return null;
    }

    // Construir nombre completo
    const nombre = [
      data.elector.p_nombre,
      data.elector.s_nombre,
      data.elector.p_apellido,
      data.elector.s_apellido
    ].filter(Boolean).join(' ').trim();

    return {
      nombre,
      municipio: data.geografico?.municipio,
      estado: data.geografico?.estado,
      codigoEstado: data.elector?.codigo_estado,
      codigoMunicipio: data.elector?.codigo_municipio
    };
  } catch (error) {
    console.log('Error buscando elector por cédula:', error);
    return null;
  }
};

// Hook para buscar elector por cédula
export const useElectorSimpleByCedula = (cedula: string) => {
  return useQuery({
    queryKey: ['electorSimple', cedula],
    queryFn: () => fetchElectorByCedulaSimple(cedula),
    enabled: !!cedula && cedula.length > 3,
    retry: false,
    staleTime: 1000 * 60 * 5
  });
}; 