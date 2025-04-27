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
 * Normaliza un texto para comparaciones (quita acentos, convierte a minúsculas)
 * @param {string} text - Texto a normalizar
 * @returns {string} Texto normalizado
 */
export const normalizeText = (text) => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

/**
 * Compara dos textos normalizados
 * @param {string} text1 - Primer texto
 * @param {string} text2 - Segundo texto
 * @returns {boolean} True si los textos son iguales normalizados
 */
export const compareNormalizedTexts = (text1, text2) => {
  return normalizeText(text1) === normalizeText(text2);
};

/**
 * Filtra un array de objetos por una propiedad y un valor normalizado
 * @param {Array} array - Array de objetos
 * @param {string} property - Propiedad a comparar
 * @param {string} value - Valor a buscar
 * @returns {Array} Array filtrado
 */
export const filterByNormalizedProperty = (array, property, value) => {
  if (!array || !Array.isArray(array)) return [];
  if (!value) return array;
  
  const normalizedValue = normalizeText(value);
  return array.filter(item => {
    const propertyValue = item[property];
    return normalizeText(propertyValue).includes(normalizedValue);
  });
}; 