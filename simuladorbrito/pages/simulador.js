import React, { useState, useEffect, useCallback } from 'react';
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
import { keyframes } from '@mui/system';

// Definir la animación de latido
const latido = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

export default function Simulador() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [orientationChanged, setOrientationChanged] = useState(false);
  const containerRef = React.useRef(null);
  
  const logoCNE = "/cne/logo_cne.png"; // Añadir referencia al logo del CNE
  
  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    const checkOrientation = () => {
      // En móviles, queremos la orientación horizontal
      if (window.innerWidth <= 768) {
        setOrientationChanged(true);
      } else {
        setOrientationChanged(false);
      }
    };
    
    checkMobile();
    checkOrientation();
    
    window.addEventListener('resize', checkMobile);
    window.addEventListener('resize', checkOrientation);
    
    // Bloquear la rotación automática en dispositivos móviles
    if (typeof window !== 'undefined') {
      if (window.screen && window.screen.orientation) {
        try {
          // Intentar bloquear en landscape
          window.screen.orientation.lock('landscape').catch(() => {
            console.log('Landscape lock not supported');
          });
        } catch (e) {
          console.log('Orientation API not supported');
        }
      }
    }
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('resize', checkOrientation);
    };
  }, []);
  
  // Datos del tarjetón actualizados según la entrada del usuario
  const tarjetonData = [
    // Fila 1 - Primera fila en blanco
    [
      null,
      null,
      null,
      null,
      null,
      null,
      null
    ],
    // Fila 2 - Segunda fila en blanco
    [
      null,
      null,
      null,
      null,
      null,
      null,
      null
    ],
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
      { id: 'soluciones', nombre: 'SOLUCIONES', logo: '/partidos/soluciones.png', apoyaBrito: false }
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

  const handleSelectPartido = useCallback((partido) => {
    if (partido) {
      console.log("Seleccionando partido:", partido.nombre);
      // Envolver en setTimeout para asegurar que el evento se procese correctamente
      setTimeout(() => {
        router.push(`/seleccion-cargos?partido=${encodeURIComponent(JSON.stringify(partido))}`);
      }, 50);
    }
  }, [router]);

  const goToInicio = useCallback(() => {
    console.log("Regresando al inicio");
    // Envolver en setTimeout para asegurar que el evento se procese correctamente
    setTimeout(() => {
      router.push('/');
    }, 50);
  }, [router]);

  const headerHeight = '56px'; // Estimación, ajustar según el contenido real de la cabecera
  const footerHeight = '48px'; // Estimación, ajustar según el contenido real del pie de página

  // No renderizar hasta que el componente esté montado en el cliente
  if (!mounted) {
    return null;
  }
  
  // En móvil, reorganizar datos del tarjetón para formato horizontal
  const mobileGridData = isMobile ? [
    tarjetonData[2].slice(0, 2),
    tarjetonData[2].slice(2, 5),
    tarjetonData[2].slice(5, 7),
    tarjetonData[3].slice(0, 2),
    tarjetonData[3].slice(2, 5),
    tarjetonData[3].slice(5, 7),
    tarjetonData[4].slice(0, 2),
    tarjetonData[4].slice(2, 5),
    tarjetonData[4].slice(5, 7),
    tarjetonData[5].slice(0, 2),
    tarjetonData[5].slice(2, 5),
    tarjetonData[5].slice(5, 7),
    tarjetonData[6]
  ] : [];

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      backgroundImage: isMobile ? 'none' : 'url(/fondovertical.jpg)',
      backgroundSize: 'contain',
      backgroundPosition: 'center',
      backgroundRepeat: 'repeat',
      backgroundColor: '#25346d', // Fondo azul oscuro para móviles
      backgroundBlendMode: 'lighten',
      overflowX: 'auto',
      position: 'relative',
    }}> 
      <Head>
        <title>Simulador Electoral 2025 - José Brito Gobernador</title>
        <meta name="description" content="Simulador de votación para las elecciones regionales 2025" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>

      {/* Cabecera Fija - Visible en escritorio, oculta en móvil */}
      {!isMobile && (
        <Box 
          sx={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            zIndex: 1200, 
            backgroundColor: '#25346d', 
            color: '#ffcc00', 
            py: 1, 
            px: 2, 
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
          <Typography variant="h5" component="h1" sx={{ 
            fontWeight: 'bold', 
            fontSize: { xs: '1rem', md: '1.5rem' },
            textTransform: 'uppercase',
          }}>
            CONOCE LAS TARJETAS PARA EL PROGRESO DE <span style={{ color: 'white' }}>ANZOÁTEGUI</span>
          </Typography>
        </Box>
      )}

      {/* Contenido Principal */}
      <Box 
        ref={containerRef}
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          flexGrow: 1, 
          pt: isMobile ? 0 : headerHeight, 
          pb: isMobile ? 0 : footerHeight, 
          width: '100%',
          height: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 0, sm: 2, md: 3 },
          overflow: 'hidden',
          position: 'relative',
        }}
      > 
        {/* Vista móvil */}
        {isMobile ? (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
              backgroundColor: '#25346d',
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
            
            
                <Typography
                variant="body2"
                sx={{
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  fontSize: 'inherit',
                  marginTop: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ELECCIONES REGIONALES Y NACIONALES 2025
                <Box 
                  component="img" 
                  src={logoCNE} 
                  alt="CNE Logo" 
                  sx={{ 
                    width: '15px',
                    height: '15px',
                    marginLeft: '5px',
                  }} 
                />
              </Typography>
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
                }}
              >
                JOSÉ BRITO BIENESTAR • PROGRESO • DESARROLLO
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
              
              {/* Contenido del tarjetón con formato horizontal como la competencia */}
              <Box
                sx={{
                  flex: 1,
                  backgroundColor: '#f5f5f5',
                  padding: '6px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                {/* Primera fila */}
                <Box sx={{ display: 'flex', height: '14.28%', mb: '4px' }}>
                  {tarjetonData[2].map((partido, index) => (
                    <Box
                      key={`row1-${index}`}
                      sx={{
                        flex: 1,
                        mx: '2px',
                        backgroundColor: (partido && partido.apoyaBrito) ? '#f8f9fa' : '#e5e7eb',
                        borderRadius: '5px',
                        border: partido ? '1px solid #ddd' : 'none',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        cursor: partido && partido.apoyaBrito ? 'pointer' : 'default',
                      }}
                      onClick={() => partido && partido.apoyaBrito && handleSelectPartido(partido)}
                    >
                      {partido && partido.apoyaBrito && (
                        <Box
                          component="img"
                          src={partido.logo}
                          alt={partido.nombre}
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            transform: 'rotate(90deg)',
                            padding: '2px',
                          }}
                        />
                      )}
                    </Box>
                  ))}
                </Box>

                {/* Segunda fila */}
                <Box sx={{ display: 'flex', height: '14.28%', mb: '4px' }}>
                  {tarjetonData[3].map((partido, index) => (
                    <Box
                      key={`row2-${index}`}
                      sx={{
                        flex: 1,
                        mx: '2px',
                        backgroundColor: (partido && partido.apoyaBrito) ? '#f8f9fa' : '#e5e7eb',
                        borderRadius: '5px',
                        border: partido ? '1px solid #ddd' : 'none',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        cursor: partido && partido.apoyaBrito ? 'pointer' : 'default',
                      }}
                      onClick={() => partido && partido.apoyaBrito && handleSelectPartido(partido)}
                    >
                      {partido && partido.apoyaBrito && (
                        <Box
                          component="img"
                          src={partido.logo}
                          alt={partido.nombre}
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            transform: 'rotate(90deg)',
                            padding: '2px',
                          }}
                        />
                      )}
                    </Box>
                  ))}
                </Box>

                {/* Tercera fila */}
                <Box sx={{ display: 'flex', height: '14.28%', mb: '4px' }}>
                  {tarjetonData[4].map((partido, index) => (
                    <Box
                      key={`row3-${index}`}
                      sx={{
                        flex: 1,
                        mx: '2px',
                        backgroundColor: (partido && partido.apoyaBrito) ? '#f8f9fa' : '#e5e7eb',
                        borderRadius: '5px',
                        border: partido ? '1px solid #ddd' : 'none',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        cursor: partido && partido.apoyaBrito ? 'pointer' : 'default',
                      }}
                      onClick={() => partido && partido.apoyaBrito && handleSelectPartido(partido)}
                    >
                      {partido && partido.apoyaBrito && (
                        <Box
                          component="img"
                          src={partido.logo}
                          alt={partido.nombre}
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            transform: 'rotate(90deg)',
                            padding: '2px',
                          }}
                        />
                      )}
                    </Box>
                  ))}
                </Box>

                {/* Cuarta fila */}
                <Box sx={{ display: 'flex', height: '14.28%', mb: '4px' }}>
                  {tarjetonData[5].map((partido, index) => (
                    <Box
                      key={`row4-${index}`}
                      sx={{
                        flex: 1,
                        mx: '2px',
                        backgroundColor: (partido && partido.apoyaBrito) ? '#f8f9fa' : '#e5e7eb',
                        borderRadius: '5px',
                        border: partido ? '1px solid #ddd' : 'none',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        cursor: partido && partido.apoyaBrito ? 'pointer' : 'default',
                      }}
                      onClick={() => partido && partido.apoyaBrito && handleSelectPartido(partido)}
                    >
                      {partido && partido.apoyaBrito && (
                        <Box
                          component="img"
                          src={partido.logo}
                          alt={partido.nombre}
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            transform: 'rotate(90deg)',
                            padding: '2px',
                          }}
                        />
                      )}
                    </Box>
                  ))}
                </Box>

                {/* Quinta fila */}
                <Box sx={{ display: 'flex', height: '14.28%', mb: '4px' }}>
                  {tarjetonData[6].map((partido, index) => (
                    <Box
                      key={`row5-${index}`}
                      sx={{
                        flex: 1,
                        mx: '2px',
                        backgroundColor: (partido && partido.apoyaBrito) ? '#f8f9fa' : '#e5e7eb',
                        borderRadius: '5px',
                        border: partido ? '1px solid #ddd' : 'none',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        cursor: partido && partido.apoyaBrito ? 'pointer' : 'default',
                      }}
                      onClick={() => partido && partido.apoyaBrito && handleSelectPartido(partido)}
                    >
                      {partido && partido.apoyaBrito && (
                        <Box
                          component="img"
                          src={partido.logo}
                          alt={partido.nombre}
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            transform: 'rotate(90deg)',
                            padding: '2px',
                          }}
                        />
                      )}
                    </Box>
                  ))}
                </Box>

                {/* Sexta fila */}
                <Box sx={{ display: 'flex', height: '14.28%', mb: '4px' }}>
                  {Array(7).fill(null).map((_, index) => (
                    <Box
                      key={`row6-${index}`}
                      sx={{
                        flex: 1,
                        mx: '2px',
                        backgroundColor: '#e5e7eb',
                        borderRadius: '5px',
                      }}
                    />
                  ))}
                </Box>

                {/* Séptima fila */}
                <Box sx={{ display: 'flex', height: '14.28%' }}>
                  {Array(7).fill(null).map((_, index) => (
                    <Box
                      key={`row7-${index}`}
                      sx={{
                        flex: 1,
                        mx: '2px',
                        backgroundColor: '#e5e7eb',
                        borderRadius: '5px',
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Paper>
            
            {/* Botón REGRESAR para vista móvil - Fuera del tarjetón */}
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
                onClick={goToInicio}
                disableElevation
                sx={{ 
                  backgroundColor: '#25346d', 
                  '&:hover': { backgroundColor: '#1c2851' },
                  fontSize: '0.8rem',
                  py: 0.8,
                  px: 5,
                  borderRadius: 1,
                  textTransform: 'uppercase',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                }}
              >
                REGRESAR
              </Button>
            </Box>
          </Box>
        ) : (
          // Vista desktop original
          <Paper 
            elevation={6} 
            sx={{ 
              p: { xs: 0.25, sm: 1 },
              backgroundColor: 'white', 
              borderRadius: '10px 10px 0 0',
              border: '1px solid #25346d',
              width: { xs: '98%', md: '95%' },
              maxWidth: { xs: '100%', sm: '900px', md: '1600px' },
              mx: 'auto',
              boxShadow: '0px 3px 10px rgba(0,0,0,0.15)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Cabecera horizontal del tarjetón */}
            <Box sx={{ 
              backgroundColor: '#002147', 
              color: 'white', 
              py: 0.25,
              px: 1, 
              textAlign: 'center', 
              mb: 0.5, 
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Typography variant="h6" component="h2" sx={{ 
                fontWeight: 'bold', 
                fontSize: { xs: '0.75rem', md: '1.1rem' },
                mr: 0.5,
              }}>
                ELECCIONES REGIONALES Y NACIONALES 2025
              </Typography>
              <Box 
                component="img" 
                src={logoCNE} 
                alt="CNE Logo" 
                sx={{ 
                  height: '15px',
                  ml: 0.5
                }} 
              />
            </Box>
            
            <Box
              display="grid"
              gridTemplateColumns="repeat(7, 1fr)"
              gridAutoRows="minmax(40px, auto)"
              gap={0.25}
              sx={{ 
                border: '1px solid #ced4da', 
                p: {xs: 0.25, sm: 0.5},
                backgroundColor: '#f0f0f0',
                flex: 1,
                mt: 0.25,
                overflow: 'auto',
                width: '100%',
              }}
            >
              {tarjetonData.flat().map((partido, index) => (
                <Box
                  key={index}
                  sx={{
                    aspectRatio: '2 / 1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: partido ? '1px solid #ced4da' : 'none',
                    backgroundColor: (partido && partido.apoyaBrito) ? '#f8f9fa' : '#e5e7eb',
                    overflow: 'hidden',
                    boxSizing: 'border-box',
                    p: 0.25,
                    borderRadius: 1,
                    minHeight: {xs: '40px', sm: '40px'},
                    height: '100%',
                    cursor: partido && partido.apoyaBrito ? 'pointer' : 'default',
                    transition: 'background-color 0.3s, transform 0.3s',
                    '&:hover': partido && partido.apoyaBrito ? {
                      backgroundColor: 'rgba(226,230,234,0.8)',
                      transform: 'scale(1.05)',
                      boxShadow: '0 0 15px rgba(0, 0, 0, 0.3)',
                    } : {},
                  }}
                >
                  {partido && partido.apoyaBrito ? (
                    <div style={{ 
                      width: '100%', 
                      height: '100%', 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundSize: '100% 100%',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      padding: 0,
                      boxSizing: 'border-box',
                    }}
                    onClick={() => handleSelectPartido(partido)}>
                      <div style={{ 
                        width: '95%',
                        height: '95%',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Box
                          component="img"
                          src={partido.logo}
                          alt={partido.nombre}
                          sx={{ 
                            maxWidth: '100%',
                            maxHeight: '100%',
                            width: 'auto',
                            height: 'auto',
                            objectFit: 'contain',
                            '@media (max-width: 600px)': {
                              objectFit: 'contain',
                              width: '100%',
                              height: '100%',
                            }
                          }}
                        />
                      </div>
                    </div>
                  ) : null}
                </Box>
              ))}
            </Box>
            
            {/* Botón de REGRESAR fuera del tarjetón */}
            <Box sx={{ 
              width: 'calc(100% - 100px)',
              mt: 2,
              mb: 1,
              textAlign: 'center',
            }}>
              <Button 
                variant="contained"
                onClick={goToInicio}
                disableElevation
                sx={{ 
                  backgroundColor: '#25346d', 
                  '&:hover': { backgroundColor: '#1c2851' },
                  fontSize: '0.8rem',
                  py: 0.8,
                  borderRadius: 0,
                  width: '100%',
                  textTransform: 'uppercase',
                  fontWeight: 'bold',
                }}
              >
                REGRESAR
              </Button>
            </Box>
          </Paper>
        )}
      </Box>
      
      {/* Pie de Página Fijo - Visible en escritorio, oculto en móvil */}
      {!isMobile && (
        <Box 
          sx={{ 
            position: 'fixed', 
            bottom: 0, 
            left: 0, 
            right: 0, 
            zIndex: 1200, 
            backgroundColor: '#25346d', 
            color: 'white', 
            py: 1, 
            height: footerHeight,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Typography 
            variant="body2" 
            align="center" 
            sx={{ 
              fontSize: {xs: '0.7rem', sm:'0.75rem', md: '0.875rem'},
              fontWeight: 'bold',
              textTransform: 'uppercase',
            }}
          >
            <Box component="span" sx={{ animation: `${latido} 1s infinite ease-in-out`, fontWeight: 'bold' }}>
              JOSÉ BRITO
            </Box>
            <span style={{ color: '#ffcc00' }}> BIENESTAR • PROGRESO • DESARROLLO</span>
          </Typography>
        </Box>
      )}
    </Box>
  );
} 