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
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

export default function SeleccionCargos() {
  const router = useRouter();
  const [partidoSeleccionado, setPartidoSeleccionado] = useState(null);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);

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
    setShowConfirmationDialog(true);
  };

  const handleCloseDialogAndRedirect = () => {
    setShowConfirmationDialog(false);
    setTimeout(() => {
      router.push('/');
    }, 1500);
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
  const headerHeight = '70px'; // Estimación combinada de las dos barras de cabecera
  const footerHeight = '40px'; // Estimación para el pie de página

  // Tamaños base (móvil)
  const baseTitlePaddingTop = '4px';
  const baseLogoHeight = { xs: '52px', sm: '60px' }; // sm podría ser igual a xs si se prefiere
  const baseFontSize = '0.65rem';
  const baseCardPadding = 0.25;
  const baseLogoMarginY = 0.5;
  const baseLogoMarginX = 0.5;
  const baseImageWidth = 90;
  const baseImageHeight = 45;

  // Tamaños para desktop (md y superior)
  const mdTitlePaddingTop = '8px';
  const mdLogoHeight = '80px';
  const mdFontSize = '0.8rem';
  const mdCardPadding = 0.5;
  const mdLogoMarginY = 1;
  const mdLogoMarginX = 1;
  const mdImageWidth = 120;
  const mdImageHeight = 60;

  const SectionHeader = ({ title, sx }) => (
    <Box sx={{
      backgroundColor: 'black',
      color: 'white',
      textAlign: 'center',
      py: {xs: 0.5, md: 0.75},
      fontSize: { xs: '0.6rem', sm: '0.7rem', md: '0.9rem' }, // Aumentado para md
      fontWeight: 'bold',
      borderRadius: 0,
      ...sx
    }}>
      {title}
    </Box>
  );

  const VotoCard = ({ cardTitle, subText, titlePaddingTop = {xs: baseTitlePaddingTop, md: mdTitlePaddingTop}, logoHeight = {xs: baseLogoHeight.xs, sm: baseLogoHeight.sm, md: mdLogoHeight} }) => (
    <Card variant="outlined" sx={{ borderColor: brandBlueColor, borderWidth: 2, borderRadius: 0, height: '100%', p: {xs: baseCardPadding, md: mdCardPadding}, display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ p: '2px !important', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flexGrow: 1 }}>
        <Typography sx={{ fontSize: {xs: baseFontSize, md: mdFontSize}, fontWeight: 600, minHeight: {xs:'1.4em', md:'1.6em'}, pt: titlePaddingTop }}>
          {cardTitle || '\u00A0'}
        </Typography>
        <Box sx={{
          backgroundColor: logoBgColor,
          height: logoHeight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          my: {xs: baseLogoMarginY, md: mdLogoMarginY},
          borderRadius: '4px',
          mx: {xs: baseLogoMarginX, md: mdLogoMarginX},
        }}>
          <Image src={logoPartido} alt={nombrePartido} 
            width={typeof logoHeight === 'object' ? (logoHeight.md === mdLogoHeight ? mdImageWidth : baseImageWidth) : baseImageWidth} 
            height={typeof logoHeight === 'object' ? (logoHeight.md === mdLogoHeight ? mdImageHeight : baseImageHeight) : baseImageHeight} 
            style={{ objectFit: 'contain' }} />
        </Box>
        <Typography sx={{ fontSize: {xs: baseFontSize, md: mdFontSize}, fontWeight: 'bold', lineHeight: 1.2, pb: '2px' }}>
          {subText}
        </Typography>
      </CardContent>
    </Card>
  );

  // Tamaños Gobernador Base (móvil)
  const baseGobernadorPadding = 0.5;
  const baseGobernadorContentPadding = '2px !important';
  const baseGobernadorGridMinHeight = {xs: '70px', sm: '85px'};
  const baseGobernadorImgContainerHeight = { xs: '65px', sm: '80px' };
  const baseGobernadorImgContainerWidth = { xs: '50px', sm: '60px' };
  const baseGobernadorImgWidth = 50;
  const baseGobernadorImgHeight = 70;
  const baseGobernadorLogoHeight = { xs: '60px', sm: '75px' };
  const baseGobernadorLogoImgWidth = 110;
  const baseGobernadorLogoImgHeight = 55;
  const baseGobernadorTextFontSize = '0.65rem';
  const baseGobernadorTextMarginTop = 0.5;

  // Tamaños Gobernador Desktop (md y superior)
  const mdGobernadorPadding = 1;
  const mdGobernadorContentPadding = '4px !important';
  const mdGobernadorGridMinHeight = '110px';
  const mdGobernadorImgContainerHeight = '100px'; 
  const mdGobernadorImgContainerWidth = '75px';
  const mdGobernadorImgWidth = 70;
  const mdGobernadorImgHeight = 90;
  const mdGobernadorLogoHeight = '95px';
  const mdGobernadorLogoImgWidth = 150;
  const mdGobernadorLogoImgHeight = 75;
  const mdGobernadorTextFontSize = '0.85rem';
  const mdGobernadorTextMarginTop = 1;

  const GobernadorCardContent = () => (
    <Card variant="outlined" sx={{ borderColor: brandBlueColor, borderWidth: 2, borderRadius: 0, p: {xs:baseGobernadorPadding, md: mdGobernadorPadding}, width: '100%', mx: 'auto' }}>
      <CardContent sx={{ p: {xs: baseGobernadorContentPadding, md: mdGobernadorContentPadding} }}>
        <Grid container alignItems="center" spacing={{xs:0.5, md:1}} sx={{minHeight: {xs: baseGobernadorGridMinHeight.xs, sm: baseGobernadorGridMinHeight.sm, md:mdGobernadorGridMinHeight}}}>
          {imagenCandidatoGobernador && (
            <Grid item xs={4} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Box sx={{ border: '1px solid grey', display: 'flex', justifyContent: 'center', alignItems: 'center', p: 0.25, 
                         height: { xs: baseGobernadorImgContainerHeight.xs, sm: baseGobernadorImgContainerHeight.sm, md: mdGobernadorImgContainerHeight }, 
                         width: { xs: baseGobernadorImgContainerWidth.xs, sm: baseGobernadorImgContainerWidth.sm, md: mdGobernadorImgContainerWidth } 
                       }}>
                <Image 
                  src={imagenCandidatoGobernador} 
                  alt={nombreCandidatoGobernador || "Candidato"} 
                  layout="intrinsic" 
                  width={baseGobernadorImgWidth} // Para xs/sm
                  height={baseGobernadorImgHeight} // Para xs/sm
                  style={{ 
                    objectFit: 'contain', 
                    // Se podría intentar un hack con media queries en style si fuera estrictamente necesario
                    // pero MUI sx prop es preferible para responsividad.
                    // Para Image de Next, el width/height son más como proporciones si layout es intrinsic/responsive.
                  }}
                  // Para md, idealmente se usaría un componente diferente o se ajustaría vía CSS más complejo
                  // Aquí, se usará el tamaño base, y el Box lo contendrá. 
                  // Podríamos escalar el Box, pero Image de Next con intrinsic/responsive se adapta al width/height dados.
                />
              </Box>
            </Grid>
          )}
          <Grid item xs={imagenCandidatoGobernador ? 8 : 12}>
            <Box sx={{
              backgroundColor: logoBgColor,
              height: { xs: baseGobernadorLogoHeight.xs, sm: baseGobernadorLogoHeight.sm, md: mdGobernadorLogoHeight },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
            }}>
              {/* Similar al anterior, usar base para xs/sm, md para md */}
              <Image 
                src={logoPartido} 
                alt={nombrePartido} 
                width={baseGobernadorLogoImgWidth} 
                height={baseGobernadorLogoImgHeight} 
                style={{ objectFit: 'contain' }} 
              />
            </Box>
          </Grid>
        </Grid>
        <Box sx={{ textAlign: 'center', mt: {xs: baseGobernadorTextMarginTop, md:mdGobernadorTextMarginTop} }}>
          {nombreCandidatoGobernador && (
            <Typography sx={{ fontSize: {xs: baseGobernadorTextFontSize, md:mdGobernadorTextFontSize}, fontWeight: 'bold', lineHeight: 1.2 }}>
              {nombreCandidatoGobernador}
            </Typography>
          )}
          <Typography sx={{ fontSize: {xs: baseGobernadorTextFontSize, md:mdGobernadorTextFontSize}, fontWeight: 'bold', lineHeight: 1.2 }}>
            {nombrePartido}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundImage: 'url(/fondovertical.jpg)', // Imagen de fondo global
      backgroundSize: 'contain',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundColor: 'rgba(255,255,255,0.87)', 
      backgroundBlendMode: 'lighten', 
    }}>
      <Head>
        <title>Selección de Voto - {nombrePartido}</title>
        <meta name="description" content={`Simulador de voto para ${nombrePartido}`} />
      </Head>

      {/* Cabecera Fija (2 barras) */}
      <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1200, boxShadow: 3 }}>
        <Box sx={{ backgroundColor: brandBlueColor, color: 'white', py: 0.5, px: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Image src={logoCNE} alt="CNE Logo" width={20} height={20} style={{ marginRight: '8px' }} />
          <Typography sx={{ fontSize: { xs: '0.6rem', sm: '0.7rem', md: '0.8rem' }, fontWeight: 'medium' }}>
            ELECCIONES REGIONALES Y NACIONALES 2025
          </Typography>
        </Box>
        <Box sx={{ backgroundColor: brandBlueColor, color: 'white', py: 0.5, textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
          <Typography sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1.1rem' }, fontWeight: 'bold' }}>
            REVISE SUS OPCIONES Y PRESIONE EL BOTÓN "VOTAR"
          </Typography>
        </Box>
      </Box>

      <Box component="main" sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          p: { xs: 0.5, sm: 1, md: 2 }, // Aumentado padding en md
          width: '100%', 
          pt: `calc(${headerHeight} + 8px)`, // Padding top para dejar espacio a la cabecera fija (8px de margen extra)
          pb: `calc(${footerHeight} + 8px)`, // Padding bottom para dejar espacio al pie de página fijo
          overflowY: 'auto' // Scroll si el contenido es largo
      }}>
        <Paper elevation={0} sx={{
          p: { xs: 0.5, sm: 1, md: 2 }, // Aumentado padding en md
          backgroundColor: 'white',
          width: '100%',
          maxWidth: {xs: '900px', md: '1100px'}, // MaxWidth aumentado para desktop
          borderRadius: 2,
          border: `3px solid ${brandBlueColor}`,
        }}>
          <Grid container spacing={{ xs: 1, sm: 1.5, md: 2.5 }}> {/* Spacing aumentado para md */}

            {/* Columna 1: DIPUTADO ASAMBLEA NACIONAL */}
            <Grid item xs={12} sm={12} md={3}> {/* sm={12} para apilar en tablet */}
              <SectionHeader title="DIPUTADO ASAMBLEA NACIONAL" />
              <Grid container spacing={{ xs: 0.5, sm: 1, md: 1.5 }} sx={{ mt: { xs: 0.25, sm: 0.5, md: 0.75 } }}>
                <Grid item xs={12}>
                  <VotoCard cardTitle="DIPUTADO A LISTA" subText="LISTA" titlePaddingTop={{xs:baseTitlePaddingTop, md:mdTitlePaddingTop}} logoHeight={{xs:baseLogoHeight.xs, sm:baseLogoHeight.sm, md:mdLogoHeight}}/>
                </Grid>
                <Grid item xs={12} sx={{mt: {xs: 0.5, sm: 1, md:1.5}}}>
                  <VotoCard cardTitle="DIPUTADO NOMINAL" subText="CANDIDATO" titlePaddingTop={{xs:baseTitlePaddingTop, md:mdTitlePaddingTop}} logoHeight={{xs:baseLogoHeight.xs, sm:baseLogoHeight.sm, md:mdLogoHeight}}/>
                </Grid>
              </Grid>
            </Grid>

            {/* Columna 2: GOBERNADOR y CONSEJO LEGISLATIVO LISTA */}
            <Grid item xs={12} sm={12} md={6}> {/* sm={12} para apilar en tablet */}
              <SectionHeader title="GOBERNADOR" />
              <Box sx={{ mt: { xs: 0.25, sm: 0.5, md:0.75 }, mb: { xs: 1, sm: 1.5, md:2 } }}>
                <GobernadorCardContent />
              </Box>
              <SectionHeader title="CONSEJO LEGISLATIVO LISTA" />
              <Box sx={{ mt: { xs: 0.25, sm: 0.5, md:0.75 } }}>
                <VotoCard subText="LISTA" titlePaddingTop={{xs:'1.9em', md:'2.2em'}} logoHeight={{xs:baseLogoHeight.xs, sm:baseLogoHeight.sm, md:mdLogoHeight}}/>
              </Box>
            </Grid>

            {/* Columna 3: CONSEJO LEGISLATIVO NOMINAL (3 tarjetas) */}
            <Grid item xs={12} sm={12} md={3}> {/* sm={12} para apilar en tablet */}
              <SectionHeader title="CONSEJO LEGISLATIVO NOMINAL" sx={{mb: {xs: 0.25, sm: 0.5, md:0.75}}}/>
              <Grid container direction="column" spacing={{ xs: 0.5, sm: 1, md:1.5 }}>
                <Grid item xs={12}>
                   <VotoCard subText="CANDIDATO" titlePaddingTop={{xs:'1.9em', md:'2.2em'}} logoHeight={{xs:baseLogoHeight.xs, sm:baseLogoHeight.sm, md:mdLogoHeight}}/>
                </Grid>
                <Grid item xs={12}>
                   <VotoCard subText="CANDIDATO" titlePaddingTop={{xs:'1.9em', md:'2.2em'}} logoHeight={{xs:baseLogoHeight.xs, sm:baseLogoHeight.sm, md:mdLogoHeight}}/>
                </Grid>
                <Grid item xs={12}>
                   <VotoCard subText="CANDIDATO" titlePaddingTop={{xs:'1.9em', md:'2.2em'}} logoHeight={{xs:baseLogoHeight.xs, sm:baseLogoHeight.sm, md:mdLogoHeight}}/>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Paper>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: { xs: 1.5, sm: 2, md: 3 }, mb: { xs: 0.5, sm: 1, md: 1.5 } }}>
            <Button
            variant="contained"
            onClick={handleVotar}
            sx={{
                backgroundColor: brandBlueColor,
                color: 'white',
                fontWeight: 'bold',
                fontSize: { xs: '0.75rem', sm: '0.85rem', md: '1rem' },
                px: { xs: 5, sm: 7, md: 8 },
                py: { xs: 0.75, sm: 1, md: 1.25 },
                borderRadius: '2px',
                '&:hover': { backgroundColor: brandBlueHoverColor }
            }}
            >
            VOTAR
            </Button>
        </Box>

      </Box>

      {/* Pie de Página Fijo */}
      <Box sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        zIndex: 1200,
        backgroundColor: brandBlueColor, 
        color: 'white', 
        py: 0.5, 
        textAlign: 'center', 
        fontSize: { xs: '0.5rem', sm: '0.6rem', md: '0.7rem' }, 
        borderTop: '1px solid #444',
        height: footerHeight
      }}>
        <Typography variant="caption">
          &copy; 2025 Simulador Electoral - Selección de Voto
        </Typography>
      </Box>

      {/* Diálogo de Confirmación de Voto */}
      <Dialog
        open={showConfirmationDialog}
        onClose={() => setShowConfirmationDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Confirmación de Voto"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {`Su voto por ${partidoSeleccionado?.nombre || 'el partido seleccionado'} ha sido registrado exitosamente (simulación).`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogAndRedirect} sx={{color: brandBlueColor}} autoFocus>
            Aceptar
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
} 