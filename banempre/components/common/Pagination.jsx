import React from 'react';

export const Pagination = ({ 
  currentPage, 
  totalItems, 
  itemsPerPage, 
  onPageChange,
  maxPagesToShow = 5 
}) => {
  // Calcular el número total de páginas
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  
  // No mostrar paginación si solo hay una página
  if (totalPages <= 1) return null;
  
  // Generar array de páginas para mostrar
  const getPageNumbers = () => {
    // Si hay menos páginas que el máximo a mostrar, mostrar todas
    if (totalPages <= maxPagesToShow) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    // Calcular rango de páginas a mostrar
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = startPage + maxPagesToShow - 1;
    
    // Ajustar si nos pasamos del total de páginas
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  };
  
  // Generar botones de página
  const pageNumbers = getPageNumbers();
  
  return (
    <div className="flex items-center justify-center space-x-2">
      {/* Botón primera página */}
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className={`px-3 py-1 rounded-md ${
          currentPage === 1
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
        }`}
      >
        &laquo;
      </button>
      
      {/* Botón página anterior */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-1 rounded-md ${
          currentPage === 1
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
        }`}
      >
        &lsaquo;
      </button>
      
      {/* Botones de páginas */}
      {pageNumbers.map(number => (
        <button
          key={number}
          onClick={() => onPageChange(number)}
          className={`px-3 py-1 rounded-md ${
            currentPage === number
              ? 'bg-golden text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          }`}
        >
          {number}
        </button>
      ))}
      
      {/* Botón página siguiente */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-3 py-1 rounded-md ${
          currentPage === totalPages
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
        }`}
      >
        &rsaquo;
      </button>
      
      {/* Botón última página */}
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className={`px-3 py-1 rounded-md ${
          currentPage === totalPages
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
        }`}
      >
        &raquo;
      </button>
      
      {/* Indicador de página actual */}
      <span className="text-sm text-gray-600 ml-2">
        Página {currentPage} de {totalPages}
      </span>
    </div>
  );
}; 