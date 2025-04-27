import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api';
import { useAuth } from '../context/AuthContext';

// --- Hooks --- //

// Hook para obtener datos de un elector por cédula para autocompletar formulario
export const useElectorDataForEmprendedor = (cedula) => {
  return useQuery({
    queryKey: ['electorForEmprendedor', cedula],
    queryFn: async () => {
      if (!cedula || cedula.length < 7) return null;
      try {
        const response = await apiClient.get(`emprendedores/get_elector_data/${cedula}`);
        return response;
      } catch (error) {
        console.log('Elector no encontrado, pero se permitirá el registro manual');
        return null;
      }
    },
    enabled: !!cedula && cedula.length >= 7,
  });
};

// Hook para crear un emprendedor
export const useCreateEmprendedor = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload) => {
      try {
        console.log('Enviando datos:', payload);
        console.log('Token:', token);
        return await apiClient.post('emprendedores', payload, token);
      } catch (error) {
        console.error('Error en mutación:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emprendedores'] });
    }
  });
}; 