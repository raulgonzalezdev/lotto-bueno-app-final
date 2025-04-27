import React, { useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { useAuth } from "../../context/AuthContext";
import Toast from "../../components/Toast";

// URL de la landing de Banempre
const BANEMPRE_URL = "/";

// Determinar si estamos en modo desarrollo
const isDevelopment = process.env.NODE_ENV === 'development';

export default function Login() {
  const router = useRouter();
  const { loginWithCredentials, loading: authLoading } = useAuth();
  const [loginData, setLoginData] = useState({
    username: "",
    password: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ message: '', type: 'info' });

  // Función para mostrar toast
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setLoginData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Función para redirigir al dashboard en modo desarrollo (bypass de autenticación)
  const devModeLogin = () => {
    showToast('Modo desarrollo: Iniciando sesión sin autenticación', 'info');
    setTimeout(() => {
      router.push('/dashboard/emprendedor');
    }, 1500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!loginData.username || !loginData.password) {
      setError("Por favor, complete todos los campos");
      return;
    }
    
    setIsSubmitting(true);
    setError("");

    try {
      // Usar la función de login del AuthContext
      const success = await loginWithCredentials(loginData.username, loginData.password);
      
      if (success) {
        showToast('Inicio de sesión exitoso', 'success');
        
        // Redirigir al dashboard de emprendedores
        setTimeout(() => {
          router.push('/dashboard/emprendedor');
        }, 1500);
      } else {
        setError("Credenciales incorrectas. Por favor, inténtalo nuevamente.");
        showToast('Credenciales incorrectas', 'error');
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      
      // Si estamos en desarrollo y hay un error (posiblemente CORS), permitimos continuar
      if (isDevelopment) {
        setError("Error de conexión (CORS). Modo desarrollo: Permitiendo acceso a emprendedores.");
        showToast('Usando modo de desarrollo para continuar', 'warning');
        devModeLogin();
      } else {
        setError("Error al procesar la solicitud. Intente nuevamente.");
        showToast('Error de conexión', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(BANEMPRE_URL);
  };

  // Función para acceso directo en modo desarrollo
  const handleDevAccess = () => {
    if (isDevelopment) {
      devModeLogin();
    }
  };

  // Estilo para el fondo de la página con la imagen de Banempre
  const bgStyle = {
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('/fondopbamempre.jpg')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed'
  };

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen" style={bgStyle}>
        <div className="container mx-auto px-4 py-4 flex flex-col">
          {/* Logo a la izquierda como en la landing */}
          <div className="flex justify-start mb-10">
            <Image 
              src="/logo bamempre.png" 
              alt="Banempre - Banco de los Emprendedores"
              width={500}
              height={105}
              className="w-64 md:w-72"
              priority
            />
          </div>
          <div className="flex-grow flex justify-center items-center">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              <p className="mt-4 text-white">Cargando...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={bgStyle}>
      {/* Header con logo más pequeño */}
      <div className="p-3 flex justify-center">
        <Image 
          src="/logo bamempre.png" 
          alt="Banempre - Banco de los Emprendedores"
          width={330}
          height={70}
          className="w-64 md:w-72"
          priority
        />
      </div>
      
      {/* Formulario centrado */}
      <div className="flex-grow flex items-center justify-center px-4">
        <div 
          style={{ backgroundColor: 'rgba(205, 150, 0, 0.90)' }} 
          className="w-full max-w-sm py-5 px-4 rounded-lg"
        >
          <h2 className="text-lg font-bold text-center mb-4 text-white">
            Inicio de Sesión Admin
          </h2>
          
          {error && (
            <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white text-sm font-medium mb-1">
                Nombre de usuario
              </label>
              <input
                type="text"
                name="username"
                value={loginData.username}
                onChange={handleChange}
                className="w-full p-2.5 border border-gray-300 rounded text-gray-900"
                required
                autoComplete="username"
              />
            </div>
            
            <div>
              <label className="block text-white text-sm font-medium mb-1">
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                value={loginData.password}
                onChange={handleChange}
                className="w-full p-2.5 border border-gray-300 rounded text-gray-900"
                required
                autoComplete="current-password"
              />
            </div>
            
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-full hover:bg-blue-700"
              >
                {isSubmitting ? 'Iniciando...' : 'INICIAR SESIÓN'}
              </button>
            </div>
            
            <div>
              <button
                type="button"
                onClick={handleCancel}
                className="w-full bg-gray-600 text-white font-medium py-2.5 rounded-full hover:bg-gray-700"
              >
                CANCELAR
              </button>
            </div>
            
            {/* Botón de acceso directo en desarrollo */}
            {isDevelopment && (
              <div className="mt-2">
                <button
                  type="button"
                  onClick={handleDevAccess}
                  className="w-full bg-yellow-600 text-white font-medium py-2.5 rounded-full hover:bg-yellow-700"
                >
                  ACCESO DESARROLLO
                </button>
              </div>
            )}
          </form>
          
          <div className="mt-4 text-center">
            <a href={BANEMPRE_URL} className="text-white hover:text-blue-100 text-sm">
              ¿No tienes una cuenta? Regístrate
            </a>
          </div>
        </div>
      </div>

      {/* Toast para notificaciones */}
      {toast.message && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ message: '', type: 'info' })} 
        />
      )}
    </div>
  );
} 