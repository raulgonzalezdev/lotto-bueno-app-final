'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api';

// TODO: Definir o importar una interfaz más específica para Settings si está disponible.
type SettingsResponse = Record<string, any> & { currentTemplate?: string };

// Hook personalizado useSettings
export const useSettings = () => {
  return useQuery<SettingsResponse, Error>({
    queryKey: ['settings'], // Clave única para la query de configuración
    queryFn: async () => {
      try {
       // console.log('Fetching settings from:', `${process.env.NEXT_PUBLIC_API_URL}/api/settings`);
        return await apiClient.get<SettingsResponse>('api/settings');
      } catch (error) {
        console.error("Error fetching settings:", error);
        throw error;
      }
    },
  });
}; 