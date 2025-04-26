/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import Toast from '../toast/Toast';
import ConfirmationModal from '../confirmation/ConfirmationModal';
import { detectHost } from "../../api";
import { useEstados } from "../../hooks/useEstados";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useImportarRecolectores } from "../../hooks/useRecolectores";
import { useMunicipios } from "../../hooks/useMunicipios";

interface Municipio {
  codigo_municipio: string;
  municipio: string;
}

interface OrganizacionPolitica {
  codigo: string;
  nombre: string;
}

interface Recolector {
  id: number;
  nombre: string;
  cedula: string;
  telefono: string;
  es_referido: boolean;
  email?: string;
  estado?: string;
  municipio?: string;
  organizacion_politica?: string;
}

interface EstadisticasRecolector {
  recolector_id: number;
  nombre: string;
  tickets_count: number;
}

interface Referido {
  id: number;
  cedula: string;
  nombre: string;
  telefono: string;
  estado: string;
  municipio: string;
  parroquia: string;
  fecha_registro: string;
}

interface ReferidosData {
  recolector: {
    id: number;
    nombre: string;
    total_referidos: number;
  };
  referidos: Referido[];
}

const municipios = [
  "BOLIVAR",
  "S. RODRÍGUEZ", 
  "SOTILLO", 
  "ANACO", 
  "GUANIPA"
];

const organizacionesPoliticas: OrganizacionPolitica[] = [
  { codigo: "PV", nombre: "Primero Venezuela" },
  { codigo: "AD", nombre: "Acción Democrática" },
  { codigo: "COPEI", nombre: "COPEI" },
  { codigo: "VOL", nombre: "Voluntad Popular" },
  { codigo: "BR", nombre: "Bandera Roja" }
];

