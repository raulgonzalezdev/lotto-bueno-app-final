import { createContext, useState, useContext, useEffect } from 'react';
import { apiClient } from '../api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar token del localStorage al iniciar
  useEffect(() => {
    const storedToken = localStorage.getItem('banempre_token');
    const storedUser = localStorage.getItem('banempre_user');
    
    if (storedToken) {
      setToken(storedToken);
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error('Error al parsear la información del usuario:', error);
        }
      }
    }
    
    setLoading(false);
  }, []);

  // Función para iniciar sesión con credenciales
  const loginWithCredentials = async (username, password) => {
    try {
      setLoading(true);
      
      // Hacer la solicitud POST al endpoint de login
      const response = await apiClient.post('login', { 
        username, 
        password 
      });
      
      // La API devuelve access_token, no token
      if (response && response.access_token) {
        // Guardar el token en el estado y localStorage
        setToken(response.access_token);
        localStorage.setItem('banempre_token', response.access_token);
        
        // Crear objeto de usuario con la información disponible
        const userData = { 
          username, 
          isAdmin: response.isAdmin || false 
        };
        
        setUser(userData);
        localStorage.setItem('banempre_user', JSON.stringify(userData));
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error en login:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('banempre_token');
    localStorage.removeItem('banempre_user');
  };

  // Verificar si el usuario está autenticado
  const isAuthenticated = () => {
    return !!token;
  };

  const value = {
    token,
    user,
    loading,
    loginWithCredentials,
    logout,
    isAuthenticated
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
} 