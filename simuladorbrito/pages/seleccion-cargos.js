import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';

// Material UI Imports
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';

export default function SeleccionCargos() {
  const router = useRouter();
  const [partidoSeleccionado, setPartidoSeleccionado] = useState(null);

  useEffect(() => {
    if (router.query.partido) {
      try {
        const partidoData = JSON.parse(decodeURIComponent(router.query.partido));
        setPartidoSeleccionado(partidoData);
      } catch (error) {
        console.error("Error parsing partido data:", error);
        router.push('/simulador');
      }
    }
  }, [router.query.partido, router]);

  const handleVotar = () => {
    console.log("Voto emitido por:", partidoSeleccionado?.nombre);
    alert(`Voto por ${partidoSeleccionado?.nombre} registrado (simulación). Redirigiendo al inicio...`);
    setTimeout(() => {
      router.push('/');
    }, 2000);
  };

  if (!partidoSeleccionado) {
    return (
      <Box className="min-h-screen flex items-center justify-center" sx={{ backgroundColor: 'grey.200' }}>
        <Typography variant="h6">Cargando datos del partido...</Typography>
      </Box>
    );
  }

  const nombreCandidatoGobernador = partidoSeleccionado.apoyaBrito ? "JOSE BRITO" : "";
  const imagenCandidatoGobernador = partidoSeleccionado.apoyaBrito ? "/candidatos/brito.png" : null;
  const logoPartido = partidoSeleccionado.logo;
  const nombrePartido = partidoSeleccionado.nombre.toUpperCase();
  const logoBgColor = '#9EFD38'; // Verde brillante de la imagen
  const logoCNE = "/cne/logo_cne.png"; // Logo CNE
  const brandBlueColor = 'rgb(21, 40, 82)';
  const brandBlueHoverColor = 'rgb(15, 30, 62)';

  const SectionHeader = ({ title, sx }) => (
    <Box sx={{
      backgroundColor: 'black',
      color: 'white',
      textAlign: 'center',
      py: 0.5,
      fontSize: { xs: '0.6rem', sm: '0.7rem' },
      fontWeight: 'bold',
      borderRadius: 0,
      ...sx
    }}>
      {title}
    </Box>
  );

  const VotoCard = ({ cardTitle, subText, titlePaddingTop = '4px', cardHeight = { xs: '100px', sm: '115px' }, logoHeight = { xs: '52px', sm: '60px' } }) => (
    <Card variant="outlined" sx={{ borderColor: brandBlueColor, borderWidth: 2, borderRadius: 0, height: '100%', p: 0.25, display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ p: '2px !important', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flexGrow: 1 }}>
        <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, minHeight: '1.4em', pt: titlePaddingTop }}>
          {cardTitle || '\u00A0'}
        </Typography>
        <Box sx={{
          backgroundColor: logoBgColor,
          height: logoHeight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          my: 0.5,
          borderRadius: '4px',
          mx: 0.5,
        }}>
          <Image src={logoPartido} alt={nombrePartido} width={90} height={45} style={{ objectFit: 'contain' }} />
        </Box>
        <Typography sx={{ fontSize: '0.65rem', fontWeight: 'bold', lineHeight: 1.2, pb: '2px' }}>
          {subText}
        </Typography>
      </CardContent>
    </Card>
  );

  const GobernadorCardContent = () => (
    <Card variant="outlined" sx={{ borderColor: brandBlueColor, borderWidth: 2, borderRadius: 0, p: 0.5, width: '100%', mx: 'auto' }}>
      <CardContent sx={{ p: '2px !important' }}>
        <Grid container alignItems="center" spacing={0.5} sx={{minHeight: {xs: '70px', sm: '85px'}}}>
          {imagenCandidatoGobernador && (
            <Grid item xs={4} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Box sx={{ border: '1px solid grey', display: 'flex', justifyContent: 'center', alignItems: 'center', p: 0.25, height: { xs: '65px', sm: '80px' }, width: { xs: '50px', sm: '60px' } }}>
                <Image src={imagenCandidatoGobernador} alt={nombreCandidatoGobernador || "Candidato"} layout="intrinsic" width={50} height={70} style={{ objectFit: 'contain' }} />
              </Box>
            </Grid>
          )}
          <Grid item xs={imagenCandidatoGobernador ? 8 : 12}>
            <Box sx={{
              backgroundColor: logoBgColor,
              height: { xs: '60px', sm: '75px' },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
            }}>
              <Image src={logoPartido} alt={nombrePartido} width={110} height={55} style={{ objectFit: 'contain' }} />
            </Box>
          </Grid>
        </Grid>
        <Box sx={{ textAlign: 'center', mt: 0.5 }}>
          {nombreCandidatoGobernador && (
            <Typography sx={{ fontSize: '0.65rem', fontWeight: 'bold', lineHeight: 1.2 }}>
              {nombreCandidatoGobernador}
            </Typography>
          )}
          <Typography sx={{ fontSize: '0.65rem', fontWeight: 'bold', lineHeight: 1.2 }}>
            {nombrePartido}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box className="min-h-screen flex flex-col" sx={{ backgroundColor: 'grey.200' }}>
      <Head>
        <title>Selección de Voto - {nombrePartido}</title>
        <meta name="description" content={`Simulador de voto para ${nombrePartido}`} />
      </Head>

      <Box sx={{ backgroundColor: brandBlueColor, color: 'white', py: 0.5, px: 1, textAlign: 'center', width: '100%', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Image src={logoCNE} alt="CNE Logo" width={20} height={20} style={{ marginRight: '8px' }} />
        <Typography sx={{ fontSize: { xs: '0.6rem', sm: '0.7rem' }, fontWeight: 'medium' }}>
          ELECCIONES REGIONALES Y NACIONALES 2025
        </Typography>
        {/* No se incluye la bandera aquí para simplicidad, ya que el logo CNE es más prominente en la referencia */}
      </Box>
      <Box sx={{ backgroundColor: brandBlueColor, color: 'white', py: 0.5, textAlign: 'center', width: '100%', zIndex: 10, borderTop: '1px solid grey' }}>
         <Typography sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' }, fontWeight: 'bold' }}>
          REVISE SUS OPCIONES Y PRESIONE EL BOTÓN "VOTAR"
        </Typography>
      </Box>

      <Box component="main" sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column', // Para apilar Paper y luego el botón Votar
          alignItems: 'center', // Centrar Paper y botón Votar horizontalmente
          p: { xs: 0.5, sm: 1 }, 
          width: '100%' 
      }}>
        <Paper elevation={0} sx={{
          p: { xs: 0.5, sm: 1 },
          backgroundColor: 'white',
          width: '100%',
          maxWidth: '900px',
          borderRadius: 0,
          border: '1px solid #ccc'
        }}>
          <Grid container spacing={{ xs: 1, sm: 1.5 }}>

            {/* Columna 1: DIPUTADO ASAMBLEA NACIONAL */}
            <Grid item xs={12} sm={3.5} md={3}>
              <SectionHeader title="DIPUTADO ASAMBLEA NACIONAL" />
              <Grid container spacing={{ xs: 0.5, sm: 1 }} sx={{ mt: { xs: 0.25, sm: 0.5 } }}>
                <Grid item xs={12}>
                  <VotoCard cardTitle="DIPUTADO A LISTA" subText="LISTA" />
                </Grid>
                <Grid item xs={12} sx={{mt: {xs: 0.5, sm: 1}}}>
                  <VotoCard cardTitle="DIPUTADO NOMINAL" subText="CANDIDATO" />
                </Grid>
              </Grid>
            </Grid>

            {/* Columna 2: GOBERNADOR y CONSEJO LEGISLATIVO LISTA */}
            <Grid item xs={12} sm={5} md={6}>
              <SectionHeader title="GOBERNADOR" />
              <Box sx={{ mt: { xs: 0.25, sm: 0.5 }, mb: { xs: 1, sm: 1.5 } }}>
                <GobernadorCardContent />
              </Box>
              <SectionHeader title="CONSEJO LEGISLATIVO LISTA" />
              <Box sx={{ mt: { xs: 0.25, sm: 0.5 } }}>
                <VotoCard subText="LISTA" titlePaddingTop="1.9em"/>
              </Box>
            </Grid>

            {/* Columna 3: CONSEJO LEGISLATIVO NOMINAL (3 tarjetas) */}
            <Grid item xs={12} sm={3.5} md={3}>
              <SectionHeader title="CONSEJO LEGISLATIVO NOMINAL" sx={{mb: {xs: 0.25, sm: 0.5}}}/>
              <Grid container direction="column" spacing={{ xs: 0.5, sm: 1 }}>
                <Grid item xs={12}>
                   <VotoCard subText="CANDIDATO" titlePaddingTop="1.9em" />
                </Grid>
                <Grid item xs={12}>
                   <VotoCard subText="CANDIDATO" titlePaddingTop="1.9em" />
                </Grid>
                <Grid item xs={12}>
                   <VotoCard subText="CANDIDATO" titlePaddingTop="1.9em" />
                </Grid>
              </Grid>
            </Grid>

          </Grid>
        </Paper>
        
        {/* BOTÓN VOTAR - Ahora fuera y debajo del Paper */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: { xs: 1.5, sm: 2 }, mb: { xs: 0.5, sm: 1 } }}>
            <Button
            variant="contained"
            onClick={handleVotar}
            sx={{
                backgroundColor: brandBlueColor,
                color: 'white',
                fontWeight: 'bold',
                fontSize: { xs: '0.75rem', sm: '0.85rem' },
                px: { xs: 5, sm: 7 },
                py: { xs: 0.75, sm: 1 },
                borderRadius: '2px',
                '&:hover': { backgroundColor: brandBlueHoverColor }
            }}
            >
            VOTAR
            </Button>
        </Box>

      </Box>

      <Box sx={{ backgroundColor: brandBlueColor, color: 'white', py: 0.5, textAlign: 'center', width: '100%', fontSize: { xs: '0.5rem', sm: '0.6rem' }, borderTop: '1px solid #444' }}>
        <Typography variant="caption">
          &copy; 2024 Simulador Electoral - Selección de Voto
        </Typography>
      </Box>
    </Box>
  );
} 