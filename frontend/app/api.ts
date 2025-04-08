export const detectHost = async (): Promise<string> => {
  // Forzar HTTPS y asegurar el formato correcto de la URL
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://applottobueno.com";
  const url = apiUrl.startsWith('https://') ? apiUrl : `https://${apiUrl}`;
  // Eliminar cualquier barra diagonal al final de la URL
  return url.replace(/\/+$/, '');
};

// Funciones utilitarias
const getBaseUrl = (): string => {
  let baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) {
    // Si no hay una URL definida, usar el host actual
    if (typeof window !== 'undefined') {
      baseUrl = window.location.origin;
    } else {
      baseUrl = 'https://applottobueno.com';
    }
  }
  
  // Garantizar que siempre usamos HTTPS
  if (baseUrl.startsWith('http://')) {
    baseUrl = baseUrl.replace('http://', 'https://');
  } else if (!baseUrl.startsWith('https://')) {
    baseUrl = `https://${baseUrl}`;
  }
  
  // Asegurar que la URL termine con /
  if (!baseUrl.endsWith('/')) {
    baseUrl = `${baseUrl}/`;
  }
  
  return baseUrl;
};

// Configuración base para los requests
const createRequest = (method: string, endpoint: string, data?: any, params?: Record<string, string>): RequestInit & { url: URL } => {
  const baseUrl = getBaseUrl();
  const url = new URL(endpoint, baseUrl);
  
  // Agregar parámetros de consulta si existen
  if (params) {
    Object.keys(params).forEach(key => {
      if (params[key]) {
        url.searchParams.append(key, params[key]);
      }
    });
  }
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  const config: RequestInit = {
    method,
    headers,
  };
  
  if (data) {
    config.body = JSON.stringify(data);
  }
  
  return { ...config, url };
};

