'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api';

// --- Interfaces --- //
interface LineaTelefonica {
  id: number;
  numero: string;
  operador: string;
}

export interface LineasResponse {
  total: number;
  items: LineaTelefonica[];
}

interface FetchLineasParams {
  currentPage: number;
  lineasPerPage: number;
  searchTerm?: string;
}

interface LineaCreatePayload {
  numero: string;
  operador: string;
}

interface LineaUpdatePayload {
  numero?: string;
  operador?: string;
}

interface ImportResult {
  insertados: number;
  errores: number;
  mensaje: string;
}

// --- Hooks --- //

// Hook para obtener líneas telefónicas
export const useLineasTelefonicas = (params: { currentPage: number; lineasPerPage: number; searchTerm: string }) => {
  const { currentPage, lineasPerPage, searchTerm } = params;
  const queryClient = useQueryClient();
  
  const queryKey = ['lineasTelefonicas', currentPage, lineasPerPage, searchTerm];

  return useQuery<LineasResponse, Error>({
    queryKey: queryKey,
    queryFn: async (): Promise<LineasResponse> => {
      const queryParams: Record<string, string> = {
        skip: ((currentPage - 1) * lineasPerPage).toString(),
        limit: lineasPerPage.toString()
      };
      
      if (searchTerm) queryParams.search = searchTerm;

      const data = await apiClient.get<LineasResponse>('api/lineas_telefonicas/', queryParams);
      
      // Asegurarse de que la respuesta tenga el formato esperado
      if (typeof data === 'object' && data !== null && Array.isArray(data.items) && typeof data.total === 'number') {
        return data as LineasResponse;
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

// Hook para crear una línea telefónica
export const useCreateLineaTelefonica = () => {
  const queryClient = useQueryClient();
  return useMutation<LineaTelefonica, Error, LineaCreatePayload>({
    mutationFn: (payload) => apiClient.post<LineaTelefonica>('api/lineas_telefonicas/', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lineasTelefonicas'] });
    },
  });
};

// Hook para actualizar una línea telefónica
export const useUpdateLineaTelefonica = () => {
  const queryClient = useQueryClient();
  return useMutation<LineaTelefonica, Error, { lineaId: number; payload: LineaUpdatePayload }>({
    mutationFn: ({ lineaId, payload }) => 
      apiClient.patch<LineaTelefonica>(`api/lineas_telefonicas/${lineaId}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lineasTelefonicas'] });
    },
  });
};

// Hook para eliminar una línea telefónica
export const useDeleteLineaTelefonica = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (lineaId) => apiClient.delete<void>(`api/lineas_telefonicas/${lineaId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lineasTelefonicas'] });
    },
  });
};

// Hook para importar múltiples líneas telefónicas desde un archivo
export const useImportarLineasTelefonicas = () => {
  const queryClient = useQueryClient();
  return useMutation<ImportResult, Error, FormData>({
    mutationFn: async (formData) => {
      // Usamos fetch directamente para manejar la carga del archivo
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://applottobueno.com'}/api/lineas_telefonicas/importar`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al importar líneas telefónicas');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lineasTelefonicas'] });
    },
  });
}; 