"use client";

import React, { useState, useCallback, ChangeEvent } from "react";
import { useSudokuEngine } from "./use-sudoku-engine";

// Types for component state
type CellValue = string;
type SudokuGrid = CellValue[];

interface SudokuSolverProps {
  wasmPath?: string;
}

const SudokuSolver: React.FC<SudokuSolverProps> = ({
  wasmPath = "/wasm/sudoku_pt.js",
}) => {
  // Use our custom hook to interact with the Sudoku engine
  const {
    status,
    isLoaded,
    error,
    progress,
    loadPuzzlesFromFile,
    solvePuzzle,
    startBulkSolve,
    stopProcessing,
    getPuzzle,
    getSolution,
    getSolutionsText,
    getPuzzleCount,
    isRunning,
  } = useSudokuEngine(wasmPath);

  const [grid, setGrid] = useState<SudokuGrid>(Array(81).fill(""));
  const [showPuzzleSelector, setShowPuzzleSelector] = useState<boolean>(false);
  const [showBulkContainer, setShowBulkContainer] = useState<boolean>(false);
  const [selectedPuzzleIndex, setSelectedPuzzleIndex] = useState<number>(0);
  const [batchSize, setBatchSize] = useState<number>(5000);
  const [localStatus, setLocalStatus] = useState<string>("");

  const displayStatus = localStatus || status;

  const getPuzzleString = useCallback((): string => {
    return grid.map((cell) => cell || "0").join("");
  }, [grid]);

  const fillGrid = useCallback((puzzleString: string): void => {
    const newGrid: SudokuGrid = Array(81).fill("");
    for (let i = 0; i < 81; i++) {
      newGrid[i] = puzzleString[i] === "0" ? "" : puzzleString[i];
    }
    setGrid(newGrid);
  }, []);

  const clearGrid = useCallback((): void => {
    setGrid(Array(81).fill(""));
    setLocalStatus("");
  }, []);

  const handleCellChange = useCallback(
    (index: number, value: string): void => {
      const newGrid = [...grid];
      newGrid[index] = value.replace(/[^1-9]/g, "");
      setGrid(newGrid);
    },
    [grid],
  );

  const handleFileUpload = useCallback(
    async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
      const file = event.target.files?.[0];
      if (!file) {
        console.log("No file selected");
        return;
      }

      try {
        const puzzleCount = await loadPuzzlesFromFile(file);

        if (puzzleCount === 0) {
          setLocalStatus(
            "No valid puzzles found in the file (each puzzle must be exactly 81 digits)",
          );
          setShowPuzzleSelector(false);
          setShowBulkContainer(false);
          return;
        }

        setShowPuzzleSelector(true);
        setShowBulkContainer(true);

        // Load the first puzzle
        const firstPuzzle = getPuzzle(0);
        if (firstPuzzle) {
          fillGrid(firstPuzzle);
          setSelectedPuzzleIndex(0);
        }
      } catch (error) {
        console.error("Error processing file:", error);
        setLocalStatus(
          `Error processing file: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    },
    [loadPuzzlesFromFile, getPuzzle, fillGrid],
  );

  const loadSelectedPuzzle = useCallback((): void => {
    const puzzle = getPuzzle(selectedPuzzleIndex);
    if (puzzle) {
      fillGrid(puzzle);
      setLocalStatus(`Loaded puzzle ${selectedPuzzleIndex + 1}`);
    }
  }, [selectedPuzzleIndex, getPuzzle, fillGrid]);

  const solveCurrentPuzzle = useCallback((): void => {
    if (!isLoaded) {
      setLocalStatus("WebAssembly module not loaded yet");
      return;
    }

    try {
      setLocalStatus("Solving...");
      const puzzleString = getPuzzleString();
      const result = solvePuzzle(puzzleString);

      if (result.solved && result.solution) {
        fillGrid(result.solution);
        setLocalStatus(`Solved in ${result.duration.toFixed(2)} ms`);
      } else {
        setLocalStatus("No solution found");
      }
    } catch (error) {
      setLocalStatus(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      console.error(error);
    }
  }, [isLoaded, getPuzzleString, solvePuzzle, fillGrid]);

  const bulkSolvePuzzles = useCallback(async (): Promise<void> => {
    if (!isLoaded) {
      setLocalStatus("WebAssembly module not loaded yet");
      return;
    }

    if (getPuzzleCount() === 0) {
      setLocalStatus("No puzzles loaded");
      return;
    }

    try {
      await startBulkSolve(batchSize);
    } catch (error) {
      setLocalStatus(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      console.error(error);
    }
  }, [isLoaded, getPuzzleCount, startBulkSolve, batchSize]);

  const downloadSolutions = useCallback((): void => {
    if (!progress || progress.solvedCount === 0) {
      alert("No solutions to download");
      return;
    }

    const solutionsText = getSolutionsText();

    // Create blob and download
    const blob = new Blob([solutionsText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "sudoku_solutions.txt";
    document.body.appendChild(a);
    a.click();

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }, [progress, getSolutionsText]);

  // Calculate time remaining text
  const getTimeRemainingText = (): string => {
    if (!progress) return "Estimating...";

    if (progress.currentIndex >= progress.totalPuzzles) {
      return "Complete!";
    }

    if (progress.timeRemaining === null) {
      return "Estimating...";
    }

    if (progress.timeRemaining < 60) {
      return `${progress.timeRemaining.toFixed(1)} seconds`;
    } else if (progress.timeRemaining < 3600) {
      return `${(progress.timeRemaining / 60).toFixed(1)} minutes`;
    } else {
      return `${(progress.timeRemaining / 3600).toFixed(1)} hours`;
    }
  };

  const getCompletionTimeText = (): string => {
    if (!progress) return "Calculating...";

    if (progress.currentIndex >= progress.totalPuzzles) {
      return "Done";
    }

    if (progress.estimatedCompletion === null) {
      return "Calculating...";
    }

    return progress.estimatedCompletion.toLocaleTimeString();
  };

  const progressPercent = progress
    ? progress.totalPuzzles > 0
      ? (progress.currentIndex / progress.totalPuzzles) * 100
      : 0
    : 0;

  return (
    <div className="font-sans max-w-4xl mx-auto p-5">
      <h1 className="text-2xl font-bold text-center mb-6">
        WebAssembly Sudoku Solver (Multithreaded)
      </h1>

      <div className="bg-blue-50 p-3 rounded-lg text-center mb-6">
        <p>Using multithreaded batch processing for maximum performance</p>
        <p className="text-sm text-gray-600 mt-1">
          Module Status: {isLoaded ? "Loaded" : error ? "Error" : "Loading"}
          {error ? ` (${error.message})` : ""}
        </p>
      </div>

      <div className="mb-6 text-center">
        <p className="mb-2">
          Load a text file with Sudoku puzzles (one per line, 81 characters
          each):
        </p>
        <input
          type="file"
          onChange={handleFileUpload}
          accept=".txt"
          className="block mx-auto file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      {showPuzzleSelector && (
        <div className="mb-6 text-center">
          <label htmlFor="puzzle-select" className="mr-2">
            Select puzzle:
          </label>
          <select
            id="puzzle-select"
            value={selectedPuzzleIndex}
            onChange={(e) => setSelectedPuzzleIndex(parseInt(e.target.value))}
            className="px-3 py-1 border rounded"
          >
            {Array.from(
              { length: Math.min(100, getPuzzleCount()) },
              (_, index) => (
                <option key={index} value={index}>
                  Puzzle {index + 1}
                </option>
              ),
            )}
            {getPuzzleCount() > 100 && (
              <option disabled>
                ... {getPuzzleCount() - 100} more puzzles ...
              </option>
            )}
          </select>
          <button
            onClick={loadSelectedPuzzle}
            className="ml-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Load Selected
          </button>
        </div>
      )}

      <div className="grid grid-cols-9 grid-rows-9 gap-px mx-auto mb-6 w-fit border border-gray-300">
        {Array(81)
          .fill(null)
          .map((_, index) => {
            const row = Math.floor(index / 9);
            const col = index % 9;

            // Add thicker borders between 3x3 blocks
            const borderClasses = [
              "border",
              col === 2 || col === 5
                ? "border-r-2 border-r-gray-700"
                : "border-r-gray-300",
              row === 2 || row === 5
                ? "border-b-2 border-b-gray-700"
                : "border-b-gray-300",
            ].join(" ");

            return (
              <div
                key={index}
                className={`w-10 h-10 flex items-center justify-center ${borderClasses}`}
              >
                <input
                  type="text"
                  value={grid[index]}
                  onChange={(e) => handleCellChange(index, e.target.value)}
                  maxLength={1}
                  pattern="[1-9]"
                  className="w-full h-full text-center text-lg focus:outline-none focus:bg-blue-50"
                />
              </div>
            );
          })}
      </div>

      <div className="flex justify-center gap-3 mb-6">
        <button
          onClick={solveCurrentPuzzle}
          disabled={!isLoaded}
          className={`px-4 py-2 text-white rounded ${
            isLoaded ? "bg-green-500 hover:bg-green-600" : "bg-gray-400"
          }`}
        >
          Solve Current
        </button>
        <button
          onClick={clearGrid}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Clear
        </button>
      </div>

      <div className="text-center min-h-6 mb-6">{displayStatus}</div>

      <div className="mb-6 p-5 border border-gray-200 rounded-lg bg-gray-50">
        <h2 className="text-xl font-bold mb-4">Bulk Solving</h2>
        <p className="mb-4">
          Loaded <span className="font-semibold">{getPuzzleCount()}</span>{" "}
          puzzles
        </p>

        <div className="mb-4">
          <label htmlFor="batch-size" className="mr-2">
            Batch Size:
          </label>
          <input
            type="number"
            id="batch-size"
            value={batchSize}
            onChange={(e) => setBatchSize(parseInt(e.target.value) || 5000)}
            min={100}
            max={50000}
            className="w-20 px-2 py-1 border rounded"
          />
          <span className="ml-2 text-sm text-gray-600">
            (Larger batches are more efficient with multithreading)
          </span>
        </div>

        <button
          onClick={bulkSolvePuzzles}
          disabled={isRunning() || !isLoaded}
          className={`block mx-auto px-6 py-3 text-white rounded-md ${
            isRunning() || !isLoaded
              ? "bg-gray-400"
              : "bg-green-500 hover:bg-green-600"
          }`}
        >
          Solve All Puzzles
        </button>

        <button
          onClick={stopProcessing}
          className={`block mx-auto mt-4 px-6 py-3 bg-red-500 text-white rounded-md hover:bg-red-600 ${
            isRunning() ? "" : "hidden"
          }`}
        >
          Stop Processing
        </button>

        <button
          onClick={downloadSolutions}
          className={`block mx-auto mt-4 px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 ${
            progress?.solvedCount ? "" : "hidden"
          }`}
        >
          Download Solutions
        </button>

        {progress && (
          <div className={`mt-6 ${isRunning() ? "" : "hidden"}`}>
            <div className="w-full h-5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-1 text-sm">
              <span>
                {progress.currentIndex}/{progress.totalPuzzles} (
                {progressPercent.toFixed(1)}%)
              </span>
              <span>{getTimeRemainingText()}</span>
            </div>
          </div>
        )}

        {progress && (
          <div className={`mt-6 p-3 bg-green-50 rounded-lg`}>
            <p>
              Solved:{" "}
              <span className="font-semibold">{progress.solvedCount}</span> /{" "}
              <span className="font-semibold">{progress.currentIndex}</span>{" "}
              puzzles
            </p>
            <p>
              Average solving time:{" "}
              <span className="font-semibold">
                {progress.averageSolveTime.toFixed(2)}
              </span>{" "}
              ms per puzzle
            </p>
            <p>
              Total time:{" "}
              <span className="font-semibold">
                {(progress.elapsedTime / 1000).toFixed(1)}
              </span>{" "}
              seconds
            </p>
            <p>
              Estimated completion:{" "}
              <span className="font-semibold">{getCompletionTimeText()}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SudokuSolver;
