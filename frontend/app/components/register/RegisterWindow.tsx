/* eslint-disable @next/next/no-img-element */

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import LoginModal from '../login/Login';
import Toast from '../toast/Toast';
import ConfirmationModal from '../confirmation/ConfirmationModal';
import { useRecolectores } from '../../hooks/useRecolectores';
import { useCreateTicket, type CreateTicketResponse } from '../../hooks/useCreateTicket';
import Script from 'next/script';

// Interface para los datos de autenticación de Telegram
interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

interface RegisterWindowProps {
  title: string;
  subtitle: string;
  imageSrc: string;
  setCurrentPage: (page: "WELCOME" | "ELECTORES" | "TICKETS" | "STATUS" | "ADD" | "SETTINGS" | "USERS" | "RECOLECTORES" | "REGISTER" | "REGISTER_RECOLECTOR" | "ORGANIZACIONES" | "EMPRENDEDORES") => void;
  onAdminLogin: (admin: boolean) => void;
  hideAdminLogin?: boolean;
}

const RegisterWindow: React.FC<RegisterWindowProps> = ({ title, subtitle, imageSrc, setCurrentPage, onAdminLogin, hideAdminLogin }) => {
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
  const [isQRModalVisible, setIsQRModalVisible] = useState(false);
  const [qrCode, setQRCode] = useState<string | null>(null);
  const [formData, setFormData] = useState({ cedula: "", operador: "0414", telefono: "", referido_id: 1 });
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  const [searchTerm, setSearchTerm] = useState("");
  const [isConfirmationModalVisible, setIsConfirmationModalVisible] = useState(false);
  const [ticketMessage, setTicketMessage] = useState("");
  const [fullnumberMessage, setFullnumberMessage] = useState("");
  const [showMessengerView, setShowMessengerView] = useState<'none' | 'whatsapp' | 'telegram'>('none');
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const router = useRouter();
  
  // Referencias para los iframes
  const whatsappIframeRef = useRef<HTMLIFrameElement>(null);
  const telegramIframeRef = useRef<HTMLIFrameElement>(null);
  
  const companyPhoneContact = process.env.COMPANY_PHONE_CONTACT || '584262831867';
  const telegramBotUsername = process.env.TELEGRAM_BOT_USERNAME || 'Applottobueno_bot';

  const { 
    data: recolectoresData, 
    isLoading: isLoadingRecolectores, 
    isError: isErrorRecolectores, 
    error: errorRecolectores 
  } = useRecolectores({
    recolectoresPerPage: 1000
  });

  const { 
    mutate: createTicketMutate, 
    isPending: isLoadingSubmit,
  } = useCreateTicket();

  // Añadir estado para usuario de Telegram
  // const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null); // Comentado
  // const [isTelegramLoginLoading, setIsTelegramLoginLoading] = useState(false); // Comentado
  
  useEffect(() => {
    if (isErrorRecolectores && errorRecolectores) {
      console.error("Error fetching referidos:", errorRecolectores);
      setToastMessage(errorRecolectores.message || 'Error al cargar la lista de promotores.');
      setToastType('error');
    }
  }, [isErrorRecolectores, errorRecolectores]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleOpenLoginModal = () => {
    setIsLoginModalVisible(true);
  };

  const handleCloseLoginModal = () => {
    setIsLoginModalVisible(false);
  };

  const handleOpenQRModal = (qr: string, ticketIdValue: string) => {
    setQRCode(qr);
    setTicketId(ticketIdValue);
    setIsQRModalVisible(true);
    setRegistrationComplete(true);
  };

  const handleCloseQRModal = () => {
    setIsQRModalVisible(false);
    setQRCode(null);
  };

  const handleOpenWhatsappView = () => {
    setShowMessengerView('whatsapp');
    handleCloseQRModal();
  };

  const handleOpenTelegramView = () => {
    setShowMessengerView('telegram');
    handleCloseQRModal();
  };

  const handleCloseMessengerView = () => {
    setShowMessengerView('none');
    setIsConfirmationModalVisible(true);
  };

  const handleConfirmRegisterAnother = () => {
    setFormData({ cedula: "", operador: "0414", telefono: "", referido_id: 1 });
    setIsConfirmationModalVisible(false);
    setRegistrationComplete(false);
  };

  const handleCancelRegisterAnother = () => {
    setIsConfirmationModalVisible(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setToastMessage(null);

    const fullPhoneNumber = `58${formData.operador.slice(1)}${formData.telefono}`;
    setFullnumberMessage(fullPhoneNumber);
    if (!/^58\d{10}$/.test(fullPhoneNumber)) {
      setToastMessage("El número de teléfono debe tener 10 dígitos después del operador.");
      setToastType('error');
      return;
    }

    const ticketPayload = {
      cedula: formData.cedula,
      telefono: fullPhoneNumber,
      referido_id: formData.referido_id || 1,
    };

    createTicketMutate(ticketPayload, {
      onSuccess: (data: CreateTicketResponse) => {
        setTicketMessage(data.message);
        if (data.status === "error") {
          // Manejar errores específicos desde la API
          setToastMessage(data.message);
          setToastType('error');
          return;
        }
        
        if (data.qr_code) {
          handleOpenQRModal(data.qr_code, data.id?.toString() || '');
        }
        setToastMessage(data.message);
        setToastType('success');
      },
      onError: (error: Error) => {
        console.error("Error al registrar ticket:", error);
        setToastMessage(error.message || "Ocurrió un error inesperado al registrar el ticket.");
        setToastType('error');
      },
    });
  };

  const filteredReferidos = recolectoresData?.items?.filter((referido: any) => 
    `${referido.cedula} ${referido.nombre}`.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getWhatsAppMessage = () => {
    return `${formData.cedula}\n\nHola, soy ${ticketMessage} con cédula ${formData.cedula}. Este es mi número telefónico ${fullnumberMessage} para Lotto Bueno.`;
  };

  const getTelegramMessage = () => {
    return formData.cedula;
  };

  // Función que se llamará cuando el usuario se autentique con Telegram
  /* Comentado por solicitud
  const handleTelegramAuth = async (user: TelegramUser) => {
    setIsTelegramLoginLoading(true);
    setToastMessage(null);
    
    try {
      // Llamar a nuestra API para verificar los datos y crear/obtener usuario
      const response = await fetch('/api/auth/telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Error al autenticar con Telegram');
      }
      
      const data = await response.json();
      setTelegramUser(user);
      
      // Guardar el token en localStorage
      localStorage.setItem('token', data.access_token);
      
      // Si el usuario está logueado, mostrar mensaje de éxito
      setToastMessage(`Inicio de sesión exitoso como ${user.first_name}`);
      setToastType('success');
      
      // Chequeamos si es admin y redirigimos
      if (data.user.is_admin) {
        onAdminLogin(true);
        setCurrentPage("WELCOME");
      }
      
    } catch (error) {
      console.error('Error en autenticación de Telegram:', error);
      setToastMessage(error instanceof Error ? error.message : 'Error desconocido en la autenticación');
      setToastType('error');
    } finally {
      setIsTelegramLoginLoading(false);
    }
  };
  */

  // Definir la función global para que el widget pueda llamarla
  /* Comentado por solicitud
  useEffect(() => {
    // @ts-ignore
    window.onTelegramAuth = handleTelegramAuth;
    
    return () => {
      // @ts-ignore
      delete window.onTelegramAuth;
    };
  }, []);
  */

  return (
    <div className="welcome-page">
      <div className="register-page p-4 flex flex-col items-center">
        
        <img src={imageSrc} width={381} height={162} className="footer-logo" alt="Logo" />
        <h1 className="text-4xl font-bold mb-2 text-center text-white">{title}</h1>
        <h2 className="text-xl mb-6 text-center text-white">{subtitle}</h2>
        
        {showMessengerView === 'none' && !registrationComplete && (
          <form className="space-y-4 w-full max-w-md" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-white">Promotor</label>
              <input 
                type="text"
                placeholder="Buscar promotor..."
                className="inputField mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={isLoadingRecolectores}
              />
              {isLoadingRecolectores && <p className="text-white">Cargando promotores...</p>}
              {isErrorRecolectores && <p className="text-red-500">Error al cargar promotores</p>}
              {!isLoadingRecolectores && !isErrorRecolectores && (
                <select 
                  name="referido_id"
                  className="inputField mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
                  onChange={handleInputChange}
                  value={formData.referido_id}
                  disabled={isLoadingRecolectores || isErrorRecolectores}
                >
                  <option value="1">ninguno</option>
                  {filteredReferidos.map((referido: any) => (
                    <option key={referido.id} value={referido.id}>
                      {`${referido.cedula} - ${referido.nombre}`}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-white">Cédula</label>
              <input 
                type="text" 
                name="cedula"
                className="inputField mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black" 
                value={formData.cedula}
                onChange={handleInputChange}
                disabled={isLoadingSubmit}
              />
            </div>
            <div className="flex items-center">
              
              <div className="ml-2">
                <label className="block text-sm font-medium text-white">Operador</label>
                <select 
                  name="operador"
                  className="inputField mt-1 block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
                  onChange={handleInputChange}
                  value={formData.operador}
                  disabled={isLoadingSubmit}
                >
                  <option value="0414">0414</option>
                  <option value="0424">0424</option>
                  <option value="0416">0416</option>
                  <option value="0426">0426</option>
                  <option value="0412">0412</option>
                </select>
              </div>
              <div className="flex-grow">
                <label className="block text-sm font-medium text-white">Teléfono</label>
                <input 
                  type="text" 
                  name="telefono"
                  placeholder="Ingrese el número de teléfono"
                  className="inputField mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black" 
                  value={formData.telefono}
                  onChange={handleInputChange}
                  disabled={isLoadingSubmit}
                />
              </div>
            </div>
            <div className="flex justify-center">
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700" disabled={isLoadingRecolectores || isLoadingSubmit}>
                {isLoadingSubmit ? <span className="spinner"></span> : "Registrar"}
              </button>
            </div>
          </form>
        )}

        {showMessengerView === 'whatsapp' && (
          <div className="messenger-view w-full max-w-md">
            <div className="bg-green-600 text-white p-4 rounded-t-lg flex justify-between items-center">
              <h3 className="text-xl font-bold">WhatsApp Web</h3>
              <button 
                onClick={handleCloseMessengerView}
                className="bg-white text-green-600 px-2 py-1 rounded text-sm"
              >
                Cerrar
              </button>
            </div>
            <div className="bg-white p-4 rounded-b-lg shadow-lg">
              <div className="mb-4">
                <p className="font-bold">Chat con Lotto Bueno</p>
                <p className="text-gray-600 text-sm">En línea</p>
              </div>
              <div className="bg-gray-100 p-3 rounded mb-4">
                <p className="text-sm text-black">
                  {getWhatsAppMessage()}
                </p>
                <div className="flex justify-end">
                  <a 
                    href={`https://wa.me/${companyPhoneContact}?text=${encodeURIComponent(getWhatsAppMessage())}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700 mt-4 inline-block"
                  >
                    Enviar mensaje
                  </a>
                </div>
              </div>
              <div className="text-center mt-4">
                <p className="text-sm text-gray-600">Este es un visor de WhatsApp integrado en nuestra aplicación.</p>
                <p className="text-sm text-gray-600">Al hacer clic en "Enviar mensaje" se abrirá WhatsApp con este mensaje.</p>
              </div>
            </div>
          </div>
        )}

        {showMessengerView === 'telegram' && (
          <div className="messenger-view w-full max-w-md">
            <div className="bg-blue-500 text-white p-4 rounded-t-lg flex justify-between items-center">
              <h3 className="text-xl font-bold">Telegram Web</h3>
              <button 
                onClick={handleCloseMessengerView}
                className="bg-white text-blue-500 px-2 py-1 rounded text-sm"
              >
                Cerrar
              </button>
            </div>
            <div className="bg-white p-4 rounded-b-lg shadow-lg">
              <div className="mb-4">
                <p className="font-bold">Chat con @{telegramBotUsername}</p>
                <p className="text-gray-600 text-sm">Bot está activo</p>
              </div>
              <div className="bg-gray-100 p-3 rounded mb-4">
                <p className="text-sm text-black">
                  {getTelegramMessage()}
                </p>
                <div className="flex justify-end">
                  <a 
                    href={`https://t.me/${telegramBotUsername}?start=${formData.cedula}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 mt-4 inline-block"
                  >
                    Enviar mensaje
                  </a>
                </div>
              </div>
              <div className="text-center mt-4">
                <p className="text-sm text-gray-600">Este es un visor de Telegram integrado en nuestra aplicación.</p>
                <p className="text-sm text-gray-600">Al hacer clic en "Enviar mensaje" se abrirá Telegram con este mensaje.</p>
              </div>
            </div>
          </div>
        )}
        
        {registrationComplete && showMessengerView === 'none' && (
          <div className="text-center mt-6 bg-white p-6 rounded-lg shadow-lg max-w-md">
            <h3 className="text-2xl font-bold mb-4 text-green-600">¡Registro Exitoso!</h3>
            <p className="mb-4 text-gray-800">
              Tu ticket ha sido generado. Para completar el proceso, conecta con nuestro sistema
              a través de WhatsApp o Telegram seleccionando una de las siguientes opciones:
            </p>
            <div className="flex justify-center space-x-4 mb-6">
              <button
                onClick={handleOpenWhatsappView}
                className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-600 transition-colors"
              >
                <img src="/whatsapp-icon.png" alt="WhatsApp" className="w-6 h-6 mr-2" />
                WhatsApp
              </button>
              <button
                onClick={handleOpenTelegramView}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-600 transition-colors"
              >
                <img src="/telegram-icon.png" alt="Telegram" className="w-6 h-6 mr-2" />
                Telegram
              </button>
            </div>
            <p className="text-sm text-gray-600">
              Esto te permitirá recibir tu ticket y estar al tanto de los resultados.
            </p>
          </div>
        )}

        <div className="mt-4 text-center">
          {!hideAdminLogin && (
            <button onClick={handleOpenLoginModal} className="text-blue-500 hover:underline">
              Ir al Dashboard
            </button>
          )}
          
          {!hideAdminLogin && (
            <div className="my-4 flex items-center justify-center">
              <div className="border-t border-gray-300 flex-grow"></div>
              <span className="px-3 text-gray-500 bg-transparent text-sm">O</span>
              <div className="border-t border-gray-300 flex-grow"></div>
            </div>
          )}
          
          {/* Widget de Telegram - Comentado por solicitud */}
          {/* 
          <div className="my-4">
            <div className="text-white text-sm mb-2">Inicia sesión con Telegram:</div>
            <div id="telegram-login-container">
              {/* El script se cargará aquí */}
              {/* <Script
                src="https://telegram.org/js/telegram-widget.js"
                strategy="lazyOnload"
                onLoad={() => {
                  // Creamos el botón de Telegram una vez cargado el script
                  const telegramBotName = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'Applottobueno_bot';
                  const container = document.getElementById('telegram-login-container');
                  
                  if (container) {
                    container.innerHTML = ''; // Limpiar cualquier contenido previo
                    
                    // Crear el script tag con los atributos necesarios
                    const script = document.createElement('script');
                    script.async = true;
                    script.src = "https://telegram.org/js/telegram-widget.js";
                    script.setAttribute('data-telegram-login', telegramBotName);
                    script.setAttribute('data-size', 'medium');
                    // script.setAttribute('data-onauth', 'onTelegramAuth(user)'); // Comentado
                    script.setAttribute('data-request-access', 'write');
                    
                    container.appendChild(script);
                  }
                }}
              /> */}
            {/* </div>
            {isTelegramLoginLoading && (
              <div className="mt-2">
                <span className="spinner"></span> Verificando...
              </div>
            )} */}
          {/* </div> */}
        </div>
        <LoginModal
          isVisible={isLoginModalVisible}
          onClose={handleCloseLoginModal}
          onAdminLogin={onAdminLogin}
          setCurrentPage={setCurrentPage}
          title={title}
          subtitle={subtitle}
          imageSrc={imageSrc}
        />
        {isQRModalVisible && qrCode && (
          <div className="modal-overlay" onClick={handleCloseQRModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close-button" onClick={handleCloseQRModal}>×</button>
              <h2>Ticket Generado</h2>
              <img src={`data:image/png;base64,${qrCode}`} alt="QR Code" />
              <p className="text-black">El ticket #{ticketId} ha sido generado exitosamente.</p>
              <p className="mt-2 mb-4 text-black">Por favor selecciona cómo quieres conectar:</p>
              <div className="flex justify-center space-x-4">
                <button 
                  onClick={handleOpenWhatsappView}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  WhatsApp
                </button>
                <button 
                  onClick={handleOpenTelegramView}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Telegram
                </button>
              </div>
            </div>
          </div>
        )}
        {toastMessage && (
          <Toast 
            message={toastMessage}
            type={toastType}
            onClose={() => setToastMessage(null)}
          />
        )}
        {isConfirmationModalVisible && (
          <ConfirmationModal
            message="¿Quieres registrar otro ticket?"
            onConfirm={handleConfirmRegisterAnother}
            onCancel={handleCancelRegisterAnother}
          />
        )}
      </div>
    </div>
  );
};

export default RegisterWindow;
