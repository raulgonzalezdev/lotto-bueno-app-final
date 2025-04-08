'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api';

interface CentroVotacion {
  codificacion_nueva_cv: string; // O number
  nombre_cv: string;
  // Otros campos según tu schema CentroVotacionList
}

// Hook personalizado useCentrosVotacion
export const useCentrosVotacion = (codigoEstado: string, codigoMunicipio: string, codigoParroquia: string) => {
  return useQuery<CentroVotacion[], Error>({
    queryKey: ['centrosVotacion', codigoEstado, codigoMunicipio, codigoParroquia],
    queryFn: async () => {
      if (!codigoEstado || !codigoMunicipio || !codigoParroquia) {
        return [];
      }

      const data = await apiClient.get<CentroVotacion[]>(
        `api/centros_votacion/${encodeURIComponent(codigoEstado)}/${encodeURIComponent(codigoMunicipio)}/${encodeURIComponent(codigoParroquia)}`
      );
      
      if (Array.isArray(data)) {
        return data.sort((a: CentroVotacion, b: CentroVotacion) => 
          a.nombre_cv.localeCompare(b.nombre_cv, 'es', { sensitivity: 'base' })
        );
      }
      return [];
    },
    enabled: !!codigoEstado && !!codigoMunicipio && !!codigoParroquia, // Ejecutar solo si los tres códigos están presentes
  });
}; 