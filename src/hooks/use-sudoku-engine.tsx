"use client";

import { useState, useEffect, useCallback } from "react";
import { SudokuEngine, SudokuProgress, SolveResult } from "sudoku-wasm-engine";
import { toast } from "sonner";

export function useSudokuEngine() {
  const [engine, setEngine] = useState<SudokuEngine | null>(null);
  const [status, setStatus] = useState<string>(
    "Initializing WebAssembly module...",
  );
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState<SudokuProgress | null>(null);

  useEffect(() => {
    const sudokuEngine = new SudokuEngine("./wasm/sudoku_pt.js");

    sudokuEngine.setStatusCallback(setStatus);
    sudokuEngine.setProgressCallback(setProgress);

    sudokuEngine
      .initialize()
      .then(() => {
        setIsLoaded(true);
        setError(null);
        toast.success("Sudoku engine loaded successfully");
      })
      .catch((err: Error) => {
        setError(err);
        setIsLoaded(false);
      });

    setEngine(sudokuEngine);

    return () => {
      sudokuEngine.dispose();
    };
  }, []);

  const loadPuzzles = useCallback(
    (content: string): number => {
      if (!engine) return 0;
      return engine.loadPuzzles(content);
    },
    [engine],
  );

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

        toast.info("Loading puzzles from file...");
        reader.readAsText(file);
      });
    },
    [engine],
  );

  const solvePuzzle = useCallback(
    (puzzleString: string): SolveResult => {
      if (!engine) {
        toast.error("Engine not initialized");
        throw new Error("Engine not initialized");
      }
      return engine.solvePuzzle(puzzleString);
    },
    [engine],
  );

  const startBulkSolve = useCallback(
    (batchSize?: number): Promise<void> => {
      if (!engine) {
        return Promise.reject(new Error("Engine not initialized"));
      }
      toast.info("Starting bulk solve...");
      return engine.startBulkSolve(batchSize);
    },
    [engine],
  );

  const stopProcessing = useCallback((): void => {
    if (!engine) return;
    engine.stopProcessing();
  }, [engine]);

  const getPuzzle = useCallback(
    (index: number): string | null => {
      if (!engine) return null;
      return engine.getPuzzle(index);
    },
    [engine],
  );

  const getSolution = useCallback(
    (index: number): string | null => {
      if (!engine) return null;
      return engine.getSolutionByIndex(index);
    },
    [engine],
  );

  const getSolutionsText = useCallback((): string => {
    if (!engine) return "";
    return engine.getSolutionsText();
  }, [engine]);

  const getPuzzleCount = useCallback((): number => {
    if (!engine) return 0;
    return engine.getPuzzleCount();
  }, [engine]);

  const isRunning = useCallback((): boolean => {
    if (!engine) return false;
    return engine.isRunning();
  }, [engine]);

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
