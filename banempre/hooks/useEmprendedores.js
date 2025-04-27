import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api';
import { useAuth } from '../context/AuthContext';

// Verificar si estamos en modo desarrollo
const isDevelopment = process.env.NODE_ENV === 'development';

// Datos de prueba para desarrollo
const mockEmprendedores = [
  {
    id: 1,
    cedula: '12345678',
    nombre_apellido: 'Juan Pérez',
    rif: 'J-12345678-9',
    nombre_emprendimiento: 'Panadería El Trigo',
    telefono: '0414-1234567',
    estado: 'Distrito Capital',
    municipio: 'Libertador',
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    cedula: '87654321',
    nombre_apellido: 'María González',
    rif: 'J-87654321-0',
    nombre_emprendimiento: 'Artesanías Mágicas',
    telefono: '0424-7654321',
    estado: 'Miranda',
    municipio: 'Chacao',
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    cedula: '23456789',
    nombre_apellido: 'Carlos Rodríguez',
    rif: 'J-23456789-1',
    nombre_emprendimiento: 'Tecnología CR',
    telefono: '0412-3456789',
    estado: 'Aragua',
    municipio: 'Girardot',
    created_at: new Date().toISOString()
  }
];

// Datos de prueba para un elector
const mockElector = {
  nombre_apellido: 'Pedro Hernández',
  estado: 'Carabobo',
  municipio: 'Valencia'
};

// --- Hooks --- //

// Hook para obtener emprendedores
export const useEmprendedores = (params = {}) => {
  const { 
    currentPage = 1, 
    emprendedoresPerPage = 10, 
    searchTerm = '',
    estado = '',
    municipio = ''
  } = params;
  
  const queryClient = useQueryClient();
  const { token } = useAuth();
  
  return useQuery({
    queryKey: ['emprendedores', currentPage, emprendedoresPerPage, searchTerm, estado, municipio],
    queryFn: async () => {
      try {
        const queryParams = {
          skip: ((currentPage - 1) * emprendedoresPerPage).toString(),
          limit: emprendedoresPerPage.toString()
        };
        
        if (searchTerm) queryParams.search = searchTerm;
        
        // Si estado y municipio son IDs, necesitamos convertirlos a nombres
        if (estado) {
          // Intentar obtener los estados de la caché
          const estadosCache = queryClient.getQueryData(['estados']);
          
          if (estadosCache) {
            // Buscar el estado por su código
            const estadoObj = estadosCache.find(e => e.codigo_estado.toString() === estado);
            if (estadoObj) {
              // Usar el nombre del estado en lugar del código
              queryParams.estado = estadoObj.estado;
            } else {
              // Si no se encuentra, usar el ID directamente
              queryParams.estado = estado;
            }
          } else {
            queryParams.estado = estado;
          }
        }
        
        if (municipio) {
          // Intentar obtener los municipios de la caché
          const municipiosCache = queryClient.getQueryData(['municipios', estado]);
          
          if (municipiosCache) {
            // Buscar el municipio por su código
            const municipioObj = municipiosCache.find(m => m.codigo_municipio.toString() === municipio);
            if (municipioObj) {
              // Usar el nombre del municipio en lugar del código
              queryParams.municipio = municipioObj.municipio;
            } else {
              // Si no se encuentra, usar el ID directamente
              queryParams.municipio = municipio;
            }
          } else {
            queryParams.municipio = municipio;
          }
        }
        
        const host = await apiClient.detectHost();
        const url = `emprendedores/?${new URLSearchParams(queryParams)}`;
        
        const response = await apiClient.get(url, token);
        return {
          items: response.items || [],
          total: typeof response.total === 'number' ? response.total : (response.items?.length || 0)
        };
      } catch (fetchError) {
        console.error('Error en fetch:', fetchError);
        
        // Si estamos en desarrollo, devolvemos datos simulados
        if (isDevelopment) {
          // Filtramos los datos de prueba según los criterios de búsqueda
          let filteredData = [...mockEmprendedores];
          
          if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filteredData = filteredData.filter(e => 
              e.nombre_apellido.toLowerCase().includes(term) ||
              e.nombre_emprendimiento.toLowerCase().includes(term) ||
              e.cedula.includes(term)
            );
          }
          
          if (estado) {
            // Para el filtrado en modo desarrollo, convertimos el código a nombre si es posible
            const estadosCache = queryClient.getQueryData(['estados']);
            let estadoNombre = estado;
            
            if (estadosCache) {
              const estadoObj = estadosCache.find(e => e.codigo_estado.toString() === estado);
              if (estadoObj) {
                estadoNombre = estadoObj.estado;
              }
            }
            
            filteredData = filteredData.filter(e => 
              e.estado === estadoNombre || 
              e.estado.includes(estadoNombre) || 
              estadoNombre.includes(e.estado)
            );
          }
          
          if (municipio) {
            // Para el filtrado en modo desarrollo, convertimos el código a nombre si es posible
            const municipiosCache = queryClient.getQueryData(['municipios', estado]);
            let municipioNombre = municipio;
            
            if (municipiosCache) {
              const municipioObj = municipiosCache.find(m => m.codigo_municipio.toString() === municipio);
              if (municipioObj) {
                municipioNombre = municipioObj.municipio;
              }
            }
            
            filteredData = filteredData.filter(e => 
              e.municipio === municipioNombre || 
              e.municipio.includes(municipioNombre) || 
              municipioNombre.includes(e.municipio)
            );
          }
          
          return {
            items: filteredData.slice((currentPage - 1) * emprendedoresPerPage, currentPage * emprendedoresPerPage),
            total: filteredData.length
          };
        }
        
        throw fetchError;
      }
    },
    placeholderData: (oldData) => oldData || { items: [], total: 0 },
    refetchOnWindowFocus: false,
  });
};

