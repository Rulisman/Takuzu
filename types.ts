
export enum TileValue {
  EMPTY = 'EMPTY',
  BLACK = 'BLACK',
  WHITE = 'WHITE'
}

export interface Cell {
  value: TileValue;
  isFixed: boolean;
  isError: boolean;
}

export type Grid = Cell[][];

export interface ErrorDetail {
  type: 'COUNT' | 'CONSECUTIVE' | 'UNIQUE' | 'INCOMPLETE';
  message: string;
  indices?: { r: number, c: number }[];
}

export enum GameState {
  SETUP = 'SETUP',
  PLAYING = 'PLAYING',
  WON = 'WON'
}
