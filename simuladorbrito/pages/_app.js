import '../styles/globals.css';
import Head from 'next/head';
import { useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Crear un tema personalizado para la aplicación
const theme = createTheme({
  palette: {
    primary: {
      main: '#25346d', // Color azul institucional
      light: '#3f5186',
      dark: '#1c2851',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ffcc00', // Color amarillo institucional
      light: '#ffe066',
      dark: '#e6b800',
      contrastText: '#000000',
    },
    background: {
      default: '#f0f2f5',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    button: {
      fontWeight: 600,
    },
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableRipple: false,
      },
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '4px',
        },
        containedPrimary: {
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          overflow: 'hidden',
        },
      },
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
});

function MyApp({ Component, pageProps }) {
  // Efecto para optimizar la experiencia móvil
  useEffect(() => {
    // Fix para eventos táctiles
    const fixTouchEvents = () => {
      document.addEventListener('touchstart', function() {}, { passive: true });
    };
    
    // Prevenir el zoom del navegador en doble tap en dispositivos móviles
    const preventZoom = () => {
      const meta = document.querySelector('meta[name="viewport"]');
      if (meta) {
        meta.content = 'width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no';
      }
    };
    
    // Aplicar fixes
    fixTouchEvents();
    preventZoom();
    
    // Intentar detectar orientación
    const detectOrientation = () => {
      const isLandscape = window.innerWidth > window.innerHeight;
      document.documentElement.classList.toggle('landscape', isLandscape);
      document.documentElement.classList.toggle('portrait', !isLandscape);
    };
    
    detectOrientation();
    window.addEventListener('resize', detectOrientation);
    
    return () => {
      window.removeEventListener('resize', detectOrientation);
    };
  }, []);

  return (
    <>
      <Head>
        <title>Simulador Electoral 2025 - José Brito</title>
        <meta name="description" content="Simulador de votación para las elecciones regionales y nacionales 2025 - José Brito Gobernador de Anzoátegui" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#25346d" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
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