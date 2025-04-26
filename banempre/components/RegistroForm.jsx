import { useState } from 'react';
import { useRouter } from 'next/router';

export default function RegistroForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    cedula: '',
    nombre: '',
    rif: '',
    nombreEmprendimiento: '',
    telefono: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Enviar datos al API
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://applottobueno.com/api';
      const response = await fetch(`${apiUrl}/emprendedores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        // Redireccionar al dashboard principal
        alert('Registro exitoso');
        window.location.href = 'https://applottobueno.com/dashboard';
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'Ha ocurrido un error al registrar'}`);
      }
    } catch (error) {
      console.error('Error al enviar el formulario:', error);
      alert('Error al procesar la solicitud. Intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-container">
      <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-white text-center">REGISTRA TU EMPRENDIMIENTO</h2>
      <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
        <div className="mb-2 md:mb-3">
          <label className="block mb-1 text-white text-sm md:text-base">Cédula de Identidad:</label>
          <input
            type="text"
            name="cedula"
            value={formData.cedula}
            onChange={handleChange}
            className="w-full p-2 rounded bg-white text-black text-sm md:text-base"
            required
          />
        </div>

        <div className="mb-2 md:mb-3">
          <label className="block mb-1 text-white text-sm md:text-base">Nombre y Apellido:</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
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
            name="nombreEmprendimiento"
            value={formData.nombreEmprendimiento}
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
            className="bg-blue-600 text-white font-medium py-2 px-6 md:px-8 rounded-full hover:bg-blue-700 transition-colors w-full"
          >
            {isSubmitting ? 'Procesando...' : 'REGISTRAR'}
          </button>
        </div>
      </form>
    </div>
  );
} 