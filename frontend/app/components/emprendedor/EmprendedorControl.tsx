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
import { useElectorSimpleByCedula } from '../../hooks/useElectores';
import { 
  useEmprendedores,
  useCreateEmprendedor,
  useUpdateEmprendedor,
  useDeleteEmprendedor,
  useCheckEmprendedorExistsByCedula,
  useEmprendedorByCedula,
  useElectorDataForEmprendedor
} from '../../hooks/useEmprededores';

/* -------------------------------------------------------------------------- */
/*                                 Tipos                                      */
/* -------------------------------------------------------------------------- */
interface Emprendedor {
  id: number;
  cedula: string;
  nombre_apellido: string;
  rif?: string;
  nombre_emprendimiento: string;
  telefono: string;
  estado?: string;
  municipio?: string;
  created_at?: string;
  updated_at?: string;
}

interface QueryEmprendedoresResponse {
  items: Emprendedor[];
  total: number;
}

/* -------------------------------------------------------------------------- */
/*                               Componente                                   */
/* -------------------------------------------------------------------------- */
const EmprendedorControl: React.FC = () => {
  /* ----------------------------- estados UI ----------------------------- */
  const [apiHost, setApiHost] = useState<string>('');
  const [toast, setToast] = useState<{ msg: string; type: 'info' | 'success' | 'error' }>({ msg: '', type: 'info' });
  const [confirmation, setConfirmation] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
  const [modalEmprendedor, setModalEmprendedor] = useState<{ open: boolean; editing: boolean; data: Partial<Emprendedor> }>({
    open: false, editing: false, data: {},
  });
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [downloading, setDownloading] = useState<boolean>(false);
  
  // Estado para el botón de exportar
  const [exporting, setExporting] = useState<boolean>(false);

  /* ------------------------- filtros y paginación ----------------------- */
  const [page, setPage] = useState<number>(1);
  const PER_PAGE = 10;

  const [filters, setFilters] = useState({
    search: '', estado: '', municipio: ''
  });

  /* ------------------------------ hooks API ----------------------------- */
  const qc = useQueryClient();
  const { data: estados = [] } = useEstados();
  const { data: municipios = [] } = useMunicipios(modalEmprendedor.open ? modalEmprendedor.data.estado?.toString() || '' : filters.estado);

  /* -------------------- Emprendedores (principal) ------------------------ */
  const { data: emprendedoresResp, isLoading: loadingEmprendedores, isError: errorEmprendedores } = useEmprendedores({
    currentPage: page,
    emprendedoresPerPage: PER_PAGE,
    searchTerm: filters.search,
    estado: filters.estado ? estados.find(e => e.codigo_estado.toString() === filters.estado)?.estado : '',
    municipio: filters.municipio ? municipios.find(m => m.codigo_municipio.toString() === filters.municipio)?.municipio : ''
  });
  
  /* --------------------------- Mutaciones ------------------------------- */
  const createMutation = useCreateEmprendedor();
  const updateMutation = useUpdateEmprendedor();
  const deleteMutation = useDeleteEmprendedor();

  // Funciones con callbacks para manejar éxito y error
  const createMut = {
    mutate: (payload: Partial<Emprendedor>) => {
      // Asegurarse de que el payload cumple con los requisitos de EmprendedorCreatePayload
      if (!payload.cedula || !payload.nombre_apellido || !payload.nombre_emprendimiento || !payload.telefono) {
        fireToast('Faltan datos obligatorios', 'error');
        return;
      }
      
      const validPayload = {
        cedula: payload.cedula,
        nombre_apellido: payload.nombre_apellido,
        nombre_emprendimiento: payload.nombre_emprendimiento,
        telefono: payload.telefono,
        rif: payload.rif,
        estado: payload.estado,
        municipio: payload.municipio
      };
      
      createMutation.mutate(validPayload, {
        onSuccess: () => {
          closeEmprendedorModal();
          fireToast('Emprendedor creado', 'success');
        },
        onError: () => fireToast('Error al crear emprendedor', 'error')
      });
    }
  };

  const updateMut = {
    mutate: (payload: Emprendedor) => {
      // Extraer los campos que pueden cambiar para el UpdatePayload
      const updatePayload = {
        cedula: payload.cedula,
        nombre_apellido: payload.nombre_apellido,
        rif: payload.rif,
        nombre_emprendimiento: payload.nombre_emprendimiento,
        telefono: payload.telefono,
        estado: payload.estado,
        municipio: payload.municipio
      };
      
      updateMutation.mutate({ 
        emprendedorId: payload.id, 
        payload: updatePayload 
      }, {
        onSuccess: () => {
          closeEmprendedorModal();
          fireToast('Emprendedor actualizado', 'success');
        },
        onError: () => fireToast('Error al actualizar emprendedor', 'error')
      });
    }
  };

  const deleteMut = {
    mutate: (id: number) => {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          setConfirmation({ open: false, id: null });
          fireToast('Emprendedor eliminado', 'success');
        },
        onError: () => fireToast('Error al eliminar emprendedor', 'error')
      });
    }
  };

  /* ------------------------- Efectos iniciales -------------------------- */
  useEffect(() => {
    detectHost()
      .then(setApiHost)
      .catch(() => setApiHost(process.env.NEXT_PUBLIC_API_URL || ''));
  }, []);

  // Efecto para actualizar el estado de municipios cuando se cambia el estado en el modal
  useEffect(() => {
    if (modalEmprendedor.open && modalEmprendedor.data.estado) {
      // Forzar la recarga de municipios cuando se cambia el estado en el modal
      qc.invalidateQueries({ queryKey: ['municipios', modalEmprendedor.data.estado.toString()] });
    }
  }, [modalEmprendedor.data.estado, modalEmprendedor.open, qc]);

  /* -------------------------------------------------------------------------- */
  /*                               Callbacks                                     */
  /* -------------------------------------------------------------------------- */
  const fireToast = (msg: string, type: 'info' | 'success' | 'error' = 'info') =>
    setToast({ msg, type });

  const [cedulaInput, setCedulaInput] = useState<string>('');
  const [showFullForm, setShowFullForm] = useState<boolean>(false);

  const { data: emprendedorData, isLoading: loadingEmprendedor } = useEmprendedorByCedula(
    cedulaInput.length >= 6 ? cedulaInput : ''
  );

  const { data: electorData, isLoading: loadingElector } = useElectorDataForEmprendedor(
    !emprendedorData && cedulaInput.length >= 6 ? cedulaInput : ''
  );

  const buscarPorCedula = () => {
    if (cedulaInput.length < 6) {
      fireToast('La cédula debe tener al menos 6 dígitos', 'error');
      return;
    }
    
    if (emprendedorData) {
      setModalEmprendedor({
        open: true,
        editing: true,
        data: {
          ...emprendedorData,
          estado: estados.find(e => e.estado === emprendedorData.estado)?.codigo_estado.toString() || '',
          municipio: municipios.find(m => m.municipio === emprendedorData.municipio)?.codigo_municipio.toString() || '',
        }
      });
      setShowFullForm(true);
    } else if (electorData) {
      setModalEmprendedor({
        open: true,
        editing: false,
        data: {
          nombre_apellido: electorData.nombre_apellido,
          cedula: cedulaInput,
          estado: estados.find(e => e.estado === electorData.estado)?.codigo_estado.toString() || '',
          municipio: municipios.find(m => m.municipio === electorData.municipio)?.codigo_municipio.toString() || '',
          telefono: '',
          nombre_emprendimiento: '',
          rif: ''
        }
      });
      setShowFullForm(true);
    } else {
      fireToast('Esta cédula no está registrada en el sistema', 'error');
    }
  };

  const openEmprendedorModal = (emp?: Emprendedor) => {
    if (emp) {
      setModalEmprendedor({ 
        open: true, 
        editing: true, 
        data: {
          ...emp,
          estado: estados.find(e => e.estado === emp.estado)?.codigo_estado.toString() || '',
          municipio: municipios.find(m => m.municipio === emp.municipio)?.codigo_municipio.toString() || '',
        } 
      });
      setShowFullForm(true);
    } else {
      setModalEmprendedor({ open: true, editing: false, data: {} });
      setCedulaInput('');
      setShowFullForm(false);
    }
  };

  const closeEmprendedorModal = () => {
    setModalEmprendedor({ open: false, editing: false, data: {} });
    setCedulaInput('');
    setShowFullForm(false);
  };

  const handleSaveEmprendedor = () => {
    const payload = { ...modalEmprendedor.data } as Emprendedor;

    /* Transformar códigos en nombres antes de enviar */
    const estadoObj = estados.find((e) => e.codigo_estado.toString() === payload.estado);
    const municipioObj = municipios.find((m) => m.codigo_municipio.toString() === payload.municipio);

    payload.estado = estadoObj?.estado || payload.estado;
    payload.municipio = municipioObj?.municipio || payload.municipio;

    modalEmprendedor.editing ? updateMut.mutate(payload) : createMut.mutate(payload);
  };

  // Función para exportar emprendedores según los filtros actuales
  const exportarEmprendedores = async () => {
    try {
      setExporting(true);
      // Construir la URL base con el endpoint correcto
      let url = `${apiHost}/api/download/excel/emprendedores`;
      
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
      
      // Agregar los parámetros a la URL
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }
      
      console.log('URL de exportación completa:', url);
      
      // Descargar directamente en nueva pestaña
      window.open(url, '_blank');
      
      fireToast('Descarga iniciada', 'success');
    } catch (err) {
      fireToast(`Error al iniciar descarga: ${(err as Error).message}`, 'error');
    } finally {
      setExporting(false);
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                              Render helpers                                 */
  /* -------------------------------------------------------------------------- */
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((emprendedoresResp?.total ?? 0) / PER_PAGE)),
    [emprendedoresResp?.total],
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
      <h2 className="text-xl font-bold mb-4">Control de Emprendedores</h2>

      {/* Acciones principales */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => openEmprendedorModal()} className="btn btn-primary">
          Nuevo Emprendedor
        </button>
        <button 
          onClick={exportarEmprendedores} 
          className="btn btn-success" 
          disabled={exporting}
        >
          {exporting ? 'Exportando...' : 'Exportar Excel'}
        </button>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4">
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

        <button
          onClick={() => {
            setFilters({ search: '', estado: '', municipio: '' });
            setPage(1);
          }}
          className="btn btn-outline"
        >
          Limpiar
        </button>
      </div>

      {/* Tabla de emprendedores */}
      {loadingEmprendedores ? (
        <div>Cargando...</div>
      ) : errorEmprendedores ? (
        <div className="text-red-500">Error al cargar</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cédula</th>
                <th>Nombre y Apellido</th>
                <th>RIF</th>
                <th>Nombre Emprendimiento</th>
                <th>Teléfono</th>
                <th>Estado</th>
                <th>Municipio</th>
                <th>Fecha Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {emprendedoresResp?.items.length ? (
                emprendedoresResp.items.map((e) => (
                  <tr key={e.id}>
                    <td>{e.id}</td>
                    <td>{e.cedula}</td>
                    <td>{e.nombre_apellido}</td>
                    <td>{e.rif ?? '-'}</td>
                    <td>{e.nombre_emprendimiento}</td>
                    <td>{e.telefono}</td>
                    <td>{e.estado ?? '-'}</td>
                    <td>{e.municipio ?? '-'}</td>
                    <td>{e.created_at ? new Date(e.created_at).toLocaleDateString() : '-'}</td>
                    <td className="flex gap-1 flex-wrap">
                      <button onClick={() => openEmprendedorModal(e)} className="btn btn-sm">
                        Editar
                      </button>
                      <button
                        onClick={() => setConfirmation({ open: true, id: e.id })}
                        className="btn btn-sm btn-danger"
                      >
                        Eliminar
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

      {/* ----------------------- MODAL Emprendedor ------------------------ */}
      {modalEmprendedor.open && (
        <div className="modal-overlay" onClick={closeEmprendedorModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{modalEmprendedor.editing ? 'Editar' : 'Crear'} Emprendedor</h3>

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
                      disabled={loadingEmprendedor || loadingElector || cedulaInput.length < 6}
                    >
                      {loadingEmprendedor || loadingElector ? (
                        <span className="animate-spin">⟳</span>
                      ) : (
                        'Buscar'
                      )}
                    </button>
                  </div>
                  {loadingEmprendedor || loadingElector ? (
                    <p className="text-sm text-gray-500 mt-2">Buscando...</p>
                  ) : cedulaInput.length >= 6 && !emprendedorData && !electorData ? (
                    <p className="text-sm text-red-500 mt-2">Esta cédula no está registrada en el sistema</p>
                  ) : null}
                </div>
                
                <div className="mt-4 flex justify-end">
                  <button onClick={closeEmprendedorModal} className="btn mr-2">Cancelar</button>
                </div>
              </div>
            ) : (
              <div>
                <div className="form-control mt-2">
                  <label>Cédula</label>
                  <input
                    type="text"
                    value={modalEmprendedor.data.cedula?.toString() ?? ''}
                    onChange={(e) => setModalEmprendedor((m) => ({ ...m, data: { ...m.data, cedula: e.target.value } }))}
                    className="input"
                    disabled={true} // Cédula no se puede editar una vez buscada
                  />
                </div>
                
                <div className="form-control mt-2">
                  <label>Nombre y Apellido</label>
                  <input
                    type="text"
                    value={modalEmprendedor.data.nombre_apellido?.toString() ?? ''}
                    onChange={(e) => setModalEmprendedor((m) => ({ ...m, data: { ...m.data, nombre_apellido: e.target.value } }))}
                    className="input"
                    disabled={Boolean(electorData)} // No editable si viene de elector
                  />
                </div>
                
                <div className="form-control mt-2">
                  <label>RIF</label>
                  <input
                    type="text"
                    value={modalEmprendedor.data.rif?.toString() ?? ''}
                    onChange={(e) => setModalEmprendedor((m) => ({ ...m, data: { ...m.data, rif: e.target.value } }))}
                    className="input"
                  />
                </div>
                
                <div className="form-control mt-2">
                  <label>Nombre del Emprendimiento</label>
                  <input
                    type="text"
                    value={modalEmprendedor.data.nombre_emprendimiento?.toString() ?? ''}
                    onChange={(e) => setModalEmprendedor((m) => ({ ...m, data: { ...m.data, nombre_emprendimiento: e.target.value } }))}
                    className="input"
                    required
                  />
                </div>
                
                <div className="form-control mt-2">
                  <label>Teléfono</label>
                  <input
                    type="text"
                    value={modalEmprendedor.data.telefono?.toString() ?? ''}
                    onChange={(e) => setModalEmprendedor((m) => ({ ...m, data: { ...m.data, telefono: e.target.value } }))}
                    className="input"
                    required
                  />
                </div>

                {/* Estado, Municipio */}
                <div className="form-control mt-2">
                  <label>Estado</label>
                  <select
                    value={modalEmprendedor.data.estado ?? ''}
                    onChange={(e) =>
                      setModalEmprendedor((m) => ({
                        ...m,
                        data: { ...m.data, estado: e.target.value.toString(), municipio: '' },
                      }))
                    }
                    className="select"
                  >
                    <option value="">Seleccione</option>
                    {estados.map((e) => (
                      <option key={e.codigo_estado} value={e.codigo_estado.toString()}>
                        {e.estado}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-control mt-2">
                  <label>Municipio</label>
                  <select
                    value={modalEmprendedor.data.municipio ?? ''}
                    onChange={(e) =>
                      setModalEmprendedor((m) => ({
                        ...m,
                        data: { ...m.data, municipio: e.target.value.toString() },
                      }))
                    }
                    className="select"
                    disabled={!modalEmprendedor.data.estado}
                  >
                    <option value="">Seleccione</option>
                    {municipios
                      .filter(m => {
                        // Si no hay estado seleccionado, no filtrar
                        if (!modalEmprendedor.data.estado) return false;
                        
                        // Solo mostrar municipios si tenemos estado seleccionado
                        return true;
                      })
                      .map((m) => (
                        <option key={m.codigo_municipio} value={m.codigo_municipio.toString()}>
                          {m.municipio}
                        </option>
                      ))}
                  </select>
                </div>

                <button 
                  onClick={handleSaveEmprendedor} 
                  className="btn btn-primary w-full mt-4"
                  disabled={!modalEmprendedor.data.nombre_apellido || !modalEmprendedor.data.nombre_emprendimiento || !modalEmprendedor.data.telefono}
                >
                  {modalEmprendedor.editing ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ----------------------- MODAL Confirmación ----------------------- */}
      {confirmation.open && (
        <ConfirmationModal
          message="¿Eliminar emprendedor?"
          onConfirm={() => confirmation.id && deleteMut.mutate(confirmation.id)}
          onCancel={() => setConfirmation({ open: false, id: null })}
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

export default EmprendedorControl;