// Procesamiento de respuestas
const processResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Error ${response.status}: No se pudo procesar la solicitud`);
  }
  
  // Algunos endpoints DELETE pueden devolver una respuesta vacía
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return {} as T;
  }
  
  return response.json();
};

// Cliente API para React Query
export const queryClient = {
  // Funciones para obtener datos (para useQuery)
  queries: {
    // Obtener usuarios
    getUsers: async <T>(params?: Record<string, string>): Promise<T> => {
      const { url, ...config } = createRequest('GET', 'api/users/', undefined, params);
      const response = await fetch(url.toString(), config);
      return processResponse<T>(response);
    },
    
    // Obtener estados
    getEstados: async <T>(): Promise<T> => {
      const { url, ...config } = createRequest('GET', 'api/estados/');
      const response = await fetch(url.toString(), config);
      return processResponse<T>(response);
    },
    
    // Obtener municipios
    getMunicipios: async <T>(codigoEstado: string): Promise<T> => {
      const { url, ...config } = createRequest('GET', `api/municipios/${encodeURIComponent(codigoEstado)}`);
      const response = await fetch(url.toString(), config);
      return processResponse<T>(response);
    },
    
    // Obtener parroquias
    getParroquias: async <T>(codigoEstado: string, codigoMunicipio: string): Promise<T> => {
      const { url, ...config } = createRequest('GET', `api/parroquias/${encodeURIComponent(codigoEstado)}/${encodeURIComponent(codigoMunicipio)}`);
      const response = await fetch(url.toString(), config);
      return processResponse<T>(response);
    },
    
    // Obtener centros de votación
    getCentrosVotacion: async <T>(codigoEstado: string, codigoMunicipio: string, codigoParroquia: string): Promise<T> => {
      const { url, ...config } = createRequest('GET', `api/centros_votacion/${encodeURIComponent(codigoEstado)}/${encodeURIComponent(codigoMunicipio)}/${encodeURIComponent(codigoParroquia)}`);
      const response = await fetch(url.toString(), config);
      return processResponse<T>(response);
    },
    
    // Obtener recolectores
    getRecolectores: async <T>(): Promise<T> => {
      const { url, ...config } = createRequest('GET', 'api/recolectores/');
      const response = await fetch(url.toString(), config);
      return processResponse<T>(response);
    },
    
    // Obtener tickets
    getTickets: async <T>(params?: Record<string, string>): Promise<T> => {
      const { url, ...config } = createRequest('GET', 'api/tickets/', undefined, params);
      const response = await fetch(url.toString(), config);
      return processResponse<T>(response);
    },
    
    // Obtener settings
    getSettings: async <T>(): Promise<T> => {
      const { url, ...config } = createRequest('GET', 'api/settings/');
      const response = await fetch(url.toString(), config);
      return processResponse<T>(response);
    },
    
    // Método GET genérico (para endpoints no específicos)
    get: async <T>(endpoint: string, params?: Record<string, string>): Promise<T> => {
      const { url, ...config } = createRequest('GET', endpoint, undefined, params);
      const response = await fetch(url.toString(), config);
      return processResponse<T>(response);
    }
  },
  
  // Funciones para mutaciones (para useMutation)
  mutations: {
    // Login
    login: async <T>(data: { username: string; password: string }): Promise<T> => {
      const { url, ...config } = createRequest('POST', 'api/login', data);
      const response = await fetch(url.toString(), config);
      return processResponse<T>(response);
    },
    
    // Registro
    register: async <T>(data: { username: string; email: string; password: string; isAdmin?: boolean }): Promise<T> => {
      const { url, ...config } = createRequest('POST', 'api/register', data);
      const response = await fetch(url.toString(), config);
      return processResponse<T>(response);
    },
    
    // Crear ticket
    createTicket: async <T>(data: { cedula: string; telefono: string; referido_id: number }): Promise<T> => {
      const { url, ...config } = createRequest('POST', 'api/generate_tickets', data);
      const response = await fetch(url.toString(), config);
      return processResponse<T>(response);
    },
    
    // Actualizar ticket
    updateTicket: async <T>(ticketId: number, data: { validado?: boolean; ganador?: boolean }): Promise<T> => {
      const { url, ...config } = createRequest('PATCH', `api/tickets/${ticketId}`, data);
      const response = await fetch(url.toString(), config);
      return processResponse<T>(response);
    },
    
    // Realizar sorteo
    realizarSorteo: async <T>(data: { cantidad_ganadores: number; estado?: string; municipio?: string }): Promise<T> => {
      const { url, ...config } = createRequest('POST', 'api/sorteo/ganadores', data);
      const response = await fetch(url.toString(), config);
      return processResponse<T>(response);
    },
    
    // Quitar ganadores
    quitarGanadores: async <T>(): Promise<T> => {
      const { url, ...config } = createRequest('POST', 'api/sorteo/quitar_ganadores', {});
      const response = await fetch(url.toString(), config);
      return processResponse<T>(response);
    },
    
    // Métodos genéricos para operaciones CRUD
    post: async <T>(endpoint: string, data: any): Promise<T> => {
      const { url, ...config } = createRequest('POST', endpoint, data);
      const response = await fetch(url.toString(), config);
      return processResponse<T>(response);
    },
    
    put: async <T>(endpoint: string, data: any): Promise<T> => {
      const { url, ...config } = createRequest('PUT', endpoint, data);
      const response = await fetch(url.toString(), config);
      return processResponse<T>(response);
    },
    
    patch: async <T>(endpoint: string, data: any): Promise<T> => {
      const { url, ...config } = createRequest('PATCH', endpoint, data);
      const response = await fetch(url.toString(), config);
      return processResponse<T>(response);
    },
    
    delete: async <T>(endpoint: string): Promise<T> => {
      const { url, ...config } = createRequest('DELETE', endpoint);
      const response = await fetch(url.toString(), config);
      return processResponse<T>(response);
    }
  }
};

// Para mantener compatibilidad con el código existente
export const apiClient = {
  get: queryClient.queries.get,
  post: queryClient.mutations.post,
  put: queryClient.mutations.put,
  patch: queryClient.mutations.patch,
  delete: queryClient.mutations.delete
};

