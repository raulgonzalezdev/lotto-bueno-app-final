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
    
    try {
      const response = await fetch(`${host}/${endpoint}`, {
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
      
      return response.json();
    } catch (error) {
      // En modo desarrollo, podemos retornar datos ficticios si hay error de conexión
      if (isDevelopment) {
        console.warn('Usando datos de desarrollo debido a un error:', error.message);
        // Devolvemos un objeto vacío o datos de prueba según el endpoint
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
    
    try {
      const response = await fetch(`${host}/${endpoint}`, {
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
      if (isDevelopment && endpoint.includes('api/login')) {
        console.warn('Usando autenticación simulada en modo desarrollo:', error.message);
        return { token: 'dev-token-123', user: { username: 'dev-user' } };
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
    
    try {
      const response = await fetch(`${host}/${endpoint}`, {
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
    
    try {
      const response = await fetch(`${host}/${endpoint}`, {
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