"use client";

import React, { useState, useEffect } from "react";
import RegisterWindow from "../components/register/RegisterWindow";
import { useSettings } from "../hooks/useSettings";
import PulseLoader from "react-spinners/PulseLoader";
import { PageType } from "../types/common";

// Estilo para el fondo de la página
const bgStyle = {
  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/fondolottobueno.jpg')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundAttachment: 'fixed'
};

export default function RegistroPage() {
  const [currentPage, setCurrentPage] = useState<PageType>("REGISTER");
  
  const { 
    data: settingsData,
    isLoading: isLoadingSettings,
    isError: isErrorSettings,
    error: errorSettings 
  } = useSettings();

  // Dummy función ya que no permitiremos acceso al dashboard desde aquí
  const handleAdminLogin = () => {
    // No hacemos nada, ya que no permitiremos acceso al dashboard desde aquí
    return;
  };

  if (isLoadingSettings) {
    return (
      <div className="flex items-center justify-center h-screen gap-2" style={bgStyle}>
        <PulseLoader loading={true} size={12} speedMultiplier={0.75} />
        <p className="text-white">Cargando configuración...</p>
      </div>
    );
  }

  if (isErrorSettings) {
    return (
      <div className="flex items-center justify-center h-screen gap-2" style={bgStyle}>
        <p className="text-white">Error cargando la configuración: {errorSettings?.message}</p>
      </div>
    );
  }

  if (!settingsData) {
    return (
      <div className="flex items-center justify-center h-screen gap-2" style={bgStyle}>
        <p className="text-white">No se pudo obtener la configuración del servidor.</p>
      </div>
    );
  }

  // Si llegamos aquí, settingsData está cargado
  const settingTemplate = settingsData.currentTemplate || "Default";

  return (
    <main className="welcome-page" style={bgStyle}>
      <RegisterWindow 
        title={settingsData[settingTemplate]?.Customization?.settings?.title?.text || 'Registro'}
        subtitle={settingsData[settingTemplate]?.Customization?.settings?.subtitle?.text || 'Completa tus datos'}
        imageSrc={settingsData[settingTemplate]?.Customization?.settings?.image?.src || '/lotto.avif'}
        setCurrentPage={setCurrentPage}
        onAdminLogin={handleAdminLogin}
        hideAdminLogin={true}
      />
    </main>
  );
} 