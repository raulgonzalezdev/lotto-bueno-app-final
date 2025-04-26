"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PulseLoader from "react-spinners/PulseLoader";

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Verificar si hay una sesión activa
    const session = localStorage.getItem('session');
    
    if (session) {
      // Si ya hay una sesión, redirigir directamente a ELECTORES
      const sessionData = JSON.parse(session);
      setIsAuthenticated(true);
      // Redirigir a la página principal con la sección ELECTORES
      router.push('/');
    } else {
      // Si no hay sesión, simular un login automático o mostrar el login
      setIsAuthenticated(false);
      // Redirigir a la página principal y mostrar WelcomeComponent
      router.push('/');
    }
    
    // Timeout para mostrar el loader un momento
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen gap-2">
        <PulseLoader loading={true} size={12} speedMultiplier={0.75} />
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  // Si no está autenticado o está en proceso de redirección, mostrar un mensaje
  if (!isAuthenticated && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <h1 className="text-2xl font-bold">Redirigiendo al panel principal...</h1>
        <PulseLoader loading={true} size={10} speedMultiplier={0.75} />
      </div>
    );
  }

  // Este contenido no debería mostrarse normalmente debido a las redirecciones
  return null;
} 