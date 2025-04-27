// Función para detectar el host y construir la URL base de la API
export const detectHost = async () => {
  // Usar la URL configurada en variables de entorno
  return process.env.NEXT_PUBLIC_API_URL || 'https://banempre.online/api';
};

// Cliente API básico
export const apiClient = {
  get: async (endpoint) => {
    const host = await detectHost();
    const response = await fetch(`${host}/${endpoint}`);
    
    if (!response.ok) {
      throw new Error(`Error en solicitud GET: ${response.statusText}`);
    }
    
    return response.json();
  },
  
  post: async (endpoint, data, token = null) => {
    const host = await detectHost();
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${host}/${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
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
  },
  
  patch: async (endpoint, data, token = null) => {
    const host = await detectHost();
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${host}/${endpoint}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
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
  },
  
  delete: async (endpoint, token = null) => {
    const host = await detectHost();
    const headers = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${host}/${endpoint}`, {
      method: 'DELETE',
      headers,
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
  }
}; 