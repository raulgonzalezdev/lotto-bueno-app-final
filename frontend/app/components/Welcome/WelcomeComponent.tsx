/* eslint-disable @next/next/no-img-element */

import React, { useState, useEffect } from 'react';
import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LoginModal from '../login/Login';

interface WelcomeComponentProps {
  title: string;
  subtitle: string;
  imageSrc: string;
  setCurrentPage: (page: "WELCOME" | "ELECTORES" | "TICKETS" | "STATUS" | "ADD" | "SETTINGS" | "USERS" | "RECOLECTORES" | "REGISTER" | "REGISTER_RECOLECTOR" | "ORGANIZACIONES" | "EMPRENDEDORES") => void;
}

const WelcomeComponent: React.FC<WelcomeComponentProps> = ({ title, subtitle, imageSrc, setCurrentPage }) => {
  const defaultImageSrc = '/lotto.avif';  // Ruta relativa a la imagen del logo por defecto
  const logoSrc =  imageSrc  ;
  const router = useRouter();
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);

  // Efecto para verificar localStorage al montar el componente
  useEffect(() => {
    const session = localStorage.getItem('session');
    if (session) {
      try {
        const sessionData = JSON.parse(session);
        if (sessionData.isAdmin) {
          console.log("WelcomeComponent - Sesión de admin detectada, redirigiendo...");
          window.location.href = '/';
        }
      } catch (e) {
        console.error("Error al procesar la sesión:", e);
      }
    }
  }, []);

  // Función que maneja tanto la navegación interna como por rutas
  const handleRegister = () => {
    // Para compatibilidad con el enfoque actual, seguimos usando setCurrentPage
    setCurrentPage('REGISTER');
    
    // Pero también hacemos la navegación por rutas que funcionará con Docker
    router.push('/registro');
  };

  const handleRecolectorRegister = () => {
    // Para compatibilidad con el enfoque actual, seguimos usando setCurrentPage
    setCurrentPage('REGISTER_RECOLECTOR');
    
    // Pero también hacemos la navegación por rutas que funcionará con Docker
    router.push('/registro-recolector');
  };
  
  const handleOpenLoginModal = () => {
    setIsLoginModalVisible(true);
  };

  const handleCloseLoginModal = () => {
    setIsLoginModalVisible(false);
  };

  const handleAdminLogin = (isAdmin: boolean) => {
    console.log("WelcomeComponent - handleAdminLogin called with isAdmin:", isAdmin);
    if (isAdmin) {
      // Guardar la sesión en localStorage aquí también
      localStorage.setItem('session', JSON.stringify({
        isAdmin: true,
        lastPage: 'ELECTORES'
      }));
      
      // Actualizar el estado local
      setCurrentPage('ELECTORES');
      
      // Redirigir a la página principal para que se active el dashboard
      window.location.href = '/';
    }
  };

  return (
    <div className="welcome-page">
      <div className="logo-container">
        <img src={logoSrc} width={381} height={162} className="footer-logo" alt="Logo" />
      </div>
      <h1 className="title">{title}</h1>
      <h2 className="subtitle">{subtitle}</h2>
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button 
          onClick={handleRegister} 
          className="register-button"
        >
          Regístrate aquí
        </button>
        <button 
          onClick={handleRecolectorRegister} 
          className="register-button register-button-secondary"
        >
          Registro para COPERO
        </button>
      </div>
      <div className="mt-6">
        <button
          onClick={handleOpenLoginModal}
          className="text-white hover:text-blue-300 transition-colors"
        >
          Acceso Administrativo
        </button>
      </div>
      <div className="social-icons">
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
          <FaFacebook size={32} />
        </a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
          <FaInstagram size={32} />
        </a>
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
          <FaTwitter size={32} />
        </a>
      </div>
      <footer className="footer">
        <p>Ganar premios nunca había sido tan sencillo</p>
        <img src={logoSrc} width={180} height={69} alt="Logo" className="footer-logo" />
      </footer>

      {/* Modal de login */}
      <LoginModal
        isVisible={isLoginModalVisible}
        onClose={handleCloseLoginModal}
        onAdminLogin={handleAdminLogin}
        setCurrentPage={setCurrentPage}
        title={title}
        subtitle={subtitle}
        imageSrc={imageSrc}
      />
    </div>
  );
};

export default WelcomeComponent;
