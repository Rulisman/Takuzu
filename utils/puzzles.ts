
import { TileValue, Grid } from '../types';

/**
 * Crea una cuadrícula a partir de un patrón de texto.
 * Elimina espacios en blanco para asegurar dimensiones correctas (6x6).
 */
const createGridFromPattern = (pattern: string): Grid => {
  const rows = pattern.trim().split('\n');
  return rows.map(row => 
    row.trim()
       .replace(/\s+/g, '') // Elimina todos los espacios para que solo queden los caracteres W, B o .
       .split('')
       .map(char => ({
          value: char === 'W' ? TileValue.WHITE : char === 'B' ? TileValue.BLACK : TileValue.EMPTY,
          isFixed: char !== '.',
          isError: false
       }))
  );
};

export const puzzles = {
  EASY: createGridFromPattern(`
    W . . B . .
    . . B . . W
    . W . . W .
    B . . B . .
    . . W . . B
    W . . . B .
  `),
  MEDIUM: createGridFromPattern(`
    . . B . . .
    W . . . B .
    . . . W . .
    . B . . . W
    . . . . B .
    B . W . . .
  `),
  HARD: createGridFromPattern(`
    . . . . . W
    . B . . . .
    . . . . W .
    . . B . . .
    W . . . . .
    . . . B . .
  `),
  EXPERT: createGridFromPattern(`
    . . . B . .
    . . . . . .
    W . . . . .
    . . . . . B
    . . . . . .
    . . W . . .
  `)
};
