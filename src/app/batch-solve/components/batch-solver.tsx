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
  Clock,
  Timer,
  AlertCircle,
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
  } = useSudokuEngine();

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

  const progressPercentage = progress
    ? Math.round((progress.solvedCount / progress.totalPuzzles) * 100)
    : 0;

  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatTimeRemaining = (seconds: number | null): string => {
    if (seconds === null) return "Calculating...";
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const formatEstimatedCompletion = (date: Date | null): string => {
    if (!date) return "Calculating...";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

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
            <AlertTitle>WebAssembly Not Loaded - Please Refresh</AlertTitle>

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
              </AlertDescription>
            </Alert>
          )}

          {isRunning() && progress && (
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>
                  Processing: {progress.solvedCount} / {progress.totalPuzzles}
                </span>
                <span>{progressPercentage}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />

              {/* Time Statistics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 text-sm">
                <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Elapsed Time:</span>
                  </div>
                  <span className="font-mono">
                    {formatTime(progress.elapsedTime)}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
                  <div className="flex items-center">
                    <Timer className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Time Remaining:</span>
                  </div>
                  <span className="font-mono">
                    {formatTimeRemaining(progress.timeRemaining)}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Est. Completion:</span>
                  </div>
                  <span className="font-mono">
                    {formatEstimatedCompletion(progress.estimatedCompletion)}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Avg. Solve Time:</span>
                  </div>
                  <span className="font-mono">
                    {formatTime(progress.averageSolveTime)}
                  </span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">{status}</p>
            </div>
          )}
        </div>
      </CardContent>

      {solveComplete && (
        <CardFooter className="flex justify-between border-t pt-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Check className="h-4 w-4 mr-2 text-green-500" />
            Successfully solved {progress?.solvedCount || 0} /{" "}
            {progress?.totalPuzzles || puzzleCount} puzzles
            {progress && (
              <span className="ml-2">
                in {formatTime(progress.elapsedTime)}
              </span>
            )}
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
