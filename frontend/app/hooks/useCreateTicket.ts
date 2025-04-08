'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api';

// Interfaz para los datos que necesita la mutación (la API)
export interface CreateTicketPayload {
  cedula: string;
  telefono: string;
  referido_id?: number;
}

// Interfaz para la respuesta de la API
export interface CreateTicketResponse {
  success?: boolean;
  message: string;
  ticket_number?: string;
  qr_code?: string;
  id?: string;  // Añadir la propiedad id que faltaba
  // Añade otros campos si la API devuelve más datos
}

/**
 * Hook para crear un ticket
 */
export const useCreateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation<CreateTicketResponse, Error, CreateTicketPayload>({
    mutationFn: (payload) => apiClient.post<CreateTicketResponse>('api/generate_tickets', payload),
    // Opciones de useMutation (onSuccess, onError, etc. van dentro del objeto)
    onSuccess: (data: CreateTicketResponse) => { // Añadir tipo explícito para data
      // Puedes invalidar queries aquí si es necesario
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    }
  });
}; 