
import React, { useState, useCallback, useEffect } from 'react';
import Board from './components/Board';
import { TileValue, Grid, GameState, ErrorDetail } from './types';
import { createEmptyGrid, getNextTileValue, validateGrid, isGridComplete } from './utils/takuzuLogic';
import { getAIHint } from './services/geminiService';

const App: React.FC = () => {
  const [grid, setGrid] = useState<Grid>(createEmptyGrid());
  const [gameState, setGameState] = useState<GameState>(GameState.SETUP);
  const [errors, setErrors] = useState<ErrorDetail[]>([]);
  const [showErrors, setShowErrors] = useState(false);
  const [aiHint, setAiHint] = useState<string | null>(null);
  const [loadingHint, setLoadingHint] = useState(false);

  const handleCellClick = useCallback((r: number, c: number) => {
    if (gameState === GameState.WON) return;

    setGrid(prevGrid => {
      const newGrid = prevGrid.map(row => row.map(cell => ({ ...cell })));
      const cell = newGrid[r][c];

      if (gameState === GameState.PLAYING && cell.isFixed) {
        return prevGrid; // Fixed cells cannot be changed during play
      }

      cell.value = getNextTileValue(cell.value);
      return newGrid;
    });
    setAiHint(null);
  }, [gameState]);

  const startGame = () => {
    const currentErrors = validateGrid(grid);
    if (currentErrors.length > 0) {
      setErrors(currentErrors);
      setShowErrors(true);
      return;
    }

    setGrid(prev => prev.map(row => row.map(cell => ({
      ...cell,
      isFixed: cell.value !== TileValue.EMPTY
    }))));
    setGameState(GameState.PLAYING);
    setErrors([]);
    setShowErrors(false);
  };

  const resetGame = () => {
    setGrid(createEmptyGrid());
    setGameState(GameState.SETUP);
    setErrors([]);
    setShowErrors(false);
    setAiHint(null);
  };

  const checkSolution = () => {
    const currentErrors = validateGrid(grid);
    setErrors(currentErrors);
    setShowErrors(true);

    if (currentErrors.length === 0 && isGridComplete(grid)) {
      setGameState(GameState.WON);
    }
  };

  const handleHint = async () => {
    setLoadingHint(true);
    const hint = await getAIHint(grid);
    setAiHint(hint);
    setLoadingHint(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 mb-2">
          TAKUZU MASTER
        </h1>
        <p className="text-gray-400 text-sm md:text-base">
          6x6 Logic Puzzle • Equal Colors • Max 2 Adjacent • Unique Lines
        </p>
      </div>

      {/* Main Game Area */}
      <div className="flex flex-col lg:flex-row gap-8 items-start justify-center w-full">
        
        {/* Left: Controls & Stats */}
        <div className="flex flex-col gap-4 w-full lg:w-64 order-2 lg:order-1">
          <div className="bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-700">
            <h2 className="font-bold text-blue-400 mb-3 flex items-center gap-2">
              <i className="fas fa-gamepad"></i>
              {gameState === GameState.SETUP ? 'Setup Mode' : gameState === GameState.WON ? 'You Won!' : 'Playing'}
            </h2>
            
            <div className="space-y-3">
              {gameState === GameState.SETUP ? (
                <>
                  <p className="text-xs text-gray-400">Place initial pieces to create your puzzle, then start.</p>
                  <button 
                    onClick={startGame}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 py-3 rounded-lg font-bold shadow-lg transition-all"
                  >
                    Start Game
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={checkSolution}
                    className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-lg font-bold shadow-lg transition-all"
                  >
                    Check Rules
                  </button>
                  <button 
                    onClick={resetGame}
                    className="w-full bg-gray-700 hover:bg-gray-600 py-3 rounded-lg font-bold shadow-lg transition-all text-gray-300"
                  >
                    Reset All
                  </button>
                </>
              )}
            </div>
          </div>

          {gameState === GameState.PLAYING && (
            <button 
              onClick={handleHint}
              disabled={loadingHint}
              className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 py-3 rounded-lg font-bold shadow-lg transition-all"
            >
              {loadingHint ? (
                <i className="fas fa-spinner fa-spin"></i>
              ) : (
                <i className="fas fa-lightbulb"></i>
              )}
              AI Master Hint
            </button>
          )}

          {errors.length > 0 && showErrors && (
            <div className="bg-red-900/30 border border-red-500/50 p-3 rounded-lg">
              <h3 className="text-red-400 text-xs font-bold uppercase mb-2">Conflicts Found:</h3>
              <ul className="text-xs text-red-200 list-disc pl-4 space-y-1">
                {errors.map((err, idx) => (
                  <li key={idx}>{err.message}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Center: The Board */}
        <div className="order-1 lg:order-2 flex flex-col items-center">
           <Board 
            grid={grid} 
            onCellClick={handleCellClick} 
            showErrors={showErrors}
          />
          {gameState === GameState.WON && (
            <div className="mt-6 animate-bounce bg-emerald-500 px-8 py-3 rounded-full shadow-2xl font-black text-xl">
              PUZZLE SOLVED! 🎉
            </div>
          )}
        </div>

        {/* Right: Hint Box */}
        {aiHint && (
          <div className="w-full lg:w-64 order-3 bg-gray-800 p-4 rounded-xl shadow-lg border border-indigo-500/50 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex justify-between items-center mb-2">
               <h3 className="text-indigo-400 font-bold text-sm">AI Advice</h3>
               <button onClick={() => setAiHint(null)} className="text-gray-500 hover:text-white">
                 <i className="fas fa-times text-xs"></i>
               </button>
            </div>
            <p className="text-sm text-gray-300 italic leading-relaxed">
              "{aiHint}"
            </p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <footer className="mt-12 text-gray-500 text-xs text-center border-t border-gray-800 pt-6 w-full">
        <div className="flex justify-center gap-6 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-white rounded-full shadow-sm"></div>
            <span>Ficha Blanca</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-black border border-gray-600 rounded-full shadow-sm"></div>
            <span>Ficha Negra</span>
          </div>
        </div>
        <p>A Takuzu Game built with React, Tailwind & Gemini AI.</p>
      </footer>
    </div>
  );
};

export default App;
