'use client';

import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../api';

// Hook personalizado useLogin
export const useLogin = () => {
  return useMutation({
    mutationFn: async (payload) => {
      console.log('Intentando iniciar sesión');
      // Usar directamente api/login como endpoint
      const response = await apiClient.post('api/login', payload);
      return response;
    },
    onSuccess: (data) => {
      // Lógica de éxito será manejada en el componente
      console.log('Login exitoso');
    },
    onError: (error) => {
      // Lógica de error será manejada en el componente
      console.error('Error en el login:', error);
    },
  });
}; 