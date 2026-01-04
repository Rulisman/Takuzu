
import React from 'react';
import Cell from './Cell';
import { Grid } from '../types';

interface BoardProps {
  grid: Grid;
  onCellClick: (r: number, c: number) => void;
  showErrors: boolean;
}

const Board: React.FC<BoardProps> = ({ grid, onCellClick, showErrors }) => {
  return (
    <div className="grid grid-cols-6 gap-2 p-2 bg-gray-800 rounded-xl shadow-2xl border-4 border-gray-700">
      {grid.map((row, rIdx) => 
        row.map((cell, cIdx) => (
          <Cell 
            key={`${rIdx}-${cIdx}`}
            cell={cell}
            onClick={() => onCellClick(rIdx, cIdx)}
            showErrors={showErrors}
          />
        ))
      )}
    </div>
  );
};

export default Board;
