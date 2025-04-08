'use client';

import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../api';

// Interfaz para los datos de entrada del login
interface LoginPayload {
  username: string;
  password: string;
}

// Interfaz para la respuesta esperada de la API de login
// Asegúrate que coincida con lo que devuelve tu endpoint /api/login
export interface LoginResponse {
  access_token: string;
  token_type: string;
  isAdmin: boolean;
  // Añade otros campos si la API devuelve más datos
}

// Hook personalizado useLogin
export const useLogin = () => {
  // No necesitamos queryClient aquí normalmente, a menos que el login
  // deba invalidar/actualizar otros datos cacheados.

  return useMutation<LoginResponse, Error, LoginPayload>({
    mutationFn: (payload) => {
      console.log('Attempting login to:', `${process.env.NEXT_PUBLIC_API_URL}/api/login`);
      return apiClient.post<LoginResponse>('api/login', payload);
    },
    onSuccess: (data) => {
      // Lógica de éxito (ej. guardar token, redirigir) se manejará
      // en el componente usando la callback onSuccess de mutate().
      console.log('Login exitoso:', data);
    },
    onError: (error) => {
      // Lógica de error (ej. mostrar toast) se manejará en el componente.
      console.error('Error en el login:', error);
    },
  });
}; 