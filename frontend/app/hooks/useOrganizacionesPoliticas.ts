'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api';

// Interfaces
interface OrganizacionPolitica {
  id: number;
  nombre: string;
  codigo: string | null;
  descripcion: string | null;
  activo: boolean;
}

interface OrganizacionPoliticaCreatePayload {
  nombre: string;
  codigo?: string;
  descripcion?: string;
  activo?: boolean;
}

interface OrganizacionPoliticaUpdatePayload {
  nombre?: string;
  codigo?: string;
  descripcion?: string;
  activo?: boolean;
}

// Hook para obtener todas las organizaciones políticas
export const useOrganizacionesPoliticas = () => {
  return useQuery<OrganizacionPolitica[], Error>({
    queryKey: ['organizaciones-politicas'],
    queryFn: async () => {
      const data = await apiClient.get<OrganizacionPolitica[]>('api/organizaciones-politicas/');
      
      // Verificar que la respuesta es un array
      if (Array.isArray(data)) {
        return data.sort((a, b) => a.nombre.localeCompare(b.nombre));
      }
      return [];
    }
  });
};

// Hook para crear una organización política
export const useCreateOrganizacionPolitica = () => {
  const queryClient = useQueryClient();
  
  return useMutation<OrganizacionPolitica, Error, OrganizacionPoliticaCreatePayload>({
    mutationFn: async (payload) => {
      return apiClient.post<OrganizacionPolitica>('api/organizaciones-politicas/', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizaciones-politicas'] });
    }
  });
};

// Hook para actualizar una organización política
export const useUpdateOrganizacionPolitica = () => {
  const queryClient = useQueryClient();
  
  return useMutation<OrganizacionPolitica, Error, { id: number; payload: OrganizacionPoliticaUpdatePayload }>({
    mutationFn: async ({ id, payload }) => {
      return apiClient.patch<OrganizacionPolitica>(`api/organizaciones-politicas/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizaciones-politicas'] });
    }
  });
};

// Hook para eliminar una organización política
export const useDeleteOrganizacionPolitica = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, number>({
    mutationFn: async (id) => {
      return apiClient.delete<void>(`api/organizaciones-politicas/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizaciones-politicas'] });
    }
  });
}; 