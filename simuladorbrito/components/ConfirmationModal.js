import Image from 'next/image';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Paper,
  Divider
} from '@mui/material';

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
  const brandBlueColor = 'rgb(21, 40, 82)';
  const imagenCandidato = "/candidatos/brito.png";
  
  return (
    <Dialog 
      open={isOpen}
      onClose={onConfirm}
      PaperProps={{
        sx: { 
          borderRadius: 1,
          maxWidth: '400px',
          width: '100%',
          m: 2,
          overflow: 'hidden'
        }
      }}
      BackdropProps={{
        sx: { backdropFilter: 'blur(3px)' }
      }}
    >
      <DialogTitle sx={{ 
        py: 2, 
        textAlign: 'center', 
        fontWeight: 'bold',
        borderBottom: '1px solid #e0e0e0'
      }}>
        Confirmación de Voto
      </DialogTitle>
      
      <DialogContent sx={{ px: 3, py: 3 }}>
        <Typography 
          variant="body1" 
          textAlign="center" 
          sx={{ mb: 2, fontWeight: 'medium' }}
        >
          Su voto por <strong>{partido?.nombre || 'el partido seleccionado'}</strong> ha sido registrado exitosamente (simulación).
        </Typography>
        
        <Box sx={{ 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 1.5
        }}>
          <Typography 
            variant="h6" 
            component="p"
            sx={{ 
              fontWeight: 'bold',
              fontSize: '1.2rem',
              mb: 1,
              color: '#FFD700', // Amarillo dorado
              textTransform: 'uppercase',
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
            }}
          >
            ESTE 25 DE MAYO
          </Typography>
          
          <Typography 
            variant="h6" 
            component="p"
            sx={{ 
              fontWeight: 'bold',
              fontSize: '1.2rem',
              px: 3,
              py: 0.5,
              mb: 1.5,
              color: 'white',
              backgroundColor: '#4169E1', // Azul real
              borderRadius: '20px',
              textTransform: 'uppercase'
            }}
          >
            TODOS A VOTAR
          </Typography>
          
          <Typography 
            variant="h3" 
            component="p"
            sx={{ 
              fontWeight: 'bold',
              fontSize: '2.5rem',
              lineHeight: 1,
              mb: 0,
              color: '#0047AB', // Azul cobalto
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
          >
            BRITO
          </Typography>
          
          <Typography 
            variant="subtitle1" 
            component="p"
            sx={{ 
              fontWeight: 'medium',
              fontSize: '1rem',
              mb: 1.5,
              color: '#0047AB', // Azul cobalto
              textTransform: 'uppercase'
            }}
          >
            GOBERNADOR 2025
          </Typography>
          
          <Typography 
            variant="h6" 
            component="p"
            sx={{ 
              fontWeight: 'bold',
              fontSize: '1.3rem',
              mb: 1,
              color: '#0047AB', // Azul cobalto
              textTransform: 'uppercase'
            }}
          >
            ¡Prepárate para votar!
          </Typography>
          
          <Box sx={{ 
            fontFamily: 'cursive, Arial, sans-serif',
            fontWeight: 'bold',
            fontSize: '1.5rem',
            color: '#0047AB', // Azul cobalto
            mb: 0.5,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <Typography 
              variant="h5" 
              component="p"
              sx={{ 
                fontFamily: 'cursive, Arial, sans-serif',
                fontWeight: 'bold',
                fontSize: '1.6rem',
                lineHeight: 1,
                mb: 0,
                color: '#0047AB', // Azul cobalto
                fontStyle: 'italic'
              }}
            >
              Ahora Sí
            </Typography>
            <Typography 
              variant="subtitle1" 
              component="p"
              sx={{ 
                fontFamily: 'cursive, Arial, sans-serif',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                lineHeight: 1,
                color: '#0047AB', // Azul cobalto
                fontStyle: 'italic'
              }}
            >
              ¡Viene lo Bueno!
            </Typography>
          </Box>
        </Box>
        
        <Paper 
          elevation={0} 
          sx={{ 
            p: 2, 
            backgroundColor: '#f5f5f5',
            borderRadius: 1,
            border: '1px solid #e0e0e0'
          }}
        >
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2
          }}>
            <Box sx={{ mr: 2, position: 'relative', width: 100, height: 100 }}>
              <img 
                src={imagenCandidato}
                alt="José Brito"
                style={{ 
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '4px'
                }}
              />
            </Box>
            
            <Box sx={{ 
              backgroundColor: '#9EFD38',
              p: 1,
              borderRadius: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: 140,
              height: 70
            }}>
              {partido?.logo && (
                <img 
                  src={partido.logo}
                  alt={partido?.nombre || "Partido"}
                  style={{ 
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain'
                  }}
                />
              )}
            </Box>
          </Box>
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              JOSÉ BRITO
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              {partido?.nombre?.toUpperCase() || 'PARTIDO'}
            </Typography>
          </Box>
        </Paper>
      </DialogContent>
      
      <Divider />
      
      <DialogActions sx={{ justifyContent: 'flex-end', p: 2, backgroundColor: '#f9f9f9' }}>
        <Button 
          onClick={onConfirm}
          variant="contained"
          sx={{ 
            backgroundColor: brandBlueColor,
            '&:hover': {
              backgroundColor: 'rgb(15, 30, 62)'
            },
            px: 3
          }}
        >
          ACEPTAR
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationModal;