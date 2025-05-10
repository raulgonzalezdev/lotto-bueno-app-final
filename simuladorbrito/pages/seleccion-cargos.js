// pages/SeleccionCargos.js
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import ConfirmationModal from '../components/ConfirmationModal';
import { keyframes } from '@mui/system';

const latido = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const BRAND_BLUE       = 'rgb(21, 40, 82)';
const BRAND_BLUE_HOVER = 'rgb(15, 30, 62)';
const HEADER_HEIGHT    = 70;
const FOOTER_HEIGHT    = 40;
const baseFontSize     = '0.65rem';
const mdFontSize       = '1.1rem';

const SectionHeader = ({ title }) => (
  <Box sx={{
    backgroundColor: 'black',
    color: 'white',
    textAlign: 'center',
    py: { xs: 0.25, md: 0.75 },
    fontSize: { xs: '0.6rem', md: '1.2rem' },
    fontWeight: 'bold'
  }}>
    {title}
  </Box>
);

const VotoCard = ({ subText, onClick, logoSrc }) => (
  <Card
    variant="outlined"
    sx={{
      borderColor: BRAND_BLUE,
      borderWidth: { xs: 1, md: 2 },
      borderRadius: 0,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      height: { xs: '100px', md: 'auto' },
      p: { xs: 0.5, md: 1 },
      cursor: 'pointer'
    }}
    onClick={onClick}
  >
    <CardContent sx={{
      p: '2px !important',
      textAlign: 'center'
    }}>
      <Box sx={{
        height: { xs: '50px', md: '120px' },
        position: 'relative'
      }}>
        <Image src={logoSrc} alt="logo" fill style={{ objectFit: 'contain' }} />
      </Box>
      <Typography sx={{
        fontSize: { xs: baseFontSize, md: mdFontSize },
        fontWeight: 'bold',
        mt: 0.5
      }}>
        {subText}
      </Typography>
    </CardContent>
  </Card>
);

const GobernadorCard = ({ nombre, foto, logo, onClick, sx }) => (
  <Card
    variant="outlined"
    sx={{
      borderColor: BRAND_BLUE,
      borderWidth: 2,
      borderRadius: 0,
      p: { xs: 1, md: 2 },
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      cursor: 'pointer',
      height: { xs: '200px', md: 'auto' },
      ...sx
    }}
    onClick={onClick}
  >
    <CardContent sx={{
      p: { xs: '4px !important', md: '10px !important' },
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 1
    }}>
      {foto && (
        <Box sx={{
          width: { xs: '80px', md: '200px' },
          height: { xs: '80px', md: '200px' },
          position: 'relative'
        }}>
          <Image
            src={foto}
            alt="candidato"
            fill
            style={{ objectFit: 'contain' }}
          />
        </Box>
      )}
      {logo && (
        <Box sx={{
          width: { xs: '100px', md: '300px' },
          height: { xs: '50px', md: '150px' },
          position: 'relative'
        }}>
          <Image
            src={logo}
            alt="logo partido"
            fill
            style={{ objectFit: 'contain' }}
          />
        </Box>
      )}
      <Typography sx={{
        fontSize: { xs: baseFontSize, md: mdFontSize },
        fontWeight: 'bold',
        textAlign: 'center'
      }}>
        {nombre}
      </Typography>
    </CardContent>
  </Card>
);

// Mapeo de IDs a nombres de archivo
const ID_TO_FILENAME = {
  'venezuela_unidad': 'VU',
  'ad': 'AD',
  'voluntad_popular': 'VPA',
  'udp': 'UVV',
  // Agregar el resto de los mapeos si son necesarios
  'copei': 'COPEI',
  'mr': 'MR',
  'pj': 'PJ',
  'une': 'UNE',
  'el_cambio': 'EL CAMBIO',
  'cambiemos': 'CAMBIEMOS',
  'ap': 'AP',
  'br': 'BR',
  'min_unidad': 'MINUNIDAD'
};

