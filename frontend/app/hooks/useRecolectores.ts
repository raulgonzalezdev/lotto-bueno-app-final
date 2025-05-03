'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api';
import { detectHost } from '../api';

// --- Interfaces --- //
interface Recolector {
  id: number;
  nombre: string;
  cedula: string;
  telefono: string;
  es_referido: boolean;
  email?: string;
  estado?: string;
  municipio?: string;
  organizacion_politica?: string;
}

export interface RecolectoresResponse {
  total: number;
  items: Recolector[];
}

interface FetchRecolectoresParams {
  currentPage: number;
  recolectoresPerPage: number;
  searchTerm?: string;
}

interface RecolectorCreatePayload {
  nombre: string;
  cedula: string;
  telefono: string;
  es_referido: boolean;
  email?: string;
  estado?: string;
  municipio?: string;
  organizacion_politica?: string;
}

interface RecolectorUpdatePayload {
  nombre?: string;
  cedula?: string;
  telefono?: string;
  es_referido?: boolean;
  email?: string;
  estado?: string;
  municipio?: string;
  organizacion_politica?: string;
}

// Interfaz para la respuesta de importación
interface ImportacionResponse {
  mensaje: string;
  total: number;
  insertados: number;
  errores: number;
}

// --- Hooks --- //

// Hook para obtener recolectores
export const useRecolectores = (params?: { 
  currentPage?: number; 
  recolectoresPerPage?: number; 
  searchTerm?: string;
  estado?: string;
  municipio?: string;
  organizacion_politica?: string;
}) => {
  const currentPage = params?.currentPage || 1;
  const searchTerm = params?.searchTerm || '';
  const estado = params?.estado || '';
  const municipio = params?.municipio || '';
  const organizacion_politica = params?.organizacion_politica || '';
  const queryClient = useQueryClient();
  
  // Si no se especifica recolectoresPerPage, usar 1000 para obtener todos
  const recolectoresPerPage = params?.recolectoresPerPage || (params?.currentPage ? 10 : 1000);
  
  const queryKey = ['recolectores', currentPage, recolectoresPerPage, searchTerm, estado, municipio, organizacion_politica];

  return useQuery<RecolectoresResponse, Error>({
    queryKey: queryKey,
    queryFn: async (): Promise<RecolectoresResponse> => {
      try {
        const queryParams: Record<string, string> = {
          skip: ((currentPage - 1) * recolectoresPerPage).toString(),
          limit: recolectoresPerPage.toString()
        };
        
        if (searchTerm) queryParams.search = searchTerm;
        if (estado) queryParams.estado = estado;
        if (municipio) queryParams.municipio = municipio;
        if (organizacion_politica) queryParams.organizacion_politica = organizacion_politica;

        const data = await apiClient.get<any>('api/recolectores/', queryParams);
        
        // Manejo seguro para cualquier formato de respuesta
        if (data === null || data === undefined) {
          console.warn('La API devolvió una respuesta nula o indefinida');
          return { items: [], total: 0 };
        }
        
        // Si es un objeto con items y total
        if (typeof data === 'object' && data !== null && 'items' in data && Array.isArray(data.items)) {
          return {
            items: data.items || [],
            total: typeof data.total === 'number' ? data.total : (data.items?.length || 0)
          };
        }
        
        // Si es un array directamente
        if (Array.isArray(data)) {
          return { items: data, total: data.length };
        }
        
        // Último recurso: devolver un objeto vacío
        console.warn('Formato de respuesta inesperado de la API:', data);
        return { items: [], total: 0 };
      } catch (error) {
        console.error('Error al obtener recolectores:', error);
        throw error;
      }
    },
    placeholderData: (oldData) => oldData || { items: [], total: 0 },
    refetchOnWindowFocus: false,
  });
};

// Hook para crear un recolector
export const useCreateRecolector = () => {
  const queryClient = useQueryClient();
  return useMutation<Recolector, Error, RecolectorCreatePayload>({
    mutationFn: (payload) => apiClient.post<Recolector>('api/recolectores/', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recolectores'] });
    },
  });
};

// Hook para actualizar un recolector
export const useUpdateRecolector = () => {
  const queryClient = useQueryClient();
  return useMutation<Recolector, Error, { recolectorId: number; payload: RecolectorUpdatePayload }>({
    mutationFn: ({ recolectorId, payload }) => 
      apiClient.patch<Recolector>(`api/recolectores/${recolectorId}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recolectores'] });
    },
  });
};

// Hook para eliminar un recolector
export const useDeleteRecolector = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (recolectorId) => apiClient.delete<void>(`api/recolectores/${recolectorId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recolectores'] });
    },
  });
};

// Hook para importar recolectores desde un archivo Excel
export const useImportarRecolectores = () => {
  const queryClient = useQueryClient();
  
  return useMutation<ImportacionResponse, Error, FormData>({
    mutationFn: async (formData) => {
      // Usamos fetch directamente para manejar la carga del archivo
      const host = await detectHost();
      const response = await fetch(`${host}/api/recolectores/importar`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al importar recolectores');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recolectores'] });
    },
  });
};

// Hook para verificar si existe un recolector por cédula
export const useCheckRecolectorExistsByCedula = (cedula: string) => {
  return useQuery<boolean, Error>({
    queryKey: ['recolectorExists', cedula],
    queryFn: async () => {
      if (!cedula || cedula.length < 6) return false;
      try {
        const response = await apiClient.get<{ exists: boolean }>(`api/recolectores/check_cedula/${cedula}`);
        return response.exists;
      } catch (error) {
        return false;
      }
    },
    enabled: !!cedula && cedula.length >= 6,
  });
};

// Hook para registrar o actualizar un recolector por cédula
export const useRegistroRecolector = () => {
  const queryClient = useQueryClient();
  return useMutation<Recolector, Error, RecolectorCreatePayload>({
    mutationFn: (payload) => apiClient.post<Recolector>('api/recolectores/registro', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recolectores'] });
      queryClient.invalidateQueries({ queryKey: ['recolector'] }); // Invalidar consultas de recolector individual
    },
  });
};

// Hook para obtener un recolector por cédula
export const useRecolectorByCedula = (cedula: string) => {
  return useQuery<Recolector | null, Error>({
    queryKey: ['recolector', cedula],
    queryFn: async () => {
      if (!cedula || cedula.length < 6) return null;
      try {
        const response = await apiClient.get<Recolector>(`api/recolectores/by_cedula/${cedula}`);
        return response;
      } catch (error) {
        return null;
      }
    },
    enabled: !!cedula && cedula.length >= 6,
  });
}; 