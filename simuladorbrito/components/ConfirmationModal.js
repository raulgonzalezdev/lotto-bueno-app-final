import Image from 'next/image';

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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">Confirmar voto</h2>
        
        <div className="flex items-center justify-center mb-4">
          <div className="mr-4">
            <Image
              src="/candidatos/brito-mini.png"
              alt="José Brito"
              width={100}
              height={100}
              className="rounded-full"
            />
          </div>
          <div>
            <p className="font-bold text-lg">José Brito</p>
            <p className="text-gray-600">Candidato a Gobernador</p>
          </div>
        </div>
        
        <div className="text-center mb-6">
          <p className="mb-2">¿Está seguro que desea votar por <strong>José Brito</strong> con el partido:</p>
          <div className="flex justify-center my-4">
            <div className="border border-gray-300 rounded-lg p-2 w-40 h-20 flex items-center justify-center">
              <Image
                src={partido?.logo || '/partidos/default.png'}
                alt={partido?.nombre || 'Partido'}
                width={100}
                height={60}
                className="object-contain"
              />
            </div>
          </div>
          <p className="font-bold">{partido?.nombre || 'Partido seleccionado'}</p>
        </div>
        
        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition duration-300"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal; 