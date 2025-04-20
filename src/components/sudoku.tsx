"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SudokuControls } from "@/components/sudoku-controls"
import { SudokuKeypad } from "@/components/sudoku-keypad"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Clock } from "lucide-react"
import { SudokuCellPopover } from "@/components/sudoku-cell-popover"

// Difficulty levels
const DIFFICULTIES = {
  easy: { empty: 30 },
  medium: { empty: 40 },
  hard: { empty: 50 },
}

// Generate a solved Sudoku board
const generateSolvedBoard = () => {
  // For simplicity, we'll use a pre-solved board
  // In a real implementation, you'd use a proper algorithm
  return [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9],
  ]
}

// Create a puzzle by removing numbers from the solved board
const createPuzzle = (solvedBoard: number[][], difficulty: keyof typeof DIFFICULTIES) => {
  const board = solvedBoard.map((row) => [...row])
  const positions = []

  // Create a list of all positions
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      positions.push({ row, col })
    }
  }

  // Shuffle positions
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[positions[i], positions[j]] = [positions[j], positions[i]]
  }

  // Remove numbers based on difficulty
  const cellsToRemove = DIFFICULTIES[difficulty].empty
  for (let i = 0; i < cellsToRemove && i < positions.length; i++) {
    const { row, col } = positions[i]
    board[row][col] = 0
  }

  return board
}

// Check if the board is valid
const isValidBoard = (board: number[][]) => {
  // Check rows
  for (let row = 0; row < 9; row++) {
    const seen = new Set()
    for (let col = 0; col < 9; col++) {
      const value = board[row][col]
      if (value !== 0 && seen.has(value)) return false
      if (value !== 0) seen.add(value)
    }
  }

  // Check columns
  for (let col = 0; col < 9; col++) {
    const seen = new Set()
    for (let row = 0; row < 9; row++) {
      const value = board[row][col]
      if (value !== 0 && seen.has(value)) return false
      if (value !== 0) seen.add(value)
    }
  }

  // Check 3x3 boxes
  for (let boxRow = 0; boxRow < 3; boxRow++) {
    for (let boxCol = 0; boxCol < 3; boxCol++) {
      const seen = new Set()
      for (let row = boxRow * 3; row < boxRow * 3 + 3; row++) {
        for (let col = boxCol * 3; col < boxCol * 3 + 3; col++) {
          const value = board[row][col]
          if (value !== 0 && seen.has(value)) return false
          if (value !== 0) seen.add(value)
        }
      }
    }
  }

  return true
}

// Check if the board is complete
const isBoardComplete = (board: number[][]) => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) return false
    }
  }
  return true
}

// Check if a move is valid
const isValidMove = (board: number[][], row: number, col: number, value: number) => {
  // Check row
  for (let c = 0; c < 9; c++) {
    if (c !== col && board[row][c] === value) return false
  }

  // Check column
  for (let r = 0; r < 9; r++) {
    if (r !== row && board[r][col] === value) return false
  }

  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3
  const boxCol = Math.floor(col / 3) * 3
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if ((r !== row || c !== col) && board[r][c] === value) return false
    }
  }

  return true
}

export type CellType = {
  value: number
  isOriginal: boolean
  notes: number[]
  isHighlighted: boolean
  isRelated: boolean
  isInvalid: boolean
}

