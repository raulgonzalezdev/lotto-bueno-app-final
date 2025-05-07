import { useState, useEffect } from 'react';

/**
 * Hook personalizado para obtener y monitorear el tamaño de la ventana
 * @returns {{width: number, height: number}} Dimensiones de la ventana
 */
export const useWindowSize = () => {
  // Estado inicial con dimensiones por defecto
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined') {
      return;
    }

    // Función para actualizar el estado cuando cambia el tamaño de la ventana
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Llamar al handler inicialmente para establecer el tamaño correcto
    handleResize();
    
    // Añadir event listener
    window.addEventListener('resize', handleResize);
    
    // Limpiar el event listener cuando el componente se desmonta
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []); // Array vacío para que solo se ejecute una vez

  return windowSize;
};

export default useWindowSize; 