import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useWindowSize } from '../hooks/useWindowSize';

/**
 * Modal de confirmación que se muestra cuando se selecciona un partido
 * 
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.isOpen - Indica si el modal está abierto
 * @param {Object} props.partido - Partido seleccionado
 * @param {Function} props.onConfirm - Función a ejecutar cuando se confirma
 * @param {Function} props.onCancel - Función a ejecutar cuando se cancela
 */
const ConfirmationModal = ({ isOpen, partido, onConfirm, onCancel }) => {
  const { width, height } = useWindowSize();
  
  if (!partido) return null;
  
  return (
    <Dialog 
      open={isOpen} 
      onClose={onCancel}
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxWidth: '95%',
          width: { xs: '350px', sm: '500px', md: '600px' },
          p: { xs: 1, sm: 2, md: 3 },
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(to bottom, #ffffff, #f0f2f5)',
          border: '2px solid rgb(21, 40, 82)',
        }
      }}
    >
      <Box 
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: '#FFD700', // Amarillo para el banner superior
          py: 1,
          textAlign: 'center',
          fontWeight: 'bold',
          color: '#333',
          fontSize: { xs: '1rem', sm: '1.2rem' },
          zIndex: 1
        }}
      >
        ESTE 25 DE MAYO
      </Box>
      
      <DialogTitle sx={{ 
        textAlign: 'center', 
        pt: { xs: 5, sm: 6 }, // Espacio para el banner superior
        pb: { xs: 1, sm: 1 },
        color: 'white',
        bgcolor: '#4169E1', // Azul para el fondo del título
        fontWeight: 'bold',
        fontSize: { xs: '1.3rem', sm: '1.6rem', md: '1.8rem' },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        mb: 2
      }}>
        <Typography 
          variant="h4" 
          component="span"
          sx={{ 
            fontSize: { xs: '1.8rem', sm: '2.2rem' },
            fontWeight: 'bold',
            color: 'white'
          }}
        >
          TODOS A <span style={{ color: '#FFD700' }}>VOTAR</span>
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ px: { xs: 2, sm: 3 }, textAlign: 'center' }}>
        <Typography 
          variant="h2" 
          component="div"
          sx={{ 
            fontSize: { xs: '3rem', sm: '4rem' },
            fontWeight: 'bold',
            color: '#0047AB', // Azul para BRITO
            mb: 0,
            lineHeight: 1,
            letterSpacing: '-0.05em'
          }}
        >
          BRITO
          <Box
            component="span"
            sx={{
              display: 'inline-block',
              position: 'relative',
              width: '40px',
              height: '40px',
              ml: 1,
              borderRadius: '50%',
              bgcolor: '#0047AB',
              '&::after': {
                content: "''",
                position: 'absolute',
                top: '10px',
                left: '50%',
                width: '20px',
                height: '20px',
                borderTop: '10px solid #FFD700',
                borderRight: '10px solid transparent',
                transform: 'rotate(45deg)'
              }
            }}
          />
        </Typography>
        
        <Typography 
          variant="h5"
          component="div"
          sx={{ 
            fontSize: { xs: '1.2rem', sm: '1.4rem' },
            color: '#0047AB',
            mb: 3,
            fontWeight: 'normal'
          }}
        >
          GOBERNADOR 2025
        </Typography>
        
        <Box sx={{ 
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2
        }}>
          <Box sx={{ 
            textAlign: 'center',
            mb: { xs: 2, sm: 0 },
            width: { xs: '100%', sm: '50%' },
          }}>
            <Typography 
              variant="h6"
              component="div"
              sx={{ 
                fontSize: { xs: '1.5rem', sm: '1.7rem' },
                color: '#0047AB',
                fontWeight: 'bold',
                mb: 1
              }}
            >
              ¡Prepárate para votar!
            </Typography>
            
            <Box sx={{ 
              fontFamily: 'cursive, serif',
              color: '#0047AB',
              fontSize: { xs: '1.5rem', sm: '1.8rem' },
              fontWeight: 'bold',
              lineHeight: 1,
              mt: 1
            }}>
              Ahora Sí
              <Box component="div" sx={{ fontSize: '0.9em' }}>
                ¡Viene lo Bueno!
              </Box>
            </Box>
          </Box>
          
          <Box sx={{ 
            width: { xs: '120px', sm: '150px' },
            height: { xs: '120px', sm: '150px' },
            position: 'relative',
            borderRadius: '5px',
            overflow: 'hidden'
          }}>
            <img
              src="/candidatos/brito.png"
              alt="José Brito"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </Box>
        </Box>
        
        <Box sx={{ 
          textAlign: 'center', 
          mb: 2,
          p: 1,
          border: '1px solid #e0e0e0',
          borderRadius: 1,
          backgroundColor: 'white'
        }}>
          <img 
            src={partido.logo} 
            alt={partido.nombre}
            style={{ 
              maxWidth: '120px',
              maxHeight: '80px',
              margin: '0 auto',
              display: 'block'
            }}
          />
          <Typography variant="body1" sx={{ mt: 1, fontWeight: 'medium' }}>
            Has votado por {partido.nombre}
          </Typography>
        </Box>
        
        <Typography variant="body2" sx={{ 
          textAlign: 'center',
          fontSize: { xs: '0.75rem', sm: '0.8rem' },
          color: 'rgba(0,0,0,0.6)',
          mt: 1,
          fontStyle: 'italic'
        }}>
          Este es un simulador para las elecciones regionales de Anzoátegui 2025.
        </Typography>
      </DialogContent>
      
      <DialogActions sx={{ justifyContent: 'center', p: { xs: 2, sm: 2 } }}>
        <Button 
          onClick={onConfirm}
          variant="contained" 
          sx={{ 
            minWidth: '120px',
            backgroundColor: 'rgb(21, 40, 82)',
            '&:hover': { backgroundColor: 'rgb(15, 30, 62)' },
            borderRadius: 1,
            py: 1
          }}
        >
          Finalizar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationModal;