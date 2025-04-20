"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SudokuBoard } from "@/components/sudoku-board";
import { SudokuKeypad } from "@/components/sudoku-keypad";
import { SudokuControls } from "@/components/sudoku-controls";
import { SudokuHeader } from "@/components/sudoku-header";
import { SudokuSolverPanel } from "@/components/sudoku-solver-panel";
import { SudokuCompletionDialog } from "@/components/sudoku-completion-dialog";
import { useSudokuGame } from "@/hooks/use-sudoku-game";
import { useDriverTour } from "@/hooks/use-driver-tour";
import { useKeyboardNavigation } from "@/hooks/use-keyboard-navigation";

export function Sudoku() {
  const [activeTab, setActiveTab] = useState<string>("play");
  const { startTour, isFirstVisit } = useDriverTour();

  const {
    board,
    selectedCell,
    isNotesMode,
    timer,
    difficulty,
    showCompletionDialog,
    historyIndex,

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
  } = useSudokuGame();

  // Set up keyboard navigation
  useKeyboardNavigation({
    selectedCell,
    handleCellSelect,
    handleNumberInput,
    handleClearCell,
    toggleNotesMode,
    isNotesMode,
  });

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl">
      <SudokuHeader
        timer={timer}
        formatTime={formatTime}
        difficulty={difficulty}
        onDifficultyChange={setDifficulty}
        onStartTour={startTour}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="play">Play</TabsTrigger>
          <TabsTrigger value="solve">Solve</TabsTrigger>
        </TabsList>

        <TabsContent value="play" className="mt-4">
          <SudokuBoard
            board={board}
            selectedCell={selectedCell}
            onCellSelect={handleCellSelect}
            onNumberInput={handleNumberInput}
            isNotesMode={isNotesMode}
            onToggleNotes={toggleNotesMode}
          />

          <div id="number-keypad" className="mt-6">
            <SudokuKeypad
              onNumberClick={handleNumberInput}
              notesMode={isNotesMode}
            />
          </div>

          <div id="game-controls" className="mt-4">
            <SudokuControls
              onNewGame={initializeBoard}
              onUndo={handleUndo}
              onHint={handleHint}
              onCheck={handleCheck}
              onToggleNotes={toggleNotesMode}
              onClearCell={handleClearCell}
              isNotesMode={isNotesMode}
              canUndo={historyIndex >= 0}
            />
          </div>
        </TabsContent>

        <TabsContent value="solve" className="mt-4">
          <SudokuSolverPanel
            currentBoard={getCurrentBoardAsString()}
            onSolutionFound={handleSolutionFound}
          />
        </TabsContent>
      </Tabs>

      <SudokuCompletionDialog
        open={showCompletionDialog}
        onOpenChange={setShowCompletionDialog}
        time={formatTime(timer)}
        onPlayAgain={initializeBoard}
      />
    </div>
  );
}
