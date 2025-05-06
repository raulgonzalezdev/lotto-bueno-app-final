import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useElectorDataForEmprendedor, useCreateEmprendedor } from '../hooks/useEmprendedores';
import Toast from './Toast';
import Modal from './Modal';

// Función debounce para retrasar la búsqueda
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export default function RegistroForm() {
  const router = useRouter();
  const { token, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    cedula: '',
    nombre_apellido: '',
    rif: '',
    nombre_emprendimiento: '',
    telefono: '',
    estado: '',
    municipio: '',
    motivo: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'info' });
  const [registroExitoso, setRegistroExitoso] = useState(false);
  const [datosRegistro, setDatosRegistro] = useState(null);

  // Usamos el hook para crear emprendedores
  const createEmprendedor = useCreateEmprendedor();

  // Usamos el hook modificado para obtener datos de elector
  const { 
    data: electorData, 
    isLoading: isSearchingElector, 
    error: electorError 
  } = useElectorDataForEmprendedor(formData.cedula);

  // Función para mostrar toast
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  // Implementar la función de búsqueda con debounce
  const debouncedSearch = useCallback(
    debounce((cedula) => {
      // La búsqueda ahora se maneja automáticamente por el hook useElectorDataForEmprendedor
      console.log("Buscando elector con cédula:", cedula);
    }, 800),
    []
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar mensajes de error al cambiar la cédula
    if (name === 'cedula') {
      setErrorMessage('');
    }

    // Si el campo modificado es la cédula y tiene al menos 7 caracteres, iniciar búsqueda con debounce
    if (name === 'cedula' && value.length >= 7) {
      debouncedSearch(value);
    }
  };

  // Actualizar datos del formulario cuando se encuentra información del elector
  useEffect(() => {
    if (electorData) {
      setFormData(prev => ({
        ...prev,
        nombre_apellido: electorData.nombre_apellido || prev.nombre_apellido,
        estado: electorData.estado || prev.estado,
        municipio: electorData.municipio || prev.municipio
      }));
    }
  }, [electorData]);

  // Función para limpiar el formulario
  const limpiarFormulario = () => {
    setFormData({
      cedula: '',
      nombre_apellido: '',
      rif: '',
      nombre_emprendimiento: '',
      telefono: '',
      estado: '',
      municipio: '',
      motivo: ''
    });
    setErrorMessage('');
    setSuccessMessage('');
  };

  // Función para cerrar el modal y limpiar el formulario
  const handleCloseModal = () => {
    setRegistroExitoso(false);
    setDatosRegistro(null);
    limpiarFormulario();
  };

  const validarFormulario = () => {
    // Resetear mensaje de error
    setErrorMessage('');
    
    if (!formData.cedula.trim()) {
      setErrorMessage('La cédula es obligatoria');
      return false;
    }
    
    if (!formData.nombre_apellido.trim()) {
      setErrorMessage('El nombre y apellido son obligatorios');
      return false;
    }
    
    if (!formData.nombre_emprendimiento.trim()) {
      setErrorMessage('El nombre del emprendimiento es obligatorio');
      return false;
    }
    
    if (!formData.telefono.trim()) {
      setErrorMessage('El número telefónico es obligatorio');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }
    
    setIsSubmitting(true);
    setErrorMessage('');
    
    try {
      // Usamos la mutación de React Query para crear el emprendedor
      const resultado = await createEmprendedor.mutateAsync({
        cedula: formData.cedula,
        nombre_apellido: formData.nombre_apellido,
        rif: formData.rif,
        nombre_emprendimiento: formData.nombre_emprendimiento,
        telefono: formData.telefono,
        estado: formData.estado,
        municipio: formData.municipio,
        motivo: formData.motivo
      });
      
      // Guardar los datos del registro para mostrarlos en el modal
      setDatosRegistro({
        ...formData,
        id: resultado?.id
      });
      
      // Mostrar modal de registro exitoso
      setRegistroExitoso(true);
      showToast('¡Registro exitoso!', 'success');
      
    } catch (error) {
      console.error('Error al enviar el formulario:', error);
      
      // Capturar el mensaje específico de error
      if (error.message.includes('Ya existe un emprendedor con esta cédula')) {
        setErrorMessage('Ya estás registrado en nuestro sistema');
        showToast('Ya estás registrado en nuestro sistema', 'info');
      } else {
        setErrorMessage(error.message || 'Error al procesar la solicitud. Intente nuevamente.');
        showToast('Error al procesar la solicitud', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Verificar si hay cédula en la URL para pre-cargar (opcional)
  useEffect(() => {
    if (router.query.cedula) {
      setFormData(prev => ({
        ...prev,
        cedula: router.query.cedula
      }));
      // La búsqueda ahora se maneja automáticamente por el hook useElectorDataForEmprendedor
    }
  }, [router.query]);

  return (
    <div className="form-container">
      {authLoading ? (
        <div className="text-center py-4">
          <p className="text-white">Cargando...</p>
        </div>
      ) : (
        <>
          <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-white text-center">REGISTRA TU EMPRENDIMIENTO</h2>
          
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
              {successMessage}
            </div>
          )}
          
          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
              {errorMessage}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
            <div className="mb-2 md:mb-3">
              <label className="block mb-1 text-white text-sm md:text-base">Cédula de Identidad:</label>
              <div className="flex items-center">
                <input
                  type="text"
                  name="cedula"
                  value={formData.cedula}
                  onChange={handleChange}
                  className="w-full p-2 rounded bg-white text-black text-sm md:text-base"
                  required
                />
                {isSearchingElector && (
                  <span className="ml-2 text-white animate-spin">⟳</span>
                )}
              </div>
              {electorData && (
                <p className="text-xs text-green-300 mt-1">Información encontrada en la base de datos</p>
              )}
            </div>

            <div className="mb-2 md:mb-3">
              <label className="block mb-1 text-white text-sm md:text-base">Nombre y Apellido:</label>
              <input
                type="text"
                name="nombre_apellido"
                value={formData.nombre_apellido}
                onChange={handleChange}
                className="w-full p-2 rounded bg-white text-black text-sm md:text-base"
                required
              />
            </div>

            <div className="mb-2 md:mb-3">
              <label className="block mb-1 text-white text-sm md:text-base">RIF (Si posee):</label>
              <input
                type="text"
                name="rif"
                value={formData.rif}
                onChange={handleChange}
                className="w-full p-2 rounded bg-white text-black text-sm md:text-base"
              />
            </div>

            <div className="mb-2 md:mb-3">
              <label className="block mb-1 text-white text-sm md:text-base">Nombre del Emprendimiento:</label>
              <input
                type="text"
                name="nombre_emprendimiento"
                value={formData.nombre_emprendimiento}
                onChange={handleChange}
                className="w-full p-2 rounded bg-white text-black text-sm md:text-base"
                required
              />
            </div>

            <div className="mb-3 md:mb-4">
              <label className="block mb-1 text-white text-sm md:text-base">Número Telefónico:</label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className="w-full p-2 rounded bg-white text-black text-sm md:text-base"
                required
              />
            </div>

            <div className="mb-3 md:mb-4">
              <label className="block mb-1 text-white text-sm md:text-base">Motivo (opcional):</label>
              <textarea
                name="motivo"
                value={formData.motivo}
                onChange={handleChange}
                className="w-full p-2 rounded bg-white text-black text-sm md:text-base resize-y"
                placeholder="Indícanos el motivo de tu registro (financiamiento, asesoría, etc.)"
                rows="4"
                style={{ minHeight: '100px' }}
              />
            </div>

            <div className="text-center">
              <button
                type="submit"
                disabled={isSubmitting || createEmprendedor.isPending}
                className="bg-blue-600 text-white font-medium py-2 px-6 md:px-8 rounded-full hover:bg-blue-700 transition-colors w-full disabled:opacity-50"
              >
                {isSubmitting || createEmprendedor.isPending ? 'Procesando...' : 'REGISTRAR'}
              </button>
            </div>
          </form>
        </>
      )}
      
      {/* Toast para notificaciones */}
      {toast.message && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ message: '', type: 'info' })} 
        />
      )}

      {/* Modal de registro exitoso */}
      <Modal
        isOpen={registroExitoso}
        onClose={handleCloseModal}
        title="¡Registro Exitoso!"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          
          <h4 className="text-lg font-semibold mb-2">¡Bienvenido a Banempre!</h4>
          
          <p className="mb-3">
            Gracias por registrar tu emprendimiento con nosotros. Hemos registrado los siguientes datos:
          </p>
          
          {datosRegistro && (
            <div className="bg-gray-50 p-3 rounded-lg text-left mb-4">
              <p><strong>Nombre:</strong> {datosRegistro.nombre_apellido}</p>
              <p><strong>Emprendimiento:</strong> {datosRegistro.nombre_emprendimiento}</p>
              <p><strong>Teléfono:</strong> {datosRegistro.telefono}</p>
              {datosRegistro.motivo && (
                <p><strong>Motivo:</strong> {datosRegistro.motivo}</p>
              )}
            </div>
          )}
          
          <p className="text-blue-600 font-medium">
            Próximamente serás contactado por un agente a través del número telefónico que proporcionaste.
          </p>
          
          <p className="mt-3 text-gray-600">
            Te informaremos sobre los recaudos necesarios para la obtención de beneficios, 
            planes disponibles y toda la información que necesitas para impulsar tu emprendimiento.
          </p>
        </div>
      </Modal>
    </div>
  );
} 