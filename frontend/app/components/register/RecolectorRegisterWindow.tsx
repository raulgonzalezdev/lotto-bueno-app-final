/* eslint-disable @next/next/no-img-element */

import React, { useState, useEffect } from 'react';
import Toast from '../toast/Toast';
import { useCreateRecolector, useCheckRecolectorExistsByCedula, useUpdateRecolector, useRecolectorByCedula } from '../../hooks/useRecolectores';
import { useEstados } from '../../hooks/useEstados';
import { useMunicipios } from '../../hooks/useMunicipios';
import { useOrganizacionesPoliticas } from '../../hooks/useOrganizacionesPoliticas';
import { useElectorSimpleByCedula } from "@/app/hooks/useElectores";

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
    organizacion_politica: "",
    nombre: ""
  });
  const [errors, setErrors] = useState({
    cedula: "",
    telefono: "",
    nombre: "",
    estado: "",
    municipio: "",
    organizacion_politica: ""
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cedulaNotFound, setCedulaNotFound] = useState(false);
  
  // Utilizar hooks para obtener datos
  const { data: estados = [], isLoading: isLoadingEstados } = useEstados();
  const { data: municipios = [], isLoading: isLoadingMunicipios } = useMunicipios(formData.estado);
  const { data: organizacionesPoliticas = [], isLoading: isLoadingOrganizaciones } = useOrganizacionesPoliticas();
  
  const { mutate: createRecolector, isPending: isLoadingSubmit } = useCreateRecolector();
  const { mutate: updateRecolector } = useUpdateRecolector();
  
  // Hook para buscar elector por cédula
  const { data: electorData, isLoading: isLoadingElector } = useElectorSimpleByCedula(formData.cedula);
  
  // Hook para buscar recolector existente
  const { data: recolectorExistente, isLoading: isLoadingRecolector } = useRecolectorByCedula(formData.cedula);

  // Agregar después de los otros hooks
  const { data: recolectorExists, isLoading: isCheckingRecolector } = useCheckRecolectorExistsByCedula(formData.cedula);

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

  // Efecto para cargar datos del recolector existente
  useEffect(() => {
    if (recolectorExistente) {
      setFormData(prevState => ({
        ...prevState,
        nombre: recolectorExistente.nombre,
        telefono: recolectorExistente.telefono.slice(-7),
        operador: recolectorExistente.telefono.slice(2, 6),
        estado: recolectorExistente.estado || ANZOATEGUI_CODIGO,
        municipio: recolectorExistente.municipio || "",
        organizacion_politica: recolectorExistente.organizacion_politica || ""
      }));
    } else if (electorData) {
      setFormData(prevState => ({
        ...prevState,
        nombre: electorData.nombre,
        estado: electorData.codigoEstado?.toString() || ANZOATEGUI_CODIGO
      }));
    }
  }, [recolectorExistente, electorData]);

  // Efecto para actualizar el formulario cuando se obtienen datos del elector
  useEffect(() => {
    if (electorData && !recolectorExistente) {
      setFormData(prevState => ({
        ...prevState,
        nombre: electorData.nombre
      }));
      
      if (electorData.codigoEstado !== undefined && estados) {
        const estado = estados.find(e => 
          e.codigo_estado !== undefined && 
          e.codigo_estado.toString() === electorData.codigoEstado?.toString()
        );
        if (estado) {
          setFormData(prevState => ({
            ...prevState,
            estado: estado.codigo_estado.toString()
          }));
        }
      }
    }
  }, [electorData, estados, recolectorExistente]);

  // Agregar un efecto para limpiar el nombre cuando se cambia la cédula
  useEffect(() => {
    if (formData.cedula.length < 6) {
      setFormData(prevState => ({
        ...prevState,
        nombre: ''
      }));
      setCedulaNotFound(false);
    }
  }, [formData.cedula]);

  // Efecto para actualizar municipio cuando se cargan los municipios
  useEffect(() => {
    // Verificar que codigoMunicipio existe y no es undefined
    if (electorData?.codigoMunicipio !== undefined && municipios) {
      const municipio = municipios.find(m => 
        m.codigo_municipio !== undefined && 
        m.codigo_municipio.toString() === electorData.codigoMunicipio?.toString()
      );
      if (municipio) {
        setFormData(prevState => ({
          ...prevState,
          municipio: municipio.codigo_municipio.toString()
        }));
      }
    }
  }, [electorData, municipios]);

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

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      cedula: "",
      telefono: "",
      nombre: "",
      estado: "",
      municipio: "",
      organizacion_politica: ""
    };

    // Validar que la cédula existe en el registro electoral si es nuevo registro
    if (!recolectorExistente && !electorData) {
      newErrors.cedula = "La cédula debe existir en el registro";
      isValid = false;
    }

    if (!formData.cedula) {
      newErrors.cedula = "La cédula es requerida";
      isValid = false;
    }

    if (!formData.telefono || formData.telefono.length < 7) {
      newErrors.telefono = "El teléfono debe tener al menos 7 dígitos";
      isValid = false;
    }

    if (!formData.estado) {
      newErrors.estado = "Debes seleccionar un estado";
      isValid = false;
    }

    if (!formData.municipio) {
      newErrors.municipio = "Debes seleccionar un municipio";
      isValid = false;
    }

    if (!formData.organizacion_politica) {
      newErrors.organizacion_politica = "Debes seleccionar una organización política";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setToastMessage(null);

    if (!validateForm()) {
      setToastMessage("Por favor completa todos los campos requeridos correctamente.");
      setToastType('error');
      return;
    }

    if (!recolectorExistente && !electorData) {
      setToastMessage("Solo se pueden registrar personas que existan en el registro electoral.");
      setToastType('error');
      return;
    }

    const fullPhoneNumber = `58${formData.operador.slice(1)}${formData.telefono}`;
    if (!/^58\d{10}$/.test(fullPhoneNumber)) {
      setToastMessage("El número de teléfono debe tener 10 dígitos después del operador.");
      setToastType('error');
      return;
    }

    setIsSubmitting(true);

    const recolectorPayload = {
      nombre: electorData?.nombre || recolectorExistente?.nombre || "",
      cedula: formData.cedula,
      telefono: fullPhoneNumber,
      es_referido: true,
      email: formData.email,
      estado: formData.estado,
      municipio: formData.municipio,
      organizacion_politica: formData.organizacion_politica
    };

    if (recolectorExistente) {
      // Actualizar recolector existente
      updateRecolector({ recolectorId: recolectorExistente.id, payload: recolectorPayload }, {
        onSuccess: () => {
          setToastMessage("Datos del copero actualizados exitosamente");
          setToastType('success');
          setRegistrationComplete(true);
          setIsSubmitting(false);
          
          setTimeout(() => {
            setFormData({ 
              cedula: "", 
              operador: "0414", 
              telefono: "", 
              email: "default@example.com",
              estado: ANZOATEGUI_CODIGO,
              municipio: "",
              organizacion_politica: "",
              nombre: ""
            });
            setRegistrationComplete(false);
          }, 5000);
        },
        onError: (error: any) => {
          console.error("Error al actualizar copero:", error);
          setToastMessage(error.message || "Ocurrió un error inesperado al actualizar.");
          setToastType('error');
          setIsSubmitting(false);
        },
      });
    } else {
      // Crear nuevo recolector
      createRecolector(recolectorPayload, {
        onSuccess: (data) => {
          setToastMessage(`Registro exitoso. Su código de recolector es: ${data.id}`);
          setToastType('success');
          setRegistrationComplete(true);
          setIsSubmitting(false);
          
          setTimeout(() => {
            setFormData({ 
              cedula: "", 
              operador: "0414", 
              telefono: "", 
              email: "default@example.com",
              estado: ANZOATEGUI_CODIGO,
              municipio: "",
              organizacion_politica: "",
              nombre: ""
            });
            setRegistrationComplete(false);
          }, 5000);
        },
        onError: (error: any) => {
          console.error("Error al registrar copero:", error);
          setToastMessage(error.message || "Ocurrió un error inesperado al registrar.");
          setToastType('error');
          setIsSubmitting(false);
        },
      });
    }
  };

  const handleVolverClick = () => {
    setCurrentPage('WELCOME');
  }

  // Modificar los estilos de los inputs y selects
  const inputClassName = `mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 ${errors.cedula ? 'border-red-500' : ''}`;
  const selectClassName = `mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 ${errors.estado ? 'border-red-500' : ''}`;

  return (
    <div className="welcome-page">
      <div className="register-page p-4 flex flex-col items-center">
        <img src={imageSrc} width={381} height={162} className="footer-logo" alt="Logo" />
        <h1 className="text-4xl font-bold mb-2 text-center text-white">{title}</h1>
        <h2 className="text-xl mb-6 text-center text-white">{subtitle}</h2>
        
        <div className="w-full max-w-lg bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-2xl font-bold mb-4 text-center">Registro de COPERO</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <label htmlFor="cedula" className="block text-sm font-medium text-gray-700">Cédula</label>
              <div className="relative">
                <input
                  type="text"
                  id="cedula"
                  name="cedula"
                  value={formData.cedula}
                  onChange={handleInputChange}
                  placeholder="V12345678"
                  className={inputClassName}
                />
                {(isLoadingElector || isLoadingRecolector) && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <span className="animate-spin">⟳</span>
                  </div>
                )}
                {!electorData && formData.cedula.length >= 6 && !isLoadingElector && (
                  <p className="mt-1 text-sm text-red-500">
                    Esta cédula esta invalidada para ser copero
                  </p>
                )}
                {recolectorExistente && (
                  <p className="mt-1 text-sm text-blue-600">
                    Este copero ya existe. Se actualizarán sus datos.
                  </p>
                )}
              </div>
              {errors.cedula && <p className="mt-1 text-sm text-red-500">{errors.cedula}</p>}
            </div>
            
            <div className="form-group">
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                Nombre
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                disabled={true}
                className={`${inputClassName} bg-gray-100`}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">Teléfono Celular*</label>
              <div className="flex gap-2">
                <select
                  name="operador"
                  id="operador"
                  value={formData.operador}
                  onChange={handleInputChange}
                  className="w-28 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5"
                >
                  <option value="0414">0414</option>
                  <option value="0424">0424</option>
                  <option value="0412">0412</option>
                  <option value="0416">0416</option>
                  <option value="0426">0426</option>
                </select>
                <input
                  type="text"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  placeholder="Ej: 1234567"
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5"
                />
              </div>
              {errors.telefono && <p className="mt-1 text-sm text-red-500">{errors.telefono}</p>}
            </div>
            
            <div className="form-group">
              <label htmlFor="estado" className="block text-sm font-medium text-gray-700">Estado*</label>
              <select
                id="estado"
                name="estado"
                value={formData.estado}
                onChange={handleInputChange}
                className={selectClassName}
              >
                <option value="">Selecciona un estado</option>
                {isLoadingEstados ? (
                  <option disabled>Cargando estados...</option>
                ) : (
                  estados.map((estado) => (
                    <option key={estado.codigo_estado} value={estado.codigo_estado}>
                      {estado.estado}
                    </option>
                  ))
                )}
              </select>
              {errors.estado && <p className="mt-1 text-sm text-red-500">{errors.estado}</p>}
            </div>
            
            <div className="form-group">
              <label htmlFor="municipio" className="block text-sm font-medium text-gray-700">Municipio*</label>
              <select
                id="municipio"
                name="municipio"
                value={formData.municipio}
                onChange={handleInputChange}
                disabled={!formData.estado || isLoadingMunicipios}
                className={selectClassName}
              >
                <option value="">Selecciona un municipio</option>
                {isLoadingMunicipios ? (
                  <option disabled>Cargando municipios...</option>
                ) : (
                  municipios.map((municipio) => (
                    <option key={municipio.codigo_municipio} value={municipio.codigo_municipio}>
                      {municipio.municipio}
                    </option>
                  ))
                )}
              </select>
              {errors.municipio && <p className="mt-1 text-sm text-red-500">{errors.municipio}</p>}
            </div>
            
            <div className="form-group">
              <label htmlFor="organizacion_politica" className="block text-sm font-medium text-gray-700">Organización Política*</label>
              <select
                id="organizacion_politica"
                name="organizacion_politica"
                value={formData.organizacion_politica}
                onChange={handleInputChange}
                className={selectClassName}
              >
                <option value="">Selecciona una organización</option>
                {isLoadingOrganizaciones ? (
                  <option disabled>Cargando organizaciones...</option>
                ) : (
                  organizacionesPoliticas.map((org) => (
                    <option key={org.id} value={org.nombre}>
                      {org.nombre}
                    </option>
                  ))
                )}
              </select>
              {errors.organizacion_politica && <p className="mt-1 text-sm text-red-500">{errors.organizacion_politica}</p>}
            </div>
            
            <div className="form-control mt-6">
              <button
                type="submit"
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={isSubmitting || registrationComplete}
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">⟳</span>
                    {recolectorExistente ? "Actualizando..." : "Registrando..."}
                  </>
                ) : (
                  recolectorExistente ? "Actualizar datos de COPERO" : "Registrarme como COPERO"
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-4 text-center">
            <button
              onClick={handleVolverClick}
              className="py-1 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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