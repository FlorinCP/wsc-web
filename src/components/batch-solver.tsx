"use client";

import type React from "react";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, AlertTriangle } from "lucide-react";
import { useSudokuEngine } from "@/hooks/use-sudoku-engine";

export function BatchSolver() {
  const { startBulkSolve, loadPuzzlesFromFile, isLoaded, error, isRunning } =
    useSudokuEngine("/wasm/sudoku_pt.js");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStartBulkSolve = async () => {
    if (fileInputRef.current?.files?.length) {
      const file = fileInputRef.current.files[0];
      await loadPuzzlesFromFile(file);
    } else {
      await startBulkSolve();
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await loadPuzzlesFromFile(file);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Sudoku Solver</CardTitle>
        <CardDescription>
          Solve the current puzzle or load from a file
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isLoaded && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              WebAssembly solver requires cross-origin isolation. Some features
              may not work.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Input
              ref={fileInputRef}
              type="file"
              accept=".txt"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1"
            >
              <FileText className="mr-2 h-4 w-4" />
              Upload Puzzle File
            </Button>
            <Button
              onClick={handleStartBulkSolve}
              disabled={!isLoaded}
              className="flex-1"
            >
              Load & Solve
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error.name}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
