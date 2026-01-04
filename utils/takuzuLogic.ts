
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

/**
 * Verifica si colocar un valor específico en (r, c) excede el límite de 3 fichas
 * por fila o columna (para un tablero de 6x6).
 */
export const checkCountViolation = (grid: Grid, r: number, c: number, value: TileValue): boolean => {
  if (value === TileValue.EMPTY) return false;
  const size = grid.length;
  const limit = size / 2;

  // Verificar Fila
  let rowCount = 0;
  for (let j = 0; j < size; j++) {
    // Si estamos en la celda actual, contamos el nuevo valor. De lo contrario, el existente.
    const valToCheck = (j === c) ? value : grid[r][j].value;
    if (valToCheck === value) rowCount++;
  }
  if (rowCount > limit) return true;

  // Verificar Columna
  let colCount = 0;
  for (let i = 0; i < size; i++) {
    const valToCheck = (i === r) ? value : grid[i][c].value;
    if (valToCheck === value) colCount++;
  }
  if (colCount > limit) return true;

  return false;
};

/**
 * Checks if placing a specific value at (r, c) violates the "no more than 2 consecutive" rule.
 */
export const checkConsecutiveViolation = (grid: Grid, r: number, c: number, value: TileValue): boolean => {
  if (value === TileValue.EMPTY) return false;
  const size = grid.length;

  // Check Horizontal
  if (c >= 2 && grid[r][c - 1].value === value && grid[r][c - 2].value === value) return true;
  if (c <= size - 3 && grid[r][c + 1].value === value && grid[r][c + 2].value === value) return true;
  if (c >= 1 && c <= size - 2 && grid[r][c - 1].value === value && grid[r][c + 1].value === value) return true;

  // Check Vertical
  if (r >= 2 && grid[r - 1][c].value === value && grid[r - 2][c].value === value) return true;
  if (r <= size - 3 && grid[r + 1][c].value === value && grid[r + 2][c].value === value) return true;
  if (r >= 1 && r <= size - 2 && grid[r - 1][c].value === value && grid[r + 1][c].value === value) return true;

  return false;
};

export const validateGrid = (grid: Grid): ErrorDetail[] => {
  const errors: ErrorDetail[] = [];
  const size = grid.length;

  // Rule 1: Count (3 Black, 3 White per row/col)
  for (let i = 0; i < size; i++) {
    let rowBlack = 0, rowWhite = 0;
    for (let j = 0; j < size; j++) {
      if (grid[i][j].value === TileValue.BLACK) rowBlack++;
      if (grid[i][j].value === TileValue.WHITE) rowWhite++;
    }
    if (rowBlack > 3 || rowWhite > 3) {
      errors.push({ type: 'COUNT', message: `La fila ${i + 1} tiene más de 3 fichas de un color.` });
    }

    let colBlack = 0, colWhite = 0;
    for (let j = 0; j < size; j++) {
      if (grid[j][i].value === TileValue.BLACK) colBlack++;
      if (grid[j][i].value === TileValue.WHITE) colWhite++;
    }
    if (colBlack > 3 || colWhite > 3) {
      errors.push({ type: 'COUNT', message: `La columna ${i + 1} tiene más de 3 fichas de un color.` });
    }
  }

  // Rule 2: No more than 2 consecutive
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const current = grid[i][j].value;
      if (current === TileValue.EMPTY) continue;
      if (j <= size - 3 && grid[i][j+1].value === current && grid[i][j+2].value === current) {
        errors.push({ type: 'CONSECUTIVE', message: `Hay 3 fichas iguales seguidas en la fila ${i + 1}.` });
      }
      if (i <= size - 3 && grid[i+1][j].value === current && grid[i+2][j].value === current) {
        errors.push({ type: 'CONSECUTIVE', message: `Hay 3 fichas iguales seguidas en la columna ${j + 1}.` });
      }
    }
  }

  // Rule 3: Uniqueness
  const rowStrings: string[] = [];
  const colStrings: string[] = [];
  for (let i = 0; i < size; i++) {
    let rowStr = "";
    let colStr = "";
    let rowFull = true;
    let colFull = true;
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
  if (hasDuplicate(rowStrings)) errors.push({ type: 'UNIQUE', message: "Al menos dos filas son idénticas." });
  if (hasDuplicate(colStrings)) errors.push({ type: 'UNIQUE', message: "Al menos dos columnas son idénticas." });

  return errors;
};

export const isGridComplete = (grid: Grid): boolean => {
  return grid.every(row => row.every(cell => cell.value !== TileValue.EMPTY));
};
