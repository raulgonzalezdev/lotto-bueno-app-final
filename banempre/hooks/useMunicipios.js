import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api';

export const useMunicipios = (estadoId) => {
  return useQuery({
    queryKey: ['municipios', estadoId],
    queryFn: async () => {
      // Si no hay estado seleccionado, devolver array vacío
      if (!estadoId) return [];
      
      try {
        // Cambiar la ruta para incluir "api" al inicio y usar encodeURIComponent
        const data = await apiClient.get(`api/municipios/${encodeURIComponent(estadoId)}`);
        
        // Verificar que los datos sean un array y ordenarlos
        if (Array.isArray(data)) {
          return data.sort((a, b) => 
            a.municipio.localeCompare(b.municipio, 'es', { sensitivity: 'base' })
          );
        }
        
        // Si la respuesta incluye data como propiedad, intentar usarla
        if (data && Array.isArray(data.data)) {
          return data.data.sort((a, b) => 
            a.municipio.localeCompare(b.municipio, 'es', { sensitivity: 'base' })
          );
        }
        
        // Si no hay datos válidos, devolver array vacío
        return [];
      } catch (error) {
        console.error(`Error al obtener municipios para estado ${estadoId}:`, error);
        
        // En modo desarrollo, devolver datos de ejemplo
        if (process.env.NODE_ENV === 'development') {
          // Datos de ejemplo según el estado
          const municipiosPorEstado = {
            '1': [
              { codigo_municipio: 101, municipio: 'Alto Orinoco' },
              { codigo_municipio: 102, municipio: 'Atabapo' },
              { codigo_municipio: 103, municipio: 'Atures' }
            ],
            '2': [
              { codigo_municipio: 201, municipio: 'Anaco' },
              { codigo_municipio: 202, municipio: 'Aragua' },
              { codigo_municipio: 203, municipio: 'Bolívar' }
            ],
            '14': [
              { codigo_municipio: 1401, municipio: 'Acevedo' },
              { codigo_municipio: 1402, municipio: 'Andrés Bello' },
              { codigo_municipio: 1403, municipio: 'Baruta' },
              { codigo_municipio: 1404, municipio: 'Brión' },
              { codigo_municipio: 1405, municipio: 'Buroz' }
            ]
          };
          
          // Devolver municipios del estado seleccionado o un array vacío
          const municipiosMock = municipiosPorEstado[estadoId] || [];
          
          // Ordenar también los datos mock
          return municipiosMock.sort((a, b) => 
            a.municipio.localeCompare(b.municipio, 'es', { sensitivity: 'base' })
          );
        }
        throw error;
      }
    },
    staleTime: 1000 * 60 * 60, // 1 hora
    enabled: !!estadoId
  });
}; 