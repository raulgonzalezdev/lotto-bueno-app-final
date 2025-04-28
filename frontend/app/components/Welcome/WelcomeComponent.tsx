/* eslint-disable @next/next/no-img-element */

import React from 'react';
import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';

interface WelcomeComponentProps {
  title: string;
  subtitle: string;
  imageSrc: string;
  setCurrentPage: (page: "WELCOME" | "ELECTORES" | "TICKETS" | "STATUS" | "ADD" | "SETTINGS" | "USERS" | "RECOLECTORES" | "REGISTER" | "REGISTER_RECOLECTOR" | "ORGANIZACIONES" | "EMPRENDEDORES") => void;
}

const WelcomeComponent: React.FC<WelcomeComponentProps> = ({ title, subtitle, imageSrc, setCurrentPage }) => {
  const defaultImageSrc = '/lotto.avif';  // Ruta relativa a la imagen del logo por defecto
  const logoSrc =  imageSrc  ;

  return (
    <div className="welcome-page">
      <div className="logo-container">
        <img src={logoSrc} width={381} height={162} className="footer-logo" alt="Logo" />
      </div>
      <h1 className="title">{title}</h1>
      <h2 className="subtitle">{subtitle}</h2>
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button 
          onClick={() => setCurrentPage('REGISTER')} 
          className="register-button"
        >
          Regístrate aquí
        </button>
        <button 
          onClick={() => setCurrentPage('REGISTER_RECOLECTOR')} 
          className="register-button register-button-secondary"
        >
          Registro para COPERO
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
    </div>
  );
};

export default WelcomeComponent;
