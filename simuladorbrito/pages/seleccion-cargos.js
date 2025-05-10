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
  const handleCardClick = e => { e.preventDefault(); setShowWarn(true); };
  const handleCloseAndRedirect = () => {
    setShowConf(false);
    setTimeout(() => router.push('/'), 1500);
  };

  if (!mounted || !partido) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'grey.200' }}>
        <Typography variant="h6">Cargando datos…</Typography>
      </Box>
    );
  }

  const nombrePartido = partido.nombre.toUpperCase();
  const logoPartido = partido.logo;
  const nombreGob = partido.apoyaBrito ? 'JOSÉ BRITO' : nombrePartido;
  const fotoGob = partido.apoyaBrito ? '/candidatos/brito.png' : null;
  const logoCNE = '/cne/logo_cne.png';

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundImage: isMobile ? 'none' : 'url(/fondovertical.jpg)',
      backgroundSize: 'contain',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundColor: isMobile ? BRAND_BLUE : 'rgba(255,255,255,0.87)',
      backgroundBlendMode: 'lighten'
    }}>
      <Head>
        <title>Selección de Voto - {nombrePartido}</title>
        <meta name="description" content={`Simulador de voto para ${nombrePartido}`} />
      </Head>

      {/* ───────── CABECERA FIJA ───────── */}
      <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1200 }}>
        <Box sx={{
          backgroundColor: BRAND_BLUE,
          color: 'white',
          py: 0.5,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 1
        }}>
          <Image src={logoCNE} alt="CNE" width={20} height={20} />
          <Typography sx={{ fontSize: { xs: '0.65rem', md: '0.8rem' } }}>
            ELECCIONES REGIONALES Y NACIONALES 2025
          </Typography>
        </Box>
        <Box sx={{
          backgroundColor: BRAND_BLUE,
          color: 'white',
          py: 0.5,
          textAlign: 'center',
          borderTop: '1px solid rgba(255,255,255,0.2)'
        }}>
          <Typography sx={{ fontWeight: 'bold', fontSize: { md: '1rem' } }}>
            REVISE SUS OPCIONES Y PRESIONE EL BOTÓN «VOTAR»
          </Typography>
        </Box>
      </Box>

      {/* ───────── CONTENIDO PRINCIPAL ───────── */}
      {isMobile ? (
        <Box sx={{
          width: '100%',
          height: '100vh',
          position: 'relative',
          backgroundColor: BRAND_BLUE,
          overflow: 'hidden',
          paddingTop: `${HEADER_HEIGHT}px`,
          paddingBottom: `${FOOTER_HEIGHT}px`,
        }}>
          {/* Textos laterales eliminados */}
          
          {/* Tarjetón central */}
          <Paper elevation={6} sx={{
            position: 'absolute',
            top: `calc(${HEADER_HEIGHT}px + 10px)`,
            left: 0,
            right: 0,
            height: `calc(100vh - ${HEADER_HEIGHT}px - ${FOOTER_HEIGHT}px - 20px)`,
            width: '100%',
            backgroundColor: 'white',
            borderRadius: '10px 10px 0 0',
            px: 1.5, 
            pt: 1.5, 
            pb: 8,
            boxSizing: 'border-box',
            overflow: 'auto'
          }}>
            <Grid container direction="column" spacing={0.5}>
              <Grid item>
                <SectionHeader title="DIPUTADO ASAMBLEA NACIONAL" />
              </Grid>
              <Grid item>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <SectionHeader title="DIPUTADO LISTA" />
                    <VotoCard subText="LISTA" logoSrc={logoPartido} onClick={handleCardClick} />
                  </Grid>
                  <Grid item xs={6}>
                    <SectionHeader title="DIPUTADO NOMINAL" />
                    <VotoCard subText="CANDIDATO" logoSrc={logoPartido} onClick={handleCardClick} />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item sx={{ mt: 1 }}>
                <SectionHeader title="GOBERNADORES Y CONSEJO LEGISLATIVO ESTADAL" />
              </Grid>
              <Grid item>
                <SectionHeader title="GOBERNADOR" />
              </Grid>
              <Grid item>
                <GobernadorCard 
                  nombre={nombreGob} 
                  foto={fotoGob} 
                  logo={logoPartido} 
                  onClick={handleCardClick} 
                  sx={{ 
                    height: { xs: '180px', md: 'auto' },
                    mb: 1
                  }}
                />
              </Grid>
              <Grid item>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <SectionHeader title="CONSEJO LEGISLATIVO LISTA" />
                    <VotoCard subText="LISTA" logoSrc={logoPartido} onClick={handleCardClick} />
                  </Grid>
                  <Grid item xs={6}>
                    <SectionHeader title="CONSEJO LEGISLATIVO NOMINAL" />
                    <VotoCard subText="CANDIDATO" logoSrc={logoPartido} onClick={handleCardClick} />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Paper>

          {/* Botón VOTAR - posición ajustada */}
          <Box sx={{
            position: 'absolute',
            bottom: 45,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            zIndex: 3
          }}>
            <Button
              variant="contained"
              onClick={handleVotar}
              disableElevation
              sx={{
                backgroundColor: BRAND_BLUE,
                '&:hover': { backgroundColor: BRAND_BLUE_HOVER },
                textTransform: 'uppercase',
                fontWeight: 'bold',
                px: 6, py: 1
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
      <Box sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: BRAND_BLUE,
        color: 'white',
        py: 0.5,
        textAlign: 'center',
        height: FOOTER_HEIGHT
      }}>
        <Typography variant="caption">
          &copy; 2025 Simulador Electoral – Selección de Voto
        </Typography>
      </Box>

      <Dialog open={showWarningDialog} onClose={() => setShowWarn(false)}>
        <DialogTitle>¡No lo pienses!</DialogTitle>
        <DialogContent>
          <DialogContentText>No inventes. Presiona VOTAR.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowWarn(false)} color="error" variant="contained">Cerrar</Button>
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
