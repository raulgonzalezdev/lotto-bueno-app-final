"use client";

import React, { useState, useEffect } from "react";
import Navbar from "./components/Navigation/NavbarComponent";
import SettingsComponent from "./components/Settings/SettingsComponent";
import ChatComponent from "./components/Chat/ChatComponent";

import WelcomeComponent from "./components/Welcome/WelcomeComponent";
import RegisterWindow from "./components/register/RegisterWindow";
import RecolectorRegisterWindow from "./components/register/RecolectorRegisterWindow";
import UserControl from "./components/login/UserControl";
import TicketControl from "./components/ticket/TicketControl";
// Corrección de la importación con la ruta correcta, si existe
// Si no existe, se debe comentar para evitar el error
import RecolectorControl from "./components/recolertor/RecolectorControl";
import LineaTelefonicaControl from "./components/lineas/LineaTelefonicaControl";
import SorteoControl from "./components/sorteo/SorteoControl";
import OrganizacionPoliticaControl from './components/organizacionpolitica/OrganizacionPoliticaControl';
import EmprendedorControl from './components/emprendedor/EmprendedorControl';

import { Settings } from "./components/Settings/types";
import { RAGConfig } from "./components/RAG/types";
import { PageType } from "./types/common";

import Script from 'next/script';
import { fonts, FontKey } from "./info";
import PulseLoader from "react-spinners/PulseLoader";
import { useSettings } from "./hooks/useSettings";

// Estilo para el fondo de la página
const bgStyle = {
  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/fondolottobueno.jpg')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundAttachment: 'fixed'
};

