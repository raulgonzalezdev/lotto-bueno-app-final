import '../styles/globals.css';
import Head from 'next/head';
import { useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Crear un tema personalizado para la aplicación
const theme = createTheme({
  palette: {
    primary: {
      main: 'rgb(21, 40, 82)', // Color azul oscuro de la aplicación
    },
    secondary: {
      main: '#f50057',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableRipple: false, // Habilitar el efecto ripple para mejor feedback
      },
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

function MyApp({ Component, pageProps }) {
  // Efecto para limpiar el localStorage al inicio
  useEffect(() => {
    // Fix para que los eventos táctiles funcionen correctamente en dispositivos móviles
    const fixTouchEvents = () => {
      document.addEventListener('touchstart', function() {}, { passive: true });
    };
    
    fixTouchEvents();
    
    // Limpiar efectos al desmontar
    return () => {
      // No es necesario limpiar el listener touchstart
    };
  }, []);

  return (
    <>
      <Head>
        <title>Simulador Electoral 2025</title>
        <meta name="description" content="Simulador de votación para las elecciones regionales y nacionales 2025" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        {/* Prevenir cache para siempre obtener los recursos actualizados */}
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  );
}

export default MyApp; 