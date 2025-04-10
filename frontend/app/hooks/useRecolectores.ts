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
}

interface RecolectorUpdatePayload {
  nombre?: string;
  cedula?: string;
  telefono?: string;
  es_referido?: boolean;
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
export const useRecolectores = (params?: { currentPage?: number; recolectoresPerPage?: number; searchTerm?: string }) => {
  const currentPage = params?.currentPage || 1;
  const recolectoresPerPage = params?.recolectoresPerPage || 10;
  const searchTerm = params?.searchTerm || '';
  const queryClient = useQueryClient();
  
  const queryKey = ['recolectores', currentPage, recolectoresPerPage, searchTerm];

  return useQuery<RecolectoresResponse, Error>({
    queryKey: queryKey,
    queryFn: async (): Promise<RecolectoresResponse> => {
      const queryParams: Record<string, string> = {
        skip: ((currentPage - 1) * recolectoresPerPage).toString(),
        limit: recolectoresPerPage.toString()
      };
      
      if (searchTerm) queryParams.search = searchTerm;

      const data = await apiClient.get<RecolectoresResponse>('api/recolectores/', queryParams);
      
      // Asegurarse de que la respuesta tenga el formato esperado
      if (typeof data === 'object' && data !== null && Array.isArray(data.items) && typeof data.total === 'number') {
        return data as RecolectoresResponse;
      } else {
        // Si la API devuelve un array directamente (caso antiguo?)
        if (Array.isArray(data)){
          return { items: data, total: data.length }; // Asumir total basado en la longitud si falta
        }
        throw new Error('Formato de respuesta inesperado de la API');
      }
    },
    placeholderData: (oldData) => oldData, // Usar datos anteriores como placeholder mientras carga
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