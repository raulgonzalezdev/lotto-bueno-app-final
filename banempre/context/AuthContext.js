import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loginAutomatico = async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://banempre.online/api';
        const response = await fetch(`${apiUrl}/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: 'admin',
            password: '1234'
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setToken(data.access_token);
          console.log('Login automático exitoso');
        } else {
          console.error('Error en login automático');
        }
      } catch (error) {
        console.error('Error en login automático:', error);
      } finally {
        setLoading(false);
      }
    };

    loginAutomatico();
  }, []);

  return (
    <AuthContext.Provider value={{ token, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 