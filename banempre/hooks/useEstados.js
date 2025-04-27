import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api';

export const useEstados = () => {
  return useQuery({
    queryKey: ['estados'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/estados');
        return response.data;
      } catch (error) {
        // En modo desarrollo, devolver datos de ejemplo
        if (process.env.NODE_ENV === 'development') {
          return [
            { codigo_estado: 1, estado: 'Amazonas' },
            { codigo_estado: 2, estado: 'Anzoátegui' },
            { codigo_estado: 3, estado: 'Apure' },
            { codigo_estado: 4, estado: 'Aragua' },
            { codigo_estado: 5, estado: 'Barinas' },
            { codigo_estado: 6, estado: 'Bolívar' },
            { codigo_estado: 7, estado: 'Carabobo' },
            { codigo_estado: 8, estado: 'Cojedes' },
            { codigo_estado: 9, estado: 'Delta Amacuro' },
            { codigo_estado: 10, estado: 'Falcón' },
            { codigo_estado: 11, estado: 'Guárico' },
            { codigo_estado: 12, estado: 'Lara' },
            { codigo_estado: 13, estado: 'Mérida' },
            { codigo_estado: 14, estado: 'Miranda' },
            { codigo_estado: 15, estado: 'Monagas' },
            { codigo_estado: 16, estado: 'Nueva Esparta' },
            { codigo_estado: 17, estado: 'Portuguesa' },
            { codigo_estado: 18, estado: 'Sucre' },
            { codigo_estado: 19, estado: 'Táchira' },
            { codigo_estado: 20, estado: 'Trujillo' },
            { codigo_estado: 21, estado: 'Vargas' },
            { codigo_estado: 22, estado: 'Yaracuy' },
            { codigo_estado: 23, estado: 'Zulia' },
            { codigo_estado: 24, estado: 'Distrito Capital' }
          ];
        }
        throw error;
      }
    },
    staleTime: 1000 * 60 * 60, // 1 hora
  });
}; 