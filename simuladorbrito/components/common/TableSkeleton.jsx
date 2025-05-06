import React from 'react';

export const TableSkeleton = ({ columns = 5, rows = 5 }) => {
  return (
    <div className="animate-pulse">
      {/* Encabezado */}
      <div className="bg-gray-100 px-4 py-3 grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <div key={`header-${i}`} className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        ))}
      </div>

      {/* Filas */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div 
          key={`row-${rowIndex}`} 
          className="border-b border-gray-100 px-4 py-4 grid items-center" 
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={`cell-${rowIndex}-${colIndex}`} className="h-3 bg-gray-200 rounded w-5/6"></div>
          ))}
        </div>
      ))}
    </div>
  );
}; 