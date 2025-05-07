import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Confetti from 'react-confetti';
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
          maxWidth: '90%',
          width: { xs: '350px', sm: '450px', md: '500px' },
          p: { xs: 1, sm: 2, md: 3 },
          position: 'relative',
          overflow: 'hidden'
        }
      }}
    >
      {isOpen && <Confetti width={width} height={height} recycle={false} numberOfPieces={200} />}
      
      <DialogTitle sx={{ 
        textAlign: 'center', 
        pt: { xs: 2, sm: 3 },
        pb: { xs: 1, sm: 2 },
        fontWeight: 'bold',
        fontSize: { xs: '1.3rem', sm: '1.5rem', md: '1.8rem' }
      }}>
        ¡Voto registrado!
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <img 
            src={partido.logo} 
            alt={partido.nombre}
            style={{ 
              maxWidth: '180px',
              maxHeight: '120px',
              margin: '0 auto',
              display: 'block'
            }}
          />
        </Box>
        
        <DialogContentText sx={{ 
          textAlign: 'center',
          fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
          mb: 2
        }}>
          Has votado por {partido.nombre} apoyando a <strong>JOSÉ BRITO</strong> como Gobernador de Anzoátegui.
        </DialogContentText>
        
        <Typography variant="body2" sx={{ 
          textAlign: 'center',
          fontSize: { xs: '0.75rem', sm: '0.8rem' },
          color: 'rgba(0,0,0,0.6)',
          mt: 2
        }}>
          Recuerda que este es solo un simulador para prácticas electorales.
        </Typography>
      </DialogContent>
      
      <DialogActions sx={{ justifyContent: 'center', p: { xs: 2, sm: 3 } }}>
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