// Hook para obtener datos de un elector por cédula para autocompletar formulario
export const useElectorDataForEmprendedor = (cedula) => {
  return useQuery({
    queryKey: ['electorForEmprendedor', cedula],
    queryFn: async () => {
      if (!cedula || cedula.length < 7) return null;
      try {
        const response = await apiClient.get(`emprendedores/get_elector_data/${cedula}`);
        return response;
      } catch (error) {
        console.log('Elector no encontrado, pero se permitirá el registro manual');
        
        // En desarrollo, devolvemos datos simulados del elector
        if (isDevelopment && cedula === '12345678') {
          console.warn('Usando datos simulados de elector en desarrollo');
          return mockElector;
        }
        
        return null;
      }
    },
    enabled: !!cedula && cedula.length >= 7,
  });
};

// Hook para crear un emprendedor
export const useCreateEmprendedor = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload) => {
      try {
        console.log('Enviando datos:', payload);
        console.log('Token:', token);
        return await apiClient.post('emprendedores', payload, token);
      } catch (error) {
        console.error('Error en mutación:', error);
        
        // En desarrollo, simulamos una respuesta exitosa
        if (isDevelopment) {
          console.warn('Simulando creación exitosa en desarrollo');
          return {
            id: mockEmprendedores.length + 1,
            ...payload,
            created_at: new Date().toISOString()
          };
        }
        
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emprendedores'] });
    }
  });
};

// Hook para actualizar un emprendedor
export const useUpdateEmprendedor = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ emprendedorId, payload }) => {
      try {
        return await apiClient.patch(`emprendedores/${emprendedorId}`, payload, token);
      } catch (error) {
        // En desarrollo, simulamos una respuesta exitosa
        if (isDevelopment) {
          console.warn('Simulando actualización exitosa en desarrollo');
          return {
            id: emprendedorId,
            ...payload,
            updated_at: new Date().toISOString()
          };
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emprendedores'] });
    },
  });
};

// Hook para eliminar un emprendedor
export const useDeleteEmprendedor = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (emprendedorId) => {
      try {
        return await apiClient.delete(`emprendedores/${emprendedorId}`, token);
      } catch (error) {
        // En desarrollo, simulamos una eliminación exitosa
        if (isDevelopment) {
          console.warn('Simulando eliminación exitosa en desarrollo');
          return { success: true };
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emprendedores'] });
    },
  });
};

// Hook para verificar si existe un emprendedor por cédula
export const useCheckEmprendedorExistsByCedula = (cedula) => {
  return useQuery({
    queryKey: ['emprendedorExists', cedula],
    queryFn: async () => {
      if (!cedula || cedula.length < 6) return false;
      try {
        const response = await apiClient.get(`emprendedores/check_cedula/${cedula}`);
        return response.exists;
      } catch (error) {
        // En desarrollo, para algunas cédulas simulamos que ya existen
        if (isDevelopment) {
          // La cédula 12345678 ya existe en nuestros datos de prueba
          return cedula === '12345678';
        }
        return false;
      }
    },
    enabled: !!cedula && cedula.length >= 6,
  });
};

// Hook para obtener un emprendedor por cédula
export const useEmprendedorByCedula = (cedula) => {
  return useQuery({
    queryKey: ['emprendedor', cedula],
    queryFn: async () => {
      if (!cedula || cedula.length < 6) return null;
      try {
        const response = await apiClient.get(`emprendedores/by_cedula/${cedula}`);
        return response;
      } catch (error) {
        // En desarrollo, devolvemos un emprendedor simulado si coincide con nuestros datos de prueba
        if (isDevelopment) {
          const mockEmprendedor = mockEmprendedores.find(e => e.cedula === cedula);
          if (mockEmprendedor) {
            console.warn('Usando datos simulados de emprendedor en desarrollo');
            return mockEmprendedor;
          }
        }
        return null;
      }
    },
    enabled: !!cedula && cedula.length >= 6,
  });
}; 