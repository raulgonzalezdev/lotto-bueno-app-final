'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api';

interface Municipio {
  codigo_municipio: string; // O number
  municipio: string;
  // Otros campos si existen
}

// Hook personalizado useMunicipios
export const useMunicipios = (codigoEstado: string) => {
  return useQuery<Municipio[], Error>({
    queryKey: ['municipios', codigoEstado],
    queryFn: async () => {
      // No hacer fetch si no hay código de estado
      if (!codigoEstado) {
        return [];
      }

      const data = await apiClient.get<Municipio[]>(`api/municipios/${encodeURIComponent(codigoEstado)}`);
      
      if (Array.isArray(data)) {
        return data.sort((a: Municipio, b: Municipio) => 
          a.municipio.localeCompare(b.municipio, 'es', { sensitivity: 'base' })
        );
      }
      return [];
    },
    enabled: !!codigoEstado, // Solo ejecutar la query si codigoEstado tiene valor
  });
}; 