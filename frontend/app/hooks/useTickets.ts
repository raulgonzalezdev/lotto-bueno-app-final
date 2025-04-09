'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api';

// --- Interfaces --- //
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
  // Otros campos según tu modelo Ticket
}

interface TicketsResponse {
  total: number;
  items: Ticket[];
}

interface FetchTicketsParams {
  currentPage: number;
  ticketsPerPage: number;
  searchTerm?: string;
  estadoFiltro?: string;
  municipioFiltro?: string;
  parroquiaFiltro?: string;
  recolectorFiltro?: string;
}

interface TicketUpdatePayload {
  validado?: boolean;
  ganador?: boolean;
}

// --- Hooks --- //

// Hook para obtener tickets paginados y filtrados
export const useTickets = (params: FetchTicketsParams) => {
  const { currentPage, ticketsPerPage, searchTerm, estadoFiltro, municipioFiltro, parroquiaFiltro, recolectorFiltro } = params;
  
  return useQuery<TicketsResponse, Error>({
    // La clave de la query incluye todos los parámetros para re-fetch automático
    queryKey: ['tickets', params],
    queryFn: async () => {
      const queryParams: Record<string, string> = {
        skip: ((currentPage - 1) * ticketsPerPage).toString(),
        limit: ticketsPerPage.toString(),
      };

      if (searchTerm) queryParams.search = searchTerm;
      if (estadoFiltro) queryParams.codigo_estado = estadoFiltro;
      if (municipioFiltro) queryParams.codigo_municipio = municipioFiltro;
      if (parroquiaFiltro) queryParams.codigo_parroquia = parroquiaFiltro;
      if (recolectorFiltro) queryParams.referido_id = recolectorFiltro;

      return apiClient.get<TicketsResponse>('api/tickets/', queryParams);
    },
    placeholderData: (oldData) => oldData, // Útil para paginación para no ver pantalla en blanco
  });
};

// Hook para la mutación de actualizar ticket
export const useUpdateTicket = () => {
    const queryClient = useQueryClient();
    return useMutation<Ticket, Error, { ticketId: number; payload: TicketUpdatePayload }>({
        mutationFn: ({ ticketId, payload }) => 
          apiClient.patch<Ticket>(`api/tickets/${ticketId}`, payload),
        onSuccess: (updatedTicket) => {
            // Invalidar la query de tickets para refrescar la lista después de la actualización
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            // Opcionalmente, actualizar el caché directamente si se desea una respuesta más rápida
            // queryClient.setQueryData(['tickets', { id: updatedTicket.id }], updatedTicket);
        },
        // onError se puede manejar en el componente que llama a la mutación
    });
}; 