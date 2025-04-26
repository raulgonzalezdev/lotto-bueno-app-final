import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function RegistroForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    cedula: '',
    nombre_apellido: '',
    rif: '',
    nombre_emprendimiento: '',
    telefono: '',
    estado: '',
    municipio: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [electorData, setElectorData] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Si el campo modificado es la cédula y tiene al menos 6 caracteres, buscar en el registro
    if (name === 'cedula' && value.length >= 6) {
      buscarElector(value);
    }
  };

  const buscarElector = async (cedula) => {
    setIsSearching(true);
    setErrorMessage('');
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://applottobueno.com/api';
      const response = await fetch(`${apiUrl}/emprendedores/get_elector_data/${cedula}`);
      
      if (response.ok) {
        const data = await response.json();
        setElectorData(data);
        
        // Autocompletar con los datos del elector
        setFormData(prev => ({
          ...prev,
          nombre_apellido: data.nombre_apellido || prev.nombre_apellido,
          estado: data.estado || prev.estado,
          municipio: data.municipio || prev.municipio
        }));
      } else {
        console.log('Elector no encontrado, pero se permitirá el registro manual');
        setElectorData(null);
      }
    } catch (error) {
      console.error('Error al buscar elector:', error);
    } finally {
      setIsSearching(false);
    }
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
      // Enviar datos al API
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://applottobueno.com/api';
      const response = await fetch(`${apiUrl}/emprendedores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cedula: formData.cedula,
          nombre_apellido: formData.nombre_apellido,
          rif: formData.rif,
          nombre_emprendimiento: formData.nombre_emprendimiento,
          telefono: formData.telefono,
          estado: formData.estado,
          municipio: formData.municipio
        }),
      });
      
      if (response.ok) {
        // Mostrar mensaje de éxito
        setSuccessMessage('¡Registro exitoso! Gracias por registrar tu emprendimiento.');
        
        // Limpiar el formulario
        setFormData({
          cedula: '',
          nombre_apellido: '',
          rif: '',
          nombre_emprendimiento: '',
          telefono: '',
          estado: '',
          municipio: ''
        });
        
        // Opcionalmente, redirigir después de un tiempo
        setTimeout(() => {
          window.location.href = 'https://applottobueno.com/dashboard';
        }, 3000);
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.detail || 'Error al registrar el emprendimiento');
      }
    } catch (error) {
      console.error('Error al enviar el formulario:', error);
      setErrorMessage('Error al procesar la solicitud. Intente nuevamente.');
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
      buscarElector(router.query.cedula);
    }
  }, [router.query]);

  return (
    <div className="form-container">
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
            {isSearching && (
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

        <div className="text-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white font-medium py-2 px-6 md:px-8 rounded-full hover:bg-blue-700 transition-colors w-full disabled:opacity-50"
          >
            {isSubmitting ? 'Procesando...' : 'REGISTRAR'}
          </button>
        </div>
      </form>
    </div>
  );
} 