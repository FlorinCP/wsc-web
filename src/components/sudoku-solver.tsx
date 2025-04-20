"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, FileText, Wand2 } from "lucide-react"

// Define the interface for the WASM module
interface SudokuWasm {
  _solveSudoku: (puzzlePtr: number) => number
  _malloc: (size: number) => number
  _free: (ptr: number) => void
  HEAPU8: Uint8Array
}

export function SudokuSolver({
  currentBoard,
  onSolutionFound,
}: {
  currentBoard: string
  onSolutionFound: (solution: number[][]) => void
}) {
  const [wasmModule, setWasmModule] = useState<SudokuWasm | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileContent, setFileContent] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load the WASM module
  useEffect(() => {
    async function loadWasm() {
      try {
        setIsLoading(true)
        // In a real implementation, you would replace this URL with your actual WASM file
        const response = await fetch("/sudoku-solver.wasm")
        const wasmBytes = await response.arrayBuffer()

        const importObject = {
          env: {
            memory: new WebAssembly.Memory({ initial: 256 }),
            // Add any required environment functions here
          },
          wasi_snapshot_preview1: {
            // Add any required WASI functions here
            proc_exit: () => {},
          },
        }

        const { instance } = await WebAssembly.instantiate(wasmBytes, importObject)
        setWasmModule(instance.exports as unknown as SudokuWasm)
        setError(null)
      } catch (err) {
        console.error("Failed to load WASM module:", err)
        setError("Failed to load Sudoku solver. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    loadWasm()
  }, [])

  // Convert a string representation of a Sudoku board to the format expected by the WASM module
  const formatBoardForWasm = (boardStr: string): string => {
    // Remove any non-digit characters and replace spaces or dots with zeros
    return boardStr
      .replace(/[^\d.]/g, "")
      .replace(/\./g, "0")
      .padEnd(81, "0")
      .substring(0, 81)
  }

  // Convert a string representation of a Sudoku board to a 2D array
  const parseBoardToArray = (boardStr: string): number[][] => {
    const formattedStr = formatBoardForWasm(boardStr)
    const result: number[][] = []

    for (let i = 0; i < 9; i++) {
      const row: number[] = []
      for (let j = 0; j < 9; j++) {
        const index = i * 9 + j
        row.push(Number.parseInt(formattedStr[index], 10))
      }
      result.push(row)
    }

    return result
  }

  // Solve the current board
  const solveCurrentBoard = async () => {
    if (!wasmModule) {
      setError("Solver not loaded yet. Please wait.")
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const formattedBoard = formatBoardForWasm(currentBoard)

      // Allocate memory for the input puzzle
      const puzzlePtr = wasmModule._malloc(82) // 81 chars + null terminator

      // Copy the puzzle to WASM memory
      for (let i = 0; i < formattedBoard.length; i++) {
        wasmModule.HEAPU8[puzzlePtr + i] = formattedBoard.charCodeAt(i)
      }
      wasmModule.HEAPU8[puzzlePtr + 81] = 0 // Null terminator

      // Call the solver
      const resultPtr = wasmModule._solveSudoku(puzzlePtr)

      // Read the result
      let result = ""
      let i = 0
      while (wasmModule.HEAPU8[resultPtr + i] !== 0) {
        result += String.fromCharCode(wasmModule.HEAPU8[resultPtr + i])
        i++
      }

      // Free the allocated memory
      wasmModule._free(puzzlePtr)

      if (result.startsWith("No solution")) {
        setError("No solution found for the current board.")
        return
      }

      // Convert the solution to a 2D array and pass it to the parent component
      const solutionArray = parseBoardToArray(result)
      onSolutionFound(solutionArray)
    } catch (err) {
      console.error("Error solving board:", err)
      setError("An error occurred while solving the board.")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setFileContent(content)
    }
    reader.readAsText(file)
  }

  // Solve from file
  const solveFromFile = () => {
    if (!fileContent) {
      setError("Please upload a file first.")
      return
    }

    try {
      // Parse the file content to get the Sudoku puzzle
      // This assumes a simple format where the puzzle is represented as 81 characters
      // You may need to adjust this based on your actual file format
      const formattedContent = fileContent.replace(/[^\d.]/g, "").replace(/\./g, "0")
      if (formattedContent.length < 81) {
        setError("Invalid puzzle format in file.")
        return
      }

      // Create a board representation from the file
      const boardFromFile = parseBoardToArray(formattedContent)

      // Pass the solution to the parent component
      onSolutionFound(boardFromFile)
    } catch (err) {
      console.error("Error parsing file:", err)
      setError("Failed to parse the uploaded file.")
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Sudoku Solver</CardTitle>
        <CardDescription>Solve the current puzzle or load from a file</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2">
          <Button onClick={solveCurrentBoard} disabled={isLoading || !wasmModule} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Solving...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Solve Current Puzzle
              </>
            )}
          </Button>

          <div className="flex items-center gap-2">
            <Input ref={fileInputRef} type="file" accept=".txt" onChange={handleFileUpload} className="hidden" />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="flex-1">
              <FileText className="mr-2 h-4 w-4" />
              Upload Puzzle File
            </Button>
            <Button onClick={solveFromFile} disabled={!fileContent || isLoading} className="flex-1">
              Load & Solve
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {fileContent && (
          <div className="text-sm text-muted-foreground">File loaded: {fileContent.length} characters</div>
        )}
      </CardContent>
    </Card>
  )
}
