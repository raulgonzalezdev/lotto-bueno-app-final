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
 */
const PartidoCard = ({ partido, onClick, label = '', showCandidate = false }) => {
  return (
    <div 
      className="party-card bg-white p-2 hover:shadow-lg transition-all cursor-pointer"
      onClick={() => onClick(partido)}
    >
      {showCandidate && (
        <div className="flex items-center p-2">
          <Image
            src="/candidatos/brito.png"
            alt="José Brito"
            width={100}
            height={100}
            className="rounded-full mr-2"
          />
          <Image
            src={partido.logo}
            alt={partido.nombre}
            width={120}
            height={60}
          />
        </div>
      )}
      
      {!showCandidate && (
        <Image
          src={partido.logo}
          alt={partido.nombre}
          width={200}
          height={100}
          className="w-full"
        />
      )}
      
      <div className="text-center py-2 text-sm font-semibold">
        {label || (showCandidate ? 'JOSÉ BRITO' : partido.nombre)}
      </div>
    </div>
  );
};

export default PartidoCard; 