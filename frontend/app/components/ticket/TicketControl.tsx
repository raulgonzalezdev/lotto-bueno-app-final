/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect, useRef } from "react";
import * as XLSX from 'xlsx'; // Importar xlsx
import { detectHost } from "../../api";
import { useTickets, useUpdateTicket } from "../../hooks/useTickets";
import { useEstados } from "../../hooks/useEstados";
import { useRecolectores } from "../../hooks/useRecolectores";
import ConfirmationModal from '../confirmation/ConfirmationModal';
import MessagingModal from '../messaging/MessagingModal';

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

interface Ticket {
  id: number;
  numero_ticket: string;
  qr_ticket: string;
  cedula: string;
  nombre: string;
  telefono: string;
  estado: string;
  municipio: string;
  parroquia: string;
  referido_id: number | null;
  validado: boolean;
  ganador: boolean;
  created_at: string;
}

// Redefinir Contact aquí si no se exporta desde MessagingModal
interface Contact {
  id: string;
  name: string;
  phone: string;
  lastMessage?: string;
  lastMessageTime?: string;
  cedula?: string;
  estado?: string;
  municipio?: string;
  numero_ticket?: string;
}

const TicketControl: React.FC = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editModalIsOpen, setEditModalIsOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [ticketsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [APIHost, setAPIHost] = useState<string>('https://applottobueno.com');
  const [updatedTicket, setUpdatedTicket] = useState({ validado: false, ganador: false });
  const [estadoFiltro, setEstadoFiltro] = useState<string>("");
  const [recolectorFiltro, setRecolectorFiltro] = useState<string>("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [totalParts, setTotalParts] = useState(0);
  const [currentPart, setCurrentPart] = useState(0);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [confirmationAction, setConfirmationAction] = useState<() => void>(() => {});
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [messageType, setMessageType] = useState<'info' | 'error' | 'success'>('info');
  const [showMessagingModal, setShowMessagingModal] = useState(false);
  const [selectedTicketsForMessaging, setSelectedTicketsForMessaging] = useState<string[]>([]);
  const [messageTemplate, setMessageTemplate] = useState("");

  // Hooks de React Query
  const { data: ticketsResponse, isLoading: ticketsLoading } = useTickets({
    currentPage,
    ticketsPerPage,
    searchTerm,
    estadoFiltro,
    recolectorFiltro
  });
  const { data: estados = [], isLoading: estadosLoading } = useEstados();
  const { data: recolectoresData, isLoading: recolectoresLoading } = useRecolectores();
  const updateTicketMutation = useUpdateTicket();

  const tickets = ticketsResponse?.items || [];

  useEffect(() => {
    if (ticketsResponse) {
      setTotalPages(Math.ceil(ticketsResponse.total / ticketsPerPage));
    }
  }, [ticketsResponse, ticketsPerPage]);

  useEffect(() => {
    fetchHost();
  }, []);

  const fetchHost = async () => {
    try {
      const host = await detectHost();
      setAPIHost(host);
    } catch (error) {
      console.error("Error detecting host:", error);
      setAPIHost(process.env.NEXT_PUBLIC_API_URL || 'https://applottobueno.com');
    }
  };

  const openModal = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setModalIsOpen(true);
  };

  const openEditModal = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setUpdatedTicket({ validado: ticket.validado, ganador: ticket.ganador });
    setEditModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedTicket(null);
  };

  const closeEditModal = () => {
    setEditModalIsOpen(false);
    setSelectedTicket(null);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
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

  const handleUpdateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setUpdatedTicket((prevState) => ({ ...prevState, [name]: checked }));
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    try {
      await updateTicketMutation.mutateAsync({
        ticketId: selectedTicket.id,
        payload: updatedTicket
      });
      closeEditModal();
      showMessage('Ticket actualizado con éxito', 'success');
    } catch (error) {
      console.error("Error updating ticket:", error);
      showMessage(`Error al actualizar ticket: ${error instanceof Error ? error.message : 'Error desconocido'}`, 'error');
    }
  };

  const showMessage = (message: string, type: 'info' | 'error' | 'success' = 'info') => {
    setMessageText(message);
    setMessageType(type);
    setShowMessageModal(true);
  };

  const showConfirmation = (message: string, onConfirm: () => void) => {
    setConfirmationMessage(message);
    setConfirmationAction(() => onConfirm);
    setShowConfirmationModal(true);
  };

  const downloadBlobAsFile = async (blob: Blob, filename: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        
        link.onload = () => {
          console.log(`Archivo ${filename} cargado correctamente`);
        };
        
        link.onclick = () => {
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
        
        setTimeout(() => {
          if (document.body.contains(link)) {
              document.body.removeChild(link);
          }
          window.URL.revokeObjectURL(downloadUrl);
          resolve();
        }, 3000);
      } catch (err) {
        console.error(`Error preparando la descarga de ${filename}:`, err);
        reject(err);
      }
    });
  };

  const handleDownload = async (type: string, format: string) => {
    try {
      setIsDownloading(true);
      setDownloadProgress(0);
      setCurrentPart(0);
      setTotalParts(0);
      
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append('search', searchTerm);
      if (estadoFiltro) queryParams.append('codigo_estado', estadoFiltro);
      if (recolectorFiltro) queryParams.append('referido_id', recolectorFiltro); 
      
      const query = queryParams.toString();

      let urlEndpoint = '';
      if (type === 'tickets') {
        urlEndpoint = format === 'excel' ? `/api/download/excel/tickets` : `/api/download/txt/tickets`;
      } else {
         showMessage('Tipo de descarga no soportado', 'error');
         setIsDownloading(false);
         return;
      }

      const url = `${APIHost}${urlEndpoint}${query ? '?' + query : ''}`;

      console.log(`Iniciando descarga desde: ${url}`);
      
      const response = await fetch(url);

      if (!response.ok) {
        let errorDetail = `Error ${response.status}: ${response.statusText}`;
        try {
           const errorBody = await response.json();
           errorDetail = errorBody.detail || errorDetail;
        } catch (e) {
           // No json body
        }
        throw new Error(`Error obteniendo el archivo: ${errorDetail}`);
      }

      const blob = await response.blob();
      const filename = response.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/["']/g, '') || 
                      `${type}_${format === 'excel' ? 'excel' : 'txt'}.${format}.zip`;

      await downloadBlobAsFile(blob, filename);

      setDownloadProgress(100);
      showMessage('Descarga completada exitosamente', 'success');

    } catch (error) {
      console.error('Error en la descarga:', error);
      showMessage(`Error en la descarga: ${error instanceof Error ? error.message : 'Error desconocido'}`, 'error');
    } finally {
        setIsDownloading(false);
        setTimeout(() => {
            setDownloadProgress(0);
        }, 3000);
    }
  };

  const recolectores = recolectoresData?.items || [];

  const openMessagingModal = () => {
    const contactsToSend = ticketsToContacts();
    if (contactsToSend.length === 0) {
        showMessage("No hay tickets seleccionados o disponibles para enviar mensajes.", "info");
        return;
    }
    setShowMessagingModal(true);
  };

  const ticketsToContacts = (): Contact[] => {
    const sourceTickets = tickets || [];
    const filteredTickets = sourceTickets.filter(ticket => 
        selectedTicketsForMessaging.length === 0 || 
        selectedTicketsForMessaging.includes(ticket.id.toString())
    );
    
    return filteredTickets.map(ticket => ({
      id: ticket.id.toString(),
      name: ticket.nombre || `Usuario ${ticket.cedula}`,
      phone: ticket.telefono,
      lastMessage: undefined,
      lastMessageTime: undefined,
      cedula: ticket.cedula,
      estado: ticket.estado,
      municipio: ticket.municipio,
      numero_ticket: ticket.numero_ticket
    }));
  };

  const handleTicketSelection = (ticketId: string) => {
    setSelectedTicketsForMessaging(prev => {
      if (prev.includes(ticketId)) {
        return prev.filter(id => id !== ticketId);
      } else {
        return [...prev, ticketId];
      }
    });
  };

  const handleSelectAllTickets = () => {
    if (selectedTicketsForMessaging.length === tickets.length && tickets.length > 0) {
      setSelectedTicketsForMessaging([]);
    } else {
      setSelectedTicketsForMessaging(tickets.map(ticket => ticket.id.toString()));
    }
  };

  const messageTemplates = [
    "Hola {nombre}, gracias por participar en Lotto Bueno. Tu ticket #{numero_ticket} ha sido registrado.",
    "Estimado/a {nombre}, te recordamos que tu ticket #{numero_ticket} participa en nuestro próximo sorteo.",
    "Importante: {nombre}, verifica tu ticket #{numero_ticket} en nuestra página web."
  ];

  return (
    <div className="p-4">
      <h2>Control de Tickets</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <input
          type="text"
          placeholder="Buscar..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="input input-bordered"
        />
        <select
          value={estadoFiltro}
          onChange={(e) => setEstadoFiltro(e.target.value)}
          className="select select-bordered"
          disabled={estadosLoading}
        >
          <option value="">Todos los estados</option>
          {estados.map(estado => (
            <option key={estado.codigo_estado} value={estado.codigo_estado.toString()}> 
              {estado.estado}
            </option>
          ))}
        </select>
        <select
          value={recolectorFiltro}
          onChange={(e) => setRecolectorFiltro(e.target.value)}
          className="select select-bordered"
          disabled={recolectoresLoading}
        >
          <option value="">Todos los recolectores</option>
          {recolectores.map(recolector => (
            <option key={recolector.id} value={recolector.id.toString()}>
              {recolector.nombre}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        <button 
          onClick={() => handleDownload('tickets', 'excel')} 
          className="btn btn-secondary mr-2"
          disabled={isDownloading}
        >
          {isDownloading ? (
            <span className="flex items-center">
              <span className="loading loading-spinner loading-xs mr-2"></span>
              Descargando...
            </span>
          ) : (
            'Descargar Excel'
          )}
        </button>
        <button 
          onClick={() => handleDownload('tickets', 'txt')} 
          className="btn btn-secondary mr-2"
          disabled={isDownloading}
        >
           {isDownloading ? (
            <span className="flex items-center">
              <span className="loading loading-spinner loading-xs mr-2"></span>
              Descargando...
            </span>
          ) : (
            'Descargar TXT'
          )}
        </button>
        <button 
          onClick={openMessagingModal} 
          className="btn btn-info text-white mr-2"
          disabled={tickets.length === 0}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
          Enviar Mensajes
        </button>
      </div>
      
      <div className="pagination mb-4 flex justify-center">
          <button onClick={() => paginate(1)} className="btn btn-sm btn-primary mr-1" disabled={currentPage === 1}>{"<<"}</button>
          <button onClick={() => paginate(currentPage - 1)} className="btn btn-sm btn-primary mr-1" disabled={currentPage === 1}>{"<"}</button>
          <span className="btn btn-sm btn-disabled mr-1">Página {currentPage} de {totalPages}</span>
          <button onClick={() => paginate(currentPage + 1)} className="btn btn-sm btn-primary mr-1" disabled={currentPage === totalPages}>{">"}</button>
          <button onClick={() => paginate(totalPages)} className="btn btn-sm btn-primary" disabled={currentPage === totalPages}>{">>"}</button>
      </div>

      {ticketsLoading ? (
        <div className="text-center p-10">
           <span className="loading loading-dots loading-lg"></span>
        </div>
      ) : (
        <>
          {tickets.length > 0 && (
             <div className="mb-4 flex items-center">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="select-all"
                  className="checkbox checkbox-sm mr-2"
                  checked={selectedTicketsForMessaging.length === tickets.length && tickets.length > 0}
                  onChange={handleSelectAllTickets}
                />
                <label htmlFor="select-all" className="text-sm">Seleccionar todos para mensajería</label>
              </div>
              {selectedTicketsForMessaging.length > 0 && (
                <span className="ml-4 text-sm text-gray-600">
                  ({selectedTicketsForMessaging.length} seleccionado(s))
                </span>
              )}
            </div>
          )}
          
          <div className="overflow-x-auto">
             <table className="table table-zebra w-full mb-4">
              <thead>
                <tr>
                  {tickets.length > 0 && (
                    <th className="w-10">
                      <input type="checkbox" className="checkbox checkbox-xs" onChange={handleSelectAllTickets} checked={selectedTicketsForMessaging.length === tickets.length && tickets.length > 0} />
                    </th>
                  )}
                  <th>ID</th>
                  <th>Número Ticket</th>
                  <th>Cédula</th>
                  <th>Nombre</th>
                  <th>Teléfono</th>
                  <th>Estado</th>
                  <th>Municipio</th>
                  <th>Parroquia</th>
                  <th>Referido ID</th>
                  <th>Validado</th>
                  <th>Ganador</th>
                  <th>Creado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {tickets.length > 0 ? tickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td>
                      <input
                        type="checkbox"
                        className="checkbox checkbox-xs"
                        checked={selectedTicketsForMessaging.includes(ticket.id.toString())}
                        onChange={() => handleTicketSelection(ticket.id.toString())}
                      />
                    </td>
                    <td>{ticket.id}</td>
                    <td>{ticket.numero_ticket}</td>
                    <td>{ticket.cedula}</td>
                    <td>{ticket.nombre}</td>
                    <td>{ticket.telefono}</td>
                    <td>{ticket.estado}</td>
                    <td>{ticket.municipio}</td>
                    <td>{ticket.parroquia}</td>
                    <td>{ticket.referido_id ?? '-'}</td>
                    <td>{ticket.validado ? "Sí" : "No"}</td>
                    <td>{ticket.ganador ? "Sí" : "No"}</td>
                    <td>{new Date(ticket.created_at).toLocaleString()}</td>
                    <td>
                       <div className="flex gap-1">
                        <button className="btn btn-xs btn-outline btn-info" onClick={() => openModal(ticket)}>
                          Detalles
                        </button>
                        <button className="btn btn-xs btn-outline btn-warning" onClick={() => openEditModal(ticket)}>
                          Editar
                        </button>
                       </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={14} className="text-center p-4">No hay tickets disponibles que coincidan con los filtros.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      <MessagingModal
        isOpen={showMessagingModal}
        onClose={() => setShowMessagingModal(false)}
        initialContacts={ticketsToContacts()}
        initialTemplate={messageTemplate} 
        enableAttachments={true} 
      />
      
      {modalIsOpen && selectedTicket && (
        <div className="modal modal-open">
            <div className="modal-box relative">
                 <label onClick={closeModal} className="btn btn-sm btn-circle absolute right-2 top-2">✕</label>
                 <h3 className="text-lg font-bold mb-4">Detalles del Ticket #{selectedTicket.id}</h3>
                <div className="space-y-2">
                  <p><strong>Número Ticket:</strong> {selectedTicket.numero_ticket}</p>
                  <p><strong>Cédula:</strong> {selectedTicket.cedula}</p>
                  <p><strong>Nombre:</strong> {selectedTicket.nombre}</p>
                  <p><strong>Teléfono:</strong> {selectedTicket.telefono}</p>
                  <p><strong>Estado:</strong> {selectedTicket.estado}</p>
                  <p><strong>Municipio:</strong> {selectedTicket.municipio}</p>
                  <p><strong>Parroquia:</strong> {selectedTicket.parroquia}</p>
                  <p><strong>Referido ID:</strong> {selectedTicket.referido_id ?? '-'}</p>
                  <p><strong>Validado:</strong> {selectedTicket.validado ? "Sí" : "No"}</p>
                  <p><strong>Ganador:</strong> {selectedTicket.ganador ? "Sí" : "No"}</p>
                  <p><strong>Creado en:</strong> {new Date(selectedTicket.created_at).toLocaleString()}</p>
                  <div className="mt-4">
                    <p><strong>QR Code:</strong></p>
                    <img src={`data:image/png;base64,${selectedTicket.qr_ticket}`} alt="QR Code" className="mx-auto mt-2 border"/>
                  </div>
                </div>
                <div className="modal-action">
                    <button className="btn" onClick={closeModal}>Cerrar</button>
                </div>
            </div>
        </div>
      )}

      {editModalIsOpen && selectedTicket && (
        <div className="modal modal-open">
          <div className="modal-box relative">
            <label onClick={closeEditModal} className="btn btn-sm btn-circle absolute right-2 top-2">✕</label>
            <h3 className="text-lg font-bold mb-4">Editar Ticket #{selectedTicket.id}</h3>
            <form onSubmit={handleUpdateSubmit}>
                <div className="form-control">
                    <label className="cursor-pointer label">
                        <span className="label-text">Validado</span>
                        <input 
                            type="checkbox" 
                            name="validado"
                            className="checkbox checkbox-primary"
                            checked={updatedTicket.validado} 
                            onChange={handleUpdateChange} 
                        />
                    </label>
                </div>
                 <div className="form-control mt-2">
                    <label className="cursor-pointer label">
                        <span className="label-text">Ganador</span>
                        <input 
                            type="checkbox" 
                            name="ganador"
                            className="checkbox checkbox-secondary"
                            checked={updatedTicket.ganador} 
                            onChange={handleUpdateChange} 
                        />
                    </label>
                </div>
                <div className="modal-action mt-6">
                  <button type="button" className="btn mr-2" onClick={closeEditModal}>Cancelar</button>
                  <button type="submit" className="btn btn-primary" disabled={updateTicketMutation.isPending}>
                      {updateTicketMutation.isPending ? <span className="loading loading-spinner loading-xs"></span> : "Guardar Cambios"}
                  </button>
                </div>
            </form>
          </div>
        </div>
      )}

      {isDownloading && (
         <div className="fixed bottom-4 right-4 bg-base-100 p-4 rounded-lg shadow-lg border">
          <h4 className="font-bold mb-2">Descargando archivos</h4>
          {totalParts > 0 ? (
            <>
             <div className="mb-2 text-sm">
               Parte actual: {currentPart} de {totalParts}
             </div>
             <progress className="progress progress-primary w-56" value={downloadProgress} max="100"></progress>
             <div className="text-xs text-gray-600 mt-1">
               {Math.round(downloadProgress)}% completado
             </div>
            </>
          ) : (
             <progress className="progress progress-primary w-56" value={isDownloading ? undefined : 0}></progress>
          )}
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

export default TicketControl;
