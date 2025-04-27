import { useState, useEffect } from 'react';

export default function Toast({ message, type = 'info', duration = 5000, onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!message) return;
    
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message || !visible) return null;

  const bgColors = {
    info: 'bg-blue-500',
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500'
  };

  const baseClasses = 'fixed bottom-4 right-4 z-50 px-4 py-3 rounded shadow-lg text-white';
  const typeClass = bgColors[type] || bgColors.info;

  return (
    <div className={`${baseClasses} ${typeClass} flex items-center justify-between`}>
      <span>{message}</span>
      <button
        onClick={() => {
          setVisible(false);
          if (onClose) onClose();
        }}
        className="ml-4 text-white"
      >
        ✕
      </button>
    </div>
  );
} 