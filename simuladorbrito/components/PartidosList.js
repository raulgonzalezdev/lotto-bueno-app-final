import Image from 'next/image';

/**
 * Componente para mostrar la lista de partidos que apoyan a un candidato
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.partidos - Lista de partidos políticos
 * @param {string} props.className - Clases adicionales para el contenedor
 * @param {string} props.title - Título del componente
 */
const PartidosList = ({ partidos, className = '', title = 'Partidos que respaldan a José Brito' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <h2 className="text-2xl font-bold text-center mb-6">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3">
        {partidos.map((partido) => (
          <div key={partido.id} className="flex flex-col items-center">
            <div className="bg-white border border-gray-200 rounded-lg p-2 w-full h-24 flex items-center justify-center mb-2">
              <Image
                src={partido.logo}
                alt={partido.nombre}
                width={100}
                height={50}
                className="max-h-20 object-contain"
              />
            </div>
            <span className="text-xs text-center font-medium">{partido.nombre}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PartidosList; 