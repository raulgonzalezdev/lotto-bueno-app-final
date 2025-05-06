import React from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';

// Material UI Imports
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

export default function Simulador() {
  const router = useRouter();
  
  // Datos del tarjetón 7x7 exactamente como en la imagen
  const tarjetonData = [
    // Fila 1 - todos vacíos
    [null, null, null, null, null, null, null],
    // Fila 2 - todos vacíos
    [null, null, null, null, null, null, null],
    // Fila 3
    [
      { id: 'union_cambio', nombre: 'UNIÓN CAMBIO', logo: '/partidos/union_cambio.png', apoyaBrito: false },
      { id: 'mra', nombre: 'MRA', logo: '/partidos/mra.png', apoyaBrito: false },
      { id: 'conde', nombre: 'CONDE', logo: '/partidos/conde.png', apoyaBrito: false },
      null,
      { id: 'fuerza_vecinal', nombre: 'FUERZA VECINAL', logo: '/partidos/fuerza_vecinal.png', apoyaBrito: false },
      null,
      null
    ],
    // Fila 4
    [
      { id: 'un_nuevo_tiempo', nombre: 'UN NUEVO TIEMPO', logo: '/partidos/un_nuevo_tiempo.png', apoyaBrito: false },
      null,
      { id: 'ecologico', nombre: 'ECOLÓGICO', logo: '/partidos/ecologico.png', apoyaBrito: false },
      { id: 'avanzada', nombre: 'AVANZADA PROGRESISTA', logo: '/partidos/avanzada.png', apoyaBrito: true },
      { id: 'arepa', nombre: 'AREPA', logo: '/partidos/arepa.png', apoyaBrito: false },
      null,
      { id: 'min_unidad', nombre: 'MIN UNIDAD', logo: '/partidos/min_unidad.png', apoyaBrito: true },
    
    ],
    // Fila 5
    [
      { id: 'bandera_roja', nombre: 'BANDERA ROJA', logo: '/partidos/bandera_roja.png', apoyaBrito: true },
      { id: 'primero_justicia', nombre: 'PRIMERO JUSTICIA', logo: '/partidos/primero_justicia.png', apoyaBrito: true },
      null,
      null,
      { id: 'lapiz', nombre: 'LÁPIZ', logo: '/partidos/lapiz.png', apoyaBrito: false },
      { id: 'une', nombre: 'UNE', logo: '/partidos/une.png', apoyaBrito: true },
      { id: 'soluciones', nombre: 'SOLUCIONES', logo: '/partidos/soluciones.png', apoyaBrito: true }
    ],
    // Fila 6
    [
      null,
      null,
      { id: 'copei', nombre: 'COPEI', logo: '/partidos/copei.png', apoyaBrito: true },
      null,
      null,
      null,
      { id: 'mr', nombre: 'MOVIMIENTO REPUBLICANO', logo: '/partidos/mr.png', apoyaBrito: true }
    ],
    // Fila 7
    [
      { id: 'ad', nombre: 'ACCIÓN DEMOCRÁTICA', logo: '/partidos/ad.png', apoyaBrito: true },
      { id: 'voluntad_popular', nombre: 'VOLUNTAD POPULAR', logo: '/partidos/voluntad_popular.png', apoyaBrito: true },
      { id: 'venezuela_unidad', nombre: 'VENEZUELA UNIDAD', logo: '/partidos/venezuela_unidad.png', apoyaBrito: true },
      { id: 'primero_venezuela', nombre: 'PRIMERO VENEZUELA', logo: '/partidos/primero_venezuela.png', apoyaBrito: true },
      { id: 'cambiemos', nombre: 'CAMBIEMOS', logo: '/partidos/cambiemos.png', apoyaBrito: true },
      { id: 'udp', nombre: 'UNIDAD VISIÓN VENEZUELA', logo: '/partidos/udp.png', apoyaBrito: true },
      { id: 'el_cambio', nombre: 'EL CAMBIO', logo: '/partidos/el_cambio.png', apoyaBrito: true }
    ]
  ];

  const handleSelectPartido = (partido) => {
    if (partido) {
      // Navegar a la nueva página de selección de cargos, pasando el objeto partido como JSON string
      router.push(`/seleccion-cargos?partido=${encodeURIComponent(JSON.stringify(partido))}`);
    }
  };

  const goToInicio = () => {
    router.push('/');
  };

  const headerHeight = '56px'; // Estimación, ajustar según el contenido real de la cabecera
  const footerHeight = '48px'; // Estimación, ajustar según el contenido real del pie de página

  const sidePanelSx = {
    width: { xs: '0px', md: '25vw' }, // Aumentado un poco para que se vea más
    minHeight: `calc(100vh - ${headerHeight} - ${footerHeight})`,
    mt: headerHeight, // Margen superior para no solaparse con la cabecera fija
    mb: footerHeight, // Margen inferior para no solaparse con el pie de página fijo
    backgroundImage: 'url(/fondovertical.jpg)',
    backgroundSize: 'contain', // Cambiado de cover a contain
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    opacity: 0.7,
    display: { xs: 'none', md: 'block' },
    alignSelf: 'stretch' // Para que ocupe la altura disponible en el flex container
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}> {/* Contenedor principal de página ahora es columna */}
      <Head>
        <title>Simulador Electoral 2025 - José Brito Gobernador</title>
        <meta name="description" content="Simulador de votación para las elecciones regionales 2025" />
      </Head>

      {/* Cabecera Fija */}
      <Box 
        sx={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          zIndex: 1200, // Alto z-index para estar encima de todo
          backgroundColor: 'rgb(21, 40, 82)', 
          color: 'white', 
          py: 1, px: 2, 
          textAlign: 'center', 
          boxShadow: 3, 
          height: headerHeight 
        }}
      >
        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', fontSize: { xs: '1.2rem', md: '1.5rem' } }}>
          ELECCIONES REGIONALES Y NACIONALES 2025
        </Typography>
      </Box>

      {/* Contenedor para Paneles Laterales y Contenido Central */}
      <Box sx={{ display: 'flex', flexDirection: 'row', flexGrow: 1, pt: headerHeight, pb: footerHeight }}> 
        <Box sx={sidePanelSx} /> {/* Panel Izquierdo */}

        <Box 
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            // minHeight: `calc(100vh - ${headerHeight} - ${footerHeight})`, // Altura ajustada
            // overflowY: 'auto' // Si el contenido central es más largo que el espacio
          }}
        >
          {/* El contenido que solía estar aquí (cabecera azul, tarjetón, pie de página) ahora está distribuido */}
          {/* La cabecera ya no es necesaria aquí, ya que está fija arriba */}
          
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: { xs: 1, sm: 2, md: 3 }, width: '100%' }}>
            <Paper 
              elevation={6} 
              sx={{ 
                p: { xs: 1, sm: 2 }, 
                backgroundColor: 'white', 
                borderRadius: 2, 
                border: '3px solid rgb(21, 40, 82)',
                maxWidth: '900px', 
                width: '100%',
              }}
            >
              <Box sx={{ backgroundColor: 'rgb(21, 40, 82)', color: 'white', py: 1, px: 2, textAlign: 'center', mb: 2, borderRadius: 1 }}>
                <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', fontSize: { xs: '1rem', md: '1.25rem' } }}>
                  TARJETÓN ELECTORAL 2025
                </Typography>
                <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                  Seleccione un partido para votar por José Brito como Gobernador
                </Typography>
              </Box>
              
              <Box
                display="grid"
                gridTemplateColumns="repeat(7, 1fr)"
                gap={{ xs: 0.5, sm: 1 }}
                sx={{ border: '1px solid #ccc', p: {xs: 0.5, sm: 1}, backgroundColor: '#f0f0f0' }}
              >
                {tarjetonData.flat().map((partido, index) => (
                  <Box
                    key={index}
                    sx={{
                      aspectRatio: '1 / 0.7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid #d1d5db',
                      // El fondo es blanco si apoya Y HAY PARTIDO, si no, es gris claro.
                      // Si solo es `partido.apoyaBrito`, una celda null con apoyaBrito=true (imposible) sería blanca.
                      backgroundColor: (partido && partido.apoyaBrito) ? 'white' : '#e5e7eb',
                      overflow: 'hidden',
                    }}
                  >
                    {partido && partido.apoyaBrito ? (
                      // Solo renderiza la Card si el partido existe y apoyaBrito es true
                      <Card 
                        variant="outlined" 
                        sx={{ 
                          width: '100%', 
                          height: '100%', 
                          borderColor: 'rgb(21, 40, 82)',
                          borderWidth: 2,
                          borderRadius: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                           '&:hover': {
                            borderColor: 'blue.700',
                            boxShadow: 3,
                          }
                        }}
                      >
                        <CardActionArea 
                          onClick={() => handleSelectPartido(partido)}
                          sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 0.25 }}
                        >
                          <Image
                            src={partido.logo}
                            alt={partido.nombre}
                            layout="intrinsic"
                            width={100}
                            height={60}
                            objectFit="contain"
                          />
                        </CardActionArea>
                      </Card>
                    ) : (
                      // Si no hay partido o el partido no apoya a Brito, se renderiza una celda vacía (el Box base con su estilo).
                      // No se muestra ningún logo aquí.
                      null 
                    )}
                  </Box>
                ))}
              </Box>
              
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Button 
                  variant="contained"
                  onClick={goToInicio}
                  sx={{ 
                    backgroundColor: 'rgb(21, 40, 82)', 
                    '&:hover': { backgroundColor: 'rgb(15, 30, 62)' },
                    fontSize: {xs: '0.8rem', sm:'0.9rem', md: '1rem'},
                    px: {xs: 2, sm:3, md: 4},
                    py: {xs: 0.8, sm:1, md: 1.2}
                  }}
                >
                  REGRESAR
                </Button>
              </Box>
            </Paper>
          </Box>
        </Box>

        <Box sx={sidePanelSx} /> {/* Panel Derecho */}
      </Box>
      
      {/* Pie de Página Fijo */}
      <Box 
        sx={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          zIndex: 1200, 
          backgroundColor: 'rgb(21, 40, 82)', 
          color: 'white', 
          py: 1.5, 
          height: footerHeight
        }}
      >
        <Typography variant="body2" align="center" sx={{ fontSize: {xs: '0.7rem', sm:'0.75rem', md: '0.875rem'} }}>
          &copy; 2024 Simulador Electoral - José Brito Gobernador
        </Typography>
      </Box>
    </Box>
  );
} 