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
      console.error('Error en respuesta:', await response.text());
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
      throw new Error(`Error en solicitud DELETE: ${response.statusText}`);
    }
    
    return;
  }
}; 