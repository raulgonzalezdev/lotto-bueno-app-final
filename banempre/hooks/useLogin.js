'use client';

import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../api';

// Hook personalizado useLogin
export const useLogin = () => {
  return useMutation({
    mutationFn: async (payload) => {
      console.log('Intentando iniciar sesión');
      // Usar solo 'login' como endpoint (sin el prefijo api/)
      const response = await apiClient.post('login', payload);
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