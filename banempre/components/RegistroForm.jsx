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
    <div className="form-container text-white">
      <h2 className="text-2xl font-bold mb-6 text-center">REGISTRA TU EMPRENDIMIENTO</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-1">Cédula de Identidad:</label>
          <input
            type="text"
            name="cedula"
            value={formData.cedula}
            onChange={handleChange}
            className="w-full p-2 rounded bg-white text-black"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1">Nombre y Apellido:</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            className="w-full p-2 rounded bg-white text-black"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1">RIF (Si posee):</label>
          <input
            type="text"
            name="rif"
            value={formData.rif}
            onChange={handleChange}
            className="w-full p-2 rounded bg-white text-black"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1">Nombre del Emprendimiento:</label>
          <input
            type="text"
            name="nombreEmprendimiento"
            value={formData.nombreEmprendimiento}
            onChange={handleChange}
            className="w-full p-2 rounded bg-white text-black"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block mb-1">Número Telefónico:</label>
          <input
            type="tel"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            className="w-full p-2 rounded bg-white text-black"
            required
          />
        </div>

        <div className="text-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-white text-primary font-bold py-2 px-6 rounded-full hover:bg-gray-100 transition-colors"
          >
            {isSubmitting ? 'Procesando...' : 'REGISTRAR'}
          </button>
        </div>
      </form>
    </div>
  );
} 