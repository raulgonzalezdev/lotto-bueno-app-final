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

const VotoCard = ({ subText, cardTitle = null, onClick }) => (
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
          src="/placeholder.svg"
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
      {/* Foto + logo (desktop: lado a lado | móvil: apilados) */}
      <Grid
        container
        spacing={1}
        alignItems="center"
        sx={{ mb: 1, flexGrow: 1 }}
      >
        {foto && (
          <Grid item xs={12} md={4} sx={{ position: 'relative', height: 120 }}>
            <Image
              src={foto}
              alt="candidato"
              fill
              style={{ objectFit: 'contain' }}
            />
          </Grid>
        )}
        {logo && (
          <Grid
            item
            xs={12}
            md={8}
            sx={{ position: 'relative', height: 120 }}
          >
            <Image
              src={logo}
              alt="logo partido"
              fill
              style={{ objectFit: 'contain' }}
            />
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

  /* ───── Carga de datos del partido dese la query ───── */
  useEffect(() => {
    if (router.query.partido) {
      try {
        setPartido(
          JSON.parse(decodeURIComponent(router.query.partido))
        );
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

  if (!partido) {
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
  const fotoGob        = partido.apoyaBrito ? '/candidatos/brito.png' : null;
  const logoCNE        = '/cne/logo_cne.png';

  /* ─────────────────────────────────  UI  ───────────────────────────────── */
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundImage: 'url(/fondovertical.jpg)',
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: 'rgba(255,255,255,0.87)',
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

      {/* ───────── CONTENIDO PRINCIPAL ───────── */}
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
            {/* ===== Bloque 1 ─ Diputado Asamblea Nacional (colspan 6) ===== */}
            <Grid item md={6}>
              <SectionHeader title="DIPUTADO ASAMBLEA NACIONAL" />

              <Grid container>
                <Grid item md={6} sx={{ p: 1 }}>
                  <SectionHeader title="DIPUTADO LISTA" />
                  <VotoCard
                    subText="LISTA"
                    cardTitle={null}
                    onClick={handleCardClick}
                  />
                </Grid>

                <Grid item md={6} sx={{ p: 1 }}>
                  <SectionHeader title="DIPUTADO NOMINAL" />
                  <VotoCard
                    subText="CANDIDATO"
                    cardTitle={null}
                    onClick={handleCardClick}
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* ===== Bloque 2 ─ Gob y Consejo Legislativo (colspan 6) ===== */}
            <Grid item md={6}>
              <SectionHeader title="GOBERNADORES Y CONSEJO LEGISLATIVO ESTADAL" />

              <Grid container>
                {/* Col 3 – Gobernador + Consejo Lista */}
                <Grid item md={6} sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <SectionHeader title="GOBERNADOR" />
                  <GobernadorCard
                    nombre={nombreGob || nombrePartido}
                    foto={fotoGob}
                    logo={logoPartido}
                    onClick={handleCardClick}
                  />

                  <SectionHeader title="CONSEJO LEGISLATIVO LISTA" />
                  <VotoCard
                    subText="LISTA"
                    cardTitle={null}
                    onClick={handleCardClick}
                  />
                </Grid>

                {/* Col 4 – Consejo Nominal */}
                <Grid item md={6} sx={{ p: 1 }}>
                  <SectionHeader title="CONSEJO LEGISLATIVO NOMINAL" />
                  <VotoCard
                    subText="CANDIDATO"
                    cardTitle={null}
                    onClick={handleCardClick}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          {/* ───── ESTRUCTURA MÓVIL (igual que antes) ───── */}
          <Box sx={{ display: { md: 'none' } }}>
            {/* ... (tu estructura móvil original se deja tal cual) ... */}
          </Box>
        </Paper>

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
      </Box>

      {/* ───────── PIE DE PÁGINA ───────── */}
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
