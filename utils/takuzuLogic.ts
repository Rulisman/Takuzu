
import { TileValue, Grid, ErrorDetail } from '../types';

export const createEmptyGrid = (size: number = 6): Grid => {
  return Array(size).fill(null).map(() => 
    Array(size).fill(null).map(() => ({
      value: TileValue.EMPTY,
      isFixed: false,
      isError: false
    }))
  );
};

export const getNextTileValue = (current: TileValue): TileValue => {
  switch (current) {
    case TileValue.EMPTY: return TileValue.WHITE;
    case TileValue.WHITE: return TileValue.BLACK;
    case TileValue.BLACK: return TileValue.EMPTY;
    default: return TileValue.EMPTY;
  }
};

export const validateGrid = (grid: Grid): ErrorDetail[] => {
  const errors: ErrorDetail[] = [];
  const size = grid.length;

  // Rule 1: Count (3 Black, 3 White per row/col)
  for (let i = 0; i < size; i++) {
    // Check rows
    let rowBlack = 0, rowWhite = 0;
    for (let j = 0; j < size; j++) {
      if (grid[i][j].value === TileValue.BLACK) rowBlack++;
      if (grid[i][j].value === TileValue.WHITE) rowWhite++;
    }
    if (rowBlack > 3 || rowWhite > 3) {
      errors.push({ type: 'COUNT', message: `Row ${i + 1} has more than 3 tiles of one color.` });
    }

    // Check cols
    let colBlack = 0, colWhite = 0;
    for (let j = 0; j < size; j++) {
      if (grid[j][i].value === TileValue.BLACK) colBlack++;
      if (grid[j][i].value === TileValue.WHITE) colWhite++;
    }
    if (colBlack > 3 || colWhite > 3) {
      errors.push({ type: 'COUNT', message: `Column ${i + 1} has more than 3 tiles of one color.` });
    }
  }

  // Rule 2: No more than 2 consecutive
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const current = grid[i][j].value;
      if (current === TileValue.EMPTY) continue;

      // Horizontal
      if (j <= size - 3) {
        if (grid[i][j+1].value === current && grid[i][j+2].value === current) {
          errors.push({ type: 'CONSECUTIVE', message: `Found 3 consecutive tiles in row ${i + 1}.` });
        }
      }

      // Vertical
      if (i <= size - 3) {
        if (grid[i+1][j].value === current && grid[i+2][j].value === current) {
          errors.push({ type: 'CONSECUTIVE', message: `Found 3 consecutive tiles in column ${j + 1}.` });
        }
      }
    }
  }

  // Rule 3: Uniqueness (Rows and Columns)
  const rowStrings: string[] = [];
  const colStrings: string[] = [];
  
  for (let i = 0; i < size; i++) {
    let rowStr = "", colStr = "";
    let rowFull = true, colFull = true;
    for (let j = 0; j < size; j++) {
      if (grid[i][j].value === TileValue.EMPTY) rowFull = false;
      rowStr += grid[i][j].value;
      
      if (grid[j][i].value === TileValue.EMPTY) colFull = false;
      colStr += grid[j][i].value;
    }
    if (rowFull) rowStrings.push(rowStr);
    if (colFull) colStrings.push(colStr);
  }

  const hasDuplicate = (arr: string[]) => new Set(arr).size !== arr.length;
  if (hasDuplicate(rowStrings)) errors.push({ type: 'UNIQUE', message: "At least two rows are identical." });
  if (hasDuplicate(colStrings)) errors.push({ type: 'UNIQUE', message: "At least two columns are identical." });

  return errors;
};

export const isGridComplete = (grid: Grid): boolean => {
  return grid.every(row => row.every(cell => cell.value !== TileValue.EMPTY));
};
