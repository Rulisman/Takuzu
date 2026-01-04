
import React, { useState, useCallback, useEffect } from 'react';
import Board from './components/Board';
import { TileValue, Grid, GameState, ErrorDetail } from './types';
import { createEmptyGrid, validateGrid, isGridComplete, checkConsecutiveViolation, checkCountViolation } from './utils/takuzuLogic';
import { getAIHint } from './services/geminiService';
import { playAlarmSound, startOrientalMusic, stopOrientalMusic } from './utils/audio';
import { puzzles } from './utils/puzzles';

const App: React.FC = () => {
  const [grid, setGrid] = useState<Grid>(createEmptyGrid());
  const [gameState, setGameState] = useState<GameState>(GameState.SETUP);
  const [errors, setErrors] = useState<ErrorDetail[]>([]);
  const [showErrors, setShowErrors] = useState(false);
  const [aiHint, setAiHint] = useState<string | null>(null);
  const [loadingHint, setLoadingHint] = useState(false);
  const [shakeBoard, setShakeBoard] = useState(false);
  const [violationMsg, setViolationMsg] = useState("");
  const [isMusicOn, setIsMusicOn] = useState(false);

  // Toggle Music
  useEffect(() => {
    if (isMusicOn) {
      startOrientalMusic();
    } else {
      stopOrientalMusic();
    }
    return () => stopOrientalMusic();
  }, [isMusicOn]);

  const loadPuzzle = (level: keyof typeof puzzles) => {
    setGrid(JSON.parse(JSON.stringify(puzzles[level])));
    setGameState(GameState.PLAYING);
    setErrors([]);
    setShowErrors(false);
    setAiHint(null);
  };

  const handleCellClick = useCallback((r: number, c: number) => {
    if (gameState === GameState.WON) return;

    const cell = grid[r][c];
    if (gameState === GameState.PLAYING && cell.isFixed) return; 

    let nextValue: TileValue = TileValue.EMPTY;

    const isInvalid = (val: TileValue) => {
      if (val === TileValue.EMPTY) return false;
      return checkConsecutiveViolation(grid, r, c, val) || checkCountViolation(grid, r, c, val);
    };

    const getMsg = (val: TileValue) => {
      if (checkConsecutiveViolation(grid, r, c, val)) return "¡ERROR: Máximo 2 iguales seguidas!";
      if (checkCountViolation(grid, r, c, val)) return "¡ERROR: Máximo 3 de cada color por línea!";
      return "";
    };

    if (cell.value === TileValue.EMPTY) {
      const whiteInvalid = isInvalid(TileValue.WHITE);
      const blackInvalid = isInvalid(TileValue.BLACK);
      if (whiteInvalid && !blackInvalid) nextValue = TileValue.BLACK;
      else if (!whiteInvalid) nextValue = TileValue.WHITE;
      else {
        playAlarmSound();
        setViolationMsg(getMsg(TileValue.WHITE));
        setShakeBoard(true);
        setTimeout(() => { setShakeBoard(false); setViolationMsg(""); }, 1000);
        return;
      }
    } else if (cell.value === TileValue.WHITE) {
      const blackInvalid = isInvalid(TileValue.BLACK);
      nextValue = blackInvalid ? TileValue.EMPTY : TileValue.BLACK;
    } else {
      nextValue = TileValue.EMPTY;
    }

    if (nextValue !== TileValue.EMPTY && isInvalid(nextValue)) {
      playAlarmSound();
      setViolationMsg(getMsg(nextValue));
      setShakeBoard(true);
      setTimeout(() => { setShakeBoard(false); setViolationMsg(""); }, 1000);
      return;
    }

    setGrid(prevGrid => {
      const newGrid = prevGrid.map(row => row.map(cell => ({ ...cell })));
      newGrid[r][c].value = nextValue;
      return newGrid;
    });
    setAiHint(null);
  }, [gameState, grid]);

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
    <div className="flex flex-col items-center justify-center min-h-screen p-4 max-w-5xl mx-auto font-sans">
      
      {/* HUD Superior */}
      <div className="w-full flex justify-between items-center mb-8 px-4">
        <div className="flex flex-col">
          <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-red-500 to-purple-600 tracking-tighter">
            TAKUZU ZEN
          </h1>
          <p className="text-gray-500 text-xs uppercase tracking-widest font-bold">Lógica & Armonía</p>
        </div>
        
        <button 
          onClick={() => setIsMusicOn(!isMusicOn)}
          className={`px-4 py-2 rounded-full border-2 transition-all flex items-center gap-2 font-bold text-sm ${isMusicOn ? 'bg-amber-500/20 border-amber-500 text-amber-500' : 'bg-gray-800 border-gray-700 text-gray-500'}`}
        >
          <i className={`fas ${isMusicOn ? 'fa-volume-up' : 'fa-volume-mute'}`}></i>
          {isMusicOn ? 'Música Zen ON' : 'Música OFF'}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 items-center lg:items-start justify-center w-full">
        
        {/* Lado Izquierdo: Selector de Niveles / Controles */}
        <div className="flex flex-col gap-6 w-full lg:w-72 order-2 lg:order-1">
          
          <div className="bg-gray-800/50 backdrop-blur-md p-6 rounded-2xl border border-gray-700 shadow-xl">
            <h2 className="text-amber-500 font-black mb-4 flex items-center gap-2 uppercase text-sm tracking-wider">
              <i className="fas fa-layer-group"></i> Seleccionar Nivel
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {(['EASY', 'MEDIUM', 'HARD', 'EXPERT'] as const).map(lvl => (
                <button
                  key={lvl}
                  onClick={() => loadPuzzle(lvl)}
                  className="bg-gray-700 hover:bg-amber-600 py-2 rounded-lg text-xs font-bold transition-colors uppercase"
                >
                  {lvl === 'EASY' ? 'Fácil' : lvl === 'MEDIUM' ? 'Medio' : lvl === 'HARD' ? 'Difícil' : 'Experto'}
                </button>
              ))}
            </div>
            <button 
              onClick={() => { setGrid(createEmptyGrid()); setGameState(GameState.SETUP); }}
              className="w-full mt-4 border border-gray-600 hover:bg-gray-700 py-2 rounded-lg text-xs font-bold transition-all text-gray-400"
            >
              Diseño Libre
            </button>
          </div>

          {gameState !== GameState.SETUP && (
            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 shadow-xl space-y-4">
              <button 
                onClick={checkSolution}
                className="w-full bg-indigo-600 hover:bg-indigo-500 py-3 rounded-xl font-bold shadow-lg transition-all"
              >
                Verificar Reglas
              </button>
              <button 
                onClick={handleHint}
                disabled={loadingHint}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {loadingHint ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-om"></i>}
                Pista del Maestro
              </button>
            </div>
          )}
        </div>

        {/* Centro: El Tablero */}
        <div className="order-1 lg:order-2 flex flex-col items-center relative">
          <div className={`${shakeBoard ? 'animate-shake' : ''} p-4 bg-gray-900 rounded-3xl border-8 border-gray-800 shadow-[0_0_50px_rgba(0,0,0,0.5)]`}>
             <Board 
              grid={grid} 
              onCellClick={handleCellClick} 
              showErrors={showErrors}
            />
          </div>
          
          {gameState === GameState.WON && (
            <div className="mt-8 animate-bounce bg-gradient-to-r from-amber-400 to-orange-500 px-10 py-4 rounded-full shadow-2xl font-black text-2xl text-gray-900 border-4 border-white">
              ¡ILUMINACIÓN ALCANZADA! 🎉
            </div>
          )}

          {violationMsg && (
            <div className="absolute -top-16 whitespace-nowrap text-white font-bold animate-pulse text-sm bg-red-600 px-6 py-3 rounded-full border-2 border-white shadow-2xl z-20">
              {violationMsg}
            </div>
          )}
        </div>

        {/* Lado Derecho: Feedback AI y Reglas */}
        <div className="w-full lg:w-72 order-3 space-y-6">
          {aiHint && (
            <div className="bg-amber-900/20 border border-amber-500/50 p-6 rounded-2xl animate-in fade-in slide-in-from-right-4">
              <div className="flex justify-between items-center mb-3">
                 <h3 className="text-amber-500 font-black text-xs uppercase tracking-widest">Sabiduría AI</h3>
                 <button onClick={() => setAiHint(null)} className="text-gray-500 hover:text-white">
                   <i className="fas fa-times text-xs"></i>
                 </button>
              </div>
              <p className="text-sm text-amber-100/80 italic leading-relaxed font-serif">
                "{aiHint}"
              </p>
            </div>
          )}

          <div className="bg-gray-800/30 p-6 rounded-2xl border border-gray-700">
            <h3 className="text-gray-400 font-bold text-xs uppercase mb-4 tracking-tighter">Reglas del Maestro:</h3>
            <ul className="text-[10px] text-gray-500 space-y-3 leading-tight uppercase font-bold">
              <li className="flex gap-2"><span className="text-amber-500">●</span> 3 Blancas y 3 Negras por línea.</li>
              <li className="flex gap-2"><span className="text-amber-500">●</span> Máximo 2 del mismo color seguidas.</li>
              <li className="flex gap-2"><span className="text-amber-500">●</span> Cada fila y columna es única.</li>
            </ul>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shake {
          0% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          50% { transform: translateX(8px); }
          75% { transform: translateX(-8px); }
          100% { transform: translateX(0); }
        }
        .animate-shake {
          animation: shake 0.12s cubic-bezier(.36,.07,.19,.97) both;
          animation-iteration-count: 2;
        }
      `}} />

      <footer className="mt-16 text-gray-600 text-[10px] text-center border-t border-gray-800/50 pt-8 w-full tracking-[0.2em] font-bold uppercase">
        <p>Atmósfera Zen • Takuzu Master Edition • © 2024</p>
      </footer>
    </div>
  );
};

export default App;
