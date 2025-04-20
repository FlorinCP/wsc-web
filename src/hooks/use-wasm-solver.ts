"use client"

import { useState, useEffect, useCallback } from "react"
import { stringToBoard } from "@/utils/sudoku-utils"

// Define the complete Module type with all exported functions
interface EmscriptenModule {
  // Single puzzle solving
  ccall?: (funcName: string, returnType: string, argTypes: string[], args: any[]) => any;
  
  // Batch processing functions
  _allocateInputBuffer?: (size: number) => void;
  _allocateOutputBuffer?: (size: number) => void;
  _allocateSolvedFlags?: (size: number) => void;
  _freeAllBuffers?: () => void;
  _setPuzzle?: (index: number, puzzle: string) => void;
  _getSolution?: (index: number) => string;
  _wasSolved?: (index: number) => boolean;
  _solveBatch?: (count: number) => number;
  _getCompletedThreadCount?: () => number;
  _requestStop?: () => void;
  _resetStopFlag?: () => void;

  // Module lifecycle
  onRuntimeInitialized?: () => void;
  onAbort?: (error: any) => void;
  locateFile?: (path: string) => string;
}

declare global {
  interface Window {
    Module: EmscriptenModule;
  }
}

export function useWasmSolver() {
  const [wasmModule, setWasmModule] = useState<EmscriptenModule | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isIsolated, setIsIsolated] = useState(false)
  const [batchProgress, setBatchProgress] = useState<number>(0)

  // Load the WASM module
  useEffect(() => {
    const crossOriginIsolated = typeof window !== "undefined" && window.crossOriginIsolated === true
    setIsIsolated(crossOriginIsolated)

    if (!crossOriginIsolated) {
      setError("Cross-Origin Isolation is not enabled. WebAssembly threads may not work.")
      return
    }

    let isMounted = true
    let currentModule: Partial<EmscriptenModule> | null = null

    async function loadWasm() {
      try {
        setIsLoading(true)
        setError(null)

        // Check if Module is already initialized
        if (window.Module?.ccall) {
          setWasmModule(window.Module)
          setIsLoading(false)
          return
        }

        // Create a new Module object
        currentModule = {
          locateFile: (path: string) => {
            if (path.endsWith(".wasm")) return "/wasm/sudoku_pt.wasm"
            return path
          },
          onRuntimeInitialized: () => {
            if (isMounted) {
              setWasmModule(window.Module)
              setIsLoading(false)
            }
          },
          onAbort: (error: any) => {
            if (isMounted) {
              setError(`WebAssembly initialization failed: ${error}`)
              setIsLoading(false)
            }
          },
        }

        // Set the global Module object
        window.Module = currentModule

        // Load the WASM module using a script tag
        const script = document.createElement('script')
        script.src = '/wasm/sudoku_pt.js'
        script.async = true
        script.onerror = () => {
          if (isMounted) {
            setError('Failed to load WebAssembly script')
            setIsLoading(false)
          }
        }
        document.body.appendChild(script)

        // Wait for the script to load
        await new Promise<void>((resolve, reject) => {
          script.onload = () => resolve()
          script.onerror = () => reject(new Error('Failed to load WebAssembly script'))
        })
      } catch (err) {
        console.error("Failed to load WASM module:", err)
        if (isMounted) {
          setError(`Failed to load Sudoku solver: ${err instanceof Error ? err.message : String(err)}`)
          setIsLoading(false)
        }
      }
    }

    loadWasm()

    return () => {
      isMounted = false
      if (window.Module?._freeAllBuffers) {
        try {
          window.Module._freeAllBuffers()
        } catch (e) {
          console.error("Error freeing WASM memory:", e)
        }
      }
      // Only clear Module if it's our instance
      if (currentModule && window.Module === currentModule) {
        window.Module = {} as EmscriptenModule
      }
    }
  }, [])

  // Single puzzle solving
  const solvePuzzle = useCallback(async (puzzleStr: string): Promise<number[][] | null> => {
    if (!wasmModule?.ccall) {
      setError("Solver not loaded yet")
      return null
    }

    if (!isIsolated) {
      setError("Cross-Origin Isolation is required for WebAssembly threads")
      return null
    }

    try {
      setIsLoading(true)
      setError(null)

      const formattedPuzzle = puzzleStr
        .replace(/[^\d.]/g, "")
        .replace(/\./g, "0")
        .padEnd(81, "0")
        .substring(0, 81)

      const result = wasmModule.ccall("solveSudoku", "string", ["string"], [formattedPuzzle])

      if (result.startsWith("No solution")) {
        setError("No solution found for this puzzle")
        return null
      }

      return stringToBoard(result)
    } catch (err) {
      console.error("Error solving puzzle:", err)
      setError("Failed to solve the puzzle")
      return null
    } finally {
      setIsLoading(false)
    }
  }, [wasmModule, isIsolated])

  // Batch puzzle solving
  const solveBatch = useCallback(async (puzzles: string[]): Promise<{
    solutions: (number[][] | null)[];
    solvedCount: number;
  }> => {
    if (!wasmModule?._solveBatch || !wasmModule._allocateInputBuffer || !wasmModule._allocateOutputBuffer || 
        !wasmModule._allocateSolvedFlags || !wasmModule._setPuzzle || !wasmModule._getSolution || 
        !wasmModule._wasSolved || !wasmModule._freeAllBuffers) {
      setError("Batch solver not loaded yet")
      return { solutions: [], solvedCount: 0 }
    }

    if (!isIsolated) {
      setError("Cross-Origin Isolation is required for WebAssembly threads")
      return { solutions: [], solvedCount: 0 }
    }

    try {
      setIsLoading(true)
      setError(null)
      setBatchProgress(0)

      const count = puzzles.length
      
      // Allocate buffers
      wasmModule._allocateInputBuffer(count * 81)
      wasmModule._allocateOutputBuffer(count * 81)
      wasmModule._allocateSolvedFlags(count)
      if (wasmModule._resetStopFlag) {
        wasmModule._resetStopFlag()
      }

      // Set puzzles in input buffer
      puzzles.forEach((puzzle, index) => {
        const formattedPuzzle = puzzle
          .replace(/[^\d.]/g, "")
          .replace(/\./g, "0")
          .padEnd(81, "0")
          .substring(0, 81)
        wasmModule._setPuzzle(index, formattedPuzzle)
      })

      // Start batch solving
      const solvedCount = wasmModule._solveBatch(count)

      // Get solutions
      const solutions: (number[][] | null)[] = []
      for (let i = 0; i < count; i++) {
        if (wasmModule._wasSolved(i)) {
          const solution = wasmModule._getSolution(i)
          solutions.push(stringToBoard(solution))
        } else {
          solutions.push(null)
        }
      }

      return { solutions, solvedCount }
    } catch (err) {
      console.error("Error solving batch:", err)
      setError("Failed to solve batch of puzzles")
      return { solutions: [], solvedCount: 0 }
    } finally {
      setIsLoading(false)
      setBatchProgress(100)
      if (wasmModule._freeAllBuffers) {
        wasmModule._freeAllBuffers()
      }
    }
  }, [wasmModule, isIsolated])

  // Stop batch processing
  const stopBatch = useCallback(() => {
    if (wasmModule?._requestStop) {
      wasmModule._requestStop()
    }
  }, [wasmModule])

  return {
    solvePuzzle,
    solveBatch,
    stopBatch,
    isLoading,
    error,
    isReady: !!wasmModule && isIsolated,
    batchProgress,
  }
}
