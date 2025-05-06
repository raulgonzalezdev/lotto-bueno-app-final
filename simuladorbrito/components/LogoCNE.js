import Image from 'next/image';

/**
 * Componente para mostrar el logo del CNE (Consejo Nacional Electoral)
 * 
 * @param {Object} props - Propiedades del componente
 * @param {number} props.width - Ancho de la imagen
 * @param {number} props.height - Alto de la imagen
 * @param {string} props.className - Clases adicionales para el contenedor
 */
const LogoCNE = ({ width = 150, height = 70, className = '' }) => {
  return (
    <div className={`flex justify-center ${className}`}>
      <Image
        src="/partidos/logo_cne.png"
        alt="Consejo Nacional Electoral"
        width={width}
        height={height}
        className="object-contain"
      />
    </div>
  );
};

export default LogoCNE; 