'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api';
import { detectHost } from '../api';

// --- Interfaces --- //
interface Emprendedor {
  id: number;
  cedula: string;
  nombre_apellido: string;
  rif?: string;
  nombre_emprendimiento: string;
  telefono: string;
  estado?: string;
  municipio?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EmprendedoresResponse {
  total: number;
  items: Emprendedor[];
}

interface EmprendedorCreatePayload {
  cedula: string;
  nombre_apellido: string;
  rif?: string;
  nombre_emprendimiento: string;
  telefono: string;
  estado?: string;
  municipio?: string;
}

interface EmprendedorUpdatePayload {
  cedula?: string;
  nombre_apellido?: string;
  rif?: string;
  nombre_emprendimiento?: string;
  telefono?: string;
  estado?: string;
  municipio?: string;
}

// --- Hooks --- //

// Hook para obtener emprendedores
export const useEmprendedores = (params?: { 
  currentPage?: number; 
  emprendedoresPerPage?: number; 
  searchTerm?: string;
  estado?: string;
  municipio?: string;
}) => {
  const currentPage = params?.currentPage || 1;
  const emprendedoresPerPage = params?.emprendedoresPerPage || 10;
  const searchTerm = params?.searchTerm || '';
  const estado = params?.estado || '';
  const municipio = params?.municipio || '';
  const queryClient = useQueryClient();
  
  const queryKey = ['emprendedores', currentPage, emprendedoresPerPage, searchTerm, estado, municipio];

  return useQuery<EmprendedoresResponse, Error>({
    queryKey: queryKey,
    queryFn: async (): Promise<EmprendedoresResponse> => {
      try {
        const queryParams: Record<string, string> = {
          skip: ((currentPage - 1) * emprendedoresPerPage).toString(),
          limit: emprendedoresPerPage.toString()
        };
        
        if (searchTerm) queryParams.search = searchTerm;
        if (estado) queryParams.estado = estado;
        if (municipio) queryParams.municipio = municipio;

        const data = await apiClient.get<any>('api/emprendedores/', queryParams);
        
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
        console.error('Error al obtener emprendedores:', error);
        throw error;
      }
    },
    placeholderData: (oldData) => oldData || { items: [], total: 0 },
    refetchOnWindowFocus: false,
  });
};

// Hook para crear un emprendedor
export const useCreateEmprendedor = () => {
  const queryClient = useQueryClient();
  return useMutation<Emprendedor, Error, EmprendedorCreatePayload>({
    mutationFn: (payload) => apiClient.post<Emprendedor>('api/emprendedores/', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emprendedores'] });
    },
  });
};

// Hook para actualizar un emprendedor
export const useUpdateEmprendedor = () => {
  const queryClient = useQueryClient();
  return useMutation<Emprendedor, Error, { emprendedorId: number; payload: EmprendedorUpdatePayload }>({
    mutationFn: ({ emprendedorId, payload }) => 
      apiClient.patch<Emprendedor>(`api/emprendedores/${emprendedorId}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emprendedores'] });
    },
  });
};

// Hook para eliminar un emprendedor
export const useDeleteEmprendedor = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (emprendedorId) => apiClient.delete<void>(`api/emprendedores/${emprendedorId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emprendedores'] });
    },
  });
};

// Hook para verificar si existe un emprendedor por cédula
export const useCheckEmprendedorExistsByCedula = (cedula: string) => {
  return useQuery<boolean, Error>({
    queryKey: ['emprendedorExists', cedula],
    queryFn: async () => {
      if (!cedula || cedula.length < 6) return false;
      try {
        const response = await apiClient.get<{ exists: boolean }>(`api/emprendedores/check_cedula/${cedula}`);
        return response.exists;
      } catch (error) {
        return false;
      }
    },
    enabled: !!cedula && cedula.length >= 6,
  });
};

// Hook para obtener un emprendedor por cédula
export const useEmprendedorByCedula = (cedula: string) => {
  return useQuery<Emprendedor | null, Error>({
    queryKey: ['emprendedor', cedula],
    queryFn: async () => {
      if (!cedula || cedula.length < 6) return null;
      try {
        const response = await apiClient.get<Emprendedor>(`api/emprendedores/by_cedula/${cedula}`);
        return response;
      } catch (error) {
        return null;
      }
    },
    enabled: !!cedula && cedula.length >= 6,
  });
};

// Hook para obtener datos de un elector por cédula para autocompletar formulario
export const useElectorDataForEmprendedor = (cedula: string) => {
  return useQuery<{ nombre_apellido: string; estado: string; municipio: string } | null, Error>({
    queryKey: ['electorForEmprendedor', cedula],
    queryFn: async () => {
      if (!cedula || cedula.length < 6) return null;
      try {
        const response = await apiClient.get<{ nombre_apellido: string; estado: string; municipio: string }>(
          `api/emprendedores/get_elector_data/${cedula}`
        );
        return response;
      } catch (error) {
        return null;
      }
    },
    enabled: !!cedula && cedula.length >= 6,
  });
}; 