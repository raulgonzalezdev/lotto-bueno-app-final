import { useRouter } from 'next/router';
import Head from 'next/head';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

// Material UI Imports
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography'; // Opcional, si queremos estilizar texto con MUI

export default function Home() {
  const router = useRouter();
  const [isPortrait, setIsPortrait] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  // Función para verificar la orientación de la pantalla
  const checkOrientation = useCallback(() => {
    if (typeof window !== 'undefined') {
      setIsPortrait(window.innerHeight > window.innerWidth);
    }
  }, []);
  
  // Escuchar cambios de orientación
  useEffect(() => {
    setMounted(true);
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, [checkOrientation]);
  
  const goToSimulator = useCallback(() => {
    console.log("Navegando a /simulador");
    router.push('/simulador');
  }, [router]);

  const brandBlueColor = 'rgb(21, 40, 82)';
  const brandBlueHoverColor = 'rgb(15, 30, 62)';
  const headerHeight = '56px';
  const footerHeight = '48px';
  
  // Usar URL absolutas para las imágenes
  const logoCNE = "/cne/logo_cne.png";
  const fondoVertical = "/fondovertical.jpg";
  const fondoHorizontal = "/fondohorizontal.jpg";

  // No renderizar hasta que el componente esté montado en el cliente
  if (!mounted) {
    return null;
  }

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
          ? `url(${fondoVertical})` 
          : `url(${fondoHorizontal})`,
        backgroundSize: isPortrait ? '75%' : '80%',
        backgroundPosition: 'center 55%',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#f0f2f5',
        pt: headerHeight,
        pb: footerHeight,
        overflow: 'hidden',
      }}
    >
      <Head>
        <title>Simulador Electoral 2025 - José Brito Gobernador</title>
        <meta name="description" content="Simulador de votación para las elecciones regionales 2025 - José Brito Gobernador de Anzoátegui" />
      </Head>
      
      {/* Cabecera Fija */}
      <Box 
        sx={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          zIndex: 1200, 
          backgroundColor: brandBlueColor, 
          color: 'white', 
          py: 1, px: 2, 
          textAlign: 'center', 
          boxShadow: 3, 
          height: headerHeight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div style={{ marginRight: '8px', width: '24px', height: '24px', position: 'relative' }}>
          <img src={logoCNE} alt="CNE Logo" width={24} height={24} />
        </div>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', fontSize: { xs: '1.2rem', md: '1.5rem' } }}>
          ELECCIONES REGIONALES Y NACIONALES 2025
        </Typography>
      </Box>
      
      <Box 
        sx={{
          position: 'absolute',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          // Ajustar 'bottom' para subir el botón. 
          bottom: isPortrait ? '18%' : '15%', 
        }}
      >
        <Button 
          variant="contained"
          onClick={goToSimulator}
          disableElevation
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
      
      {/* Pie de Página Fijo */}
      <Box 
        sx={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          zIndex: 1200, 
          backgroundColor: brandBlueColor, 
          color: 'white', 
          py: 1.5, 
          height: footerHeight
        }}
      >
        <Typography variant="body2" align="center" sx={{ fontSize: {xs: '0.7rem', sm:'0.75rem', md: '0.875rem'} }}>
          &copy; 2025 Simulador Electoral - José Brito Gobernador
        </Typography>
      </Box>
    </Box>
  );
} 