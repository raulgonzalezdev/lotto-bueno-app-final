/* eslint-disable @next/next/no-img-element */

import React from 'react';
import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';

interface WelcomeComponentProps {
  title: string;
  subtitle: string;
  imageSrc: string;
  setCurrentPage: (page: "WELCOME" | "ELECTORES" | "TICKETS" | "STATUS" | "ADD" | "SETTINGS" | "USERS" | "RECOLECTORES" | "REGISTER") => void;
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
      <button 
        onClick={() => setCurrentPage('REGISTER')} 
        className="register-button"
      >
        Regístrate aquí
      </button>
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