const RecolectorControl: React.FC = () => {
  const [recolectores, setRecolectores] = useState<Recolector[]>([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRecolector, setSelectedRecolector] = useState<Recolector | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [recolectoresPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [municipioFiltro, setMunicipioFiltro] = useState("");
  const [organizacionFiltro, setOrganizacionFiltro] = useState("");
  const [newRecolector, setNewRecolector] = useState({ 
    nombre: "", 
    cedula: "", 
    telefono: "", 
    es_referido: false,
    email: "",
    estado: "",
    municipio: "",
    organizacion_politica: ""
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  const [isConfirmationModalVisible, setIsConfirmationModalVisible] = useState(false);
  const [recolectorToDelete, setRecolectorToDelete] = useState<number | null>(null);
  const [estadisticas, setEstadisticas] = useState<EstadisticasRecolector[]>([]);
  const [isEstadisticasModalOpen, setIsEstadisticasModalOpen] = useState(false);
  const [APIHost, setAPIHost] = useState<string | null>(null);
  const [selectedRecolectorId, setSelectedRecolectorId] = useState<number | null>(null);
  const [referidosData, setReferidosData] = useState<ReferidosData | null>(null);
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageModalConfig, setMessageModalConfig] = useState({
    message: '',
    type: 'info', // 'info', 'error', 'success'
  });
  const [importModalIsOpen, setImportModalIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // React Query client
  const queryClient = useQueryClient();

  // Fetch Estados usando useEstados
  const { data: estados = [], isLoading: estadosLoading } = useEstados();

  // Fetch Municipios basado en el estado seleccionado para el filtro
  const { data: municipiosData = [], isLoading: municipiosLoading } = useMunicipios(estadoFiltro);

  // Crear queries para cada estado de los recolectores
  const municipiosQueries = useMemo(() => {
    const queries: { [key: string]: Municipio[] } = {};
    recolectores.forEach(recolector => {
      if (recolector?.estado && !queries[recolector.estado]) {
        const { data: municipios = [] } = useMunicipios(recolector.estado);
        queries[recolector.estado] = municipios || [];
      }
    });
    return queries;
  }, [recolectores]);

  // Crear un conjunto único de estados de los recolectores
  const estadosUnicos = [...new Set(recolectores.filter(r => r?.estado).map(r => r.estado))];
  
  // Crear queries para cada estado único
  estadosUnicos.forEach(estado => {
    if (estado) {
      const { data: municipios = [] } = useMunicipios(estado);
      municipiosQueries[estado] = municipios || [];
    }
  });

  // Fetch Recolectores con React Query
  const fetchRecolectoresQuery = useQuery({
    queryKey: ['recolectores', currentPage, searchTerm, estadoFiltro, municipioFiltro, organizacionFiltro],
    queryFn: async () => {
      if (!APIHost) return { items: [], total: 0 };
      
      const query = new URLSearchParams({
        skip: ((currentPage - 1) * recolectoresPerPage).toString(),
        limit: recolectoresPerPage.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(estadoFiltro && { estado: estadoFiltro }),
        ...(municipioFiltro && { municipio: municipioFiltro }),
        ...(organizacionFiltro && { organizacion_politica: organizacionFiltro }),
      }).toString();

      const response = await fetch(`${APIHost}/api/recolectores/?${query}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    },
    enabled: !!APIHost,
  });

  // Hook para obtener municipios de cada recolector
  const { data: municipiosRecolector = [] } = useMunicipios(recolectores[0]?.estado || "");

  // Mutación para crear recolector
  const createRecolectorMutation = useMutation({
    mutationFn: async (newRecolector: { nombre: string; cedula: string; telefono: string; es_referido: boolean; email: string; municipio: string; organizacion_politica: string }) => {
      if (!APIHost) throw new Error('API Host no definido');
      
      const response = await fetch(`${APIHost}/api/recolectores`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newRecolector)
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recolectores'] });
      setNewRecolector({ 
        nombre: "", 
        cedula: "", 
        telefono: "", 
        es_referido: false,
        email: "",
        estado: "",
        municipio: "",
        organizacion_politica: ""
      });
      closeModal();
      setToastMessage("Recolector creado exitosamente");
      setToastType("success");
    },
    onError: (error) => {
      console.error("Error creating recolector:", error);
      setToastMessage("Error creando recolector");
      setToastType("error");
    }
  });

  // Mutación para actualizar recolector
  const updateRecolectorMutation = useMutation({
    mutationFn: async (recolector: Recolector) => {
      if (!APIHost) throw new Error('API Host no definido');
      
      const response = await fetch(`${APIHost}/api/recolectores/${recolector.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(recolector)
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recolectores'] });
      closeModal();
      setToastMessage("Recolector actualizado exitosamente");
      setToastType("success");
    },
    onError: (error) => {
      console.error("Error updating recolector:", error);
      setToastMessage("Error actualizando recolector");
      setToastType("error");
    }
  });

  // Mutación para eliminar recolector
  const deleteRecolectorMutation = useMutation({
    mutationFn: async (id: number) => {
      if (!APIHost) throw new Error('API Host no definido');
      
      const response = await fetch(`${APIHost}/api/recolectores/${id}`, { 
        method: "DELETE" 
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recolectores'] });
      setRecolectorToDelete(null);
      setIsConfirmationModalVisible(false);
      setToastMessage("Recolector eliminado exitosamente");
      setToastType("success");
    },
    onError: (error) => {
      console.error("Error deleting recolector:", error);
      setToastMessage("Error eliminando recolector");
      setToastType("error");
    }
  });

  // Query para estadísticas
  const fetchEstadisticasQuery = useQuery({
    queryKey: ['estadisticas', selectedRecolectorId, estadoFiltro],
    queryFn: async () => {
      if (!APIHost) return [];
      
      let url = `${APIHost}/api/recolectores/estadisticas/`;
      if (selectedRecolectorId) {
        url += `?recolector_id=${selectedRecolectorId}`;
      }
      if (estadoFiltro) {
        url += `${selectedRecolectorId ? '&' : '?'}codigo_estado=${estadoFiltro}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      return response.json();
    },
    enabled: false, // No ejecutar automáticamente, solo cuando se solicite
  });

  // Query para referidos
  const fetchReferidosQuery = useQuery({
    queryKey: ['referidos', selectedRecolectorId, estadoFiltro],
    queryFn: async () => {
      if (!APIHost || !selectedRecolectorId) return null;
      
      let url = `${APIHost}/api/recolectores/${selectedRecolectorId}/referidos`;
      if (estadoFiltro) {
        url += `?codigo_estado=${estadoFiltro}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      return response.json();
    },
    enabled: false, // No ejecutar automáticamente
  });

  // Mutation para importar recolectores
  const importarRecolectoresMutation = useImportarRecolectores();

  useEffect(() => {
    fetchHost();
  }, []);

  useEffect(() => {
    if (fetchRecolectoresQuery.data) {
      try {
        if (fetchRecolectoresQuery.data && typeof fetchRecolectoresQuery.data === 'object' && 'items' in fetchRecolectoresQuery.data && Array.isArray(fetchRecolectoresQuery.data.items)) {
          // Caso 1: Objeto con propiedad 'items' que es un array
          setRecolectores(fetchRecolectoresQuery.data.items || []);
          const total = typeof fetchRecolectoresQuery.data.total === 'number' ? fetchRecolectoresQuery.data.total : fetchRecolectoresQuery.data.items.length;
          setTotalPages(Math.ceil(total / recolectoresPerPage) || 1);
        } else if (Array.isArray(fetchRecolectoresQuery.data)) {
          // Caso 2: Es directamente un array
          setRecolectores(fetchRecolectoresQuery.data);
          setTotalPages(Math.ceil(fetchRecolectoresQuery.data.length / recolectoresPerPage) || 1);
        } else {
          // Caso 3: No tiene el formato esperado
          console.error("Formato de respuesta inesperado:", fetchRecolectoresQuery.data);
          setRecolectores([]);
          setTotalPages(1);
        }
      } catch (error) {
        console.error("Error al procesar datos de recolectores:", error);
        setRecolectores([]);
        setTotalPages(1);
      }
    } else {
      // Si no hay datos, inicializar con valores vacíos
      setRecolectores([]);
      setTotalPages(1);
    }
  }, [fetchRecolectoresQuery.data, recolectoresPerPage]);

  useEffect(() => {
    if (fetchEstadisticasQuery.data) {
      setEstadisticas(fetchEstadisticasQuery.data);
    }
  }, [fetchEstadisticasQuery.data]);

  useEffect(() => {
    if (fetchReferidosQuery.data) {
      setReferidosData(fetchReferidosQuery.data);
    }
  }, [fetchReferidosQuery.data]);

  const fetchHost = async () => {
    try {
      const host = await detectHost();
      setAPIHost(host);
    } catch (error) {
      console.error("Error detecting host:", error);
      setAPIHost(process.env.NEXT_PUBLIC_API_URL || 'https://applottobueno.com');
    }
  };

  const handleDelete = async () => {
    if (!recolectorToDelete) return;
    deleteRecolectorMutation.mutate(recolectorToDelete);
  };

  const handleCreate = async () => {
    createRecolectorMutation.mutate(newRecolector);
  };

  const handleUpdate = async (recolector: Recolector) => {
    updateRecolectorMutation.mutate(recolector);
  };

  const openModal = (recolector: Recolector | null = null) => {
    setSelectedRecolector(recolector);
    setIsEditing(!!recolector);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedRecolector(null);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to the first page on search
  };

  const paginate = (pageNumber: number) => {
    if (pageNumber < 1) {
      setCurrentPage(1);
    } else if (pageNumber > totalPages) {
      setCurrentPage(totalPages);
    } else {
      setCurrentPage(pageNumber);
    }
  };

  const fetchEstadisticas = async (recolectorId?: number) => {
    setSelectedRecolectorId(recolectorId || null);
    await fetchEstadisticasQuery.refetch();
    setIsEstadisticasModalOpen(true);
    
    if (recolectorId) {
      await fetchReferidosQuery.refetch();
    } else {
      setReferidosData(null);
    }
  };

  const handleEstadoFiltroChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newEstado = e.target.value;
    setEstadoFiltro(newEstado);
    setMunicipioFiltro(""); // Resetear municipio al cambiar estado
    setCurrentPage(1);
  };

  // Función para mostrar mensajes
  const showMessage = (message: string, type = 'info') => {
    setMessageModalConfig({ message, type });
    setShowMessageModal(true);
  };
  
  // Función para cerrar el modal de mensaje
  const closeMessageModal = () => {
    setShowMessageModal(false);
  };

  // Función para descargar el archivo como blob
  const downloadBlobAsFile = (blob: Blob, fileName: string) => {
    try {
      // Crear URL para el blob
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      
      // Añadir a DOM, simular clic y eliminar
      document.body.appendChild(link);
      link.click();
      
      // Limpiar
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      // Indicar finalización
      setIsDownloading(false);
      setDownloadProgress(0);
      showMessage('Descarga completada con éxito', 'success');
    } catch (error) {
      console.error('Error al descargar el archivo:', error);
      setIsDownloading(false);
      setDownloadProgress(0);
      showMessage('Error al descargar el archivo. Inténtelo de nuevo.', 'error');
    }
  };

  const downloadReferidosExcel = async (recolectorId: number) => {
    const apiHost = await detectHost();
    if (!apiHost) {
      showMessage('No se pudo detectar el host del API. Verifique la configuración.', 'error');
      return;
    }
    
    try {
      setIsDownloading(true);
      setDownloadProgress(10);
      
      // Simular progreso de carga
      const progressInterval = setInterval(() => {
        setDownloadProgress(prev => {
          const newProgress = prev + 5;
          return newProgress >= 90 ? 90 : newProgress;
        });
      }, 300);

      const response = await fetch(`${apiHost}/api/recolector/referidos-excel/${recolectorId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      clearInterval(progressInterval);
      
      if (!response.ok) {
        throw new Error(`Error al descargar: ${response.status} ${response.statusText}`);
      }
      
      setDownloadProgress(95);
      
      const blob = await response.blob();
      setDownloadProgress(100);
      
      // Obtener nombre del recolector para personalizar el nombre del archivo
      const recolectorName = estadisticas && estadisticas.length > 0 
        ? (estadisticas.find(stat => stat.recolector_id === recolectorId)?.nombre || 'recolector')
        : 'recolector';
      
      const fileName = `referidos_${recolectorName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      downloadBlobAsFile(blob, fileName);
    } catch (error) {
      console.error('Error al descargar referidos:', error);
      setIsDownloading(false);
      setDownloadProgress(0);
      showMessage(`Error al descargar referidos: ${error instanceof Error ? error.message : 'Error desconocido'}`, 'error');
    }
  };

  const closeEstadisticasModal = () => {
    setIsEstadisticasModalOpen(false);
    setEstadisticas([]);
  };

  const openImportModal = () => {
    setImportModalIsOpen(true);
  };

  const closeImportModal = () => {
    setImportModalIsOpen(false);
    setSelectedFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setToastMessage("Por favor seleccione un archivo para importar");
      setToastType("error");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const result = await importarRecolectoresMutation.mutateAsync(formData);
      setToastMessage(`Importación completada: ${result.insertados} recolectores insertados, ${result.errores} errores. ${result.mensaje}`);
      setToastType("success");
      closeImportModal();
    } catch (error) {
      setToastMessage(`Error durante la importación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      setToastType("error");
    } finally {
      setIsUploading(false);
    }
  };

  // Reiniciar filtros
  const resetFilters = () => {
    setSearchTerm("");
    setEstadoFiltro("");
    setMunicipioFiltro("");
    setOrganizacionFiltro("");
    setCurrentPage(1);
  };

  // Funciones de manejo de cambios para nuevos filtros
  const handleMunicipioFiltroChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMunicipioFiltro(e.target.value);
    setCurrentPage(1);
  };

  const handleOrganizacionFiltroChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setOrganizacionFiltro(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="p-4">
      <h2>Control de Recolectores</h2>
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => openModal()} className="btn btn-primary mb-4">Crear Nuevo Recolector</button>
        <button onClick={() => fetchEstadisticas()} className="btn btn-secondary mb-4 ml-2">Ver Estadísticas Generales</button>
        <button onClick={openImportModal} className="btn btn-info mb-4 ml-2">Importar Recolectores</button>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-4">
        <div>
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="input input-bordered w-full"
          />
        </div>
        <div>
          <select
            value={estadoFiltro}
            onChange={handleEstadoFiltroChange}
            className="select select-bordered w-full"
            disabled={estadosLoading}
          >
            <option value="">Todos los estados</option>
            {estados.map(estado => (
              <option key={estado.codigo_estado} value={estado.codigo_estado}>
                {estado.estado}
              </option>
            ))}
          </select>
        </div>
        <div>
          <select
            value={municipioFiltro}
            onChange={handleMunicipioFiltroChange}
            className="select select-bordered w-full"
            disabled={municipiosLoading || !estadoFiltro}
          >
            <option value="">Todos los municipios</option>
            {municipiosData.map(municipio => (
              <option key={municipio.codigo_municipio} value={municipio.codigo_municipio}>
                {municipio.municipio}
              </option>
            ))}
          </select>
        </div>
        <div>
          <select
            value={organizacionFiltro}
            onChange={handleOrganizacionFiltroChange}
            className="select select-bordered w-full"
          >
            <option value="">Todas las organizaciones</option>
            {organizacionesPoliticas.map(org => (
              <option key={org.codigo} value={org.codigo}>
                {org.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <button 
            onClick={resetFilters} 
            className="btn btn-outline btn-sm w-full"
          >
            Limpiar filtros
          </button>
        </div>
      </div>
      
      <div className="pagination mb-4 flex justify-center">
        <button onClick={() => paginate(1)} className="btn btn-primary mr-1">{"<<"}</button>
        <button onClick={() => paginate(currentPage - 1)} className="btn btn-primary mr-1">{"<"}</button>
        <span className="btn btn-disabled mr-1">Página {currentPage} de {totalPages}</span>
        <button onClick={() => paginate(currentPage + 1)} className="btn btn-primary mr-1">{">"}</button>
        <button onClick={() => paginate(totalPages)} className="btn btn-primary">{">>"}</button>
      </div>

      {fetchRecolectoresQuery.isLoading ? (
        <div className="text-center p-4">Cargando recolectores...</div>
      ) : fetchRecolectoresQuery.isError ? (
        <div className="text-center p-4 text-red-500">Error al cargar recolectores</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table-auto w-full">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Cédula</th>
                <th>Teléfono</th>
                <th>Email</th>
                <th>Estado</th>
                <th>Municipio</th>
                <th>Organización</th>
                <th>Referido</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {(!recolectores || recolectores.length === 0) ? (
                <tr>
                  <td colSpan={10} className="text-center">No hay recolectores disponibles</td>
                </tr>
              ) : (
                recolectores.map((recolector) => {
                  if (!recolector) return null;
                  
                  // Buscar nombres descriptivos de forma segura
                  let estadoNombre = recolector.estado || '-';
                  let municipioNombre = recolector.municipio || '-';
                  let orgPoliticaNombre = recolector.organizacion_politica || '-';
                  
                  try {
                    // Encontrar el estado correspondiente de forma segura
                    const estadoObj = estados?.find(e => e && e.codigo_estado && 
                      e.codigo_estado.toString() === recolector.estado);
                    if (estadoObj?.estado) estadoNombre = estadoObj.estado;
                    
                    // Obtener los municipios del estado del recolector de forma segura
                    const municipiosDelEstado = recolector.estado && municipiosQueries && 
                      municipiosQueries[recolector.estado] 
                        ? municipiosQueries[recolector.estado] 
                        : [];
                    
                    // Encontrar el municipio correspondiente de forma segura
                    const municipioObj = municipiosDelEstado?.find(
                      m => m && m.codigo_municipio && 
                        m.codigo_municipio.toString() === recolector.municipio
                    );
                    if (municipioObj?.municipio) municipioNombre = municipioObj.municipio;
                    
                    // Encontrar la organización política de forma segura
                    const orgPolitica = organizacionesPoliticas?.find(
                      org => org && org.codigo === recolector.organizacion_politica
                    );
                    if (orgPolitica?.nombre) orgPoliticaNombre = orgPolitica.nombre;
                  } catch (error) {
                    console.error("Error al procesar datos descriptivos:", error);
                    // Ya tenemos valores por defecto, así que no es necesario hacer nada aquí
                  }
                  
                  return (
                    <tr key={recolector.id}>
                      <td>{recolector.id}</td>
                      <td>{recolector.nombre || '-'}</td>
                      <td>{recolector.cedula || '-'}</td>
                      <td>{recolector.telefono || '-'}</td>
                      <td>{recolector.email || '-'}</td>
                      <td>{estadoNombre}</td>
                      <td>{municipioNombre}</td>
                      <td>{orgPoliticaNombre}</td>
                      <td>{recolector.es_referido ? "Sí" : "No"}</td>
                      <td>
                        <button 
                          className="btn btn-primary btn-sm mr-2" 
                          onClick={() => openModal(recolector)}
                        >
                          Editar
                        </button>
                        <button 
                          className="btn btn-danger btn-sm mr-2" 
                          onClick={() => { 
                            setRecolectorToDelete(recolector.id); 
                            setIsConfirmationModalVisible(true); 
                          }}
                          disabled={deleteRecolectorMutation.isPending}
                        >
                          {deleteRecolectorMutation.isPending && recolectorToDelete === recolector.id 
                            ? "Eliminando..." 
                            : "Eliminar"
                          }
                        </button>
                        <button 
                          className="btn btn-info btn-sm" 
                          onClick={() => fetchEstadisticas(recolector.id)}
                        >
                          Ver Estadísticas
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {modalIsOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-button" onClick={closeModal}>×</button>
            <h2>{isEditing ? "Editar Recolector" : "Crear Recolector"}</h2>
            
            <div className="form-control mb-2">
              <label className="label">Nombre</label>
              <input
                type="text"
                placeholder="Nombre"
                value={isEditing && selectedRecolector ? selectedRecolector.nombre : newRecolector.nombre}
                onChange={(e) => {
                  if (isEditing && selectedRecolector) {
                    setSelectedRecolector({ ...selectedRecolector, nombre: e.target.value });
                  } else {
                    setNewRecolector({ ...newRecolector, nombre: e.target.value });
                  }
                }}
                className="input input-bordered w-full"
              />
            </div>
            
            <div className="form-control mb-2">
              <label className="label">Cédula</label>
              <input
                type="text"
                placeholder="Cédula"
                value={isEditing && selectedRecolector ? selectedRecolector.cedula : newRecolector.cedula}
                onChange={(e) => {
                  if (isEditing && selectedRecolector) {
                    setSelectedRecolector({ ...selectedRecolector, cedula: e.target.value });
                  } else {
                    setNewRecolector({ ...newRecolector, cedula: e.target.value });
                  }
                }}
                className="input input-bordered w-full"
              />
            </div>
            
            <div className="form-control mb-2">
              <label className="label">Teléfono</label>
              <input
                type="text"
                placeholder="Teléfono"
                value={isEditing && selectedRecolector ? selectedRecolector.telefono : newRecolector.telefono}
                onChange={(e) => {
                  if (isEditing && selectedRecolector) {
                    setSelectedRecolector({ ...selectedRecolector, telefono: e.target.value });
                  } else {
                    setNewRecolector({ ...newRecolector, telefono: e.target.value });
                  }
                }}
                className="input input-bordered w-full"
              />
            </div>
            
            {/* Nuevos campos */}
            <div className="form-control mb-2">
              <label className="label">Email</label>
              <input
                type="email"
                placeholder="Email"
                value={isEditing && selectedRecolector ? selectedRecolector.email || '' : newRecolector.email}
                onChange={(e) => {
                  if (isEditing && selectedRecolector) {
                    setSelectedRecolector({ ...selectedRecolector, email: e.target.value });
                  } else {
                    setNewRecolector({ ...newRecolector, email: e.target.value });
                  }
                }}
                className="input input-bordered w-full"
              />
            </div>
            
            <div className="form-control mb-2">
              <label className="label">Estado</label>
              <select
                value={isEditing && selectedRecolector ? selectedRecolector.estado || '' : newRecolector.estado}
                onChange={(e) => {
                  const newEstado = e.target.value;
                  if (isEditing && selectedRecolector) {
                    setSelectedRecolector({ 
                      ...selectedRecolector, 
                      estado: newEstado,
                      municipio: '' // Resetear municipio al cambiar estado
                    });
                  } else {
                    setNewRecolector({ 
                      ...newRecolector, 
                      estado: newEstado,
                      municipio: '' // Resetear municipio al cambiar estado
                    });
                  }
                }}
                className="select select-bordered w-full"
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
            
            <div className="form-control mb-2">
              <label className="label">Municipio</label>
              <select
                value={isEditing && selectedRecolector ? selectedRecolector.municipio || '' : newRecolector.municipio}
                onChange={(e) => {
                  if (isEditing && selectedRecolector) {
                    setSelectedRecolector({ ...selectedRecolector, municipio: e.target.value });
                  } else {
                    setNewRecolector({ ...newRecolector, municipio: e.target.value });
                  }
                }}
                className="select select-bordered w-full"
                disabled={municipiosLoading || !(isEditing ? selectedRecolector?.estado : newRecolector.estado)}
              >
                <option value="">Seleccione un municipio</option>
                {municipiosData.map(municipio => (
                  <option key={municipio.codigo_municipio} value={municipio.codigo_municipio}>
                    {municipio.municipio}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-control mb-2">
              <label className="label">Organización Política</label>
              <select
                value={isEditing && selectedRecolector ? selectedRecolector.organizacion_politica || '' : newRecolector.organizacion_politica}
                onChange={(e) => {
                  if (isEditing && selectedRecolector) {
                    setSelectedRecolector({ ...selectedRecolector, organizacion_politica: e.target.value });
                  } else {
                    setNewRecolector({ ...newRecolector, organizacion_politica: e.target.value });
                  }
                }}
                className="select select-bordered w-full"
              >
                <option value="">Seleccione una organización</option>
                {organizacionesPoliticas.map(org => (
                  <option key={org.codigo} value={org.codigo}>
                    {org.nombre}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-control mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isEditing && selectedRecolector ? selectedRecolector.es_referido : newRecolector.es_referido}
                  onChange={(e) => {
                    if (isEditing && selectedRecolector) {
                      setSelectedRecolector({ ...selectedRecolector, es_referido: e.target.checked });
                    } else {
                      setNewRecolector({ ...newRecolector, es_referido: e.target.checked });
                    }
                  }}
                  className="checkbox"
                />
                <span>Es Referido</span>
              </label>
            </div>
            
            <button 
              onClick={isEditing ? () => handleUpdate(selectedRecolector!) : handleCreate} 
              className="btn btn-primary w-full"
              disabled={isEditing ? updateRecolectorMutation.isPending : createRecolectorMutation.isPending}
            >
              {isEditing 
                ? (updateRecolectorMutation.isPending ? "Actualizando..." : "Actualizar Recolector") 
                : (createRecolectorMutation.isPending ? "Creando..." : "Crear Recolector")
              }
            </button>
          </div>
        </div>
      )}

      {toastMessage && (
        <Toast 
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage(null)}
        />
      )}
      {isConfirmationModalVisible && (
        <ConfirmationModal
          message="¿Estás seguro de que quieres eliminar este recolector?"
          onConfirm={handleDelete}
          onCancel={() => setIsConfirmationModalVisible(false)}
        />
      )}
      {isEstadisticasModalOpen && (
        <div className="modal-overlay" onClick={closeEstadisticasModal}>
          <div className="modal-content max-w-full w-11/12 lg:w-10/12 xl:w-9/12 p-6" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-button" onClick={closeEstadisticasModal}>×</button>
            <h2 className="text-xl font-bold mb-4">Estadísticas de Recolectores</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Filtrar por Estado:</label>
                <select
                  value={estadoFiltro}
                  onChange={handleEstadoFiltroChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  disabled={estadosLoading}
                >
                  <option value="">Todos los estados</option>
                  {estados.map(estado => (
                    <option key={estado.codigo_estado} value={estado.codigo_estado}>
                      {estado.estado}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Filtrar por Municipio:</label>
                <select
                  value={municipioFiltro}
                  onChange={handleMunicipioFiltroChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">Todos los municipios</option>
                  {municipios.map(municipio => (
                    <option key={municipio} value={municipio}>{municipio}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Filtrar por Organización:</label>
                <select
                  value={organizacionFiltro}
                  onChange={handleOrganizacionFiltroChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">Todas las organizaciones</option>
                  {organizacionesPoliticas.map(org => (
                    <option key={org.codigo} value={org.codigo}>{org.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              {fetchEstadisticasQuery.isLoading ? (
                <div className="text-center p-4">Cargando estadísticas...</div>
              ) : fetchEstadisticasQuery.isError ? (
                <div className="text-center p-4 text-red-500">Error al cargar estadísticas</div>
              ) : (
                <table className="table-auto w-full mb-4">
                  <thead>
                    <tr>
                      <th className="px-4 py-2">ID Recolector</th>
                      <th className="px-4 py-2">Nombre</th>
                      <th className="px-4 py-2">Cantidad de Tickets</th>
                      <th className="px-4 py-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estadisticas.length > 0 ? estadisticas.map((stat) => (
                      <tr key={stat.recolector_id} className={selectedRecolectorId === stat.recolector_id ? 'bg-blue-100' : ''}>
                        <td className="border px-4 py-2">{stat.recolector_id}</td>
                        <td className="border px-4 py-2">{stat.nombre}</td>
                        <td className="border px-4 py-2">{stat.tickets_count}</td>
                        <td className="border px-4 py-2">
                          <button 
                            onClick={() => fetchEstadisticas(stat.recolector_id)}
                            className="btn btn-sm btn-primary mr-2"
                          >
                            Ver Referidos
                          </button>
                          <button
                            onClick={() => downloadReferidosExcel(stat.recolector_id)}
                            className="btn btn-sm btn-secondary"
                            disabled={isDownloading}
                          >
                            {isDownloading ? 
                              <span className="flex items-center">
                                <span className="mr-2">Descargando...</span>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              </span> 
                              : 'Descargar Excel'
                            }
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={4} className="border px-4 py-2 text-center">No hay estadísticas disponibles</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {referidosData && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">
                  Referidos de {referidosData.recolector.nombre}
                  <span className="text-sm text-gray-600 ml-2">
                    (Total: {referidosData.recolector.total_referidos})
                  </span>
                </h3>
                <div className="overflow-x-auto">
                  {fetchReferidosQuery.isLoading ? (
                    <div className="text-center p-4">Cargando referidos...</div>
                  ) : fetchReferidosQuery.isError ? (
                    <div className="text-center p-4 text-red-500">Error al cargar referidos</div>
                  ) : (
                    <table className="table-auto w-full">
                      <thead>
                        <tr>
                          <th className="px-4 py-2">Cédula</th>
                          <th className="px-4 py-2">Nombre</th>
                          <th className="px-4 py-2">Teléfono</th>
                          <th className="px-4 py-2">Estado</th>
                          <th className="px-4 py-2">Municipio</th>
                          <th className="px-4 py-2">Parroquia</th>
                          <th className="px-4 py-2">Fecha Registro</th>
                        </tr>
                      </thead>
                      <tbody>
                        {referidosData.referidos.length > 0 ? referidosData.referidos.map((referido) => (
                          <tr key={referido.id}>
                            <td className="border px-4 py-2">{referido.cedula}</td>
                            <td className="border px-4 py-2">{referido.nombre}</td>
                            <td className="border px-4 py-2">{referido.telefono}</td>
                            <td className="border px-4 py-2">{referido.estado}</td>
                            <td className="border px-4 py-2">{referido.municipio}</td>
                            <td className="border px-4 py-2">{referido.parroquia}</td>
                            <td className="border px-4 py-2">{new Date(referido.fecha_registro).toLocaleDateString()}</td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={7} className="border px-4 py-2 text-center">No hay referidos disponibles</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {showMessageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className={`bg-white rounded-lg p-6 max-w-lg w-full shadow-lg ${
            messageModalConfig.type === 'error' 
              ? 'border-l-4 border-red-500' 
              : messageModalConfig.type === 'success'
                ? 'border-l-4 border-green-500'
                : 'border-l-4 border-blue-500'
          }`}>
            <div className="flex items-start">
              {messageModalConfig.type === 'error' && (
                <svg className="w-6 h-6 text-red-500 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              )}
              {messageModalConfig.type === 'success' && (
                <svg className="w-6 h-6 text-green-500 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              )}
              {messageModalConfig.type === 'info' && (
                <svg className="w-6 h-6 text-blue-500 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              )}
              <div className="flex-1">
                <h3 className={`text-lg font-medium ${
                  messageModalConfig.type === 'error' 
                    ? 'text-red-800' 
                    : messageModalConfig.type === 'success'
                      ? 'text-green-800'
                      : 'text-blue-800'
                }`}>
                  {messageModalConfig.type === 'error' 
                    ? 'Error' 
                    : messageModalConfig.type === 'success'
                      ? 'Éxito'
                      : 'Información'}
                </h3>
                <p className="mt-2 text-sm text-gray-700">{messageModalConfig.message}</p>
                <div className="mt-4">
                  <button
                    type="button"
                    className={`inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-${
                      messageModalConfig.type === 'error' 
                        ? 'red' 
                        : messageModalConfig.type === 'success'
                          ? 'green'
                          : 'blue'
                    }-600 border border-transparent rounded-md hover:bg-${
                      messageModalConfig.type === 'error' 
                        ? 'red' 
                        : messageModalConfig.type === 'success'
                          ? 'green'
                          : 'blue'
                    }-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-${
                      messageModalConfig.type === 'error' 
                        ? 'red' 
                        : messageModalConfig.type === 'success'
                          ? 'green'
                          : 'blue'
                    }-500`}
                    onClick={closeMessageModal}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Indicador de progreso de descarga */}
      {isDownloading && downloadProgress > 0 && (
        <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg z-50">
          <h4 className="font-bold mb-2">Descargando archivo</h4>
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
      {/* Modal de importación de recolectores */}
      {importModalIsOpen && (
        <div className="modal-overlay" onClick={closeImportModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-button" onClick={closeImportModal}>×</button>
            <h2>Importar Recolectores</h2>
            <form onSubmit={handleImportSubmit}>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Seleccione un archivo Excel (.xlsx) o CSV (.csv) que contenga los recolectores a importar.
                  <br />
                  El archivo debe tener las columnas: <strong>nombre</strong>, <strong>cedula</strong>, <strong>telefono</strong> 
                  y opcionalmente <strong>es_referido</strong>.
                </p>
                <label className="block text-sm font-medium text-gray-700 mb-1">Archivo</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="w-full p-2 border rounded"
                />
                {selectedFile && (
                  <p className="mt-1 text-sm text-green-600">
                    Archivo seleccionado: {selectedFile.name}
                  </p>
                )}
              </div>
              <div className="flex justify-end space-x-2">
                <button 
                  type="button" 
                  onClick={closeImportModal}
                  className="btn btn-outline"
                  disabled={isUploading}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={isUploading || !selectedFile}
                >
                  {isUploading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Importando...
                    </span>
                  ) : "Importar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecolectorControl;
