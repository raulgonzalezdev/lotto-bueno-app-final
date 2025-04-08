'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api';

// Definir la interfaz para un Recolector según tu API
interface Recolector {
  id: number;
  nombre: string;
  cedula: string;
  telefono: string;
  es_referido: boolean;
  // Añade otros campos si son necesarios
}

// Definir la interfaz para la respuesta de la API
interface RecolectoresResponse {
  total: number;
  items: Recolector[];
}

// Hook personalizado
export const useRecolectores = () => {
  return useQuery<RecolectoresResponse, Error>({
    queryKey: ['recolectores'],
    queryFn: () => apiClient.get<RecolectoresResponse>('api/recolectores/'),
    // Opciones adicionales (opcional)
    // staleTime: 5 * 60 * 1000, 
    // cacheTime: 10 * 60 * 1000, 
    // refetchOnWindowFocus: false, 
  });
}; 