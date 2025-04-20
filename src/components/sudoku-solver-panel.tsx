"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, FileText, Wand2, AlertTriangle } from "lucide-react"
import { useWasmSolver } from "@/hooks/use-wasm-solver"
import { parseSudokuFile } from "@/utils/sudoku-utils"

interface SudokuSolverPanelProps {
  currentBoard: string
  onSolutionFound: (solution: number[][]) => void
}

export function SudokuSolverPanel({ currentBoard, onSolutionFound }: SudokuSolverPanelProps) {
  const { solvePuzzle, isLoading, error, setError, wasmLoaded, isCrossOriginIsolated } = useWasmSolver()
  const [fileContent, setFileContent] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Solve the current board
  const solveCurrentBoard = async () => {
    const solution = await solvePuzzle(currentBoard)
    if (solution) {
      onSolutionFound(solution)
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
  const solveFromFile = async () => {
    if (!fileContent) {
      setError("Please upload a file first.")
      return
    }

    try {
      // Parse the file content to get the Sudoku puzzle
      const formattedContent = parseSudokuFile(fileContent)
      if (formattedContent.length < 81) {
        setError("Invalid puzzle format in file.")
        return
      }

      const solution = await solvePuzzle(formattedContent)
      if (solution) {
        onSolutionFound(solution)
      }
    } catch (err) {
      console.error("Error parsing file:", err)
      setError("Failed to parse the uploaded file.")
    }
  }

  if (!isCrossOriginIsolated) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Sudoku Solver</CardTitle>
          <CardDescription>WebAssembly with threads requires Cross-Origin Isolation</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Cross-Origin Isolation Not Enabled</AlertTitle>
            <AlertDescription>
              This feature requires Cross-Origin Isolation to be enabled on the server. Please make sure your server
              sets the COOP and COEP headers as described in the documentation.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            onClick={() =>
              window.open(
                "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer#security_requirements",
                "_blank",
              )
            }
          >
            Learn More
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Sudoku Solver</CardTitle>
        <CardDescription>Solve the current puzzle or load from a file</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2">
          <Button onClick={solveCurrentBoard} disabled={isLoading || !wasmLoaded} className="w-full">
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
