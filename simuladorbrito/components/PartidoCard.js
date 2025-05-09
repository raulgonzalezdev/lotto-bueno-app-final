import Image from 'next/image';

/**
 * Componente para mostrar una tarjeta de partido político
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.partido - Datos del partido político
 * @param {string} props.partido.id - ID único del partido
 * @param {string} props.partido.nombre - Nombre del partido
 * @param {string} props.partido.logo - Ruta de la imagen del logo
 * @param {function} props.onClick - Función a ejecutar al hacer clic en la tarjeta
 * @param {string} props.label - Etiqueta a mostrar debajo del logo (opcional)
 * @param {boolean} props.showCandidate - Si se debe mostrar la info del candidato (opcional)
 * @param {boolean} props.isMobile - Si se está visualizando en un dispositivo móvil
 * @param {boolean} props.showBorder - Si se debe mostrar el borde de la tarjeta
 * @param {boolean} props.horizontal - Si la tarjeta debe mostrar una disposición horizontal
 */
const PartidoCard = ({ 
  partido, 
  onClick, 
  label = '', 
  showCandidate = false, 
  isMobile = false,
  showBorder = true,
  horizontal = false
}) => {
  const cardStyle = {
    aspectRatio: isMobile ? '3/1' : (horizontal ? '1/1' : '2/1'),
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: isMobile ? '1px' : '8px',
    height: '100%',
    width: '100%',
    border: showBorder ? '1px solid #ced4da' : 'none',
    borderRadius: isMobile ? '4px' : '4px',
    backgroundColor: 'white',
    boxShadow: isMobile ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
    overflow: 'hidden',
  };
  
  // Estilo diferente para móvil vs desktop
  if (!isMobile) {
    cardStyle.flexDirection = 'column';
  }
  
  return (
    <div 
      className={`party-card transition-all cursor-pointer ${isMobile ? 'mobile-card' : ''} ${horizontal ? 'horizontal-card' : ''}`}
      style={cardStyle}
      onClick={() => onClick(partido)}
    >
      {showCandidate && !isMobile && (
        <div className="flex items-center justify-center" style={{ width: '100%', height: '100%' }}>
          <div className="flex-shrink-0" style={{ maxWidth: isMobile ? '30%' : '35%', marginRight: '4px' }}>
            <Image
              src="/candidatos/brito.png"
              alt="José Brito"
              width={isMobile ? 50 : 100}
              height={isMobile ? 50 : 100}
              className="rounded-full"
              style={{ objectFit: 'contain', maxWidth: '100%', height: 'auto' }}
            />
          </div>
          <div style={{ maxWidth: isMobile ? '65%' : '60%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Image
              src={partido.logo}
              alt={partido.nombre}
              width={isMobile ? 80 : 120}
              height={isMobile ? 40 : 60}
              style={{ objectFit: 'contain', maxWidth: '100%', height: 'auto' }}
            />
          </div>
        </div>
      )}
      
      {!showCandidate && isMobile && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          padding: '0px'
        }}>
          <Image
            src={partido.logo}
            alt={partido.nombre}
            width={80}
            height={30}
            style={{ 
              objectFit: 'contain', 
              maxWidth: '100%', 
              maxHeight: '90%',
              width: 'auto',
              height: 'auto'
            }}
            priority={true}
          />
        </div>
      )}
      
      {!showCandidate && !isMobile && (
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          width: '100%', 
          height: horizontal ? '90%' : '80%',
          padding: horizontal ? '2px' : '4px'
        }}>
          <Image
            src={partido.logo}
            alt={partido.nombre}
            width={200}
            height={100}
            style={{ 
              objectFit: 'contain', 
              maxWidth: '100%', 
              maxHeight: '100%',
              width: 'auto',
              height: 'auto'
            }}
          />
        </div>
      )}
      
      {!isMobile && !horizontal && (
        <div className="text-center py-1 text-sm font-semibold" style={{ 
          fontSize: '0.8rem',
          marginTop: '2px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          width: '100%',
          height: '20%'
        }}>
          {label || (showCandidate ? 'JOSÉ BRITO' : partido.nombre)}
        </div>
      )}
    </div>
  );
};

export default PartidoCard; 