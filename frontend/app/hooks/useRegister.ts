'use client';

import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../api';

// Interfaz para los datos de entrada del registro
interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  isAdmin?: boolean;
}

// Interfaz para la respuesta esperada de la API de registro
export interface RegisterResponse {
  id: number;
  username: string;
  email: string;
  isAdmin: boolean;
  // Añade otros campos si la API devuelve más datos
}

// Hook personalizado useRegister
export const useRegister = () => {
  return useMutation<RegisterResponse, Error, RegisterPayload>({
    mutationFn: (payload) => apiClient.post<RegisterResponse>('api/register', payload),
    onSuccess: (data) => {
      console.log('Registro exitoso:', data);
    },
    onError: (error) => {
      console.error('Error en el registro:', error);
    },
  });
}; 