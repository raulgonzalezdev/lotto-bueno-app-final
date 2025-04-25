/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useState, useEffect, useMemo } from "react";
import Toast from '../toast/Toast';
// Importar los hooks de React Query
import {
    useOrganizacionesPoliticas,
    useCreateOrganizacionPolitica,
    useUpdateOrganizacionPolitica,
    useDeleteOrganizacionPolitica
} from "../../hooks/useOrganizacionesPoliticas";

interface OrganizacionPolitica {
  id: number;
  nombre: string;
  codigo: string | null;
  descripcion: string | null;
  activo: boolean;
}

const OrganizacionPoliticaControl: React.FC = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedOrganizacion, setSelectedOrganizacion] = useState<Partial<OrganizacionPolitica> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({ 
    nombre: "", 
    codigo: "", 
    descripcion: "",
    activo: true 
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');

  const { 
    data: organizaciones = [],
    isLoading: isLoadingOrganizaciones,
    isError: isErrorOrganizaciones,
    error: errorOrganizaciones
  } = useOrganizacionesPoliticas();

  const createOrganizacionMutation = useCreateOrganizacionPolitica();
  const updateOrganizacionMutation = useUpdateOrganizacionPolitica();
  const deleteOrganizacionMutation = useDeleteOrganizacionPolitica();

  const filteredOrganizaciones = useMemo(() => {
    if (!organizaciones) return [];
    
    return organizaciones.filter(org => 
      org.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (org.codigo && org.codigo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (org.descripcion && org.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [organizaciones, searchTerm]);

  useEffect(() => {
    if (isErrorOrganizaciones && errorOrganizaciones) {
      setToastMessage(errorOrganizaciones.message || "Error cargando las organizaciones políticas.");
      setToastType("error");
    }
  }, [isErrorOrganizaciones, errorOrganizaciones]);

  useEffect(() => {
    if (isEditing && selectedOrganizacion) {
      setFormData({ 
        nombre: selectedOrganizacion.nombre || "", 
        codigo: selectedOrganizacion.codigo || "", 
        descripcion: selectedOrganizacion.descripcion || "",
        activo: selectedOrganizacion.activo !== undefined ? selectedOrganizacion.activo : true
      });
    } else {
      setFormData({ nombre: "", codigo: "", descripcion: "", activo: true });
    }
  }, [isEditing, selectedOrganizacion]);

  const openModal = (organizacion: OrganizacionPolitica | null = null) => {
    if (organizacion) {
      setSelectedOrganizacion(organizacion);
      setIsEditing(true);
    } else {
      setSelectedOrganizacion(null);
      setIsEditing(false);
      setFormData({ nombre: "", codigo: "", descripcion: "", activo: true });
    }
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedOrganizacion(null);
    setIsEditing(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDelete = (id: number) => {
    deleteOrganizacionMutation.mutate(id, {
      onSuccess: () => {
        setToastMessage("Organización política eliminada exitosamente");
        setToastType("success");
      },
      onError: (error) => {
        setToastMessage(error.message || "Error al eliminar la organización política.");
        setToastType("error");
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.nombre.trim()) {
      setToastMessage("El nombre de la organización es obligatorio");
      setToastType("error");
      return;
    }

    if (isEditing && selectedOrganizacion?.id) {
      updateOrganizacionMutation.mutate({ 
        id: selectedOrganizacion.id, 
        payload: formData 
      }, {
        onSuccess: () => {
          setToastMessage("Organización política actualizada exitosamente");
          setToastType("success");
          closeModal();
        },
        onError: (error) => {
          setToastMessage(error.message || "Error al actualizar la organización política.");
          setToastType("error");
        }
      });
    } else {
      createOrganizacionMutation.mutate(formData, {
        onSuccess: () => {
          setToastMessage("Organización política creada exitosamente");
          setToastType("success");
          closeModal();
        },
        onError: (error) => {
          setToastMessage(error.message || "Error al crear la organización política.");
          setToastType("error");
        }
      });
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Gestión de Organizaciones Políticas</h2>
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => openModal()} className="btn btn-primary">Crear Nueva Organización</button>
      </div>
      <input
        type="text"
        placeholder="Buscar organización..."
        value={searchTerm}
        onChange={handleSearchChange}
        className="input input-bordered w-full mb-4"
      />
      {isLoadingOrganizaciones && <p>Cargando organizaciones políticas...</p>}
      {isErrorOrganizaciones && <p className="text-red-500">Error al cargar organizaciones políticas.</p>}
      
      <div className="overflow-x-auto">
        <table className="table-auto w-full mb-4">
          <thead>
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Código</th>
              <th className="px-4 py-2">Descripción</th>
              <th className="px-4 py-2">Estado</th>
              <th className="px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrganizaciones.map((org) => (
              <tr key={org.id} className={!org.activo ? "opacity-50" : ""}>
                <td className="border px-4 py-2">{org.id}</td>
                <td className="border px-4 py-2">{org.nombre}</td>
                <td className="border px-4 py-2">{org.codigo || "-"}</td>
                <td className="border px-4 py-2">{org.descripcion || "-"}</td>
                <td className="border px-4 py-2">
                  <span className={`px-2 py-1 rounded ${org.activo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {org.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="border px-4 py-2">
                  <button 
                    className="btn btn-sm btn-primary mr-2" 
                    onClick={() => openModal(org)} 
                    disabled={createOrganizacionMutation.isPending || updateOrganizacionMutation.isPending}
                  >
                    Editar
                  </button>
                  <button 
                    className="btn btn-sm btn-danger" 
                    onClick={() => handleDelete(org.id)} 
                    disabled={deleteOrganizacionMutation.isPending}
                  >
                    {deleteOrganizacionMutation.isPending && deleteOrganizacionMutation.variables === org.id 
                      ? "Eliminando..." 
                      : "Eliminar"}
                  </button>
                </td>
              </tr>
            ))}
            {filteredOrganizaciones.length === 0 && !isLoadingOrganizaciones && (
              <tr>
                <td colSpan={6} className="border px-4 py-2 text-center">
                  No hay organizaciones políticas que coincidan con la búsqueda
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalIsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                {isEditing ? "Editar Organización Política" : "Crear Nueva Organización Política"}
              </h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleFormChange}
                  required
                  className="input input-bordered w-full"
                  placeholder="Ej: PV, AD, COPEI, etc."
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
                <input
                  type="text"
                  name="codigo"
                  value={formData.codigo}
                  onChange={handleFormChange}
                  className="input input-bordered w-full"
                  placeholder="Ej: PRIMERO VENEZUELA"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleFormChange}
                  className="textarea textarea-bordered w-full"
                  placeholder="Describa la organización política"
                  rows={3}
                />
              </div>
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="activo"
                    checked={formData.activo}
                    onChange={(e) => setFormData({...formData, activo: e.target.checked})}
                    className="checkbox"
                  />
                  <span className="ml-2">Activo</span>
                </label>
              </div>
              <div className="flex justify-end space-x-2">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="btn btn-outline"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={createOrganizacionMutation.isPending || updateOrganizacionMutation.isPending}
                >
                  {createOrganizacionMutation.isPending || updateOrganizacionMutation.isPending 
                    ? "Guardando..." 
                    : (isEditing ? "Actualizar" : "Crear")}
                </button>
              </div>
            </form>
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
    </div>
  );
};

export default OrganizacionPoliticaControl; 