
import React from 'react';
import { TileValue, Cell as CellType } from '../types';

interface CellProps {
  cell: CellType;
  onClick: () => void;
  showErrors: boolean;
}

const Cell: React.FC<CellProps> = ({ cell, onClick, showErrors }) => {
  const getBaseStyles = () => {
    let styles = "w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-lg cursor-pointer transition-all duration-200 border-2 select-none ";
    
    if (cell.isFixed) {
      styles += "bg-gray-800 border-gray-600 ";
    } else {
      styles += "bg-gray-700 border-gray-500 hover:bg-gray-600 ";
    }

    if (showErrors && cell.isError) {
      styles += "ring-2 ring-red-500 border-red-500 ";
    }

    return styles;
  };

  const renderContent = () => {
    switch (cell.value) {
      case TileValue.WHITE:
        return (
          <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full bg-white shadow-lg flex items-center justify-center ${cell.isFixed ? 'opacity-100' : 'opacity-85'}`}>
          </div>
        );
      case TileValue.BLACK:
        return (
          <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full bg-black border border-gray-700 shadow-lg flex items-center justify-center ${cell.isFixed ? 'opacity-100' : 'opacity-85'}`}>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={getBaseStyles()} onClick={onClick}>
      {renderContent()}
    </div>
  );
};

export default Cell;
