// Función para detectar el host y construir la URL base de la API
export const detectHost = async () => {
  // Verificar si estamos en desarrollo
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // En desarrollo, podemos utilizar un host local para evitar problemas de CORS
  if (isDevelopment) {
    // Si existe la variable de entorno, usarla, sino usar localhost
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  }
  
  // En producción usar la URL real
  return process.env.NEXT_PUBLIC_API_URL || 'https://banempre.online/api';
};

// Cliente API básico
export const apiClient = {
  detectHost: async () => {
    return await detectHost();
  },
  
  get: async (endpoint, token = null) => {
    const host = await detectHost();
    const headers = {};
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Asegurar que no haya barras duplicadas
    const url = `${host}/${endpoint}`.replace(/([^:]\/)\/+/g, "$1");
    console.log(`Haciendo GET a: ${url}`);
    
    try {
      const response = await fetch(url, {
        headers,
        // En desarrollo, incluimos credenciales para posibles casos donde la API está en otro dominio
        ...(isDevelopment && { credentials: 'include' })
      });
      
      if (!response.ok) {
        // Intentar obtener el mensaje de error de la respuesta
        try {
          const errorData = await response.json();
          // Si hay un objeto de error con detalle, lanzamos ese mensaje específico
          if (errorData && errorData.detail) {
            throw new Error(errorData.detail);
          }
        } catch (jsonError) {
          // Si no podemos analizar la respuesta como JSON, lanzamos el error original
        }
        
        throw new Error(`Error en solicitud GET: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`Respuesta de ${url}:`, data);
      return data;
    } catch (error) {
      // En modo desarrollo, podemos retornar datos ficticios si hay error de conexión
      if (isDevelopment) {
        console.warn('Usando datos de desarrollo debido a un error:', error.message);
        
        // Datos de ejemplo según el endpoint
        if (endpoint.includes('emprendedores') && !endpoint.includes('cedula')) {
          return {
            total: 5,
            items: [
              {
                cedula: "11436207",
                nombre_apellido: "RAUL ANTONIO GONZALEZ QUIJADA",
                rif: "V114362073",
                nombre_emprendimiento: "DISEÑOS CREATIVOS",
                telefono: "04148398384",
                estado: "EDO. ANZOATEGUI",
                municipio: "MP. ANACO",
                id: 1,
                created_at: "2025-04-26T19:20:17.122521Z"
              },
              {
                cedula: "25434020",
                nombre_apellido: "MARIA LAURA GONZALEZ MATUTE",
                rif: "v1152555555",
                nombre_emprendimiento: "p`ruena de registe",
                telefono: "584248822479",
                estado: "EDO. ANZOATEGUI",
                municipio: "MP. L/DIEGO BAUTISTA",
                id: 2,
                created_at: "2025-04-27T03:52:23.401696Z"
              }
            ]
          };
        } else if (endpoint.includes('estados')) {
          return [
            {"codigo_estado":1,"codigo_municipio":null,"codigo_parroquia":null,"estado":"DTTO. CAPITAL","municipio":null,"parroquia":null,"id":0},
            {"codigo_estado":22,"codigo_municipio":null,"codigo_parroquia":null,"estado":"EDO. AMAZONAS","municipio":null,"parroquia":null,"id":1},
            {"codigo_estado":2,"codigo_municipio":null,"codigo_parroquia":null,"estado":"EDO. ANZOATEGUI","municipio":null,"parroquia":null,"id":2}
          ];
        }
        
        // Devolvemos un objeto vacío para otros endpoints
        return {};
      }
      throw error;
    }
  },
  
  post: async (endpoint, data, token = null) => {
    const host = await detectHost();
    const headers = {
      'Content-Type': 'application/json',
    };
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Asegurar que no haya barras duplicadas
    const url = `${host}/${endpoint}`.replace(/([^:]\/)\/+/g, "$1");
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
        // En desarrollo, incluimos credenciales para posibles casos donde la API está en otro dominio
        ...(isDevelopment && { credentials: 'include' })
      });
      
      if (!response.ok) {
        // Intentar obtener el mensaje de error de la respuesta
        try {
          const errorData = await response.json();
          // Si hay un objeto de error con detalle, lanzamos ese mensaje específico
          if (errorData && errorData.detail) {
            throw new Error(errorData.detail);
          }
        } catch (jsonError) {
          // Si no podemos analizar la respuesta como JSON, lanzamos el error original
          console.error('Error en respuesta:', response.statusText);
        }
        
        // Si llegamos aquí, no hemos lanzado un error específico, así que lanzamos el genérico
        throw new Error(`Error en solicitud POST: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      // En modo desarrollo, si el endpoint es de autenticación, podemos simular una respuesta
      if (isDevelopment && endpoint === 'login') {
        console.warn('Usando autenticación simulada en modo desarrollo:', error.message);
        return { 
          access_token: 'dev-token-123',
          token_type: 'bearer',
          isAdmin: true
        };
      }
      throw error;
    }
  },
  
  patch: async (endpoint, data, token = null) => {
    const host = await detectHost();
    const headers = {
      'Content-Type': 'application/json',
    };
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Asegurar que no haya barras duplicadas
    const url = `${host}/${endpoint}`.replace(/([^:]\/)\/+/g, "$1");
    
    try {
      const response = await fetch(url, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(data),
        // En desarrollo, incluimos credenciales para posibles casos donde la API está en otro dominio
        ...(isDevelopment && { credentials: 'include' })
      });
      
      if (!response.ok) {
        // Intentar obtener el mensaje de error de la respuesta
        try {
          const errorData = await response.json();
          // Si hay un objeto de error con detalle, lanzamos ese mensaje específico
          if (errorData && errorData.detail) {
            throw new Error(errorData.detail);
          }
        } catch (jsonError) {
          // Si no podemos analizar la respuesta como JSON, lanzamos el error original
        }
        
        throw new Error(`Error en solicitud PATCH: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      // En modo desarrollo, podemos retornar datos ficticios si hay error de conexión
      if (isDevelopment) {
        console.warn('Usando datos de desarrollo debido a un error:', error.message);
        return { success: true };
      }
      throw error;
    }
  },
  
  delete: async (endpoint, token = null) => {
    const host = await detectHost();
    const headers = {};
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Asegurar que no haya barras duplicadas
    const url = `${host}/${endpoint}`.replace(/([^:]\/)\/+/g, "$1");
    
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers,
        // En desarrollo, incluimos credenciales para posibles casos donde la API está en otro dominio
        ...(isDevelopment && { credentials: 'include' })
      });
      
      if (!response.ok) {
        // Intentar obtener el mensaje de error de la respuesta
        try {
          const errorData = await response.json();
          // Si hay un objeto de error con detalle, lanzamos ese mensaje específico
          if (errorData && errorData.detail) {
            throw new Error(errorData.detail);
          }
        } catch (jsonError) {
          // Si no podemos analizar la respuesta como JSON, lanzamos el error original
        }
        
        throw new Error(`Error en solicitud DELETE: ${response.statusText}`);
      }
      
      return;
    } catch (error) {
      // En modo desarrollo, podemos simular una respuesta exitosa
      if (isDevelopment) {
        console.warn('Simulando eliminación exitosa en modo desarrollo:', error.message);
        return;
      }
      throw error;
    }
  }
}; 