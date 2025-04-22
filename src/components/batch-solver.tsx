"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  AlertTriangle,
  Check,
  Download,
  StopCircle,
  Loader2,
} from "lucide-react";
import { useSudokuEngine } from "@/hooks/use-sudoku-engine";

export function BatchSolver() {
  const {
    startBulkSolve,
    loadPuzzlesFromFile,
    stopProcessing,
    isLoaded,
    error,
    isRunning,
    progress,
    status,
    getSolutionsText,
  } = useSudokuEngine("/wasm/sudoku_pt.js");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>("");
  const [puzzleCount, setPuzzleCount] = useState<number>(0);
  const [solveComplete, setSolveComplete] = useState<boolean>(false);

  const handleStartBulkSolve = async () => {
    setSolveComplete(false);
    try {
      await startBulkSolve();
      setSolveComplete(true);
    } catch (err) {
      console.error("Failed to solve puzzles:", err);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setSolveComplete(false);

    try {
      const count = await loadPuzzlesFromFile(file);
      setPuzzleCount(count);
    } catch (err) {
      console.error("Failed to load puzzles:", err);
    }
  };

  const handleDownloadSolutions = () => {
    const solutions = getSolutionsText();
    if (!solutions) return;

    const blob = new Blob([solutions], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download =
      fileName.replace(".txt", "-solutions.txt") || "sudoku-solutions.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Calculate progress percentage
  const progressPercentage = progress
    ? Math.round((progress.solvedCount / progress.totalPuzzles) * 100)
    : 0;

  return (
    <Card className="w-full max-w-screen-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Sudoku Batch Solver</span>
          {isLoaded && (
            <Badge variant="outline" className="ml-2">
              Ready
            </Badge>
          )}
          {isRunning() && (
            <Badge variant="secondary" className="ml-2 animate-pulse">
              Processing
            </Badge>
          )}
          {solveComplete && (
            <Badge className="ml-2 bg-green-500 text-white">Complete</Badge>
          )}
        </CardTitle>
        <CardDescription>
          Upload and solve multiple Sudoku puzzles at once
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {!isLoaded && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>WebAssembly Not Loaded</AlertTitle>
            <AlertDescription>
              WebAssembly solver requires cross-origin isolation. Some features
              may not work.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error.message || error.name}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col gap-4">
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
              disabled={isRunning()}
            >
              <FileText className="mr-2 h-4 w-4" />
              {fileName ? "Change Puzzle File" : "Upload Puzzle File"}
            </Button>

            {isRunning() ? (
              <Button
                variant="destructive"
                onClick={stopProcessing}
                className="flex-1"
              >
                <StopCircle className="mr-2 h-4 w-4" />
                Stop Processing
              </Button>
            ) : (
              <Button
                onClick={handleStartBulkSolve}
                disabled={!isLoaded || puzzleCount === 0}
                className="flex-1"
              >
                {solveComplete ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Solved
                  </>
                ) : (
                  <>
                    {isRunning() ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Solve Puzzles
                  </>
                )}
              </Button>
            )}
          </div>

          {fileName && (
            <Alert variant="default" className="bg-muted">
              <FileText className="h-4 w-4" />
              <AlertTitle>File Loaded</AlertTitle>
              <AlertDescription className="flex items-center justify-between">
                <span>
                  {fileName} ({puzzleCount} puzzles)
                </span>
                {solveComplete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadSolutions}
                    className="ml-auto"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Solutions
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          )}

          {isRunning() && progress && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>
                  Processing: {progress.solvedCount} / {progress.totalPuzzles}
                </span>
                <span>{progressPercentage}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <p className="text-xs text-muted-foreground">{status}</p>
            </div>
          )}
        </div>
      </CardContent>

      {solveComplete && (
        <CardFooter className="flex justify-between border-t pt-4">
          <div className="text-sm text-muted-foreground">
            Successfully solved {progress?.solvedCount || puzzleCount} puzzles
          </div>
          <Button variant="outline" size="sm" onClick={handleDownloadSolutions}>
            <Download className="mr-2 h-4 w-4" />
            Download Solutions
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
