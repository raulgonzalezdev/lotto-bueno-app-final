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
  const logoCNE = "/cne/logo_cne.png"; // Añadir referencia al logo del CNE
  
  // Datos del tarjetón actualizados según la entrada del usuario
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

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      backgroundImage: 'url(/fondovertical.jpg)', // Imagen de fondo global
      backgroundSize:  'contain',
      backgroundPosition: 'center',
      backgroundRepeat: 'repeat',
      backgroundColor: 'rgba(255,255,255,0.87)', // Ligera transparencia sobre la imagen
      backgroundBlendMode: 'lighten', // Modo de mezcla para la transparencia
    }}> 
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
          zIndex: 1200, 
          backgroundColor: 'rgb(21, 40, 82)', 
          color: 'white', 
          py: 1, px: 2, 
          textAlign: 'center', 
          boxShadow: 3, 
          height: headerHeight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Image src={logoCNE} alt="CNE Logo" width={24} height={24} style={{ marginRight: '8px' }} />
        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', fontSize: { xs: '1.2rem', md: '1.5rem' } }}>
          ELECCIONES REGIONALES Y NACIONALES 2025
        </Typography>
      </Box>

      {/* Contenido Principal (entre cabecera y pie de página) */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', // Apila el Paper del tarjetón y otros elementos si los hubiera
        flexGrow: 1, 
        pt: headerHeight, 
        pb: footerHeight, 
        width: '100%',
        alignItems: { xs: 'center', md: 'center' }, // Centra en móvil Y en desktop
        justifyContent: 'center', // Centra verticalmente el contenido si hay espacio
        p: { xs: 1, sm: 2, md: 3 }, // Padding general
        overflowY: 'auto' // Scroll si el contenido es muy alto
      }}> 
        
        {/* Tarjetón */}
        <Paper 
          elevation={6} 
          sx={{ 
            p: { xs: 1, sm: 2 }, 
            backgroundColor: 'white', 
            borderRadius: 2, 
            border: '3px solid rgb(21, 40, 82)',
            maxWidth: { xs: '900px', md: '1600px' }, // Aumentado para desktop y centrado por el padre
            width: '100%', // Ocupa el ancho disponible hasta maxWidth
            height: { xs: 'auto', md: 'auto' }, // Permitir que crezca en altura en móviles
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
            gap={{ xs: 0.8, sm: 1 }}
            sx={{ 
              border: '1px solid #ccc', 
              p: {xs: 0.8, sm: 1}, 
              backgroundColor: '#f0f0f0',
              minHeight: { xs: '400px', sm: 'auto' } // Aumentar altura mínima en móviles
            }}
          >
            {tarjetonData.flat().map((partido, index) => (
              <Box
                key={index}
                sx={{
                  aspectRatio: { xs: '1 / 1', sm: '1 / 0.7', md: '1.8 / 0.7' }, // Hacer cuadradas las tarjetas en móvil
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #d1d5db',
                  backgroundColor: (partido && partido.apoyaBrito) ? 'white' : '#e5e7eb',
                  overflow: 'hidden',
                  boxSizing: 'border-box',
                  p: { xs: 0.3, sm: 0.4, md: 0.5 } // Reducir padding para dar más espacio a la imagen
                }}
              >
                {partido && partido.apoyaBrito ? (
                  <div style={{ 
                    width: '100%', 
                    height: '100%', 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid rgb(21, 40, 82)',
                    padding: 0,
                    boxSizing: 'border-box',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleSelectPartido(partido)}>
                    <div style={{ 
                      width: '95%', // Aumentado de 90% a 95%
                      height: '95%', // Aumentado de 90% a 95%
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <img
                        src={partido.logo}
                        alt={partido.nombre}
                        style={{ 
                          maxWidth: '100%',
                          maxHeight: '100%',
                          width: 'auto',
                          height: 'auto',
                          objectFit: 'contain'
                        }}
                      />
                    </div>
                  </div>
                ) : (
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
          &copy; 2025 Simulador Electoral - José Brito Gobernador
        </Typography>
      </Box>
    </Box>
  );
} 