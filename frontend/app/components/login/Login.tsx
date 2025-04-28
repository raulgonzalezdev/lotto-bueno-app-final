/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
import React, { useState, useEffect } from 'react';
import Toast from '../toast/Toast';
import { detectHost } from "../../api";
import { useLogin } from "../../hooks/useLogin";
import { useRegister } from "../../hooks/useRegister";
import { PageType } from "../../types/common";

interface LoginModalProps {
  isVisible: boolean;
  onClose: () => void;
  onAdminLogin: (isAdmin: boolean) => void;
  setCurrentPage: React.Dispatch<React.SetStateAction<PageType>> | ((page: PageType) => void);
  title: string;
  subtitle: string;
  imageSrc: string;
}

const LoginModal: React.FC<LoginModalProps> = ({
  isVisible,
  onClose,
  onAdminLogin,
  setCurrentPage,
  title,
  subtitle,
  imageSrc,
}) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  const [APIHost, setAPIHost] = useState<string | null>(null);

  // Usar los hooks de React Query
  const loginMutation = useLogin();
  const registerMutation = useRegister();

  useEffect(() => {
    fetchHost();
  }, []);

  const fetchHost = async () => {
    try {
      const host = await detectHost();
      setAPIHost(host);
    } catch (error) {
      console.error("Error detecting host:", error);
      setAPIHost(process.env.NEXT_PUBLIC_API_URL || 'https://applottobueno.com');
    }
  };

  const handleLogin = async () => {
    try {
      // Usar mutación en lugar de fetch directo
      await loginMutation.mutateAsync({ 
        username,
        password 
      }, {
        onSuccess: (data) => {
          if (data.isAdmin) {
            onAdminLogin(true);
            setCurrentPage('ELECTORES');
            setToastMessage("Inicio de sesión exitoso");
            setToastType("success");
            onClose();
          } else {
            setToastMessage("No tiene permisos de administrador");
            setToastType("error");
            onAdminLogin(false);
          }
        },
        onError: (error) => {
          setToastMessage("Inicio de sesión fallido: " + error.message);
          setToastType("error");
          onAdminLogin(false);
        }
      });
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      setToastMessage("Error al iniciar sesión. Por favor, inténtelo de nuevo.");
      setToastType("error");
    }
    setUsername('');
    setPassword('');
  };

  const handleRegister = async () => {
    try {
      // Usar el hook de registro en lugar de fetch directo
      await registerMutation.mutateAsync({
        username,
        email,
        password,
        isAdmin: false
      }, {
        onSuccess: (data) => {
          setToastMessage("Registro exitoso. Ahora puedes iniciar sesión.");
          setToastType("success");
          setIsLoginMode(true);
        },
        onError: (error) => {
          setToastMessage("Registro fallido: " + error.message);
          setToastType("error");
        }
      });
    } catch (error) {
      console.error("Error al registrarse:", error);
      setToastMessage("Error al registrarse. Por favor, inténtelo de nuevo.");
      setToastType("error");
    }
    setUsername('');
    setEmail('');
    setPassword('');
  };

  if (!isVisible) return null;  // No renderizar el modal si no es visible

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        {/* Logo, Título, Subtítulo */}
        <div className="flex flex-row items-center gap-5 mb-4">
          <img src={imageSrc} width={381} height={162}  className="flex"></img>
          <div className="flex flex-col lg:flex-row lg:items-end justify-center lg:gap-3">
            <p className="sm:text-2xl md:text-3xl text-text-verba">{title}</p>
            <p className="sm:text-sm text-base text-text-alt-verba font-light">
              {subtitle}
            </p>
          </div>
        </div>

        <h2 className="text-lg font-bold mb-4">{isLoginMode ? "Inicio de Sesión Admin" : "Registro"}</h2>
        <div className="mb-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nombre de usuario"
            className="input input-bordered w-full mb-2 text-black"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            className="input input-bordered w-full mb-2 text-black"
          />
          {!isLoginMode && (
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Correo electrónico"
              className="input input-bordered w-full mb-2 text-black"
            />
          )}
        </div>
        <div className="flex justify-between items-center">
          <button 
            onClick={isLoginMode ? handleLogin : handleRegister} 
            className="btn btn-primary"
            disabled={(isLoginMode && loginMutation.isPending) || (!isLoginMode && registerMutation.isPending)}
          >
            {isLoginMode 
              ? (loginMutation.isPending ? "Iniciando sesión..." : "Iniciar Sesión")
              : (registerMutation.isPending ? "Registrando..." : "Registrarse")
            }
          </button>
          <button onClick={onClose} className="btn">Cancelar</button>
        </div>
        <div className="mt-4 text-center">
          <button onClick={() => setIsLoginMode(!isLoginMode)} className="text-blue-500 hover:underline">
            {isLoginMode ? "¿No tienes una cuenta? Regístrate" : "¿Ya tienes una cuenta? Inicia sesión"}
          </button>
        </div>
        {toastMessage && (
          <Toast 
            message={toastMessage}
            type={toastType}
            onClose={() => setToastMessage(null)}
          />
        )}
      </div>
    </div>
  );
};

export default LoginModal;
