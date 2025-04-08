import { useMutation, useQuery } from '@tanstack/react-query';

// Interfaces para los datos necesarios
interface SendSMSPayload {
  phone: string;
  message: string;
  thread_key?: string;
}

interface SendBulkSMSPayload {
  messages: Array<{
    phone: string;
    message: string;
  }>;
  batch_size?: number;
}

interface SMSResponse {
  success: boolean;
  message?: string;
  error?: string;
  message_id?: string;
  thread_key?: string;
  request_id?: string;
  details?: any;
}

interface BulkSMSResponse {
  success: boolean;
  message?: string;
  error?: string;
  batch_id?: string;
  results: Array<{
    phone: string;
    success: boolean;
    message?: string;
    error?: string;
    message_id?: string;
    thread_key?: string;
    request_id?: string;
  }>;
  summary: {
    total: number;
    success: number;
    failed: number;
    elapsed_time?: string;
  };
}

interface ConversationMessage {
  message_id: string;
  phone: string;
  message: string;
  timestamp: string;
  delivered_at?: string;
  status: "pending" | "delivered" | "failed";
  error?: string;
  request_id?: string;
}

interface ConversationResponse {
  thread_key: string;
  messages: ConversationMessage[];
  count: number;
}

interface MessageStatusResponse {
  exists: boolean;
  details?: ConversationMessage;
  error?: string;
}

/**
 * Función para detectar el operador basado en el número de teléfono (para Venezuela)
 */
export function detectOperador(phone: string): string | null {
  // Limpia el número de teléfono
  const cleanedPhone = phone.replace(/\D/g, '');
  
  // Si el número comienza con 58, eliminamos ese prefijo
  const nationalNumber = cleanedPhone.startsWith('58') 
    ? cleanedPhone.substring(2) 
    : cleanedPhone;
  
  // Si comienza con 0, eliminamos ese prefijo también
  const operatorCode = nationalNumber.startsWith('0') 
    ? nationalNumber.substring(1, 4) 
    : nationalNumber.substring(0, 3);
  
  // Mapa de códigos de operadores venezolanos
  const operadoresMap: Record<string, string> = {
    '414': 'Movistar',
    '424': 'Movistar',
    '416': 'Movilnet',
    '426': 'Movilnet',
    '412': 'Digitel',
    '422': 'Digitel',
  };
  
  return operadoresMap[operatorCode] || null;
}

/**
 * Hook para enviar un solo mensaje SMS usando Google Cloud
 */
export function useSendGoogleSMS() {
  return useMutation<SMSResponse, Error, SendSMSPayload>({
    mutationFn: async ({ phone, message, thread_key }: SendSMSPayload) => {
      try {
        const endpoint = thread_key 
          ? '/api/google/send_sms_with_thread' 
          : '/api/google/send_sms';
          
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone,
            message,
            thread_key
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al enviar el SMS');
        }

        return await response.json();
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        }
        throw new Error('Error desconocido al enviar el SMS');
      }
    },
  });
}

/**
 * Hook para enviar múltiples mensajes SMS usando Google Cloud
 */
export function useSendGoogleBulkSMS() {
  return useMutation<BulkSMSResponse, Error, SendBulkSMSPayload>({
    mutationFn: async ({ messages, batch_size = 25 }: SendBulkSMSPayload) => {
      try {
        const response = await fetch('/api/google/send_bulk_sms_batched', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages,
            batch_size
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al enviar los SMS en lote');
        }

        return await response.json();
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        }
        throw new Error('Error desconocido al enviar los SMS en lote');
      }
    },
  });
}

// Hook para obtener el estado de un mensaje específico
export function useMessageStatus(messageId: string | null) {
  return useQuery<MessageStatusResponse, Error>(
    ['messageStatus', messageId],
    async () => {
      if (!messageId) {
        return { exists: false, error: 'ID de mensaje no proporcionado' };
      }
      
      const response = await fetch(`/api/google/message_status/${messageId}`);
      
      if (response.status === 404) {
        return { exists: false, error: 'Mensaje no encontrado' };
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al obtener estado del mensaje');
      }
      
      return await response.json();
    },
    {
      // Solo ejecutar la consulta si hay un ID de mensaje
      enabled: !!messageId,
      // Refrescar cada 5 segundos mientras el estado sea "pending"
      refetchInterval: (data) => {
        if (data?.details?.status === 'pending') {
          return 5000;
        }
        return false;
      },
      // Mantener datos anteriores mientras se recarga
      keepPreviousData: true,
    }
  );
}

// Hook para obtener todos los mensajes de una conversación
export function useConversation(threadKey: string | null) {
  return useQuery<ConversationResponse, Error>(
    ['conversation', threadKey],
    async () => {
      if (!threadKey) {
        throw new Error('Clave de conversación no proporcionada');
      }
      
      const response = await fetch(`/api/google/conversation/${threadKey}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al obtener la conversación');
      }
      
      return await response.json();
    },
    {
      // Solo ejecutar la consulta si hay una clave de conversación
      enabled: !!threadKey,
      // Refrescar cada 10 segundos
      refetchInterval: 10000,
      // Mantener datos anteriores mientras se recarga
      keepPreviousData: true,
    }
  );
}

// Para compatibilidad con el código existente
export const useSendSMS = useSendGoogleSMS;
export const useSendBulkSMS = useSendGoogleBulkSMS; 