import { useRouter } from 'next/router';
import Head from 'next/head';
import { useState, useEffect } from 'react';

// Material UI Imports
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography'; // Opcional, si queremos estilizar texto con MUI

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

  const brandBlueColor = 'rgb(21, 40, 82)';
  const brandBlueHoverColor = 'rgb(15, 30, 62)';

  return (
    <Box 
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        height: '100vh',
        backgroundImage: isPortrait 
          ? 'url(/fondovertical.jpg)' 
          : 'url(/fondohorizontal.jpg)',
        backgroundSize: 'contain',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#f0f2f5' // Un color de fondo suave por si la imagen no cubre todo
      }}
    >
      <Head>
        <title>Simulador Electoral 2025 - José Brito Gobernador</title>
        <meta name="description" content="Simulador de votación para las elecciones regionales 2025 - José Brito Gobernador de Anzoátegui" />
      </Head>
      
      <Box 
        sx={{
          position: 'absolute',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          // Ajustar 'bottom' para subir el botón. 
          // Queremos que esté debajo del eslogan principal, cerca de la miniatura del tarjetón en la imagen de fondo.
          // Estos valores pueden necesitar ajuste fino dependiendo de las imágenes exactas.
          bottom: isPortrait ? '18%' : '15%', 
        }}
      >
        <Button 
          variant="contained"
          onClick={goToSimulator}
          sx={{
            backgroundColor: brandBlueColor,
            color: 'white',
            fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' }, // Equivalente a text-xl aprox.
            padding: { xs: '10px 24px', sm: '12px 32px', md: '16px 40px' }, // Equivalente a px-10 py-4 aprox.
            borderRadius: '8px', // Un ligero redondeo
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: brandBlueHoverColor,
              transform: 'scale(1.03)',
              boxShadow: '0 6px 16px rgba(0,0,0,0.35)',
            }
          }}
        >
          ENTRAR AL SIMULADOR
        </Button>
      </Box>
    </Box>
  );
} 