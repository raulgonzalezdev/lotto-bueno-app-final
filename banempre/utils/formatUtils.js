/**
 * Formatea una fecha en formato DD/MM/YYYY
 * @param {string} dateString - Fecha en formato ISO
 * @returns {string} Fecha formateada
 */
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';
  
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

/**
 * Formatea una fecha incluyendo la hora en formato DD/MM/YYYY HH:MM
 * @param {string} dateString - Fecha en formato ISO
 * @returns {string} Fecha y hora formateadas
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';
  
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Convierte una fecha a formato ISO string para enviar al API
 * @param {Date} date - Objeto Date
 * @returns {string} Fecha en formato ISO
 */
export const toISOString = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return null;
  }
  return date.toISOString();
}; 