const Home = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentPage, setCurrentPage] = useState<PageType>("WELCOME");
  const [production, setProduction] = useState(false);
  const [gtag, setGtag] = useState("");
  const [settingTemplate, setSettingTemplate] = useState<string>("Default");
  const [baseSetting, setBaseSetting] = useState<Settings | null>(null);
  const [RAGConfig, setRAGConfig] = useState<RAGConfig | null>(null);

  const fontKey = baseSetting ? (baseSetting[settingTemplate]?.Customization.settings.font.value as FontKey) : null;
  const fontClassName = fontKey ? fonts[fontKey]?.className || "" : "";

  

  const { 
    data: settingsData,
    isLoading: isLoadingSettings,
    isError: isErrorSettings,
    error: errorSettings 
  } = useSettings();

  const handleOutsideClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      // setIsChatVisible(false);
    }
  };

  // Verificar sesión al cargar la página
  useEffect(() => {
    const session = localStorage.getItem('session');
    if (session) {
      const sessionData = JSON.parse(session);
      setIsAdmin(sessionData.isAdmin);
      setCurrentPage(sessionData.lastPage || "ELECTORES");
    } else {
      setCurrentPage("WELCOME");
      setIsAdmin(false);
    }

    if (settingsData) {
      setSettingTemplate(settingsData.currentTemplate || "Default");
      setBaseSetting(settingsData);
    }
  }, [settingsData]);

  // Guardar estado de la sesión cuando cambia
  useEffect(() => {
    if (isAdmin) {
      localStorage.setItem('session', JSON.stringify({
        isAdmin,
        lastPage: currentPage
      }));
    } else {
      localStorage.removeItem('session');
    }
  }, [isAdmin, currentPage]);

  const handleLogout = () => {
    setIsAdmin(false);
    setCurrentPage("WELCOME");
  };

  const handleAdminLogin = (isAdminSuccess: boolean) => {
    if (isAdminSuccess) {
      setIsAdmin(true);
      setCurrentPage("ELECTORES");
      console.log("Login successful, setting isAdmin=true, currentPage=ELECTORES");
    }
  };

  useEffect(() => {
    if (baseSetting && settingTemplate) {
      const currentSettings = baseSetting[settingTemplate]?.Customization.settings;
      if (currentSettings) {
        document.documentElement.style.setProperty("--primary-verba", currentSettings.primary_color.color);
        document.documentElement.style.setProperty("--secondary-verba", currentSettings.secondary_color.color);
        document.documentElement.style.setProperty("--warning-verba", currentSettings.warning_color.color);
        document.documentElement.style.setProperty("--bg-verba", currentSettings.bg_color.color);
        document.documentElement.style.setProperty("--bg-alt-verba", currentSettings.bg_alt_color.color);
        document.documentElement.style.setProperty("--text-verba", currentSettings.text_color.color);
        document.documentElement.style.setProperty("--text-alt-verba", currentSettings.text_alt_color.color);
        document.documentElement.style.setProperty("--button-verba", currentSettings.button_color.color);
        document.documentElement.style.setProperty("--button-hover-verba", currentSettings.button_hover_color.color);
        document.documentElement.style.setProperty("--bg-console-verba", currentSettings.bg_console.color);
        document.documentElement.style.setProperty("--text-console-verba", currentSettings.text_console.color);
      }
    }
  }, [baseSetting, settingTemplate]);

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
  const currentCustomizationSettings = settingsData[settingTemplate]?.Customization?.settings;
  const currentChatSettings = settingsData[settingTemplate]?.Chat?.settings;

  return (
    <div>
      <main
        className={
          isAdmin
            ? `min-h-screen p-5 bg-bg-verba text-text-verba ${fontClassName}`
            : `welcome-page ${fontClassName}`
        }
        data-theme={
          currentCustomizationSettings?.theme || "light"
        }
        style={!isAdmin ? bgStyle : {}}
      >
        {gtag && (
          <>
            <Script 
              strategy="afterInteractive" 
              src={`https://www.googletagmanager.com/gtag/js?id=${gtag}`}
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gtag}');
                `,
              }}
            />
          </>
        )}

        <div>
          {!isAdmin && currentPage === "WELCOME" && (
            <WelcomeComponent 
              title={baseSetting?.[settingTemplate]?.Customization?.settings?.title?.text || "Bienvenido"}
              subtitle={baseSetting?.[settingTemplate]?.Customization?.settings?.subtitle?.text || "Registrate para participar"}
              imageSrc={baseSetting?.[settingTemplate]?.Customization?.settings?.image?.src || '/lotto.avif'}
              setCurrentPage={setCurrentPage}
            />
          )}

          {!isAdmin && currentPage === "REGISTER" && (
            <RegisterWindow 
              title={baseSetting?.[settingTemplate]?.Customization?.settings?.title?.text || 'Registro'}
              subtitle={baseSetting?.[settingTemplate]?.Customization?.settings?.subtitle?.text || 'Completa tus datos'}
              imageSrc={baseSetting?.[settingTemplate]?.Customization?.settings?.image?.src || '/lotto.avif'}
              setCurrentPage={setCurrentPage}
              onAdminLogin={handleAdminLogin}
            />
          )}

          {!isAdmin && currentPage === "REGISTER_RECOLECTOR" && (
            <RecolectorRegisterWindow 
              title={baseSetting?.[settingTemplate]?.Customization?.settings?.title?.text || 'Registro de COPERO'}
              subtitle={baseSetting?.[settingTemplate]?.Customization?.settings?.subtitle?.text || 'Completa tus datos para registrarte como COPERO'}
              imageSrc={baseSetting?.[settingTemplate]?.Customization?.settings?.image?.src || '/lotto.avif'}
              setCurrentPage={setCurrentPage}
            />
          )}

          {isAdmin && (
            <>
              <div className="flex justify-between items-center mb-4">
                <div className="flex-grow">
                  <Navbar
                    APIHost={process.env.NEXT_PUBLIC_API_URL || null}
                    production={production}
                    title={currentCustomizationSettings?.title?.text || 'Admin'}
                    subtitle={currentCustomizationSettings?.subtitle?.text || 'Panel'}
                    imageSrc={currentCustomizationSettings?.image?.src || '/lotto.avif'}
                    version="v1.0.1"
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                  />
                </div>
                <div className="ml-4">
                  <button 
                    onClick={handleLogout}
                    className="btn btn-error btn-sm"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              </div>

              {currentPage === "ELECTORES" && (
                <>
                  {settingsData && settingsData[settingTemplate] ? (
                    <ChatComponent
                      production={production}
                      settingConfig={settingsData[settingTemplate]}
                      APIHost={process.env.NEXT_PUBLIC_API_URL || null}
                      RAGConfig={RAGConfig}
                      isAdmin={isAdmin}
                      title={currentCustomizationSettings?.title?.text || 'Chat'}
                      subtitle={currentCustomizationSettings?.subtitle?.text || 'Consulta'}
                      imageSrc={currentCustomizationSettings?.image?.src || '/lotto.avif'}
                    />
                  ) : (
                    <p>Cargando datos de chat...</p>
                  )}
                </>
              )}

              {currentPage === "STATUS" && <SorteoControl />}
              {currentPage === "SETTINGS" && !production && baseSetting && (
                <SettingsComponent
                  settingTemplate={settingTemplate}
                  setSettingTemplate={setSettingTemplate}
                  baseSetting={baseSetting}
                  setBaseSetting={setBaseSetting}
                />
              )}
              {currentPage === "USERS" && !production && <UserControl />}
              {currentPage === "TICKETS" && !production && <TicketControl />}
              {currentPage === "RECOLECTORES" && <RecolectorControl />}
              {currentPage === "ADD" && !production && <LineaTelefonicaControl />}
              {currentPage === "ORGANIZACIONES" && !production && <OrganizacionPoliticaControl />}
              {currentPage === "EMPRENDEDORES" && !production && <EmprendedorControl />}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;
