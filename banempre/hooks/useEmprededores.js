import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api';

// Mock data para desarrollo
const mockEmprendedores = {
  items: [
    {
      id: 1,
      cedula: '12345678',
      nombre_apellido: 'Juan Pérez',
      rif: 'J-12345678-9',
      nombre_emprendimiento: 'Panadería El Pan Nuestro',
      telefono: '04241234567',
      estado: 'Miranda',
      municipio: 'Baruta',
      created_at: '2023-01-15T10:30:00Z'
    },
    {
      id: 2,
      cedula: '87654321',
      nombre_apellido: 'Maria Rodriguez',
      rif: 'J-87654321-0',
      nombre_emprendimiento: 'Dulces Artesanales María',
      telefono: '04167654321',
      estado: 'Distrito Capital',
      municipio: 'Libertador',
      created_at: '2023-02-20T14:15:00Z'
    }
  ],
  total: 2
};

// Hook para obtener emprendedores con paginación y filtros
export const useEmprendedores = (params) => {
  return useQuery({
    queryKey: ['emprendedores', params],
    queryFn: async () => {
      try {
        const queryParams = {
          page: params.currentPage,
          limit: params.emprendedoresPerPage
        };
        
        if (params.searchTerm) queryParams.search = params.searchTerm;
        if (params.estado) queryParams.estado = params.estado;
        if (params.municipio) queryParams.municipio = params.municipio;
        
        const response = await apiClient.get('/emprendedores', queryParams);
        return response.data;
      } catch (error) {
        console.error('Error fetching emprendedores:', error);
        
        // En modo desarrollo, devolver datos de ejemplo
        if (process.env.NODE_ENV === 'development') {
          return mockEmprendedores;
        }
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5 // 5 minutos
  });
};

// Hook para obtener un emprendedor por cédula
export const useEmprendedorByCedula = (cedula) => {
  return useQuery({
    queryKey: ['emprendedor', 'cedula', cedula],
    queryFn: async () => {
      if (!cedula || cedula.length < 6) return null;
      
      try {
        const response = await apiClient.get(`/emprendedores/cedula/${cedula}`);
        return response.data;
      } catch (error) {
        // En modo desarrollo, devolver datos de ejemplo
        if (process.env.NODE_ENV === 'development') {
          if (cedula === '12345678') {
            return mockEmprendedores.items[0];
          }
          return null;
        }
        throw error;
      }
    },
    enabled: !!cedula && cedula.length >= 6,
    staleTime: 1000 * 60 * 5 // 5 minutos
  });
};

// Hook para obtener datos de elector para crear un emprendedor
export const useElectorDataForEmprendedor = (cedula) => {
  return useQuery({
    queryKey: ['elector', 'emprendedor', cedula],
    queryFn: async () => {
      if (!cedula || cedula.length < 6) return null;
      
      try {
        const response = await apiClient.get(`/electores/data/${cedula}`);
        return response.data;
      } catch (error) {
        // En modo desarrollo, devolver datos de ejemplo
        if (process.env.NODE_ENV === 'development') {
          if (cedula === '87654321') {
            return {
              nombre_apellido: 'Maria Rodriguez',
              cedula: '87654321',
              estado: 'Distrito Capital',
              municipio: 'Libertador'
            };
          }
          return null;
        }
        throw error;
      }
    },
    enabled: !!cedula && cedula.length >= 6,
    staleTime: 1000 * 60 * 5 // 5 minutos
  });
};

// Mutación para crear un nuevo emprendedor
export const useCreateEmprendedor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (emprendedorData) => {
      const response = await apiClient.post('/emprendedores', emprendedorData);
      return response.data;
    },
    onSuccess: () => {
      // Invalidar consultas cuando se crea un nuevo emprendedor
      queryClient.invalidateQueries({ queryKey: ['emprendedores'] });
    }
  });
};

// Mutación para actualizar un emprendedor
export const useUpdateEmprendedor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ emprendedorId, payload }) => {
      const response = await apiClient.put(`/emprendedores/${emprendedorId}`, payload);
      return response.data;
    },
    onSuccess: () => {
      // Invalidar consultas cuando se actualiza un emprendedor
      queryClient.invalidateQueries({ queryKey: ['emprendedores'] });
    }
  });
};

// Mutación para eliminar un emprendedor
export const useDeleteEmprendedor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (emprendedorId) => {
      const response = await apiClient.delete(`/emprendedores/${emprendedorId}`);
      return response.data;
    },
    onSuccess: () => {
      // Invalidar consultas cuando se elimina un emprendedor
      queryClient.invalidateQueries({ queryKey: ['emprendedores'] });
    }
  });
}; 