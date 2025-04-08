'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api';

// --- Interfaces --- //
interface User {
  id: number;
  username: string;
  email: string;
  hashed_password?: string;
  created_at: string;
  updated_at: string;
  isAdmin: boolean;
}

interface UsersResponse {
  total: number;
  items: User[];
}

interface FetchUsersParams {
  currentPage: number;
  usersPerPage: number;
  searchTerm?: string;
}

interface CreateUserPayload {
  username: string;
  email: string;
  password: string;
  isAdmin: boolean;
}

interface UpdateUserPayload {
  username?: string;
  email?: string;
  password?: string;
  isAdmin?: boolean;
}

// --- Hooks --- //

// Hook para obtener usuarios paginados y filtrados
export const useUsers = (params: FetchUsersParams) => {
  const { currentPage, usersPerPage, searchTerm } = params;
  
  return useQuery<UsersResponse, Error>({
    queryKey: ['users', params],
    queryFn: async () => {
      const queryParams: Record<string, string> = {
        skip: ((currentPage - 1) * usersPerPage).toString(),
        limit: usersPerPage.toString(),
      };
      
      if (searchTerm) queryParams.search = searchTerm;

      const data = await apiClient.get<UsersResponse | User[]>('api/users/', queryParams);
      
      // Manejar diferentes formatos de respuesta
      if (typeof data === 'object' && data !== null && 'items' in data && Array.isArray(data.items)) {
        return data as UsersResponse;
      } else if (Array.isArray(data)) {
        return {
          items: data,
          total: data.length
        };
      }
      
      return {
        items: [],
        total: 0
      };
    },
    placeholderData: (oldData) => oldData, // Usar datos anteriores mientras carga
  });
};

// Hook para la mutación de crear usuario
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation<User, Error, CreateUserPayload>({
    mutationFn: (payload) => apiClient.post<User>('api/users/', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });
};

// Hook para la mutación de actualizar usuario
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation<User, Error, { userId: number; payload: UpdateUserPayload }>({
    mutationFn: ({ userId, payload }) => apiClient.put<User>(`api/users/${userId}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });
};

// Hook para la mutación de eliminar usuario
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (userId) => apiClient.delete<void>(`api/users/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });
}; 