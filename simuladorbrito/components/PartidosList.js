import React from 'react';
import { Grid, Box } from '@mui/material';
import PartidoCard from './PartidoCard';

/**
 * Componente para mostrar una lista de partidos políticos en un grid
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.partidos - Lista de partidos a mostrar
 * @param {Function} props.onSelectPartido - Función a ejecutar al seleccionar un partido
 * @param {Boolean} props.isMobile - Indica si se está en vista móvil
 * @param {Boolean} props.horizontal - Indica si se debe usar vista horizontal en móvil
 */
const PartidosList = ({ partidos, onSelectPartido, isMobile = false, horizontal = false }) => {
  if (!partidos || partidos.length === 0) {
    return <p className="text-center py-4">No hay partidos disponibles</p>;
  }

  return (
    <Box sx={{ 
      width: '100%', 
      mt: isMobile ? 0.5 : 2,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <Grid 
        container 
        spacing={isMobile ? 0.5 : 2}
        justifyContent="center"
        sx={{
          maxWidth: isMobile ? '100%' : '90%',
          backgroundColor: isMobile ? '#f5f5f5' : 'transparent'
        }}
      >
        {partidos.map((partido) => (
          <Grid 
            item 
            xs={isMobile ? 1.7 : (horizontal ? 4 : 6)} 
            sm={horizontal ? 3 : 4} 
            md={3} 
            key={partido.id} 
            sx={{ 
              aspectRatio: isMobile ? '3/1' : (horizontal ? '1/1' : '2/1'),
              mb: isMobile ? 0.5 : 1,
              height: 'auto',
              p: isMobile ? 0.25 : 0.5,
            }}
          >
            <PartidoCard 
              partido={partido} 
              onClick={onSelectPartido}
              isMobile={isMobile}
              horizontal={horizontal}
              showBorder={true}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PartidosList; 