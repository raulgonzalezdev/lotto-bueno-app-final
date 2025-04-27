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

        console.log('Llamando API de emprendedores con parámetros:', queryParams);
        
        try {
          const host = await detectHost();
          console.log('API Host:', host);
          const url = `${host}/api/emprendedores/?${new URLSearchParams(queryParams)}`;
          console.log('URL completa:', url);
          
          const response = await fetch(url);
          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Error ${response.status} al obtener emprendedores:`, errorText);
            throw new Error(`Error ${response.status}: ${errorText}`);
          }
          
          const data = await response.json();
          //console.log('Respuesta de API:', data);
          return {
            items: data.items || [],
            total: typeof data.total === 'number' ? data.total : (data.items?.length || 0)
          };
        } catch (fetchError) {
          console.error('Error en fetch:', fetchError);
          throw fetchError;
        }
      } catch (error) {
        console.error('Error global al obtener emprendedores:', error);
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