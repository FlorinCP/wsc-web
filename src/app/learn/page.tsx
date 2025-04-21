"use client";

import { useState } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BasicRules } from "./components/basic-rules";
import { RowColumnStrategy } from "./components/row-column-strategy";
import { BoxStrategy } from "./components/box-strategy";
import { CandidateStrategy } from "./components/candidate-strategy";
import { createExampleBoard } from "@/utils/example-boards";
import { SudokuBoard } from "@/components/sudoku-board";

export default function LearnPage() {
  const [selectedCell, setSelectedCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [isNotesMode, setIsNotesMode] = useState(false);
  const [activeTab, setActiveTab] = useState("basics");

  // Example board for demonstrations
  const [board, setBoard] = useState(createExampleBoard(activeTab));

  const handleCellSelect = (row: number, col: number) => {
    setSelectedCell({ row, col });
  };

  const handleNumberInput = (number: number) => {
    // This is just for demonstration, not actually changing the board
    console.log(
      `Input ${number} at row ${selectedCell?.row}, col ${selectedCell?.col}`,
    );
  };

  const handleToggleNotes = () => {
    setIsNotesMode(!isNotesMode);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setBoard(createExampleBoard(value));
  };

  const startTutorial = () => {
    const driverObj = driver({
      showProgress: true,
      steps: [
        {
          element: "#learn-tabs",
          popover: {
            title: "Learning Sections",
            description:
              "Navigate between different Sudoku strategies and techniques.",
          },
        },
        {
          element: "#sudoku-board",
          popover: {
            title: "Example Board",
            description:
              "This board demonstrates the current strategy being explained.",
          },
        },
        {
          element: "#strategy-explanation",
          popover: {
            title: "Strategy Explanation",
            description:
              "Read about how to apply this technique to solve Sudoku puzzles.",
          },
        },
        {
          element: "#interactive-demo",
          popover: {
            title: "Interactive Demo",
            description:
              "Try out the strategy on this example to see how it works.",
          },
        },
      ],
    });

    driverObj.drive();
  };

  return (
    <div className="container py-8 max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Learn Sudoku Strategies</h1>
        <Button onClick={startTutorial} variant="outline">
          Start Tour
        </Button>
      </div>

      <Tabs
        id="learn-tabs"
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="basics">Basic Rules</TabsTrigger>
          <TabsTrigger value="rowcol">Row & Column</TabsTrigger>
          <TabsTrigger value="box">Box Technique</TabsTrigger>
          <TabsTrigger value="candidates">Candidates</TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Example Board</CardTitle>
                <CardDescription>See the strategy in action</CardDescription>
              </CardHeader>
              <CardContent>
                <SudokuBoard
                  board={board}
                  selectedCell={selectedCell}
                  onCellSelect={handleCellSelect}
                  onNumberInput={handleNumberInput}
                  isNotesMode={isNotesMode}
                  onToggleNotes={handleToggleNotes}
                />
              </CardContent>
            </Card>
          </div>

          <div id="strategy-explanation">
            <TabsContent value="basics">
              <BasicRules />
            </TabsContent>
            <TabsContent value="rowcol">
              <RowColumnStrategy />
            </TabsContent>
            <TabsContent value="box">
              <BoxStrategy />
            </TabsContent>
            <TabsContent value="candidates">
              <CandidateStrategy />
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
