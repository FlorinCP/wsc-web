"use client";

import { useState, useCallback, useEffect } from "react";
import type { CellType } from "@/types/sudoku";
import {
  createPuzzle,
  generateSolvedBoard,
  isValidMove,
  isValidBoard,
  isBoardComplete,
} from "@/utils/sudoku-core";

export type Difficulty = "easy" | "medium" | "hard";

const DIFFICULTIES = {
  easy: { empty: 30 },
  medium: { empty: 40 },
  hard: { empty: 50 },
};

export function useSudokuGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [solvedBoard, setSolvedBoard] = useState<number[][]>(
    generateSolvedBoard(),
  );
  const [board, setBoard] = useState<CellType[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [isNotesMode, setIsNotesMode] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [history, setHistory] = useState<CellType[][][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);

  const getCurrentBoardAsString = useCallback(() => {
    if (!board.length) return "";

    let result = "";
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        result += board[row][col].value || "0";
      }
    }
    return result;
  }, [board]);

  const updateHighlighting = useCallback(
    (row: number, col: number) => {
      const newBoard = [...board];

      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          newBoard[r][c] = {
            ...newBoard[r][c],
            isHighlighted: false,
            isRelated: false,
          };
        }
      }

      if (row >= 0 && col >= 0) {
        newBoard[row][col].isHighlighted = true;

        // Highlight related cells (same row, column, and box)
        for (let i = 0; i < 9; i++) {
          newBoard[row][i].isRelated = true;
          newBoard[i][col].isRelated = true;
        }

        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let r = boxRow; r < boxRow + 3; r++) {
          for (let c = boxCol; c < boxCol + 3; c++) {
            newBoard[r][c].isRelated = true;
          }
        }

        const value = newBoard[row][col].value;
        if (value !== 0) {
          for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
              if (newBoard[r][c].value === value) {
                newBoard[r][c].isRelated = true;
              }
            }
          }
        }
      }

      setBoard(newBoard);
    },
    [board],
  );

  const handleCellSelect = useCallback(
    (row: number, col: number) => {
      setSelectedCell({ row, col });
      updateHighlighting(row, col);
    },
    [updateHighlighting],
  );

  const handleNumberInput = useCallback(
    (number: number) => {
      if (!selectedCell) return;

      const { row, col } = selectedCell;
      if (board[row][col].isOriginal) return;

      // Save current state to history
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(JSON.parse(JSON.stringify(board)));
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);

      const newBoard = [...board];

      if (number === 0) {
        // Clear the cell
        newBoard[row][col] = {
          ...newBoard[row][col],
          value: 0,
          notes: [],
          isInvalid: false,
        };
      } else if (isNotesMode) {
        // Toggle note
        const notes = [...newBoard[row][col].notes];
        const index = notes.indexOf(number);

        if (index === -1) {
          notes.push(number);
        } else {
          notes.splice(index, 1);
        }

        newBoard[row][col] = {
          ...newBoard[row][col],
          notes,
          value: 0, // Clear value when adding notes
          isInvalid: false,
        };
      } else {
        // Set value
        const isValid = isValidMove(
          board.map((row) => row.map((cell) => cell.value)),
          row,
          col,
          number,
        );

        newBoard[row][col] = {
          ...newBoard[row][col],
          value: number,
          notes: [], // Clear notes when setting value
          isInvalid: !isValid,
        };
      }

      setBoard(newBoard);

      const values = newBoard.map((row) => row.map((cell) => cell.value));
      if (isBoardComplete(values) && isValidBoard(values)) {
        setIsRunning(false);
        setShowCompletionDialog(true);
      }
    },
    [board, history, historyIndex, isNotesMode, selectedCell],
  );

  const handleClearCell = useCallback(() => {
    if (!selectedCell) return;

    const { row, col } = selectedCell;
    if (board[row][col].isOriginal) return;

    // Save current state to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(board)));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    const newBoard = [...board];
    newBoard[row][col] = {
      ...newBoard[row][col],
      value: 0,
      notes: [],
      isInvalid: false,
    };

    setBoard(newBoard);
  }, [selectedCell, board, history, historyIndex]);

  const initializeBoard = useCallback(() => {
    const newSolvedBoard = generateSolvedBoard();
    setSolvedBoard(newSolvedBoard);

    const puzzle = createPuzzle(newSolvedBoard, DIFFICULTIES[difficulty].empty);
    const newBoard: CellType[][] = [];

    for (let row = 0; row < 9; row++) {
      const newRow: CellType[] = [];
      for (let col = 0; col < 9; col++) {
        newRow.push({
          value: puzzle[row][col],
          isOriginal: puzzle[row][col] !== 0,
          notes: [],
          isHighlighted: false,
          isRelated: false,
          isInvalid: false,
        });
      }
      newBoard.push(newRow);
    }

    setBoard(newBoard);
    setSelectedCell(null);
    setHistory([]);
    setHistoryIndex(-1);
    setTimer(0);
    setIsRunning(true);
    setShowCompletionDialog(false);
  }, [difficulty]);

  const handleSolutionFound = useCallback(
    (solution: number[][]) => {
      // Save current state to history
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(JSON.parse(JSON.stringify(board)));
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);

      // Update the board with the solution
      const newBoard = [...board];
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (!newBoard[row][col].isOriginal) {
            newBoard[row][col] = {
              ...newBoard[row][col],
              value: solution[row][col],
              notes: [],
              isInvalid: false,
            };
          }
        }
      }

      setBoard(newBoard);
      setIsRunning(false);
    },
    [board, history, historyIndex],
  );

  const handleUndo = useCallback(() => {
    if (historyIndex >= 0) {
      setBoard(JSON.parse(JSON.stringify(history[historyIndex])));
      setHistoryIndex(historyIndex - 1);
    }
  }, [history, historyIndex]);

  const handleHint = useCallback(() => {
    if (!selectedCell) return;

    const { row, col } = selectedCell;
    if (board[row][col].isOriginal) return;

    // Save current state to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(board)));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    const newBoard = [...board];
    newBoard[row][col] = {
      ...newBoard[row][col],
      value: solvedBoard[row][col],
      notes: [],
      isInvalid: false,
    };

    setBoard(newBoard);

    const values = newBoard.map((row) => row.map((cell) => cell.value));
    if (isBoardComplete(values)) {
      setIsRunning(false);
      setShowCompletionDialog(true);
    }
  }, [board, history, historyIndex, selectedCell, solvedBoard]);

  const handleCheck = useCallback(() => {
    const newBoard = [...board];

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (newBoard[row][col].value !== 0) {
          const isValid = newBoard[row][col].value === solvedBoard[row][col];
          newBoard[row][col].isInvalid = !isValid;
        }
      }
    }

    setBoard(newBoard);
  }, [board, solvedBoard]);

  // Toggle notes mode
  const toggleNotesMode = useCallback(() => {
    setIsNotesMode((prev) => !prev);
  }, []);

  // Initialize the game
  useEffect(() => {
    initializeBoard();
  }, [initializeBoard]);

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning]);

  // Format timer
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  return {
    // State
    board,
    selectedCell,
    isNotesMode,
    timer,
    difficulty,
    showCompletionDialog,
    historyIndex,
    solvedBoard,

    // Actions
    handleCellSelect,
    handleNumberInput,
    handleClearCell,
    initializeBoard,
    handleSolutionFound,
    handleUndo,
    handleHint,
    handleCheck,
    toggleNotesMode,
    setDifficulty,
    setShowCompletionDialog,
    getCurrentBoardAsString,
    formatTime,
  };
}
