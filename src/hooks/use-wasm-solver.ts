"use client"

import { useState, useEffect, useRef } from "react"
import {stringToBoard} from "../../utils/sudoku-utils";

// Define the interface for the WASM module with pthread support
interface SudokuWasm {
  _solveSudoku: (puzzlePtr: number) => number
  _solveBatch: (count: number) => number
  _allocateInputBuffer: (size: number) => void
  _allocateOutputBuffer: (size: number) => void
  _allocateSolvedFlags: (size: number) => void
  _freeAllBuffers: () => void
  _setPuzzle: (index: number, puzzlePtr: number) => void
  _getSolution: (index: number) => number
  _wasSolved: (index: number) => boolean
  _getCompletedThreadCount: () => number
  _requestStop: () => void
  _resetStopFlag: () => void
  _malloc: (size: number) => number
  _free: (ptr: number) => void
  HEAPU8: Uint8Array
  ccall: (name: string, returnType: string, argTypes: string[], args: any[]) => any
  cwrap: (name: string, returnType: string, argTypes: string[]) => (...args: any[]) => any
}

export function useWasmSolver() {
  const [wasmModule, setWasmModule] = useState<SudokuWasm | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCrossOriginIsolated, setIsCrossOriginIsolated] = useState(false)
  const moduleRef = useRef<any>(null)

  // Check if the browser environment supports cross-origin isolation
  useEffect(() => {
    // Check if the page is cross-origin isolated (required for SharedArrayBuffer)
    setIsCrossOriginIsolated(typeof window !== "undefined" && window.crossOriginIsolated === true)

    if (typeof window !== "undefined" && !window.crossOriginIsolated) {
      console.warn(
        "Cross-Origin Isolation is not enabled. WebAssembly threads may not work. " +
          "Make sure your server sets the COOP and COEP headers.",
      )
    }
  }, [])

  // Load the WASM module
  useEffect(() => {
    async function loadWasm() {
      if (moduleRef.current) return

      try {
        setIsLoading(true)
        setError(null)

        // Create a global variable to receive the module
        // This is necessary because Emscripten's pthread implementation
        // needs a global reference
        window.Module = window.Module || {}

        // Add locateFile to help Emscripten find the .wasm file
        window.Module.locateFile = (path: string) => {
          if (path.endsWith(".wasm")) {
            return "/sudoku_pt.wasm"
          }
          return path
        }

        // Load the JavaScript glue code that Emscripten generated
        const script = document.createElement("script")
        script.src = "./wasm/sudoku_pt.js"
        script.async = true

        // Wait for the script to load and initialize
        const scriptLoaded = new Promise((resolve, reject) => {
          script.onload = resolve
          script.onerror = () => reject(new Error("Failed to load WebAssembly script"))
        })

        document.body.appendChild(script)
        await scriptLoaded

        // Wait for the module to initialize
        // Emscripten will call this when the module is ready
        window.Module.onRuntimeInitialized = () => {
          moduleRef.current = window.Module
          setWasmModule(window.Module as unknown as SudokuWasm)
          setIsLoading(false)
        }

        // Handle any errors during initialization
        window.Module.onAbort = (error: any) => {
          setError(`WebAssembly module initialization failed: ${error}`)
          setIsLoading(false)
        }
      } catch (err) {
        console.error("Failed to load WASM module:", err)
        setError(`Failed to load Sudoku solver: ${err instanceof Error ? err.message : String(err)}`)
        setIsLoading(false)
      }
    }

    if (typeof window !== "undefined" && isCrossOriginIsolated) {
      loadWasm()
    }

    // Cleanup function
    return () => {
      if (moduleRef.current && moduleRef.current._freeAllBuffers) {
        try {
          moduleRef.current._freeAllBuffers()
        } catch (e) {
          console.error("Error freeing WASM memory:", e)
        }
      }
    }
  }, [isCrossOriginIsolated])

  // Format a board string for the WASM module
  const formatBoardForWasm = (boardStr: string): string => {
    // Remove any non-digit characters and replace spaces or dots with zeros
    return boardStr
      .replace(/[^\d.]/g, "")
      .replace(/\./g, "0")
      .padEnd(81, "0")
      .substring(0, 81)
  }

  // Solve a Sudoku puzzle using the WASM module
  const solvePuzzle = async (puzzleStr: string): Promise<number[][] | null> => {
    if (!wasmModule) {
      setError("Solver not loaded yet. Please wait.")
      return null
    }

    if (!isCrossOriginIsolated) {
      setError(
        "Cross-Origin Isolation is not enabled. WebAssembly threads cannot be used. " +
          "Please make sure your server sets the COOP and COEP headers.",
      )
      return null
    }

    try {
      setIsLoading(true)
      setError(null)

      const formattedBoard = formatBoardForWasm(puzzleStr)

      // Use ccall for a cleaner interface with the C++ functions
      const result = wasmModule.ccall("solveSudoku", "string", ["string"], [formattedBoard])

      if (result.startsWith("No solution")) {
        setError("No solution found for the current board.")
        return null
      }

      // Convert the solution to a 2D array
      return stringToBoard(result)
    } catch (err) {
      console.error("Error solving board:", err)
      setError(`An error occurred while solving the board: ${err instanceof Error ? err.message : String(err)}`)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Solve multiple puzzles in batch mode
  const solveBatch = async (puzzles: string[]): Promise<(number[][] | null)[]> => {
    if (!wasmModule) {
      setError("Solver not loaded yet. Please wait.")
      return []
    }

    if (!isCrossOriginIsolated) {
      setError(
        "Cross-Origin Isolation is not enabled. WebAssembly threads cannot be used. " +
          "Please make sure your server sets the COOP and COEP headers.",
      )
      return []
    }

    try {
      setIsLoading(true)
      setError(null)

      const count = puzzles.length

      // Allocate buffers
      wasmModule.ccall("allocateInputBuffer", null, ["number"], [count * 81])
      wasmModule.ccall("allocateOutputBuffer", null, ["number"], [count * 81])
      wasmModule.ccall("allocateSolvedFlags", null, ["number"], [count])

      // Set puzzles
      for (let i = 0; i < count; i++) {
        const formattedPuzzle = formatBoardForWasm(puzzles[i])
        wasmModule.ccall("setPuzzle", null, ["number", "string"], [i, formattedPuzzle])
      }

      // Solve the batch
      const solvedCount = wasmModule.ccall("solveBatch", "number", ["number"], [count])

      // Get solutions
      const solutions: (number[][] | null)[] = []
      for (let i = 0; i < count; i++) {
        const wasSolved = wasmModule.ccall("wasSolved", "boolean", ["number"], [i])

        if (wasSolved) {
          const solution = wasmModule.ccall("getSolution", "string", ["number"], [i])
          solutions.push(stringToBoard(solution))
        } else {
          solutions.push(null)
        }
      }

      // Free buffers
      wasmModule.ccall("freeAllBuffers", null, [], [])

      return solutions
    } catch (err) {
      console.error("Error solving batch:", err)
      setError(`An error occurred while solving the batch: ${err instanceof Error ? err.message : String(err)}`)
      return []
    } finally {
      setIsLoading(false)
    }
  }

  return {
    solvePuzzle,
    solveBatch,
    isLoading,
    error,
    setError,
    wasmLoaded: !!wasmModule,
    isCrossOriginIsolated,
  }
}

// Add this to make TypeScript happy with the global Module
declare global {
  interface Window {
    Module: any
  }
}
