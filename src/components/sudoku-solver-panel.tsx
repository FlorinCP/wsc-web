"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, FileText, Wand2, AlertTriangle } from "lucide-react"
import { useWasmSolver } from "@/hooks/use-wasm-solver"

interface SudokuSolverPanelProps {
  currentBoard: string
  onSolutionFound: (solution: number[][]) => void
}

export function SudokuSolverPanel({ currentBoard, onSolutionFound }: SudokuSolverPanelProps) {
  const { solvePuzzle, isLoading, error, isReady } = useWasmSolver()
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
      return
    }

    const solution = await solvePuzzle(fileContent)
    if (solution) {
      onSolutionFound(solution)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Sudoku Solver</CardTitle>
        <CardDescription>Solve the current puzzle or load from a file</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isReady && (
          <Alert variant="warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              WebAssembly solver requires cross-origin isolation. Some features may not work.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col gap-2">
          <Button onClick={solveCurrentBoard} disabled={isLoading || !isReady} className="w-full">
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
            <Button onClick={solveFromFile} disabled={!fileContent || isLoading || !isReady} className="flex-1">
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
