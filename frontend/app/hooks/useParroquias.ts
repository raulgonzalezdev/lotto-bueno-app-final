'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api';

interface Parroquia {
  codigo_parroquia: string; // O number
  parroquia: string;
  // Otros campos si existen
}

// Hook personalizado useParroquias
export const useParroquias = (codigoEstado: string, codigoMunicipio: string) => {
  return useQuery<Parroquia[], Error>({
    queryKey: ['parroquias', codigoEstado, codigoMunicipio],
    queryFn: async () => {
      if (!codigoEstado || !codigoMunicipio) {
        return [];
      }

      const data = await apiClient.get<Parroquia[]>(
        `api/parroquias/${encodeURIComponent(codigoEstado)}/${encodeURIComponent(codigoMunicipio)}`
      );
      
      if (Array.isArray(data)) {
        return data.sort((a: Parroquia, b: Parroquia) => 
          a.parroquia.localeCompare(b.parroquia, 'es', { sensitivity: 'base' })
        );
      }
      return [];
    },
    enabled: !!codigoEstado && !!codigoMunicipio, // Ejecutar solo si ambos códigos están presentes
  });
}; 