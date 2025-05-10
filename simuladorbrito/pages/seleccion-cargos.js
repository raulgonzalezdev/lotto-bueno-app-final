// pages/SeleccionCargos.js
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';

// Material-UI
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

// Componentes propios
import ConfirmationModal from '../components/ConfirmationModal';
import { keyframes } from '@mui/system';

// Definir la animación de latido
const latido = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

/* ─────────────────────────────────  CONSTANTES DE ESTILO  ───────────────────────────────── */
const BRAND_BLUE          = 'rgb(21, 40, 82)';
const BRAND_BLUE_HOVER    = 'rgb(15, 30, 62)';
const HEADER_HEIGHT       = 70;   // px
const FOOTER_HEIGHT       = 40;   // px

/* Tamaños responsivos reutilizables (solo los que se usan en el grid) */
const baseFontSize   = '0.65rem';
const mdFontSize     = '1.1rem';

/* ─────────────────────────────────  COMPONENTES AUXILIARES  ───────────────────────────────── */
const SectionHeader = ({ title }) => (
  <Box
    sx={{
      backgroundColor: 'black',
      color: 'white',
      textAlign: 'center',
      py: { xs: 0.25, md: 0.75 },
      fontSize: { xs: '0.6rem', md: '1.2rem' },
      fontWeight: 'bold'
    }}
  >
    {title}
  </Box>
);

const VotoCard = ({ subText, cardTitle = null, onClick, logoSrc }) => (
  <Card
    variant="outlined"
    sx={{
      borderColor: BRAND_BLUE,
      borderWidth: { xs: 1, md: 2 },
      borderRadius: 0,
      height: '100%',
      p: { xs: 0.25, md: 1 },
      display: 'flex',
      flexDirection: 'column',
      justifyContent: cardTitle ? 'space-between' : 'center',
      cursor: 'pointer'
    }}
    onClick={onClick}
  >
    <CardContent
      sx={{
        p: '2px !important',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: cardTitle ? 'space-between' : 'center',
        flexGrow: 1
      }}
    >
      {cardTitle && (
        <Typography
          sx={{
            fontSize: { xs: baseFontSize, md: mdFontSize },
            fontWeight: 600,
            minHeight: { xs: '1.4em', md: '1.6em' },
            pt: { xs: '4px', md: '8px' }
          }}
        >
          {cardTitle}
        </Typography>
      )}

      {/* Logo genérico – se remplaza con el logo del partido afuera */}
      <Box
        sx={{
          height: { xs: '55px', md: '120px' },
          my: { xs: 0.5, md: 1 },
          mx: { xs: 0.5, md: 1.5 },
          position: 'relative'
        }}
      >
        <Image
          src={logoSrc}
          alt="logo"
          fill
          style={{ objectFit: 'contain' }}
        />
      </Box>

      <Typography
        sx={{
          fontSize: { xs: baseFontSize, md: mdFontSize },
          fontWeight: 'bold',
          lineHeight: 1.2,
          pb: '2px'
        }}
      >
        {subText}
      </Typography>
    </CardContent>
  </Card>
);

/* Tarjeta compuesta especial para Gobernador */
const GobernadorCard = ({ nombre, foto, logo, onClick }) => (
  <Card
    variant="outlined"
    sx={{
      borderColor: BRAND_BLUE,
      borderWidth: 2,
      borderRadius: 0,
      p: { xs: 0.5, md: 2 },
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      cursor: 'pointer'
    }}
    onClick={onClick}
  >
    <CardContent
      sx={{
        p: { xs: '2px !important', md: '10px !important' },
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      {/* Foto + logo (vertical: foto arriba, logo abajo) */}
      <Grid
        container
        direction="column"
        spacing={1}
        alignItems="center"
        sx={{ mb: 1, flexGrow: 1 }}
      >
        {foto && (
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: { xs: '160px', sm: '200px', md: '250px' }, 
              width: { xs: '160px', sm: '200px', md: '250px' },
              mx: 'auto'
            }}>
              <Image
                src={foto}
                alt="candidato"
                width={230}
                height={230}
                style={{ objectFit: 'contain', maxWidth: '100%', height: 'auto' }}
              />
            </Box>
          </Grid>
        )}
        {logo && (
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              mb: {xs: 1, md: 1.5},
              height: { xs: '100px', sm: '120px', md: '160px' },
              width: { xs: '180px', sm: '220px', md: '300px' },
            }}>
              <Image
                src={logo}
                alt="logo partido"
                width={280}
                height={140}
                style={{ objectFit: 'contain', maxWidth: '100%', height: 'auto' }}
              />
            </Box>
          </Grid>
        )}
      </Grid>

      {/* Nombre */}
      <Typography
        sx={{
          fontSize: { xs: baseFontSize, md: mdFontSize },
          fontWeight: 'bold',
          textAlign: 'center'
        }}
      >
        {nombre}
      </Typography>
    </CardContent>
  </Card>
);