export function Sudoku() {
  const [difficulty, setDifficulty] = useState<keyof typeof DIFFICULTIES>("easy")
  const [solvedBoard, setSolvedBoard] = useState<number[][]>(generateSolvedBoard())
  const [board, setBoard] = useState<CellType[][]>([])
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null)
  const [isNotesMode, setIsNotesMode] = useState(false)
  const [timer, setTimer] = useState(0)
  const [isRunning, setIsRunning] = useState(true)
  const [history, setHistory] = useState<CellType[][][]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [showCompletionDialog, setShowCompletionDialog] = useState(false)

  // Update cell highlighting
  const updateHighlighting = useCallback(
    (row: number, col: number) => {
      const newBoard = [...board]

      // Reset all highlights
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          newBoard[r][c] = {
            ...newBoard[r][c],
            isHighlighted: false,
            isRelated: false,
          }
        }
      }

      // Highlight selected cell
      if (row >= 0 && col >= 0) {
        newBoard[row][col].isHighlighted = true

        // Highlight related cells (same row, column, and box)
        for (let i = 0; i < 9; i++) {
          // Same row
          newBoard[row][i].isRelated = true
          // Same column
          newBoard[i][col].isRelated = true
        }

        // Same box
        const boxRow = Math.floor(row / 3) * 3
        const boxCol = Math.floor(col / 3) * 3
        for (let r = boxRow; r < boxRow + 3; r++) {
          for (let c = boxCol; c < boxCol + 3; c++) {
            newBoard[r][c].isRelated = true
          }
        }

        // Highlight cells with the same value
        const value = newBoard[row][col].value
        if (value !== 0) {
          for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
              if (newBoard[r][c].value === value) {
                newBoard[r][c].isRelated = true
              }
            }
          }
        }
      }

      setBoard(newBoard)
    },
    [board, setBoard],
  )

  // Handle cell selection
  const handleCellSelect = useCallback(
    (row: number, col: number) => {
      if (board[row][col].isOriginal) {
        // Can still select original cells to highlight related cells
        setSelectedCell({ row, col })
      } else {
        setSelectedCell({ row, col })
      }

      // Update highlighting
      updateHighlighting(row, col)
    },
    [board, updateHighlighting],
  )

  // Handle number input
  const handleNumberInput = (number: number) => {
    if (!selectedCell) return

    const { row, col } = selectedCell
    if (board[row][col].isOriginal) return

    // Save current state to history
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(JSON.parse(JSON.stringify(board)))
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)

    const newBoard = [...board]

    if (number === 0) {
      // Clear the cell
      newBoard[row][col] = {
        ...newBoard[row][col],
        value: 0,
        notes: [],
        isInvalid: false,
      }
    } else if (isNotesMode) {
      // Toggle note
      const notes = [...newBoard[row][col].notes]
      const index = notes.indexOf(number)

      if (index === -1) {
        notes.push(number)
      } else {
        notes.splice(index, 1)
      }

      newBoard[row][col] = {
        ...newBoard[row][col],
        notes,
        value: 0, // Clear value when adding notes
        isInvalid: false,
      }
    } else {
      // Set value
      const isValid = isValidMove(
        board.map((row) => row.map((cell) => cell.value)),
        row,
        col,
        number,
      )

      newBoard[row][col] = {
        ...newBoard[row][col],
        value: number,
        notes: [], // Clear notes when setting value
        isInvalid: !isValid,
      }
    }

    setBoard(newBoard)

    // Check if the board is complete
    const values = newBoard.map((row) => row.map((cell) => cell.value))
    if (isBoardComplete(values) && isValidBoard(values)) {
      setIsRunning(false)
      setShowCompletionDialog(true)
    }
  }

  // Handle clear cell
  const handleClearCell = useCallback(() => {
    if (!selectedCell) return

    const { row, col } = selectedCell
    if (board[row][col].isOriginal) return

    // Save current state to history
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(JSON.parse(JSON.stringify(board)))
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)

    const newBoard = [...board]
    newBoard[row][col] = {
      ...newBoard[row][col],
      value: 0,
      notes: [],
      isInvalid: false,
    }

    setBoard(newBoard)
  }, [selectedCell, board, history, historyIndex, setBoard])

  // Initialize the board
  const initializeBoard = useCallback(() => {
    const newSolvedBoard = generateSolvedBoard()
    setSolvedBoard(newSolvedBoard)

    const puzzle = createPuzzle(newSolvedBoard, difficulty)
    const newBoard: CellType[][] = []

    for (let row = 0; row < 9; row++) {
      const newRow: CellType[] = []
      for (let col = 0; col < 9; col++) {
        newRow.push({
          value: puzzle[row][col],
          isOriginal: puzzle[row][col] !== 0,
          notes: [],
          isHighlighted: false,
          isRelated: false,
          isInvalid: false,
        })
      }
      newBoard.push(newRow)
    }

    setBoard(newBoard)
    setSelectedCell(null)
    setHistory([])
    setHistoryIndex(-1)
    setTimer(0)
    setIsRunning(true)
    setShowCompletionDialog(false)
  }, [difficulty])

  // Initialize the game
  useEffect(() => {
    initializeBoard()
  }, [initializeBoard])

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isRunning) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1)
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [isRunning])

  // Add a new useEffect for keyboard navigation after the timer useEffect
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCell) return

      const { row, col } = selectedCell

      // Arrow key navigation
      if (e.key === "ArrowUp" && row > 0) {
        handleCellSelect(row - 1, col)
      } else if (e.key === "ArrowDown" && row < 8) {
        handleCellSelect(row + 1, col)
      } else if (e.key === "ArrowLeft" && col > 0) {
        handleCellSelect(row, col - 1)
      } else if (e.key === "ArrowRight" && col < 8) {
        handleCellSelect(row, col + 1)
      }

      // Number input (1-9)
      if (/^[1-9]$/.test(e.key)) {
        handleNumberInput(Number.parseInt(e.key))
      }

      // Delete or Backspace to clear cell
      if (e.key === "Delete" || e.key === "Backspace") {
        handleClearCell()
      }

      // 'n' key to toggle notes mode
      if (e.key === "n") {
        setIsNotesMode(!isNotesMode)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedCell, isNotesMode, handleCellSelect, handleClearCell, setIsNotesMode])

  // Format timer
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Handle undo
  const handleUndo = () => {
    if (historyIndex >= 0) {
      setBoard(JSON.parse(JSON.stringify(history[historyIndex])))
      setHistoryIndex(historyIndex - 1)
    }
  }

  // Handle hint
  const handleHint = () => {
    if (!selectedCell) return

    const { row, col } = selectedCell
    if (board[row][col].isOriginal) return

    // Save current state to history
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(JSON.parse(JSON.stringify(board)))
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)

    const newBoard = [...board]
    newBoard[row][col] = {
      ...newBoard[row][col],
      value: solvedBoard[row][col],
      notes: [],
      isInvalid: false,
    }

    setBoard(newBoard)

    // Check if the board is complete
    const values = newBoard.map((row) => row.map((cell) => cell.value))
    if (isBoardComplete(values)) {
      setIsRunning(false)
      setShowCompletionDialog(true)
    }
  }

  // Handle check
  const handleCheck = () => {
    const newBoard = [...board]

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (newBoard[row][col].value !== 0) {
          const isValid = newBoard[row][col].value === solvedBoard[row][col]
          newBoard[row][col].isInvalid = !isValid
        }
      }
    }

    setBoard(newBoard)
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          <span className="text-lg font-mono">{formatTime(timer)}</span>
        </div>

        <Tabs defaultValue="easy" onValueChange={(value) => setDifficulty(value as keyof typeof DIFFICULTIES)}>
          <TabsList>
            <TabsTrigger value="easy">Easy</TabsTrigger>
            <TabsTrigger value="medium">Medium</TabsTrigger>
            <TabsTrigger value="hard">Hard</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Card className="w-full">
        <CardContent className="p-4">
          <div className="grid grid-cols-9 gap-0.5 md:gap-1 aspect-square">
            {board.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <SudokuCellPopover
                  key={`${rowIndex}-${colIndex}`}
                  cell={cell}
                  row={rowIndex}
                  col={colIndex}
                  isSelected={selectedCell?.row === rowIndex && selectedCell?.col === colIndex}
                  onSelect={() => handleCellSelect(rowIndex, colIndex)}
                  onNumberInput={handleNumberInput}
                  isNotesMode={isNotesMode}
                  onToggleNotes={() => setIsNotesMode(!isNotesMode)}
                />
              )),
            )}
          </div>
        </CardContent>
      </Card>

      <SudokuKeypad onNumberClick={handleNumberInput} notesMode={isNotesMode} />

      <SudokuControls
        onNewGame={initializeBoard}
        onUndo={handleUndo}
        onHint={handleHint}
        onCheck={handleCheck}
        onToggleNotes={() => setIsNotesMode(!isNotesMode)}
        onClearCell={handleClearCell}
        isNotesMode={isNotesMode}
        canUndo={historyIndex >= 0}
      />

      <AlertDialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Congratulations!</AlertDialogTitle>
            <AlertDialogDescription>You completed the Sudoku puzzle in {formatTime(timer)}!</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={initializeBoard}>Play Again</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
