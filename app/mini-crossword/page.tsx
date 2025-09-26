"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { dailyGameManager } from "@/lib/dailyGames";
import { getTodaysMiniCrossword } from "@/lib/data";

type Cell = {
  letter: string;
  number?: number;
  isBlack: boolean;
  isSelected: boolean;
  isCorrect: boolean;
  clue: {
    across?: string;
    down?: string;
  };
};

type Clue = {
  number: number;
  text: string;
  answer: string;
  direction: "across" | "down";
  startRow: number;
  startCol: number;
  length: number;
};


export default function MiniCrosswordPage() {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [clues, setClues] = useState<{ across: Clue[]; down: Clue[] }>({ across: [], down: [] });
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [currentClue, setCurrentClue] = useState<Clue | null>(null);
  const [gameWon, setGameWon] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [hasPlayedToday, setHasPlayedToday] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only check on client side
    if (typeof window !== "undefined") {
      const played = dailyGameManager.hasPlayedToday("miniCrossword");
      setHasPlayedToday(played);
      
      if (played) {
        setGameComplete(true);
        const gameState = dailyGameManager.getGameState("miniCrossword");
        setCurrentTime(gameState.time);
      } else {
        initializeGame();
      }
    } else {
      initializeGame();
    }
  }, []);

  const initializeGame = () => {
    const puzzleData = getTodaysMiniCrossword();
    const { grid: gridData, clues: cluesData } = puzzleData;
    
    const newGrid: Cell[][] = gridData.map((row, rowIndex) =>
      row.map((cell, colIndex) => ({
        letter: cell || "",
        isBlack: !cell,
        isSelected: false,
        isCorrect: false,
        clue: {
          across: cluesData.across.find(c => 
            c.startRow === rowIndex && c.startCol <= colIndex && colIndex < c.startCol + c.length
          )?.text,
          down: cluesData.down.find(c => 
            c.startRow <= rowIndex && rowIndex < c.startRow + c.length && c.startCol === colIndex
          )?.text,
        },
      }))
    );

    setGrid(newGrid);
    setClues(cluesData);
  };

  const startGame = () => {
    setGameStarted(true);
    setStartTime(Date.now());
    setCurrentTime(0);
    
    // Start timer
    timerRef.current = setInterval(() => {
      setCurrentTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
  };

  const selectCell = (row: number, col: number) => {
    if (gameComplete || !gameStarted) return;
    
    const cell = grid[row][col];
    if (cell.isBlack) return;

    setSelectedCell({ row, col });
    
    // Find the clue for this cell
    const acrossClue = clues.across.find(c => 
      c.startRow === row && c.startCol <= col && col < c.startCol + c.length
    );
    const downClue = clues.down.find(c => 
      c.startRow <= row && row < c.startRow + c.length && c.startCol === col
    );

    if (acrossClue && downClue) {
      // If cell is part of both across and down, prioritize across
      setCurrentClue(acrossClue);
    } else if (acrossClue) {
      setCurrentClue(acrossClue);
    } else if (downClue) {
      setCurrentClue(downClue);
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (!selectedCell || gameComplete) return;

    const { row, col } = selectedCell;
    const newGrid = [...grid];

    if (e.key === "Backspace") {
      newGrid[row][col].letter = "";
    } else if (e.key.match(/[A-Za-z]/)) {
      newGrid[row][col].letter = e.key.toUpperCase();
      
      // Check if this completes a word
      checkWordCompletion(newGrid, row, col);
    } else if (e.key === "ArrowRight" || e.key === "ArrowLeft" || 
               e.key === "ArrowUp" || e.key === "ArrowDown") {
      moveSelection(e.key);
    }

    setGrid(newGrid);
  };

  const moveSelection = (direction: string) => {
    if (!selectedCell) return;

    let { row, col } = selectedCell;
    const currentClue = clues.across.find(c => 
      c.startRow === row && c.startCol <= col && col < c.startCol + c.length
    ) || clues.down.find(c => 
      c.startRow <= row && row < c.startRow + c.length && c.startCol === col
    );

    if (!currentClue) return;

    if (currentClue.direction === "across") {
      if (direction === "ArrowLeft" && col > currentClue.startCol) {
        col--;
      } else if (direction === "ArrowRight" && col < currentClue.startCol + currentClue.length - 1) {
        col++;
      }
    } else {
      if (direction === "ArrowUp" && row > currentClue.startRow) {
        row--;
      } else if (direction === "ArrowDown" && row < currentClue.startRow + currentClue.length - 1) {
        row++;
      }
    }

    selectCell(row, col);
  };

  const checkWordCompletion = (newGrid: Cell[][], row: number, col: number) => {
    // Check across word
    const acrossClue = clues.across.find(c => 
      c.startRow === row && c.startCol <= col && col < c.startCol + c.length
    );
    
    if (acrossClue) {
      const word = acrossClue.answer;
      let isComplete = true;
      let isCorrect = true;
      
      for (let i = 0; i < acrossClue.length; i++) {
        const cellLetter = newGrid[acrossClue.startRow][acrossClue.startCol + i].letter;
        if (!cellLetter) {
          isComplete = false;
          break;
        }
        if (cellLetter !== word[i]) {
          isCorrect = false;
        }
      }
      
      if (isComplete && isCorrect) {
        // Mark all cells in this word as correct
        for (let i = 0; i < acrossClue.length; i++) {
          newGrid[acrossClue.startRow][acrossClue.startCol + i].isCorrect = true;
        }
      }
    }

    // Check down word
    const downClue = clues.down.find(c => 
      c.startRow <= row && row < c.startRow + c.length && c.startCol === col
    );
    
    if (downClue) {
      const word = downClue.answer;
      let isComplete = true;
      let isCorrect = true;
      
      for (let i = 0; i < downClue.length; i++) {
        const cellLetter = newGrid[downClue.startRow + i][downClue.startCol].letter;
        if (!cellLetter) {
          isComplete = false;
          break;
        }
        if (cellLetter !== word[i]) {
          isCorrect = false;
        }
      }
      
      if (isComplete && isCorrect) {
        // Mark all cells in this word as correct
        for (let i = 0; i < downClue.length; i++) {
          newGrid[downClue.startRow + i][downClue.startCol].isCorrect = true;
        }
      }
    }

    // Check if all words are complete
    const allWordsComplete = [...clues.across, ...clues.down].every(clue => {
      for (let i = 0; i < clue.length; i++) {
        const cell = clue.direction === "across" 
          ? newGrid[clue.startRow][clue.startCol + i]
          : newGrid[clue.startRow + i][clue.startCol];
        if (!cell.isCorrect) return false;
      }
      return true;
    });

    if (allWordsComplete && !gameWon) {
      setGameWon(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Mark game as played
      dailyGameManager.markGamePlayed("miniCrossword", true, { time: currentTime });
      setGameComplete(true);
    }
  };

  useEffect(() => {
    if (gameStarted && !gameComplete) {
      document.addEventListener("keydown", handleKeyPress);
      return () => document.removeEventListener("keydown", handleKeyPress);
    }
  }, [selectedCell, gameStarted, gameComplete]);

  const shareResults = () => {
    const shareText = dailyGameManager.getShareText("miniCrossword");
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
    } else {
      alert(shareText);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
  };

  if (hasPlayedToday) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-8">Mini Crossword</h1>
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-8 mb-6">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">Puzzle Complete!</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              You solved today's Mini Crossword in {formatTime(currentTime)}
            </p>
            <button
              onClick={shareResults}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Share Results
            </button>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-500">
            Come back tomorrow for a new puzzle!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">Mini Crossword</h1>
          <div className="flex items-center gap-4">
            {gameStarted && (
              <div className="text-lg font-mono text-slate-600 dark:text-slate-400">
                {formatTime(currentTime)}
              </div>
            )}
            {gameComplete && (
              <button
                onClick={shareResults}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Share
              </button>
            )}
          </div>
        </div>

        {!gameStarted ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🧩</div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Ready to solve today's Mini Crossword?</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Complete the puzzle as fast as you can!
            </p>
            <button
              onClick={startGame}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
            >
              Start Puzzle
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Crossword Grid */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-6 gap-1 max-w-md mx-auto">
                {grid.map((row, rowIndex) =>
                  row.map((cell, colIndex) => (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={cn(
                        "aspect-square border-2 flex items-center justify-center text-lg font-bold cursor-pointer transition-colors relative",
                        cell.isBlack
                          ? "bg-black border-black"
                          : cell.isSelected
                          ? "bg-blue-200 dark:bg-blue-800 border-blue-500"
                          : cell.isCorrect
                          ? "bg-green-200 dark:bg-green-800 border-green-500"
                          : "bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600"
                      )}
                      onClick={() => selectCell(rowIndex, colIndex)}
                    >
                      {cell.number && (
                        <div className="absolute top-0 left-0 text-xs text-slate-500">
                          {cell.number}
                        </div>
                      )}
                      {cell.letter}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Clues */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">Across</h3>
                <div className="space-y-2">
                  {clues.across.map((clue) => (
                    <div
                      key={clue.number}
                      className={cn(
                        "p-3 rounded-lg cursor-pointer transition-colors",
                        currentClue?.number === clue.number && currentClue?.direction === "across"
                          ? "bg-blue-100 dark:bg-blue-900"
                          : "hover:bg-slate-100 dark:hover:bg-slate-800"
                      )}
                      onClick={() => setCurrentClue(clue)}
                    >
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{clue.number}.</span> 
                      <span className="text-slate-700 dark:text-slate-300 ml-1">{clue.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">Down</h3>
                <div className="space-y-2">
                  {clues.down.map((clue) => (
                    <div
                      key={clue.number}
                      className={cn(
                        "p-3 rounded-lg cursor-pointer transition-colors",
                        currentClue?.number === clue.number && currentClue?.direction === "down"
                          ? "bg-blue-100 dark:bg-blue-900"
                          : "hover:bg-slate-100 dark:hover:bg-slate-800"
                      )}
                      onClick={() => setCurrentClue(clue)}
                    >
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{clue.number}.</span> 
                      <span className="text-slate-700 dark:text-slate-300 ml-1">{clue.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}