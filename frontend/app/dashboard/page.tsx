"use client";

import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import PulseLoader from "react-spinners/PulseLoader";

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [loginData, setLoginData] = useState({
    username: "",
    password: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Verificar si hay una sesión activa
    const session = localStorage.getItem('session');
    
    if (session) {
      // Si ya hay una sesión, redirigir directamente a ELECTORES
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } else {
      // Si no hay sesión, mostrar el formulario de login
      setTimeout(() => {
        setIsLoading(false);
        setShowLoginForm(true);
      }, 1000);
    }
  }, [router]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Intentar autenticar contra la API
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://applottobueno.com/api';
      const response = await fetch(`${apiUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Guardar la sesión
        localStorage.setItem('session', JSON.stringify({
          isAdmin: true,
          lastPage: "ELECTORES",
          token: data.token
        }));
        
        // Redirigir al dashboard principal
        router.push('/');
      } else {
        setError("Credenciales incorrectas. Por favor, inténtalo nuevamente.");
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      setError("Error al procesar la solicitud. Intente nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-indigo-900">
        <div className="mb-8">
          <Image 
            src="/logo bamempre.png" 
            alt="Banempre - Banco de los Emprendedores"
            width={300}
            height={100}
            priority
          />
        </div>
        <PulseLoader color="#ffffff" loading={true} size={12} speedMultiplier={0.75} />
        <p className="mt-4 text-white">Cargando dashboard...</p>
      </div>
    );
  }

  if (showLoginForm) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-indigo-900 py-6">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 flex justify-center bg-white">
            <Image 
              src="/logo bamempre.png" 
              alt="Banempre - Banco de los Emprendedores"
              width={220}
              height={80}
              priority
            />
          </div>
          
          <div className="p-6">
            <h2 className="text-xl font-bold text-center mb-6">Inicio de Sesión Admin</h2>
            
            {error && (
              <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Nombre de usuario
                </label>
                <input
                  type="text"
                  name="username"
                  value={loginData.username}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Contraseña
                </label>
                <input
                  type="password"
                  name="password"
                  value={loginData.password}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {isSubmitting ? 'Iniciando...' : 'Iniciar Sesión'}
                </button>
                
                <button
                  type="button"
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => router.push('/')}
                >
                  Cancelar
                </button>
              </div>
            </form>
            
            <div className="mt-4 text-center text-sm">
              <a href="/" className="text-blue-600 hover:text-blue-800">
                ¿No tienes una cuenta? Regístrate gracias
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Este contenido no debería mostrarse normalmente debido a las redirecciones
  return null;
} 