/* eslint-disable react-hooks/exhaustive-deps */

"use client";
import React, { useState, useEffect } from "react";
import { Elector, Estado, Municipio, Parroquia, CentroVotacion, elector } from './types';
import { useEstados } from '../../hooks/useEstados';
import { useMunicipios } from '../../hooks/useMunicipios';
import { useParroquias } from '../../hooks/useParroquias';
import { useCentrosVotacion } from '../../hooks/useCentrosVotacion';
import { useElectores, useElectorDetail, useTotalElectores } from '../../hooks/useElectores';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../../api';
import ConfirmationModal from '../confirmation/ConfirmationModal';

// Componente para mostrar mensajes
const MessageModal: React.FC<{
  isOpen: boolean;
  message: string;
  type: 'info' | 'error' | 'success';
  onClose: () => void;
}> = ({ isOpen, message, type, onClose }) => {
  if (!isOpen) return null;
  
  const bgColor = {
    info: 'bg-blue-100 border-blue-500',
    error: 'bg-red-100 border-red-500',
    success: 'bg-green-100 border-green-500'
  }[type];
  
  const textColor = {
    info: 'text-blue-800',
    error: 'text-red-800',
    success: 'text-green-800'
  }[type];
  
  const icon = {
    info: (
      <svg className="w-6 h-6 text-blue-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    ),
    error: (
      <svg className="w-6 h-6 text-red-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    ),
    success: (
      <svg className="w-6 h-6 text-green-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    )
  }[type];
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`bg-white rounded-lg shadow-xl p-6 max-w-md border-l-4 ${bgColor}`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {icon}
          </div>
          <div className="ml-3">
            <h3 className={`text-lg font-medium ${textColor}`}>
              {type === 'info' ? 'Información' : type === 'error' ? 'Error' : 'Éxito'}
            </h3>
            <div className={`mt-2 text-sm ${textColor}`}>
              <p>{message}</p>
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className={`px-4 py-2 text-sm font-medium rounded-md ${textColor} bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};

interface ChatComponentProps {
  production: boolean;
  settingConfig: any;
  APIHost: any;
  RAGConfig: any;

  isAdmin: boolean;

  title: string;
  subtitle: string;
  imageSrc: string;
}

const ChatComponent: React.FC<ChatComponentProps> = ({
  production,
  settingConfig,
  APIHost,
  RAGConfig,

  isAdmin,

  title,
  subtitle,
  imageSrc
}) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedElector, setSelectedElector] = useState<any | null>(null);
  const [currentElectorPage, setCurrentElectorPage] = useState(1);
  const [electoresPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [cedulaSearch, setCedulaSearch] = useState("");

  const [searchError, setSearchError] = useState("");

  const [codigoEstado, setCodigoEstado] = useState("");
  const [codigoMunicipio, setCodigoMunicipio] = useState("");
  const [codigoParroquia, setCodigoParroquia] = useState("");
  const [codigoCentroVotacion, setCodigoCentroVotacion] = useState("");

  const [isDownloading, setIsDownloading] = useState(false);
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [downloadType, setDownloadType] = useState<{type: string, format: string} | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [totalBatches, setTotalBatches] = useState(0);
  const [currentBatch, setCurrentBatch] = useState(0);

  // Estados para modales de confirmación y mensajes
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [confirmationAction, setConfirmationAction] = useState<() => void>(() => {});
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [messageType, setMessageType] = useState<'info' | 'error' | 'success'>('info');

  // Utilizar los hooks de React Query
  const { data: estados = [], isLoading: estadosLoading, error: estadosError } = useEstados();
  const { data: municipios = [], isLoading: municipiosLoading } = useMunicipios(codigoEstado);
  const { data: parroquias = [], isLoading: parroquiasLoading } = useParroquias(codigoEstado, codigoMunicipio);
  const { data: centrosVotacion = [], isLoading: centrosLoading } = useCentrosVotacion(codigoEstado, codigoMunicipio, codigoParroquia);
  
  // Para los electores, usamos el hook con los parámetros necesarios
  const { data: electoresData = [], isLoading: electoresLoading } = useElectores({
    currentPage: currentElectorPage,
    electoresPerPage,
    codigoEstado,
    codigoMunicipio,
    codigoParroquia,
    codigoCentroVotacion
  });

  // Para obtener el total de electores
  const { data: totalElectores = 0 } = useTotalElectores({
    codigoEstado,
    codigoMunicipio,
    codigoParroquia,
    codigoCentroVotacion
  });

  // Para obtener el detalle de un elector por cédula
  const { data: electorDetailData, isLoading: electorDetailLoading } = useElectorDetail(cedulaSearch);

  // Actualizamos el estado electores cuando cambia electoresData
  useEffect(() => {
    if (electoresData) {
      // Convertimos los datos de electoresData al tipo esperado por el componente
      const electoresConverted = Array.isArray(electoresData) 
        ? electoresData.map(e => ({
            id: e.id,
            letra_cedula: e.letra_cedula,
            numero_cedula: String(e.numero_cedula),
            p_nombre: e.p_nombre,
            s_nombre: e.s_nombre || '',
            p_apellido: e.p_apellido,
            s_apellido: e.s_apellido || '',
            sexo: e.sexo || '',
            fecha_nacimiento: e.fecha_nacimiento,
            codigo_estado: e.codigo_estado,
            codigo_municipio: e.codigo_municipio,
            codigo_parroquia: e.codigo_parroquia,
            codigo_centro_votacion: Number(e.codigo_centro_votacion),
            
            // Añadimos los objetos anidados necesarios
            elector: {
              id: e.id,
              letra_cedula: e.letra_cedula,
              numero_cedula: String(e.numero_cedula),
              p_nombre: e.p_nombre,
              s_nombre: e.s_nombre || '',
              p_apellido: e.p_apellido,
              s_apellido: e.s_apellido || '',
              sexo: e.sexo || '',
              fecha_nacimiento: e.fecha_nacimiento,
              codigo_estado: e.codigo_estado,
              codigo_municipio: e.codigo_municipio,
              codigo_parroquia: e.codigo_parroquia,
              codigo_centro_votacion: Number(e.codigo_centro_votacion)
            },
            centro_votacion: {
              codificacion_vieja_cv: 0,
              codificacion_nueva_cv: 0,
              condicion: 0,
              codigo_estado: e.codigo_estado,
              codigo_municipio: e.codigo_municipio,
              codigo_parroquia: e.codigo_parroquia,
              nombre_cv: '',
              direccion_cv: '',
              id: 0
            },
            geografico: {
              codigo_estado: e.codigo_estado,
              codigo_municipio: e.codigo_municipio,
              codigo_parroquia: e.codigo_parroquia,
              estado: '',
              municipio: '',
              parroquia: '',
              id: 0
            }
          }))
        : [];
      setElectores(electoresConverted);
    }
  }, [electoresData]);

  // Actualizamos el total de páginas cuando cambia totalElectores
  useEffect(() => {
    if (typeof totalElectores === 'number') {
      setTotalPages(Math.ceil(totalElectores / electoresPerPage));
    }
  }, [totalElectores, electoresPerPage]);

  const [electores, setElectores] = useState<Elector[]>([]);

  const handleEstadoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setCodigoEstado(value === "Seleccione un estado" ? "" : value);
    setCodigoMunicipio("");
    setCodigoParroquia("");
    setCodigoCentroVotacion("");
  };

  const handleMunicipioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setCodigoMunicipio(value);
    setCodigoParroquia("");
    setCodigoCentroVotacion("");
  };

  const handleParroquiaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setCodigoParroquia(value);
    setCodigoCentroVotacion("");
  };

  const handleCentroVotacionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setCodigoCentroVotacion(value);
  };

  const handleCedulaSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCedulaSearch(e.target.value);
  };
  
  const handleCedulaSearch = async () => {
    if (cedulaSearch) {
      setCedulaSearch(cedulaSearch); // Esto activará el useElectorDetail hook
      setModalIsOpen(true);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const openModal = (numero_cedula: string) => {
    setCedulaSearch(numero_cedula);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedElector(null);
    setSearchError("");
  };

  const paginate = (pageNumber: number) => {
    if (pageNumber < 1) {
      setCurrentElectorPage(1);
    } else if (pageNumber > totalPages) {
      setCurrentElectorPage(totalPages);
    } else {
      setCurrentElectorPage(pageNumber);
    }
  };

  const initiateDownload = (type: string, format: string) => {
    setDownloadType({ type, format });
    setShowDownloadDialog(true);
  };

  // Añadir estas funciones de mutación después de los otros hooks pero antes de las funciones de descargas
  const downloadElectoresInfoMutation = useMutation({
    mutationFn: async (query: URLSearchParams) => {
      const response = await fetch(`${APIHost}/api/download/excel/electores/info?${query}`);
      if (!response.ok) {
        throw new Error(`Error al obtener información de la descarga: ${response.statusText}`);
      }
      return response.json();
    }
  });

  const downloadElectoresBatchMutation = useMutation({
    mutationFn: async ({ batchNumber, query }: { batchNumber: number, query: URLSearchParams }) => {
      const response = await fetch(`${APIHost}/api/download/excel/electores/batch/${batchNumber}?${query}`);
      if (!response.ok) {
        throw new Error(`Error al descargar el lote ${batchNumber}: ${response.statusText}`);
      }
      return response;
    }
  });

  const downloadCentrosPorEstadoMutation = useMutation({
    mutationFn: async (codigoEstado: string) => {
      const response = await fetch(`${APIHost}/api/download/excel/centros-por-estado/${codigoEstado}`);
      if (!response.ok) {
        throw new Error(`Error al descargar los centros: ${response.statusText}`);
      }
      return response;
    }
  });

  const downloadElectoresPorCentrosInfoMutation = useMutation({
    mutationFn: async (codigoEstado: string) => {
      const response = await fetch(`${APIHost}/api/download/excel/electores-por-centros/info/${codigoEstado}`);
      if (!response.ok) {
        throw new Error(`Error al obtener información de la descarga: ${response.statusText}`);
      }
      return response.json();
    }
  });

  const downloadElectoresPorCentroMutation = useMutation({
    mutationFn: async ({ codigoEstado, codigoCentro }: { codigoEstado: string, codigoCentro: string }) => {
      const response = await fetch(
        `${APIHost}/api/download/excel/electores-por-centros/${codigoEstado}/${codigoCentro}`
      );
      if (!response.ok) {
        throw new Error(`Error al descargar centro ${codigoCentro}: ${response.statusText}`);
      }
      return response;
    }
  });

  // Agregar una función auxiliar para descargar archivos más robusta 
  const downloadBlobAsFile = async (blob: Blob, filename: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        
        // Agregar evento de finalización para saber cuándo se completa la descarga
        link.onload = () => {
          console.log(`Archivo ${filename} cargado correctamente`);
        };
        
        link.onclick = () => {
          // Dar tiempo para que se inicie la descarga antes de limpiar
          setTimeout(() => {
            window.URL.revokeObjectURL(downloadUrl);
            resolve();
          }, 150);
        };
        
        link.onerror = (err) => {
          console.error(`Error en la descarga de ${filename}:`, err);
          window.URL.revokeObjectURL(downloadUrl);
          reject(err);
        };
        
        document.body.appendChild(link);
        link.click();
        
        // Si no se activó el evento onclick (algunos navegadores), resolver después de un tiempo
        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(downloadUrl);
          resolve();
        }, 3000);
      } catch (err) {
        console.error(`Error preparando la descarga de ${filename}:`, err);
        reject(err);
      }
    });
  };

  // Reemplazar la función startSequentialDownload por esta versión mejorada
  const startSequentialDownload = async () => {
    if (!downloadType) return;
    
    setShowDownloadDialog(false);
    setIsDownloading(true);
    setDownloadProgress(0);
    setCurrentBatch(0);

    try {
      const query = new URLSearchParams();
      if (codigoEstado) query.append('codigo_estado', codigoEstado);
      if (codigoMunicipio && codigoMunicipio !== "") query.append('codigo_municipio', codigoMunicipio);
      if (codigoParroquia && codigoParroquia !== "") query.append('codigo_parroquia', codigoParroquia);
      if (codigoCentroVotacion && codigoCentroVotacion !== "") query.append('codigo_centro_votacion', codigoCentroVotacion);

      // Obtener información de descarga usando mutation
      const info = await downloadElectoresInfoMutation.mutateAsync(query);
      setTotalBatches(info.num_batches);
      
      console.log(`Iniciando descarga de ${info.num_batches} lotes, total ${info.total_records} registros`);

      // ID único para seguimiento de progreso
      const downloadId = `download_${Date.now()}`;
      
      for (let batchNumber = 1; batchNumber <= info.num_batches; batchNumber++) {
        setCurrentBatch(batchNumber);
        setDownloadProgress(((batchNumber - 1) / info.num_batches) * 100);
        
        console.log(`Descargando lote ${batchNumber} de ${info.num_batches}`);

        // Descargar cada lote usando mutation
        const response = await downloadElectoresBatchMutation.mutateAsync({ batchNumber, query });

        const blob = await response.blob();
        const filename = response.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/["']/g, '') || 
                        `electores_parte_${batchNumber}.xlsx.zip`;

        await downloadBlobAsFile(blob, filename);

        // Actualizar progreso real
        setDownloadProgress((batchNumber / info.num_batches) * 100);

        // Hacer una pausa antes de la siguiente descarga para que el navegador tenga tiempo de procesar
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      setDownloadProgress(100);
      showMessage('Descarga completada exitosamente', 'success');
    } catch (error) {
      console.error('Error en la descarga:', error);
      showMessage('Hubo un error al descargar los archivos. Por favor, inténtelo de nuevo.', 'error');
    } finally {
      setIsDownloading(false);
      setCurrentBatch(0);
      setDownloadProgress(0);
    }
  };

  // Mejorar la función downloadCentrosPorEstado
  const downloadCentrosPorEstado = async () => {
    if (!codigoEstado) {
      showMessage('Por favor, seleccione un estado primero', 'error');
      return;
    }

    try {
      setIsDownloading(true);
      setDownloadProgress(10); // Indicador inicial de progreso
      
      console.log(`Iniciando descarga de centros para el estado ${codigoEstado}`);
      
      // Descargar centros usando mutation
      const response = await downloadCentrosPorEstadoMutation.mutateAsync(codigoEstado);
      
      setDownloadProgress(60); // Actualizar progreso
      
      const blob = await response.blob();
      const filename = response.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/["']/g, '') || 
                      'centros_electorales.xlsx.zip';

      setDownloadProgress(90); // Casi completado
      
      await downloadBlobAsFile(blob, filename);
      
      setDownloadProgress(100); // Completado
      setTimeout(() => setIsDownloading(false), 1000); // Mostrar progreso completo por un momento
    } catch (error) {
      console.error('Error en la descarga:', error);
      showMessage('Hubo un error al descargar el archivo. Por favor, inténtelo de nuevo.', 'error');
      setIsDownloading(false);
    }
  };

  // Mejorar la función downloadElectoresPorCentros
  const downloadElectoresPorCentros = async () => {
    if (!codigoEstado) {
      showMessage('Por favor, seleccione un estado primero', 'error');
      return;
    }

    try {
      setIsDownloading(true);
      setDownloadProgress(0);

      console.log(`Obteniendo información de centros para el estado ${codigoEstado}`);
      
      // Obtener información sobre la descarga usando mutation
      const info = await downloadElectoresPorCentrosInfoMutation.mutateAsync(codigoEstado);
      
      if (!info.centros || !Array.isArray(info.centros)) {
        throw new Error('Formato de respuesta inválido: no se encontraron centros');
      }

      console.log(`Se encontraron ${info.centros.length} centros con un total de ${info.total_electores} electores`);
      
      let centrosProcesados = 0;
      const totalCentros = info.centros.length;

      // Procesar cada centro
      for (const centro of info.centros) {
        try {
          console.log(`Descargando centro ${centro.codigo} (${centro.nombre})`);
          
          // Descargar cada centro usando mutation
          const response = await downloadElectoresPorCentroMutation.mutateAsync({
            codigoEstado,
            codigoCentro: centro.codigo
          });

          const blob = await response.blob();
          const filename = response.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/["']/g, '') || 
                        `centro_${centro.codigo}.xlsx.zip`;

          await downloadBlobAsFile(blob, filename);

          centrosProcesados++;
          const progreso = (centrosProcesados / totalCentros) * 100;
          setDownloadProgress(progreso);
          
          console.log(`Progreso: ${progreso.toFixed(1)}% (${centrosProcesados}/${totalCentros})`);

          // Pequeña pausa entre descargas para dar tiempo al navegador
          await new Promise(resolve => setTimeout(resolve, 1500));
        } catch (error) {
          console.error(`Error descargando centro ${centro.codigo}:`, error);
        }
      }

      setDownloadProgress(100);
      setTimeout(() => setIsDownloading(false), 1000); // Mostrar progreso completo por un momento
    } catch (error) {
      console.error('Error en la descarga:', error);
      showMessage('Hubo un error al descargar los archivos. Por favor, inténtelo de nuevo.', 'error');
      setIsDownloading(false);
    }
  };

  // Utilizamos electorDetailData cuando está disponible
  useEffect(() => {
    if (electorDetailData) {
      setSelectedElector(electorDetailData);
      setSearchError("");
      setModalIsOpen(true);
    }
  }, [electorDetailData]);

  // Función para mostrar mensajes (reemplaza alert)
  const showMessage = (message: string, type: 'info' | 'error' | 'success' = 'info') => {
    setMessageText(message);
    setMessageType(type);
    setShowMessageModal(true);
  };

  // Función para mostrar confirmaciones (reemplaza confirm)
  const showConfirmation = (message: string, onConfirm: () => void) => {
    setConfirmationMessage(message);
    setConfirmationAction(() => onConfirm);
    setShowConfirmationModal(true);
  };

  return (
    <div className="p-4">
      <h2>Control de Electores</h2>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <label>Estado:</label>
          <select 
            onChange={handleEstadoChange} 
            className="input input-bordered w-full" 
            value={codigoEstado || ""}
            disabled={estadosLoading}
          >
            <option value="">Seleccione un estado</option>
            {estados.map(estado => (
              <option key={estado.codigo_estado} value={estado.codigo_estado}>
                {estado.estado}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Municipio:</label>
          <select
            onChange={handleMunicipioChange}
            className="input input-bordered w-full"
            value={codigoMunicipio}
            disabled={!codigoEstado || municipiosLoading}
          >
            <option value="">Seleccione un municipio</option>
            {municipios.map(municipio => (
              <option key={municipio.codigo_municipio} value={municipio.codigo_municipio}>
                {municipio.municipio}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Parroquia:</label>
          <select
            onChange={handleParroquiaChange}
            className="input input-bordered w-full"
            value={codigoParroquia}
            disabled={!codigoMunicipio || parroquiasLoading}
          >
            <option value="">Seleccione una parroquia</option>
            {parroquias.map(parroquia => (
              <option key={parroquia.codigo_parroquia} value={parroquia.codigo_parroquia}>
                {parroquia.parroquia}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Centro de Votación:</label>
          <select
            onChange={handleCentroVotacionChange}
            className="input input-bordered w-full"
            value={codigoCentroVotacion}
            disabled={!codigoParroquia || centrosLoading}
          >
            <option value="">Seleccione un centro de votación</option>
            {centrosVotacion.map(centro => (
              <option key={centro.codificacion_nueva_cv} value={centro.codificacion_nueva_cv}>
                {centro.nombre_cv}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Búsqueda por cédula:</label>
          <input
            type="text"
            value={cedulaSearch}
            onChange={handleCedulaSearchChange}
            className="input input-bordered w-full"
          />
          <button onClick={handleCedulaSearch} className="btn btn-primary w-full mt-2">Buscar</button>
        </div>
        <div>
          <label>Búsqueda general:</label>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            className="input input-bordered w-full"
          />
        </div>
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        <button 
          onClick={() => initiateDownload('electores', 'excel')} 
          className="btn btn-secondary"
          disabled={isDownloading}
        >
          {isDownloading ? 'Descargando...' : 'Descargar Electores Excel'}
        </button>
        <button 
          onClick={downloadCentrosPorEstado} 
          className="btn btn-primary"
          disabled={!codigoEstado || isDownloading}
        >
          {isDownloading ? 'Descargando...' : 'Descargar Centros del Estado'}
        </button>
        <button
          onClick={downloadElectoresPorCentros}
          disabled={!codigoEstado || isDownloading}
          className={`flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            !codigoEstado || isDownloading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isDownloading ? (
            <>
              <span className="mr-2">Descargando... {downloadProgress.toFixed(1)}%</span>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </>
          ) : (
            'Descargar Electores por Centros'
          )}
        </button>
      </div>
      <div className="pagination mb-4 flex justify-center">
        <button onClick={() => paginate(1)} className="btn btn-primary mr-1">{"<<"}</button>
        <button onClick={() => paginate(currentElectorPage - 1)} className="btn btn-primary mr-1">{"<"}</button>
        <span className="btn btn-disabled mr-1">Página {currentElectorPage} de {totalPages}</span>
        <button onClick={() => paginate(currentElectorPage + 1)} className="btn btn-primary mr-1">{">"}</button>
        <button onClick={() => paginate(totalPages)} className="btn btn-primary">{">>"}</button>
      </div>
      
      {electoresLoading ? (
        <div className="flex justify-center">Cargando electores...</div>
      ) : (
        <table className="table-auto w-full mb-4">
          <thead>
            <tr>
              <th>Cédula</th>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Centro de Votación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {electores.map((elector) => (
              <tr key={elector?.id}>
                <td>{`${elector?.letra_cedula}-${elector?.numero_cedula}`}</td>
                <td>{elector?.p_nombre}</td>
                <td>{elector?.p_apellido}</td>
                <td>{elector?.codigo_centro_votacion}</td>
                <td>
                  <button className="btn btn-primary" onClick={() => openModal(elector?.numero_cedula)}>
                    Ver Detalle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modalIsOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-button" onClick={closeModal}>×</button>
            <h2>Detalle del Elector</h2>
            {electorDetailLoading ? (
              <div>Cargando información del elector...</div>
            ) : selectedElector ? (
              <div>
                <p><strong>ID:</strong> {selectedElector.elector.id}</p>
                <p><strong>Cédula:</strong> {`${selectedElector.elector.letra_cedula}-${selectedElector.elector.numero_cedula}`}</p>
                <p><strong>Nombre:</strong> {`${selectedElector.elector.p_nombre} ${selectedElector.elector.s_nombre}`}</p>
                <p><strong>Apellido:</strong> {`${selectedElector.elector.p_apellido} ${selectedElector.elector.s_apellido}`}</p>
                <p><strong>Sexo:</strong> {selectedElector.elector.sexo}</p>
                <p><strong>Fecha Nacimiento:</strong> {new Date(selectedElector.elector.fecha_nacimiento).toLocaleDateString()}</p>
                <p><strong>Estado:</strong> {selectedElector.geografico.estado}</p>
                <p><strong>Municipio:</strong> {selectedElector.geografico.municipio}</p>
                <p><strong>Parroquia:</strong> {selectedElector.geografico.parroquia}</p>
                <p><strong>Centro de Votación:</strong> {selectedElector.centro_votacion.nombre_cv}</p>
                <p><strong>Dirección Centro de Votación:</strong> {selectedElector.centro_votacion.direccion_cv}</p>
              </div>
            ) : (
              <div>No se encontró información del elector</div>
            )}
          </div>
        </div>
      )}

      {showDownloadDialog && (
        <div className="modal-overlay" onClick={() => setShowDownloadDialog(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Información de Descarga</h3>
            <p className="mb-4">
              Los archivos se descargarán en partes para mayor eficiencia.
              Cada parte se descargará automáticamente tan pronto como esté lista.
              Puede continuar trabajando mientras se completan las descargas.
            </p>
            <div className="flex justify-end gap-2">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowDownloadDialog(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn btn-primary"
                onClick={startSequentialDownload}
              >
                Comenzar descargas
              </button>
            </div>
          </div>
        </div>
      )}

      {isDownloading && (
        <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg">
          <h4 className="font-bold mb-2">Descargando archivos</h4>
          <div className="mb-2">
            Parte actual: {currentBatch} de {totalBatches}
          </div>
          <div className="w-64 h-2 bg-gray-200 rounded-full">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${downloadProgress}%` }}
            />
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {Math.round(downloadProgress)}% completado
          </div>
        </div>
      )}

      {showConfirmationModal && (
        <ConfirmationModal
          message={confirmationMessage}
          onConfirm={() => {
            confirmationAction();
            setShowConfirmationModal(false);
          }}
          onCancel={() => setShowConfirmationModal(false)}
        />
      )}

      {showMessageModal && (
        <MessageModal
          isOpen={showMessageModal}
          message={messageText}
          type={messageType}
          onClose={() => setShowMessageModal(false)}
        />
      )}
    </div>
  );
};

export default ChatComponent;
