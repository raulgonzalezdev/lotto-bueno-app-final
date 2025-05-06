import { useRouter } from 'next/router';
import Head from 'next/head';
import { useState, useEffect } from 'react';

export default function Home() {
  const router = useRouter();
  const [isPortrait, setIsPortrait] = useState(true);
  
  // Función para verificar la orientación de la pantalla
  const checkOrientation = () => {
    if (typeof window !== 'undefined') {
      setIsPortrait(window.innerHeight > window.innerWidth);
    }
  };
  
  // Escuchar cambios de orientación
  useEffect(() => {
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);
  
  const goToSimulator = () => {
    router.push('/simulador');
  };

  return (
    <div 
      className="relative flex flex-col items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat" 
      style={{
        backgroundImage: isPortrait 
          ? 'url(/fondovertical.jpg)' 
          : 'url(/fondohorizontal.jpg)',
        height: '100vh',
        backgroundSize: 'contain',
        backgroundPosition: 'center center',
        backgroundColor: '#f0f2f5'
      }}
    >
      <Head>
        <title>Simulador Electoral 2025 - José Brito Gobernador</title>
        <meta name="description" content="Simulador de votación para las elecciones regionales 2025 - José Brito Gobernador de Anzoátegui" />
      </Head>
      
      <div 
        className="absolute w-full flex justify-center"
        style={{ 
          bottom: isPortrait ? '5%' : '7%',
        }}
      >
        <button 
          onClick={goToSimulator}
          className="btn-enter px-10 py-4 text-xl mx-auto"
        >
          ENTRAR AL SIMULADOR
        </button>
      </div>
    </div>
  );
} 