import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  let backgroundColor;
  switch (type) {
    case 'success':
      backgroundColor = 'bg-green-500';
      break;
    case 'error':
      backgroundColor = 'bg-red-500';
      break;
    case 'info':
      backgroundColor = 'bg-blue-500';
      break;
  }

  useEffect(() => {
    const timer = setTimeout(onClose, 5000); // Ocultar después de 5 segundos
    return () => clearTimeout(timer); // Limpiar el temporizador en desmontaje
  }, [onClose]);

  return (
    <div className={`${backgroundColor} text-white p-4 rounded fixed bottom-4 right-4 z-50`}>
      <div className="flex justify-between items-center">
        <span>{message}</span>
        <button onClick={onClose} className="ml-4">
          &times;
        </button>
      </div>
    </div>
  );
};

export default Toast;
