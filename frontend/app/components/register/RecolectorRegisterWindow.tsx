/* eslint-disable @next/next/no-img-element */

import React, { useState, useEffect } from 'react';
import Toast from '../toast/Toast';
import { useCreateRecolector } from '../../hooks/useRecolectores';
import { useEstados } from '../../hooks/useEstados';
import { useMunicipios } from '../../hooks/useMunicipios';
import { useOrganizacionesPoliticas } from '../../hooks/useOrganizacionesPoliticas';

interface RecolectorRegisterWindowProps {
  title: string;
  subtitle: string;
  imageSrc: string;
  setCurrentPage: (page: "WELCOME" | "ELECTORES" | "TICKETS" | "STATUS" | "ADD" | "SETTINGS" | "USERS" | "RECOLECTORES" | "REGISTER" | "REGISTER_RECOLECTOR" | "ORGANIZACIONES") => void;
}

// Código DANE para Anzoátegui (esto debe coincidir con el valor correcto en su sistema)
const ANZOATEGUI_CODIGO = "2"; // Ajusta este valor al código correcto para Anzoátegui

const RecolectorRegisterWindow: React.FC<RecolectorRegisterWindowProps> = ({ 
  title, 
  subtitle, 
  imageSrc, 
  setCurrentPage 
}) => {
  const [formData, setFormData] = useState({ 
    cedula: "", 
    operador: "0414", 
    telefono: "", 
    email: "default@example.com", // Valor por defecto para el email
    estado: ANZOATEGUI_CODIGO, // Inicializar con Anzoátegui
    municipio: "",
    organizacion_politica: ""
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  const [registrationComplete, setRegistrationComplete] = useState(false);
  
  // Utilizar hooks para obtener datos
  const { data: estados = [], isLoading: isLoadingEstados } = useEstados();
  const { data: municipios = [], isLoading: isLoadingMunicipios } = useMunicipios(formData.estado);
  const { data: organizacionesPoliticas = [], isLoading: isLoadingOrganizaciones } = useOrganizacionesPoliticas();
  
  const { mutate: createRecolector, isPending: isLoadingSubmit } = useCreateRecolector();

  // Efecto para cargar los municipios tan pronto como se carguen los estados
  useEffect(() => {
    if (estados.length > 0 && !formData.estado) {
      // Intentar encontrar Anzoátegui por nombre si el código no funciona
      const anzoateguiEstado = estados.find(estado => 
        estado.estado.toLowerCase().includes("anzoátegui") || 
        estado.estado.toLowerCase().includes("anzoategui")
      );
      
      if (anzoateguiEstado) {
        setFormData(prevState => ({
          ...prevState,
          estado: anzoateguiEstado.codigo_estado.toString()
        }));
      }
    }
  }, [estados, formData.estado]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    
    // Si se cambia el estado, reiniciar el municipio seleccionado
    if (name === 'estado') {
      setFormData(prevState => ({
        ...prevState,
        municipio: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setToastMessage(null);

    // Validar formulario
    if (!formData.cedula || !formData.telefono || !formData.municipio || !formData.organizacion_politica) {
      setToastMessage("Por favor complete todos los campos obligatorios.");
      setToastType('error');
      return;
    }

    const fullPhoneNumber = `58${formData.operador.slice(1)}${formData.telefono}`;
    if (!/^58\d{10}$/.test(fullPhoneNumber)) {
      setToastMessage("El número de teléfono debe tener 10 dígitos después del operador.");
      setToastType('error');
      return;
    }

    // Crear el recolector
    const recolectorPayload = {
      nombre: `${formData.cedula} - ${formData.municipio} - ${formData.organizacion_politica}`,
      cedula: formData.cedula,
      telefono: fullPhoneNumber,
      es_referido: true,
      email: formData.email, // Usar el valor por defecto
      estado: formData.estado,
      municipio: formData.municipio,
      organizacion_politica: formData.organizacion_politica
    };

    createRecolector(recolectorPayload, {
      onSuccess: (data) => {
        setToastMessage(`Registro exitoso. Su código de recolector es: ${data.id}`);
        setToastType('success');
        setRegistrationComplete(true);
        
        // Reiniciar formulario después de 5 segundos
        setTimeout(() => {
          setFormData({ 
            cedula: "", 
            operador: "0414", 
            telefono: "", 
            email: "default@example.com", // Mantener el valor por defecto
            estado: ANZOATEGUI_CODIGO, // Mantener Anzoátegui como selección
            municipio: "",
            organizacion_politica: ""
          });
          setRegistrationComplete(false);
        }, 5000);
      },
      onError: (error: Error) => {
        console.error("Error al registrar recolector:", error);
        setToastMessage(error.message || "Ocurrió un error inesperado al registrar.");
        setToastType('error');
      },
    });
  };

  const handleVolverClick = () => {
    setCurrentPage('WELCOME');
  }

  return (
    <div className="welcome-page">
      <div className="register-page p-4 flex flex-col items-center">
        <img src={imageSrc} width={381} height={162} className="footer-logo" alt="Logo" />
        <h1 className="text-4xl font-bold mb-2 text-center text-white">{title}</h1>
        <h2 className="text-xl mb-6 text-center text-white">{subtitle}</h2>
        
        <div className="w-full max-w-lg bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-2xl font-bold mb-4 text-center">Registro de COPERO</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Cédula*</span>
              </label>
              <input
                type="text"
                name="cedula"
                value={formData.cedula}
                onChange={handleInputChange}
                className="input input-bordered w-full"
                placeholder="Ingrese su número de cédula"
                required
              />
            </div>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text">Teléfono Celular*</span>
              </label>
              <div className="flex">
                <select
                  name="operador"
                  value={formData.operador}
                  onChange={handleInputChange}
                  className="select select-bordered"
                >
                  <option value="0414">0414</option>
                  <option value="0424">0424</option>
                  <option value="0412">0412</option>
                  <option value="0416">0416</option>
                  <option value="0426">0426</option>
                </select>
                <input
                  type="text"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  className="input input-bordered flex-1 ml-2"
                  placeholder="Ej: 1234567"
                  required
                />
              </div>
            </div>
            
            {/* El campo de correo se oculta pero sigue formando parte del estado */}
            
            <div className="form-control">
              <label className="label">
                <span className="label-text">Estado*</span>
              </label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleInputChange}
                className="select select-bordered w-full"
                required
              >
                <option value="">Seleccione un estado</option>
                {isLoadingEstados ? (
                  <option disabled value="">Cargando estados...</option>
                ) : (
                  estados.map((estado) => (
                    <option key={estado.codigo_estado} value={estado.codigo_estado}>
                      {estado.estado}
                    </option>
                  ))
                )}
              </select>
            </div>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text">Municipio*</span>
              </label>
              <select
                name="municipio"
                value={formData.municipio}
                onChange={handleInputChange}
                className="select select-bordered w-full"
                disabled={!formData.estado || isLoadingMunicipios}
                required
              >
                <option value="">Seleccione un municipio</option>
                {isLoadingMunicipios ? (
                  <option disabled value="">Cargando municipios...</option>
                ) : (
                  municipios.map((municipio) => (
                    <option key={municipio.codigo_municipio} value={municipio.municipio}>
                      {municipio.municipio}
                    </option>
                  ))
                )}
              </select>
            </div>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text">Organización Política*</span>
              </label>
              <select
                name="organizacion_politica"
                value={formData.organizacion_politica}
                onChange={handleInputChange}
                className="select select-bordered w-full"
                required
              >
                <option value="">Seleccione una organización</option>
                {isLoadingOrganizaciones ? (
                  <option disabled value="">Cargando organizaciones...</option>
                ) : (
                  organizacionesPoliticas.map((org) => (
                    <option key={org.id} value={org.nombre}>
                      {org.nombre}
                    </option>
                  ))
                )}
              </select>
            </div>
            
            <div className="form-control mt-6">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isLoadingSubmit || registrationComplete}
              >
                {isLoadingSubmit ? 'Registrando...' : 'Registrarme como COPERO'}
              </button>
            </div>
          </form>
          
          <div className="mt-4 text-center">
            <button
              onClick={handleVolverClick}
              className="btn btn-outline btn-sm"
            >
              Volver
            </button>
          </div>
        </div>
        
        {/* Toast notification */}
        {toastMessage && <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />}
      </div>
    </div>
  );
};

export default RecolectorRegisterWindow; 