export default function SeleccionCargos() {
  const router = useRouter();
  const [partido, setPartido] = useState(null);
  const [showConfirmationDialog, setShowConf] = useState(false);
  const [showWarningDialog, setShowWarn] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (router.query.partido) {
      try {
        setPartido(JSON.parse(decodeURIComponent(router.query.partido)));
      } catch {
        router.push('/simulador');
      }
    }
  }, [router.query.partido, router]);

  const handleVotar = () => setShowConf(true);
  
  const handlePageClick = (e) => {
    // Si el clic no fue en el botón VOTAR ni en el diálogo, mostrar advertencia
    if (!e.target.closest('button') && !e.target.closest('.MuiDialog-root')) {
      setShowWarn(true);
    }
  };

  const handleCloseAndRedirect = () => {
    setShowConf(false);
    setTimeout(() => router.push('/'), 1500);
  };

  if (!mounted || !partido) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: 'grey.200' 
      }}>
        Cargando datos...
      </Box>
    );
  }

  // Obtener el nombre de archivo correcto usando el mapeo
  const fileName = ID_TO_FILENAME[partido.id] || partido.id.toUpperCase();
  const imagePath = `/tarjeton/PANTALLA ${fileName}.jpg`;
  console.log('ID del partido:', partido.id);
  console.log('Nombre de archivo:', fileName);
  console.log('Ruta de imagen:', imagePath);

  return (
    <Box 
      onClick={handlePageClick}
      sx={{
        height: '100vh',
        width: '100vw',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Head>
        <title>Selección de Voto - {partido.nombre}</title>
        <meta name="description" content={`Simulador de voto para ${partido.nombre}`} />
      </Head>

      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: isMobile ? 'rotate(90deg) scale(1.8)' : 'scale(1.07)',
        transformOrigin: 'center center',
        overflow: 'hidden',
        padding: isMobile ? 0 : '20px'
      }}>
        <Image
          src={imagePath}
          alt={`Tarjetón ${partido.nombre}`}
          fill
          priority
          style={{
            objectFit: 'contain',
            width: '100%',
            height: '100%'
          }}
        />
      </Box>

      <Box sx={{
        position: 'absolute',
        top: isMobile ? '45%' : '80%',
        left: isMobile ? '55px' : '50%',
        transform: isMobile ? 
          'translateY(-50%) rotate(90deg)' : 
          'translateX(-50%)',
        transformOrigin: isMobile ? 'left center' : 'center',
        zIndex: 1000
      }}>
        <Button
          variant="contained"
          onClick={handleVotar}
          sx={{
            fontSize: { xs: '1rem', md: '1.5rem' },
            px: { xs: 3, md: 6 },
            py: { xs: 0.5, md: 2 },
            backgroundColor: 'rgb(21, 40, 82)',
            '&:hover': {
              backgroundColor: 'rgb(15, 30, 62)'
            },
            minWidth: { xs: '150px', md: '200px' },
            transform: isMobile ? 'scale(0.9)' : 'none'
          }}
        >
          VOTAR
        </Button>
      </Box>

      <Dialog 
        open={showWarningDialog} 
        onClose={() => setShowWarn(false)}
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 1,
            padding: 2,
            minWidth: { xs: '250px', md: '300px' }
          }
        }}
      >
        <DialogTitle sx={{ 
          textAlign: 'center',
          fontWeight: 'bold',
          pb: 1
        }}>
          ¡No lo pienses!
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ 
            textAlign: 'center',
            pb: 2
          }}>
            No inventes. Presiona VOTAR.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center' }}>
          <Button 
            onClick={() => setShowWarn(false)} 
            variant="contained"
            sx={{
              backgroundColor: '#dc3545',
              '&:hover': {
                backgroundColor: '#c82333'
              }
            }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmationModal
        isOpen={showConfirmationDialog}
        partido={partido}
        onConfirm={handleCloseAndRedirect}
        onCancel={() => setShowConf(false)}
      />
    </Box>
  );
}