/* ─────────────────────────────────  COMPONENTE PRINCIPAL  ───────────────────────────────── */
export default function SeleccionCargos () {
  const router = useRouter();
  const [partido, setPartido]                     = useState(null);
  const [showConfirmationDialog, setShowConf]     = useState(false);
  const [showWarningDialog, setShowWarn]          = useState(false);
  const [isMobile, setIsMobile]                   = useState(false);
  const [mounted, setMounted]                     = useState(false);

  /* ───── Detección de dispositivo móvil ───── */
  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  /* ───── Carga de datos del partido dese la query ───── */
  useEffect(() => {
    if (router.query.partido) {
      try {
        const partidoData = JSON.parse(decodeURIComponent(router.query.partido));
        console.log("Datos del partido recibidos:", partidoData);
        setPartido(partidoData);
      } catch (e) {
        console.error('Error parsing partido:', e);
        router.push('/simulador');
      }
    }
  }, [router.query.partido, router]);

  /* ───── Handlers ───── */
  const handleVotar = () => setShowConf(true);
  const handleCardClick = e => {
    e.preventDefault();
    setShowWarn(true);
  };
  const handleCloseAndRedirect = () => {
    setShowConf(false);
    setTimeout(() => router.push('/'), 1500);
  };

  if (!mounted || !partido) {
    return (
      <Box
        className="min-h-screen flex items-center justify-center"
        sx={{ backgroundColor: 'grey.200' }}
      >
        <Typography variant="h6">Cargando datos…</Typography>
      </Box>
    );
  }

  /* Datos derivados */
  const nombrePartido  = partido.nombre.toUpperCase();
  const logoPartido    = partido.logo;
  const nombreGob      = partido.apoyaBrito ? 'JOSE BRITO' : '';
  const fotoGob        = partido.apoyaBrito ? "/candidatos/brito.png" : null;
  console.log("Valores para GobernadorCard:", { nombreGob, fotoGob, logoPartido, apoyaBrito: partido.apoyaBrito });
  const logoCNE        = '/cne/logo_cne.png';

  /* ─────────────────────────────────  UI  ───────────────────────────────── */
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundImage: isMobile ? 'none' : 'url(/fondovertical.jpg)',
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: isMobile ? BRAND_BLUE : 'rgba(255,255,255,0.87)',
        backgroundBlendMode: 'lighten'
      }}
    >
      <Head>
        <title>Selección de Voto - {nombrePartido}</title>
        <meta
          name="description"
          content={`Simulador de voto para ${nombrePartido}`}
        />
      </Head>

      {/* ───────── CABECERA FIJA ───────── */}
      {!isMobile && (
        <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1200 }}>
          <Box
            sx={{
              backgroundColor: BRAND_BLUE,
              color: 'white',
              py: 0.5,
              textAlign: 'center',
              display: 'flex',
              justifyContent: 'center',
              gap: 1
            }}
          >
            <Image src={logoCNE} alt="CNE" width={20} height={20} />
            <Typography sx={{ fontSize: { xs: '0.65rem', md: '0.8rem' } }}>
              ELECCIONES REGIONALES Y NACIONALES 2025
            </Typography>
          </Box>
          <Box
            sx={{
              backgroundColor: BRAND_BLUE,
              color: 'white',
              py: 0.5,
              textAlign: 'center',
              borderTop: '1px solid rgba(255,255,255,0.2)'
            }}
          >
            <Typography sx={{ fontWeight: 'bold', fontSize: { md: '1rem' } }}>
              REVISE SUS OPCIONES Y PRESIONE EL BOTÓN «VOTAR»
            </Typography>
          </Box>
        </Box>
      )}

      {/* ───────── CONTENIDO PRINCIPAL ───────── */}
      {isMobile ? (
        <Box
          sx={{
            width: '100%',
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            backgroundColor: BRAND_BLUE,
            overflow: 'hidden',
          }}
        >
          {/* Texto lateral derecho */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              right: 10,
              height: '100%',
              width: '40px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              color: '#ffcc00',
              textAlign: 'center',
              zIndex: 2,
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              fontSize: '0.7rem',
              padding: '5px 0',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: 'bold',
                textTransform: 'uppercase',
                fontSize: 'inherit',
                letterSpacing: 1,
              }}
            >
              CONOCE LAS TARJETAS PARA EL PROGRESO DE ANZOÁTEGUI
            </Typography>
          
            <Box
              sx={{
                marginTop: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
              }}
            >
              <Box 
                component="img" 
                src={logoCNE} 
                alt="CNE Logo" 
                sx={{ 
                  width: '15px',
                  height: '15px',
                  marginRight: '5px',
                }} 
              />
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  fontSize: 'inherit',
                }}
              >
                ELECCIONES REGIONALES Y NACIONALES 2025
              </Typography>
            </Box>
          </Box>

          {/* Texto lateral izquierdo */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: '40px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              color: '#ffcc00',
              textAlign: 'center',
              zIndex: 2,
              writingMode: 'vertical-lr',
              textOrientation: 'mixed',
              fontSize: '0.7rem',
              padding: '5px 0',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: 'bold',
                textTransform: 'uppercase',
                fontSize: 'inherit',
                letterSpacing: 1,
                animation: `${latido} 2s infinite ease-in-out`,
              }}
            >
              JOSÉ BRITO
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 'bold',
                textTransform: 'uppercase',
                fontSize: 'inherit',
                letterSpacing: 1,
                marginTop: '5px',
              }}
            >
              BIENESTAR • PROGRESO • DESARROLLO
            </Typography>
          </Box>

          {/* Tarjetón central */}
          <Paper
            elevation={6}
            sx={{
              width: 'calc(100% - 100px)',
              height: '95%',
              backgroundColor: 'white',
              borderRadius: '10px',
              margin: '0 50px',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Títulos */}
            <Box sx={{ backgroundColor: 'black', color: 'white', p: 0.5, textAlign: 'center', transform: 'rotate(90deg)', transformOrigin: 'left bottom', position: 'absolute', width: '100%', left: 20, top: -40 }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 'bold' }}>
                REVISE SUS OPCIONES Y PRESIONE EL BOTÓN «VOTAR»
              </Typography>
            </Box>
            
            {/* Contenido del tarjetón con formato horizontal */}
            <Box
              sx={{
                flex: 1,
                backgroundColor: 'white',
                p: 2,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              {/* Espacio para los elementos rotados */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                width: '100%', 
                height: '100%',
                transform: 'rotate(90deg)',
                transformOrigin: 'center center',
                mt: 4
              }}>
                {/* Diputado Asamblea (2 tarjetas horizontales) */}
                <Box sx={{ mb: 2 }}>
                  <SectionHeader title="DIPUTADO ASAMBLEA NACIONAL" />
                  <Grid container spacing={1} sx={{ my: 1 }}>
                    <Grid item xs={6}>
                      <VotoCard 
                        cardTitle="DIP. LISTA" 
                        subText="LISTA" 
                        logoSrc={logoPartido} 
                        onClick={handleCardClick} 
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <VotoCard 
                        cardTitle="DIP. NOMINAL" 
                        subText="CANDIDATO" 
                        logoSrc={logoPartido} 
                        onClick={handleCardClick} 
                      />
                    </Grid>
                  </Grid>
                </Box>

                {/* Gobernador */}
                <Box sx={{ mb: 2 }}>
                  <SectionHeader title="GOBERNADOR" />
                  <Box sx={{ my: 1 }}>
                    <GobernadorCard
                      nombre={nombreGob || nombrePartido}
                      foto={fotoGob}
                      logo={logoPartido}
                      onClick={handleCardClick}
                    />
                  </Box>
                </Box>

                {/* Consejo Legislativo */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <SectionHeader title="CONSEJO LEGISLATIVO LISTA" />
                    <Box sx={{ my: 1 }}>
                      <VotoCard 
                        subText="LISTA" 
                        cardTitle={null} 
                        logoSrc={logoPartido} 
                        onClick={handleCardClick} 
                      />
                    </Box>
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <SectionHeader title="CONSEJO LEGISLATIVO NOMINAL" />
                    <Box sx={{ my: 1 }}>
                      <VotoCard 
                        subText="CANDIDATO" 
                        cardTitle={null} 
                        logoSrc={logoPartido} 
                        onClick={handleCardClick} 
                      />
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Paper>
            
          {/* Botón VOTAR (móvil) */}
          <Box
            sx={{
              position: 'fixed',
              bottom: '10px',
              left: '0',
              right: '0',
              display: 'flex',
              justifyContent: 'center',
              zIndex: 10,
            }}
          >
            <Button 
              variant="contained"
              onClick={handleVotar}
              disableElevation
              sx={{ 
                backgroundColor: BRAND_BLUE, 
                '&:hover': { backgroundColor: BRAND_BLUE_HOVER },
                fontSize: '0.8rem',
                py: 0.8,
                px: 5,
                borderRadius: 1,
                textTransform: 'uppercase',
                fontWeight: 'bold',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
              }}
            >
              VOTAR
            </Button>
          </Box>
        </Box>
      ) : (
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            pt: `${HEADER_HEIGHT + 8}px`,
            pb: `${FOOTER_HEIGHT + 8}px`
          }}
        >
          <Paper
            elevation={0}
            sx={{
              width: '100%',
              maxWidth: { md: 1600 },
              backgroundColor: { xs: 'transparent', md: 'white' },
              border: { md: `3px solid ${BRAND_BLUE}` },
              borderRadius: { md: 2 },
              p: { xs: 0, md: 2 },
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            {/* ───── GRID DESKTOP (md+) │ nuevo layout ───── */}
            <Grid
              container
              spacing={2}
              sx={{ display: { xs: 'none', md: 'flex' } }}
            >
              {/* ===== Bloque 1 ─ Diputado Asamblea Nacional (colspan 5) ===== */}
              <Grid item md={5}>
                <SectionHeader title="DIPUTADO ASAMBLEA NACIONAL" />

                <Grid container>
                  <Grid item md={6} sx={{ p: 1 }}>
                    <SectionHeader title="DIPUTADO LISTA" />
                    <VotoCard
                      subText="LISTA"
                      cardTitle={null}
                      logoSrc={logoPartido}
                      onClick={handleCardClick}
                    />
                  </Grid>

                  <Grid item md={6} sx={{ p: 1 }}>
                    <SectionHeader title="DIPUTADO NOMINAL" />
                    <VotoCard
                      subText="CANDIDATO"
                      cardTitle={null}
                      logoSrc={logoPartido}
                      onClick={handleCardClick}
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* ===== Bloque 2 ─ Gob y Consejo Legislativo (colspan 7) ===== */}
              <Grid item md={7}>
                <SectionHeader title="GOBERNADORES Y CONSEJO LEGISLATIVO ESTADAL" />

                <Grid container>
                  {/* Col 3 – Gobernador (ocupa más espacio) */}
                  <Grid item md={7} sx={{ p: 1 }}>
                    <SectionHeader title="GOBERNADOR" />
                    <GobernadorCard
                      nombre={nombreGob || nombrePartido}
                      foto={fotoGob}
                      logo={logoPartido}
                      onClick={handleCardClick}
                    />
                  </Grid>

                  {/* Col 4 – Consejo Lista + Nominal (ocupa menos espacio) */}
                  <Grid item md={5} sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box>
                      <SectionHeader title="CONSEJO LEGISLATIVO LISTA" />
                      <VotoCard
                        subText="LISTA"
                        cardTitle={null}
                        logoSrc={logoPartido}
                        onClick={handleCardClick}
                        sx={{ height: '100%', mb: 1 }}
                      />
                    </Box>

                    <Box>
                      <SectionHeader title="CONSEJO LEGISLATIVO NOMINAL" />
                      <VotoCard
                        subText="CANDIDATO"
                        cardTitle={null}
                        logoSrc={logoPartido}
                        onClick={handleCardClick}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            {/* BOTÓN VOTAR (solo desktop) */}
            <Box
              sx={{
                position: 'absolute',
                bottom: `${FOOTER_HEIGHT + 8}px`,
                left: '50%',
                transform: 'translateX(-50%)',
                display: { xs: 'none', md: 'flex' }
              }}
            >
              <Button
                variant="contained"
                onClick={handleVotar}
                sx={{
                  backgroundColor: BRAND_BLUE,
                  fontWeight: 'bold',
                  px: 8,
                  py: 1.25,
                  '&:hover': { backgroundColor: BRAND_BLUE_HOVER }
                }}
              >
                VOTAR
              </Button>
            </Box>
          </Paper>
        </Box>
      )}

      {/* ───────── PIE DE PÁGINA ───────── */}
      {!isMobile && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: BRAND_BLUE,
            color: 'white',
            py: 0.5,
            textAlign: 'center',
            height: FOOTER_HEIGHT
          }}
        >
          <Typography variant="caption">
            &copy; 2025 Simulador Electoral – Selección de Voto
          </Typography>
        </Box>
      )}

      {/* ───────── Diálogos ───────── */}
      <Dialog
        open={showWarningDialog}
        onClose={() => setShowWarn(false)}
      >
        <DialogTitle>¡No lo pienses!</DialogTitle>
        <DialogContent>
          <DialogContentText>No inventes. Presiona VOTAR.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowWarn(false)} color="error" variant="contained">
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
