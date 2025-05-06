import Image from 'next/image';

/**
 * Componente para mostrar información del candidato
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} props.className - Clases adicionales para el contenedor
 */
const CandidateInfo = ({ className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex flex-col md:flex-row items-center">
        <div className="mb-4 md:mb-0 md:mr-6">
          <Image
            src="/candidatos/brito.png"
            alt="José Brito"
            width={200}
            height={200}
            className="rounded-lg"
          />
        </div>
        <div>
          <h2 className="text-3xl font-bold mb-2">José Brito</h2>
          <h3 className="text-xl text-blue-700 mb-4">Candidato a Gobernador de Anzoátegui</h3>
          <p className="text-gray-700 mb-4">
            José Brito es nuestro candidato para las elecciones regionales de 2025, 
            respaldado por 14 partidos políticos que conforman la plataforma unitaria.
          </p>
          <p className="text-gray-700 mb-4">
            Comprometido con el progreso y desarrollo del estado Anzoátegui, 
            Brito propone un gobierno de puertas abiertas y soluciones concretas 
            para los problemas que afectan a todos los ciudadanos.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Seguridad</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Salud</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Educación</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Empleo</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Infraestructura</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateInfo; 