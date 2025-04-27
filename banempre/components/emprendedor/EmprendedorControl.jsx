/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import React, {
  useState, useEffect, useRef, useCallback, useMemo,
} from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';

import Toast from '../Toast';
import ConfirmationModal from '../confirmation/ConfirmationModal';

import { useEstados } from '../../hooks/useEstados';
import { useMunicipios } from '../../hooks/useMunicipios';
import { useElectorSimpleByCedula } from '../../hooks/useElectores';
import { 
  useCreateEmprendedor,
  useUpdateEmprendedor,
  useDeleteEmprendedor,
  useEmprendedorByCedula,
  useElectorDataForEmprendedor,
  useEmprendedores
} from '../../hooks/useEmprededores';

/* -------------------------------------------------------------------------- */
/*                               Componente                                   */
/* -------------------------------------------------------------------------- */
const EmprendedorControl = () => {
  const router = useRouter();
  const { logout, user } = useAuth();
  
  /* ----------------------------- estados UI ----------------------------- */
  const [toast, setToast] = useState({ msg: '', type: 'info' });
  const [confirmation, setConfirmation] = useState({ open: false, id: null });
  const [modalEmprendedor, setModalEmprendedor] = useState({
    open: false, editing: false, data: {},
  });
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloading, setDownloading] = useState(false);
  
  // Estado para el botón de exportar
  const [exporting, setExporting] = useState(false);
  
  // Estado para menú móvil
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  /* ------------------------- filtros y paginación ----------------------- */
  const [page, setPage] = useState(1);
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
    searchTerm: filters.search || undefined,
    estado: filters.estado || undefined,
    municipio: filters.municipio || undefined
  });

  /* --------------------------- Mutaciones ------------------------------- */
  const createMut = useCreateEmprendedor();
  const updateMut = useUpdateEmprendedor();
  const deleteMut = useDeleteEmprendedor();

  /* ------------------------- Efectos iniciales -------------------------- */
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
  const fireToast = (msg, type = 'info') =>
    setToast({ msg, type });

  const handleLogout = () => {
    logout();
    router.push('/dashboard');
  };

  const [cedulaInput, setCedulaInput] = useState('');
  const [showFullForm, setShowFullForm] = useState(false);

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

  const openEmprendedorModal = (emp) => {
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
    const payload = { ...modalEmprendedor.data };

    /* Transformar códigos en nombres antes de enviar */
    const estadoObj = estados.find((e) => e.codigo_estado.toString() === payload.estado);
    const municipioObj = municipios.find((m) => m.codigo_municipio.toString() === payload.municipio);

    payload.estado = estadoObj?.estado || payload.estado;
    payload.municipio = municipioObj?.municipio || payload.municipio;

    if (modalEmprendedor.editing) {
      updateMut.mutate({ emprendedorId: payload.id, payload });
      closeEmprendedorModal();
      fireToast('Emprendedor actualizado', 'success');
    } else {
      createMut.mutate(payload, {
        onSuccess: () => {
          closeEmprendedorModal();
          fireToast('Emprendedor creado', 'success');
        },
        onError: () => {
          fireToast('Error al crear emprendedor', 'error');
        }
      });
    }
  };

  // Función para exportar emprendedores según los filtros actuales
  const exportarEmprendedores = async () => {
    try {
      setExporting(true);
      
      const estadoObj = filters.estado ? estados.find(e => e.codigo_estado.toString() === filters.estado) : null;
      const municipioObj = filters.municipio ? municipios.find(m => m.codigo_municipio.toString() === filters.municipio) : null;
      
      const searchParams = new URLSearchParams();
      if (filters.search) searchParams.append('search', filters.search);
      if (estadoObj) searchParams.append('estado', estadoObj.estado);
      if (municipioObj) searchParams.append('municipio', municipioObj.municipio);
      
      // Usar ventana para abrir la URL de descarga
      const host = await import('../../api').then(mod => mod.detectHost());
      window.open(`${host}/api/download/excel/emprendedores?${searchParams.toString()}`, '_blank');
      
      fireToast('Descarga iniciada', 'success');
    } catch (err) {
      fireToast(`Error al iniciar descarga: ${err.message}`, 'error');
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
    name,
    items,
    extra,
  ) => (
    <select
      name={name}
      value={filters[name]}
      onChange={(e) => {
        const { value } = e.target;
        setFilters((f) => ({ ...f, [name]: value, ...(name === 'estado' ? { municipio: '' } : {}) }));
        setPage(1);
      }}
      className="select select-bordered w-full bg-white text-gray-800 border-golden"
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
    <div className="flex flex-col min-h-screen bg-banempre">
      {/* Navbar */}
      <header className="bg-golden text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          {/* Logo y nombre */}
          <div className="flex items-center">
            <Image 
              src="/logo bamempre.png" 
              alt="Banempre" 
              width={180} 
              height={40} 
              className="mr-2"
              priority
            />
          </div>
          
          {/* Menú desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center text-sm">
              <span className="mr-2">Bienvenido, {user?.username || 'Administrador'}</span>
              <button 
                onClick={handleLogout}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-full transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
          
          {/* Botón móvil */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
        
        {/* Menú móvil */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-golden-dark text-white py-2 px-4">
            <div className="flex flex-col space-y-2">
              <span>Bienvenido, {user?.username || 'Administrador'}</span>
              <button 
                onClick={handleLogout}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-full transition-colors w-full"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Contenido principal */}
      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="bg-white bg-opacity-90 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b-2 border-golden pb-2">Control de Emprendedores</h2>

          {/* Acciones principales */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button 
              onClick={() => openEmprendedorModal()} 
              className="btn bg-blue-600 hover:bg-blue-700 text-white border-0"
            >
              Nuevo Emprendedor
            </button>
            <button 
              onClick={exportarEmprendedores} 
              className="btn bg-golden hover:bg-golden-dark text-white border-0" 
              disabled={exporting}
            >
              {exporting ? 'Exportando...' : 'Exportar Excel'}
            </button>
          </div>

          {/* Filtros */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">Filtros</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Búsqueda</label>
                <input
                  name="search"
                  placeholder="Buscar por nombre, cédula..."
                  value={filters.search}
                  onChange={(e) => {
                    setFilters((f) => ({ ...f, search: e.target.value }));
                    setPage(1);
                  }}
                  className="input input-bordered w-full bg-white border-gray-300 focus:border-golden focus:ring-1 focus:ring-golden"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                {renderSelect(
                  'estado',
                  estados.map((e) => ({ value: e.codigo_estado.toString(), label: e.estado })),
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Municipio</label>
                {renderSelect(
                  'municipio',
                  municipios.map((m) => ({ value: m.codigo_municipio.toString(), label: m.municipio })),
                  { disabled: !filters.estado },
                )}
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilters({ search: '', estado: '', municipio: '' });
                    setPage(1);
                  }}
                  className="btn btn-outline border-gray-300 hover:bg-gray-100 hover:border-gray-400 text-gray-700 w-full"
                >
                  Limpiar Filtros
                </button>
              </div>
            </div>
          </div>

          {/* Tabla de emprendedores */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {loadingEmprendedores ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-golden mx-auto"></div>
                <p className="mt-2 text-gray-600">Cargando...</p>
              </div>
            ) : errorEmprendedores ? (
              <div className="p-8 text-center text-red-500">Error al cargar los datos. Intente nuevamente.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead className="bg-golden-light text-gray-800">
                    <tr>
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">Cédula</th>
                      <th className="px-4 py-3">Nombre y Apellido</th>
                      <th className="px-4 py-3">RIF</th>
                      <th className="px-4 py-3">Nombre Emprendimiento</th>
                      <th className="px-4 py-3">Teléfono</th>
                      <th className="px-4 py-3">Estado</th>
                      <th className="px-4 py-3">Municipio</th>
                      <th className="px-4 py-3">Registro</th>
                      <th className="px-4 py-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emprendedoresResp?.items?.length ? (
                      emprendedoresResp.items.map((e) => (
                        <tr key={e.id} className="hover:bg-gray-50 border-b border-gray-200">
                          <td className="px-4 py-3">{e.id}</td>
                          <td className="px-4 py-3">{e.cedula}</td>
                          <td className="px-4 py-3 font-medium">{e.nombre_apellido}</td>
                          <td className="px-4 py-3">{e.rif ?? '-'}</td>
                          <td className="px-4 py-3">{e.nombre_emprendimiento}</td>
                          <td className="px-4 py-3">{e.telefono}</td>
                          <td className="px-4 py-3">{e.estado ?? '-'}</td>
                          <td className="px-4 py-3">{e.municipio ?? '-'}</td>
                          <td className="px-4 py-3">{e.created_at ? new Date(e.created_at).toLocaleDateString() : '-'}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1 flex-wrap">
                              <button 
                                onClick={() => openEmprendedorModal(e)} 
                                className="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white border-0"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => setConfirmation({ open: true, id: e.id })}
                                className="btn btn-sm bg-red-600 hover:bg-red-700 text-white border-0"
                              >
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={10} className="text-center py-8 text-gray-500">
                          No hay emprendedores que coincidan con los criterios de búsqueda
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Paginación */}
          <div className="flex justify-center gap-2 mt-6">
            {['«', '‹'].map((s, i) => (
              <button
                key={s}
                onClick={() => setPage((p) => Math.max(1, p - (i === 0 ? p - 1 : 1)))}
                className={`btn border-gray-300 ${page === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                disabled={page === 1}
              >
                {s}
              </button>
            ))}
            <span className="btn bg-golden text-white hover:bg-golden-dark">
              Página {page} de {totalPages}
            </span>
            {['›', '»'].map((s, i) => (
              <button
                key={s}
                onClick={() => setPage((p) => Math.min(totalPages, p + (i === 1 ? totalPages - p : 1)))}
                className={`btn border-gray-300 ${page === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                disabled={page === totalPages}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-golden-dark text-white text-center py-4 mt-auto">
        <p className="text-sm">© {new Date().getFullYear()} Banempre - Banco de los Emprendedores</p>
      </footer>

      {/* ----------------------- MODAL Emprendedor ------------------------ */}
      {modalEmprendedor.open && (
        <div className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={closeEmprendedorModal}>
          <div className="modal-content bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800 border-b-2 border-golden pb-2">
                {modalEmprendedor.editing ? 'Editar' : 'Crear'} Emprendedor
              </h3>

              {!showFullForm ? (
                <div>
                  <div className="form-control mt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cédula</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={cedulaInput}
                        onChange={(e) => setCedulaInput(e.target.value)}
                        className="input flex-1 border-gray-300 focus:border-golden focus:ring-1 focus:ring-golden"
                        placeholder="Ingrese la cédula"
                      />
                      <button 
                        onClick={buscarPorCedula} 
                        className="btn bg-blue-600 hover:bg-blue-700 text-white border-0"
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
                  
                  <div className="mt-6 flex justify-end">
                    <button 
                      onClick={closeEmprendedorModal} 
                      className="btn bg-gray-600 hover:bg-gray-700 text-white border-0"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cédula</label>
                      <input
                        type="text"
                        value={modalEmprendedor.data.cedula?.toString() ?? ''}
                        onChange={(e) => setModalEmprendedor((m) => ({ ...m, data: { ...m.data, cedula: e.target.value } }))}
                        className="input w-full border-gray-300 bg-gray-100"
                        disabled={true} // Cédula no se puede editar una vez buscada
                      />
                    </div>
                    
                    <div className="form-control">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre y Apellido</label>
                      <input
                        type="text"
                        value={modalEmprendedor.data.nombre_apellido?.toString() ?? ''}
                        onChange={(e) => setModalEmprendedor((m) => ({ ...m, data: { ...m.data, nombre_apellido: e.target.value } }))}
                        className={`input w-full ${Boolean(electorData) ? 'bg-gray-100' : 'border-gray-300 focus:border-golden focus:ring-1 focus:ring-golden'}`}
                        disabled={Boolean(electorData)} // No editable si viene de elector
                      />
                    </div>
                    
                    <div className="form-control">
                      <label className="block text-sm font-medium text-gray-700 mb-1">RIF</label>
                      <input
                        type="text"
                        value={modalEmprendedor.data.rif?.toString() ?? ''}
                        onChange={(e) => setModalEmprendedor((m) => ({ ...m, data: { ...m.data, rif: e.target.value } }))}
                        className="input w-full border-gray-300 focus:border-golden focus:ring-1 focus:ring-golden"
                      />
                    </div>
                    
                    <div className="form-control">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Emprendimiento <span className="text-red-600">*</span></label>
                      <input
                        type="text"
                        value={modalEmprendedor.data.nombre_emprendimiento?.toString() ?? ''}
                        onChange={(e) => setModalEmprendedor((m) => ({ ...m, data: { ...m.data, nombre_emprendimiento: e.target.value } }))}
                        className="input w-full border-gray-300 focus:border-golden focus:ring-1 focus:ring-golden"
                        required
                      />
                    </div>
                    
                    <div className="form-control">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono <span className="text-red-600">*</span></label>
                      <input
                        type="text"
                        value={modalEmprendedor.data.telefono?.toString() ?? ''}
                        onChange={(e) => setModalEmprendedor((m) => ({ ...m, data: { ...m.data, telefono: e.target.value } }))}
                        className="input w-full border-gray-300 focus:border-golden focus:ring-1 focus:ring-golden"
                        required
                      />
                    </div>

                    <div className="form-control">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                      <select
                        value={modalEmprendedor.data.estado ?? ''}
                        onChange={(e) =>
                          setModalEmprendedor((m) => ({
                            ...m,
                            data: { ...m.data, estado: e.target.value.toString(), municipio: '' },
                          }))
                        }
                        className="select w-full border-gray-300 focus:border-golden focus:ring-1 focus:ring-golden"
                      >
                        <option value="">Seleccione</option>
                        {estados.map((e) => (
                          <option key={e.codigo_estado} value={e.codigo_estado.toString()}>
                            {e.estado}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-control">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Municipio</label>
                      <select
                        value={modalEmprendedor.data.municipio ?? ''}
                        onChange={(e) =>
                          setModalEmprendedor((m) => ({
                            ...m,
                            data: { ...m.data, municipio: e.target.value.toString() },
                          }))
                        }
                        className="select w-full border-gray-300 focus:border-golden focus:ring-1 focus:ring-golden"
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
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button 
                      onClick={closeEmprendedorModal} 
                      className="btn bg-gray-600 hover:bg-gray-700 text-white border-0"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={handleSaveEmprendedor} 
                      className="btn bg-golden hover:bg-golden-dark text-white border-0"
                      disabled={!modalEmprendedor.data.nombre_apellido || !modalEmprendedor.data.nombre_emprendimiento || !modalEmprendedor.data.telefono}
                    >
                      {modalEmprendedor.editing ? 'Actualizar' : 'Crear'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ----------------------- MODAL Confirmación ----------------------- */}
      {confirmation.open && (
        <ConfirmationModal
          message="¿Está seguro que desea eliminar este emprendedor? Esta acción no se puede deshacer."
          onConfirm={() => {
            if (confirmation.id) {
              deleteMut.mutate(confirmation.id, {
                onSuccess: () => {
                  setConfirmation({ open: false, id: null });
                  fireToast('Emprendedor eliminado correctamente', 'success');
                },
                onError: () => {
                  fireToast('Error al eliminar emprendedor', 'error');
                }
              });
            }
          }}
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
