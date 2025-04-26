/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import React, {
  useState, useEffect, useRef, useCallback, useMemo,
} from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import Toast from '../toast/Toast';
import ConfirmationModal from '../confirmation/ConfirmationModal';

import { detectHost } from '../../api';
import { useEstados } from '../../hooks/useEstados';
import { useMunicipios } from '../../hooks/useMunicipios';
import { useOrganizacionesPoliticas } from '../../hooks/useOrganizacionesPoliticas';
import { useImportarRecolectores, useRecolectorByCedula } from '../../hooks/useRecolectores';
import { useElectorSimpleByCedula } from '../../hooks/useElectores';

/* -------------------------------------------------------------------------- */
/*                                 Tipos                                      */
/* -------------------------------------------------------------------------- */
interface Recolector {
  id: number;
  nombre: string;
  cedula: string;
  telefono: string;
  email?: string;
  estado?: string;
  municipio?: string;
  organizacion_politica?: string;
  es_referido: boolean;
}

interface Estadistica {
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
  recolector: { id: number; nombre: string; total_referidos: number };
  referidos: Referido[];
}

interface QueryRecolectoresResponse {
  items: Recolector[];
  total: number;
}

/* -------------------------------------------------------------------------- */
/*                               Componente                                   */
/* -------------------------------------------------------------------------- */
const RecolectorControl: React.FC = () => {
  /* ----------------------------- estados UI ----------------------------- */
  const [apiHost, setApiHost] = useState<string>('');
  const [toast, setToast] = useState<{ msg: string; type: 'info' | 'success' | 'error' }>({ msg: '', type: 'info' });
  const [confirmation, setConfirmation] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
  const [modalRecolector, setModalRecolector] = useState<{ open: boolean; editing: boolean; data: Partial<Recolector> }>({
    open: false, editing: false, data: {},
  });
  const [modalStats, setModalStats] = useState<boolean>(false);
  const [modalImport, setModalImport] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [downloading, setDownloading] = useState<boolean>(false);
  
  // Estado para el botón de exportar
  const [exporting, setExporting] = useState<boolean>(false);

  /* ------------------------- filtros y paginación ----------------------- */
  const [page, setPage] = useState<number>(1);
  const PER_PAGE = 10;

  const [filters, setFilters] = useState({
    search: '', estado: '', municipio: '', organizacion: '',
  });

  /* ------------------------------ hooks API ----------------------------- */
  const qc = useQueryClient();
  const { data: estados = [] } = useEstados();
  const { data: municipios = [] } = useMunicipios(filters.estado);
  const { data: organizaciones = [] } = useOrganizacionesPoliticas();

  /* -------------------- Recolectores (principal) ------------------------ */
  const { data: recolectoresResp, isLoading: loadingRecolectores, isError: errorRecolectores } = useQuery({
    queryKey: ['recolectores', page, filters],
    enabled: Boolean(apiHost),
    queryFn: async () => {
      const params = new URLSearchParams({
        skip: ((page - 1) * PER_PAGE).toString(),
        limit: PER_PAGE.toString(),
        ...(filters.search && { search: filters.search }),
      });
      
      // Convertir códigos a descripciones para filtrar
      if (filters.estado) {
        const estadoObj = estados.find(e => e.codigo_estado.toString() === filters.estado);
        if (estadoObj) {
          params.append('estado', estadoObj.estado);
        }
      }
      
      if (filters.municipio) {
        const municipioObj = municipios.find(m => m.codigo_municipio.toString() === filters.municipio);
        if (municipioObj) {
          params.append('municipio', municipioObj.municipio);
        }
      }
      
      if (filters.organizacion) {
        params.append('organizacion_politica', filters.organizacion);
      }

      const res = await fetch(`${apiHost}/api/recolectores?${params}`);
      if (!res.ok) throw new Error('Error al obtener recolectores');
      return res.json() as Promise<QueryRecolectoresResponse>;
    },
    staleTime: 60_000,
  });

  /* ----------------------- Estadísticas y referidos --------------------- */
  const [selectedRecolectorId, setSelectedRecolectorId] = useState<number | null>(null);
  const { data: estadisticas = [], refetch: refetchEstadisticas, isLoading: loadingStats } = useQuery({
    queryKey: ['estadisticas', selectedRecolectorId, filters.estado],
    enabled: false,
    queryFn: async () => {
      const params = new URLSearchParams({
        ...(selectedRecolectorId ? { recolector_id: selectedRecolectorId.toString() } : {}),
      });
      
      // Usar la descripción del estado en lugar del código
      if (filters.estado) {
        const estadoObj = estados.find(e => e.codigo_estado.toString() === filters.estado);
        if (estadoObj) {
          params.append('codigo_estado', filters.estado);
        }
      }
      
      const res = await fetch(`${apiHost}/api/recolectores/estadisticas/?${params}`);
      if (!res.ok) throw new Error('Error al obtener estadísticas');
      return res.json() as Promise<Estadistica[]>;
    },
  });

  const { data: referidosData, refetch: refetchReferidos, isLoading: loadingReferidos } = useQuery({
    queryKey: ['referidos', selectedRecolectorId, filters.estado],
    enabled: false,
    queryFn: async () => {
      if (!selectedRecolectorId) return null;
      
      // Construir parámetros con el formato exacto requerido por la API
      const params = new URLSearchParams();
      if (filters.estado) {
        // Buscamos el estado por su código para obtener su nombre
        const estadoObj = estados.find(e => e.codigo_estado.toString() === filters.estado);
        if (estadoObj) {
          // El nombre del estado ya viene con el formato "EDO. NOMBREESTADO", usarlo directamente
          params.append('estado', estadoObj.estado);
        }
      }
      
      console.log(`API call: Obteniendo referidos para recolector ID: ${selectedRecolectorId}`);
      console.log('URL de consulta:', `${apiHost}/api/recolectores/${selectedRecolectorId}/referidos?${params}`);
      
      const res = await fetch(`${apiHost}/api/recolectores/${selectedRecolectorId}/referidos?${params}`);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Error respuesta API:', errorText);
        throw new Error('Error al obtener referidos');
      }
      
      const data = await res.json();
      console.log('Datos referidos recibidos:', data);
      return data as ReferidosData;
    },
  });

  /* --------------------------- Mutaciones ------------------------------- */
  const createMut = useMutation({
    mutationFn: async (payload: Partial<Recolector>) => {
      const res = await fetch(`${apiHost}/api/recolectores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(res.statusText);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recolectores'] });
      closeRecolectorModal();
      fireToast('Recolector creado', 'success');
    },
    onError: () => fireToast('Error al crear recolector', 'error'),
  });

  const updateMut = useMutation({
    mutationFn: async (payload: Recolector) => {
      const res = await fetch(`${apiHost}/api/recolectores/${payload.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(res.statusText);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recolectores'] });
      closeRecolectorModal();
      fireToast('Recolector actualizado', 'success');
    },
    onError: () => fireToast('Error al actualizar recolector', 'error'),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${apiHost}/api/recolectores/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(res.statusText);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recolectores'] });
      setConfirmation({ open: false, id: null });
      fireToast('Recolector eliminado', 'success');
    },
    onError: () => fireToast('Error al eliminar recolector', 'error'),
  });

  const importarRecolectoresMut = useImportarRecolectores();

  /* ------------------------- Efectos iniciales -------------------------- */
  useEffect(() => {
    detectHost()
      .then(setApiHost)
      .catch(() => setApiHost(process.env.NEXT_PUBLIC_API_URL || ''));
  }, []);

  /* -------------------------------------------------------------------------- */
  /*                               Callbacks                                     */
  /* -------------------------------------------------------------------------- */
  const fireToast = (msg: string, type: 'info' | 'success' | 'error' = 'info') =>
    setToast({ msg, type });

  const [cedulaInput, setCedulaInput] = useState<string>('');
  const [showFullForm, setShowFullForm] = useState<boolean>(false);

  const { data: recolectorData, isLoading: loadingRecolector } = useRecolectorByCedula(
    cedulaInput.length >= 6 ? cedulaInput : ''
  );

  const { data: electorData, isLoading: loadingElector } = useElectorSimpleByCedula(
    !recolectorData && cedulaInput.length >= 6 ? cedulaInput : ''
  );

  const buscarPorCedula = () => {
    if (cedulaInput.length < 6) {
      fireToast('La cédula debe tener al menos 6 dígitos', 'error');
      return;
    }
    
    if (recolectorData) {
      setModalRecolector({
        open: true,
        editing: true,
        data: {
          ...recolectorData,
          estado: estados.find(e => e.estado === recolectorData.estado)?.codigo_estado.toString() || '',
          municipio: municipios.find(m => m.municipio === recolectorData.municipio)?.codigo_municipio.toString() || '',
        }
      });
      setShowFullForm(true);
    } else if (electorData) {
      setModalRecolector({
        open: true,
        editing: false,
        data: {
          nombre: electorData.nombre,
          cedula: cedulaInput,
          estado: electorData.codigoEstado?.toString() || '',
          municipio: electorData.codigoMunicipio?.toString() || '',
          telefono: '',
          es_referido: false
        }
      });
      setShowFullForm(true);
    } else {
      fireToast('Esta cédula no está registrada en el sistema', 'error');
    }
  };

  const openRecolectorModal = (rec?: Recolector) => {
    if (rec) {
      setModalRecolector({ 
        open: true, 
        editing: true, 
        data: {
          ...rec,
          estado: estados.find(e => e.estado === rec.estado)?.codigo_estado.toString() || '',
          municipio: municipios.find(m => m.municipio === rec.municipio)?.codigo_municipio.toString() || '',
        } 
      });
      setShowFullForm(true);
    } else {
      setModalRecolector({ open: true, editing: false, data: {} });
      setCedulaInput('');
      setShowFullForm(false);
    }
  };

  const closeRecolectorModal = () => {
    setModalRecolector({ open: false, editing: false, data: {} });
    setCedulaInput('');
    setShowFullForm(false);
  };

  const handleSaveRecolector = () => {
    const payload = { ...modalRecolector.data } as Recolector;

    /* Transformar códigos en nombres antes de enviar */
    const estadoObj = estados.find((e) => e.codigo_estado.toString() === payload.estado);
    const municipioObj = municipios.find((m) => m.codigo_municipio.toString() === payload.municipio);
    const orgObj = organizaciones.find((o) => o.nombre === payload.organizacion_politica);

    payload.estado = estadoObj?.estado || payload.estado;
    payload.municipio = municipioObj?.municipio || payload.municipio;
    payload.organizacion_politica = orgObj?.nombre || payload.organizacion_politica;

    modalRecolector.editing ? updateMut.mutate(payload) : createMut.mutate(payload);
  };

  const openStatsModal = async (recolectorId: number, recolector?: Recolector) => {
    if (!recolectorId) {
      fireToast('Debe seleccionar un recolector', 'error');
      return;
    }
    
    console.log(`Abriendo modal para recolector ID: ${recolectorId}`);
    setSelectedRecolectorId(recolectorId);
    
    // Si tenemos los datos del recolector, seleccionamos su estado automáticamente
    if (recolector?.estado) {
      console.log('Preseleccionando estado:', recolector.estado);
      
      // Buscar el código del estado a partir del nombre
      const estadoObj = estados.find(e => e.estado === recolector.estado);
      if (estadoObj) {
        // Actualizar el filtro con el código del estado
        setFilters(prev => ({
          ...prev,
          estado: estadoObj.codigo_estado.toString()
        }));
      }
    }
    
    setModalStats(true);
    
    try {
      // Cargar los referidos con un pequeño retraso para asegurar que el filtro se actualice
      setTimeout(async () => {
        await refetchReferidos();
      }, 100);
    } catch (error) {
      console.error('Error al cargar referidos:', error);
      fireToast('Error al cargar los referidos', 'error');
    }
  };

  const downloadReferidosExcel = async (recolectorId: number) => {
    setDownloading(true);
    try {
      // Crear una URL con los parámetros - CORRIGIENDO ENDPOINT
      const url = `${apiHost}/api/download/excel/recolector-referidos/${recolectorId}`;
      console.log('URL de descarga directa:', url);
      
      // Abrir en una nueva pestaña para descargar
      window.open(url, '_blank');
      
      fireToast('Descarga iniciada', 'success');
    } catch (err) {
      fireToast(`Error al descargar: ${(err as Error).message}`, 'error');
    } finally {
      setDownloading(false);
    }
  };

  // Función para exportar referidos de un recolector específico
  const exportarReferidosDetalles = async (recolectorId: number) => {
    if (!recolectorId || !referidosData) return;
    
    try {
      // Crear una URL con los parámetros - CORRIGIENDO ENDPOINT
      let url = `${apiHost}/api/download/excel/recolector-referidos/${recolectorId}`;
      
      // Agregar filtros si existen
      if (filters.estado) {
        const estadoObj = estados.find(e => e.codigo_estado.toString() === filters.estado);
        if (estadoObj) {
          url += `?estado=${encodeURIComponent(estadoObj.estado)}`;
        }
      }
      
      console.log('URL de exportación:', url);
      
      // Abrir en una nueva pestaña para descargar directamente
      window.open(url, '_blank');
      
      fireToast('Descarga iniciada', 'success');
    } catch (err) {
      fireToast(`Error al iniciar descarga: ${(err as Error).message}`, 'error');
    }
  };

  // Función para exportar recolectores según los filtros actuales
  const exportarRecolectores = async () => {
    try {
      // NOTA: No existe un endpoint específico para descargar recolectores en Excel
      // Creamos una solicitud al API normal de recolectores con limit=9999 para obtener todos
      let url = `${apiHost}/api/recolectores?limit=9999`;
      
      // Agregar parámetros como cadena de consulta
      const params = [];
      
      if (filters.search) {
        params.push(`search=${encodeURIComponent(filters.search)}`);
      }
      
      if (filters.estado) {
        const estadoObj = estados.find(e => e.codigo_estado.toString() === filters.estado);
        if (estadoObj) {
          params.push(`estado=${encodeURIComponent(estadoObj.estado)}`);
        }
      }
      
      if (filters.municipio) {
        const municipioObj = municipios.find(m => m.codigo_municipio.toString() === filters.municipio);
        if (municipioObj) {
          params.push(`municipio=${encodeURIComponent(municipioObj.municipio)}`);
        }
      }
      
      if (filters.organizacion) {
        params.push(`organizacion_politica=${encodeURIComponent(filters.organizacion)}`);
      }
      
      // Agregar los parámetros a la URL
      if (params.length > 0) {
        url += `&${params.join('&')}`;
      }
      
      console.log('URL de exportación completa:', url);
      
      // Descargar directamente en nueva pestaña
      window.open(url, '_blank');
      
      fireToast('Consulta iniciada. Por favor, use las herramientas del navegador para exportar a Excel', 'info');
    } catch (err) {
      fireToast(`Error al iniciar descarga: ${(err as Error).message}`, 'error');
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                              Render helpers                                 */
  /* -------------------------------------------------------------------------- */
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((recolectoresResp?.total ?? 0) / PER_PAGE)),
    [recolectoresResp?.total],
  );

  const renderSelect = (
    name: keyof typeof filters,
    items: { value: string; label: string }[],
    extra?: { disabled?: boolean },
  ) => (
    <select
      name={name}
      value={filters[name]}
      onChange={(e) => {
        const { value } = e.target;
        setFilters((f) => ({ ...f, [name]: value, ...(name === 'estado' ? { municipio: '' } : {}) }));
        setPage(1);
      }}
      className="select select-bordered w-full"
      {...extra}
    >
      <option value="">Todos</option>
      {items.map(({ value, label }) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );

  /* -------------------------------------------------------------------------- */
  /*                                   UI                                       */
  /* -------------------------------------------------------------------------- */
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Control de Recolectores</h2>

      {/* Acciones principales */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => openRecolectorModal()} className="btn btn-primary">
          Nuevo Recolector
        </button>
        <button 
          onClick={exportarRecolectores} 
          className="btn btn-success" 
          disabled={exporting}
        >
          {exporting ? 'Exportando...' : 'Exportar Excel'}
        </button>
        <button onClick={() => setModalImport(true)} className="btn btn-info">
          Importar
        </button>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-4">
        <input
          name="search"
          placeholder="Buscar..."
          value={filters.search}
          onChange={(e) => {
            setFilters((f) => ({ ...f, search: e.target.value }));
            setPage(1);
          }}
          className="input input-bordered w-full"
        />

        {renderSelect(
          'estado',
          estados.map((e) => ({ value: e.codigo_estado.toString(), label: e.estado })),
        )}

        {renderSelect(
          'municipio',
          municipios.map((m) => ({ value: m.codigo_municipio.toString(), label: m.municipio })),
          { disabled: !filters.estado },
        )}

        {renderSelect(
          'organizacion',
          organizaciones.map((o) => ({ value: o.nombre, label: o.nombre })),
        )}

        <button
          onClick={() => {
            setFilters({ search: '', estado: '', municipio: '', organizacion: '' });
            setPage(1);
          }}
          className="btn btn-outline"
        >
          Limpiar
        </button>
      </div>

      {/* Tabla de recolectores */}
      {loadingRecolectores ? (
        <div>Cargando...</div>
      ) : errorRecolectores ? (
        <div className="text-red-500">Error al cargar</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                {[
                  'ID', 'Nombre', 'Cédula', 'Teléfono', 'Email',
                  'Estado', 'Municipio', 'Org. Pol.', 'Referido', 'Acciones',
                ].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recolectoresResp?.items.length ? (
                recolectoresResp.items.map((r) => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>{r.nombre}</td>
                    <td>{r.cedula}</td>
                    <td>{r.telefono}</td>
                    <td>{r.email ?? '-'}</td>
                    <td>{r.estado ?? '-'}</td>
                    <td>{r.municipio ?? '-'}</td>
                    <td>{r.organizacion_politica ?? '-'}</td>
                    <td>{r.es_referido ? 'Sí' : 'No'}</td>
                    <td className="flex gap-1 flex-wrap">
                      <button onClick={() => openRecolectorModal(r)} className="btn btn-sm">
                        Editar
                      </button>
                      <button
                        onClick={() => setConfirmation({ open: true, id: r.id })}
                        className="btn btn-sm btn-danger"
                      >
                        Eliminar
                      </button>
                      <button
                        onClick={() => openStatsModal(r.id, r)}
                        className="btn btn-sm btn-info"
                      >
                        Ver Referidos
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="text-center">
                    Sin datos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginación */}
      <div className="flex justify-center gap-2 mt-4">
        {['«', '‹'].map((s, i) => (
          <button
            key={s}
            onClick={() => setPage((p) => Math.max(1, p - (i === 0 ? p - 1 : 1)))}
            className="btn"
            disabled={page === 1}
          >
            {s}
          </button>
        ))}
        <span className="btn btn-disabled">
          Página {page} de {totalPages}
        </span>
        {['›', '»'].map((s, i) => (
          <button
            key={s}
            onClick={() => setPage((p) => Math.min(totalPages, p + (i === 1 ? totalPages - p : 1)))}
            className="btn"
            disabled={page === totalPages}
          >
            {s}
          </button>
        ))}
      </div>

      {/* ----------------------- MODAL Recolector ------------------------ */}
      {modalRecolector.open && (
        <div className="modal-overlay" onClick={closeRecolectorModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{modalRecolector.editing ? 'Editar' : 'Crear'} Recolector</h3>

            {!showFullForm ? (
              <div>
                <div className="form-control mt-2">
                  <label>Cédula</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={cedulaInput}
                      onChange={(e) => setCedulaInput(e.target.value)}
                      className="input flex-1"
                      placeholder="Ingrese la cédula"
                    />
                    <button 
                      onClick={buscarPorCedula} 
                      className="btn"
                      disabled={loadingRecolector || loadingElector || cedulaInput.length < 6}
                    >
                      {loadingRecolector || loadingElector ? (
                        <span className="animate-spin">⟳</span>
                      ) : (
                        'Buscar'
                      )}
                    </button>
                  </div>
                  {loadingRecolector || loadingElector ? (
                    <p className="text-sm text-gray-500 mt-2">Buscando...</p>
                  ) : cedulaInput.length >= 6 && !recolectorData && !electorData ? (
                    <p className="text-sm text-red-500 mt-2">Esta cédula no está registrada en el sistema</p>
                  ) : null}
                </div>
                
                <div className="mt-4 flex justify-end">
                  <button onClick={closeRecolectorModal} className="btn mr-2">Cancelar</button>
                </div>
              </div>
            ) : (
              <div>
                {(['nombre', 'cedula', 'telefono', 'email'] as Array<keyof Recolector>).map((key) => (
                  <div className="form-control mt-2" key={key}>
                    <label>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                    <input
                      type={key === 'email' ? 'email' : 'text'}
                      value={modalRecolector.data[key]?.toString() ?? ''}
                      onChange={(e) =>
                        setModalRecolector((m) => ({ ...m, data: { ...m.data, [key]: e.target.value } }))
                      }
                      className="input"
                      disabled={key === 'cedula' || (key === 'nombre' && Boolean(electorData))}
                    />
                  </div>
                ))}

                {/* Estado, Municipio, Org */}
                <div className="form-control mt-2">
                  <label>Estado</label>
                  <select
                    value={modalRecolector.data.estado ?? ''}
                    onChange={(e) =>
                      setModalRecolector((m) => ({
                        ...m,
                        data: { ...m.data, estado: e.target.value, municipio: '' },
                      }))
                    }
                    className="select"
                  >
                    <option value="">Seleccione</option>
                    {estados.map((e) => (
                      <option key={e.codigo_estado} value={e.codigo_estado}>
                        {e.estado}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-control mt-2">
                  <label>Municipio</label>
                  <select
                    value={modalRecolector.data.municipio ?? ''}
                    onChange={(e) =>
                      setModalRecolector((m) => ({
                        ...m,
                        data: { ...m.data, municipio: e.target.value },
                      }))
                    }
                    className="select"
                    disabled={!modalRecolector.data.estado}
                  >
                    <option value="">Seleccione</option>
                    {municipios.map((m) => (
                      <option key={m.codigo_municipio} value={m.codigo_municipio}>
                        {m.municipio}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-control mt-2">
                  <label>Organización Política</label>
                  <select
                    value={modalRecolector.data.organizacion_politica ?? ''}
                    onChange={(e) =>
                      setModalRecolector((m) => ({
                        ...m,
                        data: { ...m.data, organizacion_politica: e.target.value },
                      }))
                    }
                    className="select"
                  >
                    <option value="">Seleccione</option>
                    {organizaciones.map((o) => (
                      <option key={o.id} value={o.nombre}>
                        {o.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-control mt-2">
                  <label className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={modalRecolector.data.es_referido ?? false}
                      onChange={(e) =>
                        setModalRecolector((m) => ({
                          ...m,
                          data: { ...m.data, es_referido: e.target.checked },
                        }))
                      }
                      className="checkbox" 
                    />
                    Es referido
                  </label>
                </div>

                <button onClick={handleSaveRecolector} className="btn btn-primary w-full mt-4">
                  {modalRecolector.editing ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ----------------------- MODAL Confirmación ----------------------- */}
      {confirmation.open && (
        <ConfirmationModal
          message="¿Eliminar recolector?"
          onConfirm={() => confirmation.id && deleteMut.mutate(confirmation.id)}
          onCancel={() => setConfirmation({ open: false, id: null })}
        />
      )}

      {/* ----------------------- MODAL Estadísticas ----------------------- */}
      {modalStats && selectedRecolectorId && (
        <div className="modal-overlay" onClick={() => setModalStats(false)}>
          <div className="modal-content w-11/12 h-5/6 max-w-screen-xl overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Referidos del Recolector</h2>
              <button 
                onClick={() => setModalStats(false)} 
                className="btn btn-sm btn-circle"
              >
                ×
              </button>
            </div>

            {/* Filtro adicional por estado dentro del modal */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Filtrar por Estado:</label>
              {renderSelect(
                'estado',
                estados.map((e) => ({ value: e.codigo_estado.toString(), label: e.estado })),
              )}
            </div>

            {/* Referidos */}
            {loadingReferidos ? (
              <div className="p-4 text-center">Cargando datos...</div>
            ) : referidosData ? (
              <>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">
                    Referidos de {referidosData.recolector.nombre} (Total:{' '}
                    {referidosData.recolector.total_referidos})
                  </h3>
                  <button
                    onClick={() => exportarReferidosDetalles(selectedRecolectorId)}
                    className="btn btn-sm btn-success"
                    disabled={downloading}
                  >
                    {downloading ? 'Exportando...' : 'Exportar Referidos'}
                  </button>
                </div>
                
                <div className="overflow-x-auto max-h-96">
                  <table className="table w-full">
                    <thead>
                      <tr>
                        {[
                          'Cédula',
                          'Nombre',
                          'Teléfono',
                          'Estado',
                          'Municipio',
                          'Parroquia',
                          'Fecha',
                        ].map((h) => (
                          <th key={h}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {referidosData.referidos.length ? (
                        referidosData.referidos.map((r) => (
                          <tr key={r.id}>
                            <td>{r.cedula}</td>
                            <td>{r.nombre}</td>
                            <td>{r.telefono}</td>
                            <td>{r.estado}</td>
                            <td>{r.municipio}</td>
                            <td>{r.parroquia}</td>
                            <td>{new Date(r.fecha_registro).toLocaleDateString()}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="text-center">
                            Este recolector no tiene referidos
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="p-4 text-center">No se encontraron datos</div>
            )}
            
            <div className="flex justify-end mt-4">
              <button 
                onClick={() => setModalStats(false)} 
                className="btn"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------- MODAL Importación ------------------------- */}
      {modalImport && (
        <ImportRecolectoresModal
          onClose={() => setModalImport(false)}
          importarMut={importarRecolectoresMut}
          onFinish={() => qc.invalidateQueries({ queryKey: ['recolectores'] })}
        />
      )}

      {/* ------------------------- Toast global --------------------------- */}
      {toast.msg && (
        <Toast message={toast.msg} type={toast.type} onClose={() => setToast((t) => ({ ...t, msg: '' }))} />
      )}

      {/* ---------------- Indicador descarga ---------------- */}
      {downloading && (
        <div className="fixed bottom-4 right-4 bg-white p-3 rounded shadow">
          Descargando… {downloadProgress}%
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                Modal de importación (separado para claridad)               */
/* -------------------------------------------------------------------------- */
const ImportRecolectoresModal: React.FC<{
  onClose: () => void;
  importarMut: ReturnType<typeof useImportarRecolectores>;
  onFinish: () => void;
}> = ({ onClose, importarMut, onFinish }) => {
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await importarMut.mutateAsync(formData);
      alert(`Importación exitosa: ${res.insertados} insertados, ${res.errores} errores`);
      onFinish();
      onClose();
    } catch (err) {
      alert(`Error al importar: ${(err as Error).message}`);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Importar Recolectores</h3>
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.csv"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="file-input"
          />
          <div className="mt-4 flex gap-2 justify-end">
            <button type="button" className="btn" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={!file || importarMut.isPending}>
              {importarMut.isPending ? 'Importando…' : 'Importar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecolectorControl;
