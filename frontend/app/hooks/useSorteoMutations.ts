'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api';

// --- Interfaces --- //
// Reutilizar la interfaz Ticket si ya está definida globalmente o importarla
interface Ticket {
    id: number;
    numero_ticket: string;
    cedula: string;
    nombre: string;
    telefono: string;
    estado: string;
    municipio: string;
    parroquia: string;
    referido_id: number | null;
    validado: boolean;
    ganador: boolean;
}

interface RealizarSorteoPayload {
    cantidad_ganadores: number;
    estado?: string; // Usar descripción del estado
    municipio?: string; // Usar descripción del municipio
}

// --- Funciones para realizar operaciones con el sorteo (usando apiClient) --- //
// Función refactorizada usando apiClient en lugar de fetch directo
const realizarSorteo = async (payload: RealizarSorteoPayload): Promise<Ticket[]> => {
    return apiClient.post<Ticket[]>('api/sorteo/ganadores', payload);
};

// Función refactorizada usando apiClient en lugar de fetch directo
const quitarGanadores = async (): Promise<void> => {
    return apiClient.post<void>('api/sorteo/quitar_ganadores', {});
};

// --- Hooks --- //

export const useRealizarSorteo = () => {
    const queryClient = useQueryClient();
    return useMutation<Ticket[], Error, RealizarSorteoPayload>({
        // Usamos la función realizarSorteo que internamente usa apiClient
        mutationFn: realizarSorteo,
        onSuccess: () => {
            // Invalidar queries relacionadas si es necesario, por ejemplo, la lista de tickets
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
        },
    });
};

export const useQuitarGanadores = () => {
    const queryClient = useQueryClient();
    return useMutation<void, Error, void>({
        // Usamos la función quitarGanadores que internamente usa apiClient
        mutationFn: quitarGanadores,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
        },
    });
}; 