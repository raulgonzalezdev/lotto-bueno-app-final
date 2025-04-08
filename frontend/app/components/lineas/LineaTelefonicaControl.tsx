/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import Toast from '../toast/Toast';
import { detectHost } from "../../api";
// Importar los hooks de React Query
import {
    useLineasTelefonicas,
    useCreateLineaTelefonica,
    useUpdateLineaTelefonica,
    useDeleteLineaTelefonica,
    useImportarLineasTelefonicas
} from "../../hooks/useLineasTelefonicas"; // Ajusta la ruta si es necesario

interface LineaTelefonica {
  id: number;
  numero: string;
  operador: string;
}

const LineaTelefonicaControl: React.FC = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [importModalIsOpen, setImportModalIsOpen] = useState(false);
  const [selectedLinea, setSelectedLinea] = useState<Partial<LineaTelefonica> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [lineasPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({ numero: "", operador: "" });
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  const [APIHost, setAPIHost] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [operadorPorDefecto, setOperadorPorDefecto] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const queryParams = useMemo(() => ({
      currentPage,
      lineasPerPage,
      searchTerm
  }), [currentPage, lineasPerPage, searchTerm]);

  const { 
    data: lineasData,
    isLoading: isLoadingLineas,
    isError: isErrorLineas,
    error: errorLineas
  } = useLineasTelefonicas(queryParams);

  const createLineaMutation = useCreateLineaTelefonica();
  const updateLineaMutation = useUpdateLineaTelefonica();
  const deleteLineaMutation = useDeleteLineaTelefonica();
  const importarLineasMutation = useImportarLineasTelefonicas();

  const totalPages = useMemo(() => {
      if (!lineasData) return 1;
      return Math.ceil(lineasData.total / lineasPerPage);
  }, [lineasData, lineasPerPage]);

  useEffect(() => {
      if (isErrorLineas && errorLineas) {
          setToastMessage(errorLineas.message || "Error cargando las líneas telefónicas.");
          setToastType("error");
      }
  }, [isErrorLineas, errorLineas]);

  useEffect(() => {
      if (isEditing && selectedLinea) {
          setFormData({ 
              numero: selectedLinea.numero || "", 
              operador: selectedLinea.operador || "" 
          });
      } else {
          setFormData({ numero: "", operador: "" });
      }
  }, [isEditing, selectedLinea]);

  const fetchHost = async () => {
    try {
      const host = await detectHost();
      setAPIHost(host);
    } catch (error) {
      console.error("Error detecting host:", error);
      setAPIHost(process.env.NEXT_PUBLIC_API_URL || 'https://applottobueno.com');
    }
  };

  const openModal = (linea: LineaTelefonica | null = null) => {
    if (linea) {
        setSelectedLinea(linea);
        setIsEditing(true);
    } else {
        setSelectedLinea(null);
        setIsEditing(false);
        setFormData({ numero: "", operador: "" });
    }
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedLinea(null);
    setIsEditing(false);
  };

  const openImportModal = () => {
    setImportModalIsOpen(true);
  };

  const closeImportModal = () => {
    setImportModalIsOpen(false);
    setSelectedFile(null);
    setOperadorPorDefecto("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setToastMessage("Por favor seleccione un archivo para importar");
      setToastType("error");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    
    // Si se especificó un operador por defecto
    if (operadorPorDefecto) {
      formData.append("operador_default", operadorPorDefecto);
    }

    try {
      const result = await importarLineasMutation.mutateAsync(formData);
      setToastMessage(`Importación completada: ${result.insertados} líneas insertadas, ${result.errores} errores. ${result.mensaje}`);
      setToastType("success");
      closeImportModal();
    } catch (error) {
      setToastMessage(`Error durante la importación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      setToastType("error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDelete = (id: number) => {
      deleteLineaMutation.mutate(id, {
          onSuccess: () => {
              setToastMessage("Línea eliminada exitosamente");
              setToastType("success");
          },
          onError: (error) => {
              setToastMessage(error.message || "Error al eliminar la línea.");
              setToastType("error");
          }
      });
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (isEditing && selectedLinea?.id) {
          updateLineaMutation.mutate({ lineaId: selectedLinea.id, payload: formData }, {
              onSuccess: () => {
                  setToastMessage("Línea actualizada exitosamente");
                  setToastType("success");
                  closeModal();
              },
              onError: (error) => {
                  setToastMessage(error.message || "Error al actualizar la línea.");
                  setToastType("error");
              }
          });
      } else {
          createLineaMutation.mutate(formData, {
              onSuccess: () => {
                  setToastMessage("Línea creada exitosamente");
                  setToastType("success");
                  closeModal();
              },
              onError: (error) => {
                  setToastMessage(error.message || "Error al crear la línea.");
                  setToastType("error");
              }
          });
      }
  };

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const lineas = lineasData?.items ?? [];

  return (
    <div className="p-4">
      <h2>Control de Líneas Telefónicas</h2>
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => openModal()} className="btn btn-primary">Crear Nueva Línea</button>
        <button onClick={openImportModal} className="btn btn-secondary">Importar Líneas</button>
      </div>
      <input
        type="text"
        placeholder="Buscar..."
        value={searchTerm}
        onChange={handleSearchChange}
        className="input input-bordered mb-4"
      />
      {isLoadingLineas && <p>Cargando líneas...</p>}
      {isErrorLineas && <p className="text-red-500">Error al cargar líneas.</p>}
      
      <div className="pagination mb-4 flex justify-center">
        <button onClick={() => paginate(1)} disabled={currentPage === 1 || isLoadingLineas} className="btn btn-primary mr-1">{"<<"}</button>
        <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1 || isLoadingLineas} className="btn btn-primary mr-1">{"<"}</button>
        <span className="btn btn-disabled mr-1">Página {currentPage} de {totalPages}</span>
        <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages || isLoadingLineas} className="btn btn-primary mr-1">{">"}</button>
        <button onClick={() => paginate(totalPages)} disabled={currentPage === totalPages || isLoadingLineas} className="btn btn-primary">{">>"}</button>
      </div>
      <table className="table-auto w-full mb-4">
        <thead>
          <tr>
            <th>ID</th>
            <th>Número</th>
            <th>Operador</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {lineas.map((linea) => (
            <tr key={linea.id}>
              <td>{linea.id}</td>
              <td>{linea.numero}</td>
              <td>{linea.operador}</td>
              <td>
                <button className="btn btn-primary mr-2" onClick={() => openModal(linea)} disabled={createLineaMutation.isPending || updateLineaMutation.isPending || deleteLineaMutation.isPending}>Editar</button>
                <button className="btn btn-danger" onClick={() => handleDelete(linea.id)} disabled={deleteLineaMutation.isPending || deleteLineaMutation.variables === linea.id}>
                  {deleteLineaMutation.isPending && deleteLineaMutation.variables === linea.id ? "Eliminando..." : "Eliminar"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {modalIsOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-button" onClick={closeModal}>×</button>
            <h2>{isEditing ? "Editar Línea" : "Crear Nueva Línea"}</h2>
            <form onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700">Número</label>
                <input
                  type="text"
                  name="numero"
                  value={formData.numero}
                  onChange={handleFormChange}
                  required
                  className="input input-bordered w-full mb-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Operador</label>
                <input
                  type="text"
                  name="operador"
                  value={formData.operador}
                  onChange={handleFormChange}
                  required
                  className="input input-bordered w-full mb-2"
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={createLineaMutation.isPending || updateLineaMutation.isPending}>
                {createLineaMutation.isPending || updateLineaMutation.isPending ? "Guardando..." : (isEditing ? "Guardar Cambios" : "Crear")}
              </button>
            </form>
          </div>
        </div>
      )}
      {importModalIsOpen && (
        <div className="modal-overlay" onClick={closeImportModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-button" onClick={closeImportModal}>×</button>
            <h2>Importar Líneas Telefónicas</h2>
            <form onSubmit={handleImport}>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Seleccione un archivo Excel (.xlsx) o CSV (.csv) que contenga las líneas telefónicas a importar.
                  <br />
                  El archivo debe tener las columnas: <strong>numero</strong> y opcionalmente <strong>operador</strong>.
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
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Operador por defecto (opcional)</label>
                <input
                  type="text"
                  placeholder="Operador para números sin esta información"
                  value={operadorPorDefecto}
                  onChange={(e) => setOperadorPorDefecto(e.target.value)}
                  className="input input-bordered w-full"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Si el archivo no incluye la columna de operador, o si hay celdas vacías,
                  se utilizará este valor por defecto.
                </p>
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

export default LineaTelefonicaControl;
