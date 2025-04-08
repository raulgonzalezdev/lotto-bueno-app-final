'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api';

// Interfaz para un Estado según la API
interface Estado {
  codigo_estado: string;
  estado: string;
  // Otros campos si existen
}

// Hook personalizado useEstados
export const useEstados = () => {
  return useQuery<Estado[], Error>({
    queryKey: ['estados'],
    queryFn: async () => {
      const data = await apiClient.get<Estado[]>('api/estados');
      
      if (Array.isArray(data)) {
        return data.sort((a: Estado, b: Estado) => 
          a.estado.localeCompare(b.estado, 'es', { sensitivity: 'base' })
        );
      }
      return [];
    }
  });
}; 