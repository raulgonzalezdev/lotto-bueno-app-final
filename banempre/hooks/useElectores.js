import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api';

// Hook para obtener un elector por cédula (versión simple)
export const useElectorSimpleByCedula = (cedula) => {
  return useQuery({
    queryKey: ['elector', 'simple', cedula],
    queryFn: async () => {
      if (!cedula || cedula.length < 6) return null;
      
      try {
        const response = await apiClient.get(`/electores/simple/${cedula}`);
        return response.data;
      } catch (error) {
        // En modo desarrollo, devolver datos de ejemplo
        if (process.env.NODE_ENV === 'development') {
          if (cedula === '123456') {
            return {
              nombre_apellido: 'JUAN PEREZ',
              cedula: '123456',
              estado: 'Miranda',
              municipio: 'Baruta'
            };
          }
          return null;
        }
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: cedula && cedula.length >= 6
  });
};

// Función para buscar elector por cédula para emprendedor
export const useElectorDataForEmprendedor = (cedula) => {
  return useQuery({
    queryKey: ['electorData', 'emprendedor', cedula],
    queryFn: async () => {
      if (!cedula || cedula.length < 6) return null;
      
      try {
        const response = await apiClient.get(`/electores/data/${cedula}`);
        return response.data;
      } catch (error) {
        // En modo desarrollo, devolver datos de ejemplo
        if (process.env.NODE_ENV === 'development') {
          if (cedula === '123456') {
            return {
              nombre_apellido: 'JUAN PEREZ',
              cedula: '123456',
              estado: 'Miranda',
              municipio: 'Baruta'
            };
          }
          return null;
        }
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: cedula && cedula.length >= 6
  });
}; 