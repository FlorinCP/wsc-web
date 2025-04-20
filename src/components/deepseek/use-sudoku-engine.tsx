"use client";

import { useState, useEffect, useCallback } from "react";
import {
  SudokuEngine,
  SudokuProgress,
  SolveResult,
} from "@/engine/sudoku-engine";

export function useSudokuEngine(wasmPath: string) {
  const [engine, setEngine] = useState<SudokuEngine | null>(null);
  const [status, setStatus] = useState<string>(
    "Initializing WebAssembly module...",
  );
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState<SudokuProgress | null>(null);

  useEffect(() => {
    const sudokuEngine = new SudokuEngine(wasmPath);

    // Set up callbacks
    sudokuEngine.setStatusCallback(setStatus);
    sudokuEngine.setProgressCallback(setProgress);

    // Initialize the engine
    sudokuEngine
      .initialize()
      .then(() => {
        setIsLoaded(true);
        setError(null);
      })
      .catch((err: Error) => {
        setError(err);
        setIsLoaded(false);
      });

    setEngine(sudokuEngine);

    // Clean up on unmount
    return () => {
      sudokuEngine.dispose();
    };
  }, [wasmPath]);

  const loadPuzzles = useCallback(
    (content: string): number => {
      if (!engine) return 0;
      return engine.loadPuzzles(content);
    },
    [engine],
  );

  // Load puzzles from file
  const loadPuzzlesFromFile = useCallback(
    async (file: File): Promise<number> => {
      if (!file || !engine) return 0;

      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
          try {
            const content = e.target?.result as string;
            if (!content) {
              reject(new Error("Could not read file content"));
              return;
            }

            const count = engine.loadPuzzles(content);
            resolve(count);
          } catch (error) {
            reject(error instanceof Error ? error : new Error(String(error)));
          }
        };

        reader.onerror = () => {
          reject(new Error("Error reading file"));
        };

        reader.readAsText(file);
      });
    },
    [engine],
  );

  // Solve a single puzzle
  const solvePuzzle = useCallback(
    (puzzleString: string): SolveResult => {
      if (!engine) {
        throw new Error("Engine not initialized");
      }
      return engine.solvePuzzle(puzzleString);
    },
    [engine],
  );

  // Start bulk solving
  const startBulkSolve = useCallback(
    (batchSize?: number): Promise<void> => {
      if (!engine) {
        return Promise.reject(new Error("Engine not initialized"));
      }
      return engine.startBulkSolve(batchSize);
    },
    [engine],
  );

  // Stop processing
  const stopProcessing = useCallback((): void => {
    if (!engine) return;
    engine.stopProcessing();
  }, [engine]);

  // Get a specific puzzle
  const getPuzzle = useCallback(
    (index: number): string | null => {
      if (!engine) return null;
      return engine.getPuzzle(index);
    },
    [engine],
  );

  // Get a specific solution
  const getSolution = useCallback(
    (index: number): string | null => {
      if (!engine) return null;
      return engine.getSolutionByIndex(index);
    },
    [engine],
  );

  // Get all solutions as text
  const getSolutionsText = useCallback((): string => {
    if (!engine) return "";
    return engine.getSolutionsText();
  }, [engine]);

  // Get puzzle count
  const getPuzzleCount = useCallback((): number => {
    if (!engine) return 0;
    return engine.getPuzzleCount();
  }, [engine]);

  // Is processing running
  const isRunning = useCallback((): boolean => {
    if (!engine) return false;
    return engine.isRunning();
  }, [engine]);

  // Return the hook API
  return {
    status,
    isLoaded,
    error,
    progress,
    loadPuzzles,
    loadPuzzlesFromFile,
    solvePuzzle,
    startBulkSolve,
    stopProcessing,
    getPuzzle,
    getSolution,
    getSolutionsText,
    getPuzzleCount,
    isRunning,
  };
}
