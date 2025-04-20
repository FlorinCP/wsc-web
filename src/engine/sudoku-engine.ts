/**
 * SudokuEngine is a class that encapsulates all WebAssembly interactions
 * and business logic for solving Sudoku puzzles.
 */
export class SudokuEngine {
  // WebAssembly state
  private readonly wasmPath: string;
  private wasmLoaded: boolean = false;
  private wasmError: Error | null = null;

  // WebAssembly function wrappers
  private solveSudoku: ((puzzleString: string) => string) | null = null;
  private solveBatch: ((batchSize: number) => number) | null = null;
  private allocateInputBuffer: ((size: number) => void) | null = null;
  private allocateOutputBuffer: ((size: number) => void) | null = null;
  private allocateSolvedFlags: ((size: number) => void) | null = null;
  private freeAllBuffers: (() => void) | null = null;
  private setPuzzle: ((index: number, puzzleString: string) => void) | null =
    null;
  private getSolution: ((index: number) => string) | null = null;
  private wasSolved: ((index: number) => boolean) | null = null;
  private getCompletedThreadCount: (() => number) | null = null;
  private requestStop: (() => void) | null = null;
  private resetStopFlag: (() => void) | null = null;

  // Puzzle data
  private puzzles: string[] = [];
  private solutions: string[] = [];

  // Processing state
  private batchSize: number = 5000;
  private currentIndex: number = 0;
  private solvedCount: number = 0;
  private totalSolveTime: number = 0;
  private startTime: number = 0;
  private stopRequested: boolean = false;
  private isProcessing: boolean = false;

  // Event callbacks
  private onProgressUpdate: ((progress: SudokuProgress) => void) | null = null;
  private onStatusChange: ((status: string) => void) | null = null;

  /**
   * Creates a new instance of SudokuEngine
   * @param wasmPath Path to the WebAssembly module (.js file)
   */
  constructor(wasmPath: string) {
    this.wasmPath = wasmPath;
  }

  /**
   * Loads the WebAssembly module and initializes the solver
   * @returns Promise that resolves when the module is loaded and initialized
   * @throws Error if the WebAssembly module fails to load or initialize
   */
  public async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Create and load the script
        const script = document.createElement("script");
        script.src = this.wasmPath;
        script.async = true;

        // Set up the module initialization handler
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).Module = {
          onRuntimeInitialized: () => {
            try {
              this.initializeWasmFunctions();
              this.wasmLoaded = true;
              this.notifyStatusChange(
                "WebAssembly module loaded with multithreaded batch processing support",
              );
              resolve();
            } catch (err) {
              const error = err instanceof Error ? err : new Error(String(err));
              this.wasmError = error;
              this.notifyStatusChange(
                `WebAssembly module failed to initialize: ${error.message}`,
              );
              reject(error);
            }
          },
        };

        // Handle script loading error
        script.onerror = (e) => {
          const error = new Error("Failed to load WebAssembly module");
          this.wasmError = error;
          this.notifyStatusChange("Failed to load WebAssembly module");
          reject(error);
        };

        document.body.appendChild(script);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        this.wasmError = error;
        this.notifyStatusChange(
          `Error loading WebAssembly module: ${error.message}`,
        );
        reject(error);
      }
    });
  }

  /**
   * Initialize function wrappers from loaded WebAssembly module
   * @private
   * @throws Error if WebAssembly module does not have expected functions
   */
  private initializeWasmFunctions(): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const wasmModule = (window as any).Module;

    if (!wasmModule || typeof wasmModule.cwrap !== "function") {
      throw new Error(
        "WebAssembly module does not have the expected cwrap function",
      );
    }

    // Wrap all the WebAssembly functions
    this.solveSudoku = wasmModule.cwrap("solveSudoku", "string", ["string"]);
    this.solveBatch = wasmModule.cwrap("solveBatch", "number", ["number"]);
    this.allocateInputBuffer = wasmModule.cwrap("allocateInputBuffer", null, [
      "number",
    ]);
    this.allocateOutputBuffer = wasmModule.cwrap("allocateOutputBuffer", null, [
      "number",
    ]);
    this.allocateSolvedFlags = wasmModule.cwrap("allocateSolvedFlags", null, [
      "number",
    ]);
    this.freeAllBuffers = wasmModule.cwrap("freeAllBuffers", null, []);
    this.setPuzzle = wasmModule.cwrap("setPuzzle", null, ["number", "string"]);
    this.getSolution = wasmModule.cwrap("getSolution", "string", ["number"]);
    this.wasSolved = wasmModule.cwrap("wasSolved", "boolean", ["number"]);
    this.getCompletedThreadCount = wasmModule.cwrap(
      "getCompletedThreadCount",
      "number",
      [],
    );
    this.requestStop = wasmModule.cwrap("requestStop", null, []);
    this.resetStopFlag = wasmModule.cwrap("resetStopFlag", null, []);
  }

  /**
   * Load puzzles from a file or string content
   * @param content String content with one puzzle per line (81 chars each)
   * @returns Number of valid puzzles loaded
   * @remarks Each puzzle should be exactly 81 characters (9x9 grid), with digits 0-9 (0 for empty cells)
   */
  public loadPuzzles(content: string): number {
    const puzzles = content
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => {
        return line.length === 81 && /^[0-9]+$/.test(line);
      });

    this.puzzles = puzzles;
    this.solutions = new Array(puzzles.length).fill("");
    this.currentIndex = 0;
    this.solvedCount = 0;

    this.notifyStatusChange(`Loaded ${puzzles.length} puzzles`);
    return puzzles.length;
  }

  /**
   * Solve a single puzzle
   * @param puzzleString The puzzle as a string (81 chars, 0 for empty cells)
   * @returns SolveResult object with solution string, duration, and solved status
   * @throws Error if WebAssembly module is not loaded
   */
  public solvePuzzle(puzzleString: string): SolveResult {
    if (!this.wasmLoaded || !this.solveSudoku) {
      throw new Error("WebAssembly module not loaded");
    }

    const startTime = performance.now();
    const solution = this.solveSudoku(puzzleString);
    const endTime = performance.now();
    const duration = endTime - startTime;

    if (solution && solution !== "No solution found") {
      return {
        solution,
        duration,
        solved: true,
      };
    } else {
      return {
        solution: null,
        duration,
        solved: false,
      };
    }
  }

  /**
   * Start bulk solving all loaded puzzles using multithreaded WebAssembly
   * @param batchSize Optional number of puzzles to process in each batch
   * @returns Promise that resolves when all puzzles have been processed
   * @throws Error if WebAssembly module is not loaded, no puzzles are loaded, or processing is already in progress
   */
  public async startBulkSolve(batchSize?: number): Promise<void> {
    if (!this.wasmLoaded) {
      throw new Error("WebAssembly module not loaded");
    }

    if (!this.puzzles.length) {
      throw new Error("No puzzles loaded");
    }

    if (this.isProcessing) {
      throw new Error("Processing already in progress");
    }

    // Update batch size if provided
    if (batchSize !== undefined) {
      this.batchSize = batchSize;
    }

    // Reset state for new processing run
    this.isProcessing = true;
    this.stopRequested = false;
    this.currentIndex = 0;
    this.solvedCount = 0;
    this.totalSolveTime = 0;
    this.startTime = performance.now();
    this.solutions = new Array(this.puzzles.length).fill("");

    if (this.resetStopFlag) {
      this.resetStopFlag();
    }

    this.notifyStatusChange("Starting bulk processing...");
    this.updateProgress();

    // Process in batches
    await this.processBatches();

    // Final status update
    const totalTime = ((performance.now() - this.startTime) / 1000).toFixed(1);
    this.notifyStatusChange(
      this.stopRequested
        ? `Stopped early. Solved ${this.solvedCount}/${this.currentIndex} puzzles in ${totalTime}s`
        : `Solved ${this.solvedCount}/${this.puzzles.length} puzzles in ${totalTime}s`,
    );
  }

  /**
   * Process puzzles in batches to avoid blocking the UI
   * @private
   * @throws Error if WebAssembly functions are not available or batch processing fails
   */
  private async processBatches(): Promise<void> {
    if (
      !this.solveBatch ||
      !this.allocateInputBuffer ||
      !this.allocateOutputBuffer ||
      !this.allocateSolvedFlags ||
      !this.freeAllBuffers ||
      !this.setPuzzle ||
      !this.getSolution ||
      !this.wasSolved
    ) {
      throw new Error("WebAssembly functions not available");
    }

    let batchStartIndex = 0;
    const actualBatchSize = Math.min(this.batchSize, this.puzzles.length);

    try {
      while (batchStartIndex < this.puzzles.length && !this.stopRequested) {
        const batchEndIndex = Math.min(
          batchStartIndex + actualBatchSize,
          this.puzzles.length,
        );
        const batchSizeToProcess = batchEndIndex - batchStartIndex;

        // Allocate memory for this batch
        this.allocateInputBuffer(batchSizeToProcess * 81);
        this.allocateOutputBuffer(batchSizeToProcess * 81);
        this.allocateSolvedFlags(batchSizeToProcess);

        // Set up puzzles in the buffer
        for (let i = 0; i < batchSizeToProcess; i++) {
          this.setPuzzle(i, this.puzzles[batchStartIndex + i]);
        }

        // Process the batch
        const batchStartTime = performance.now();
        const batchSolved = this.solveBatch(batchSizeToProcess);
        const batchDuration = performance.now() - batchStartTime;

        if (batchSolved < 0) {
          throw new Error("Batch processing failed");
        }

        // Retrieve solutions
        for (let i = 0; i < batchSizeToProcess; i++) {
          if (this.wasSolved(i)) {
            this.solutions[batchStartIndex + i] = this.getSolution(i);
            this.solvedCount++;
          }
        }

        // Update state
        this.currentIndex = batchEndIndex;
        this.totalSolveTime += batchDuration;

        // Free memory
        this.freeAllBuffers();

        // Update progress
        this.updateProgress();

        // Yield to main thread periodically
        if (batchEndIndex % (actualBatchSize * 4) === 0) {
          await new Promise((resolve) => setTimeout(resolve, 0));
        }

        batchStartIndex = batchEndIndex;
      }
    } catch (error) {
      // Handle errors
      this.notifyStatusChange(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      console.error("Batch processing error:", error);
    } finally {
      // Clean up
      this.isProcessing = false;
      if (this.freeAllBuffers) {
        this.freeAllBuffers();
      }

      // Final progress update
      this.updateProgress();
    }
  }

  /**
   * Stops the current batch processing after the current batch completes
   */
  public stopProcessing(): void {
    this.stopRequested = true;
    if (this.requestStop) {
      this.requestStop();
    }
    this.notifyStatusChange("Stopping after current batch...");
  }

  /**
   * Gets all valid solutions as a string with one solution per line
   * @returns String containing all valid solutions (one per line)
   */
  public getSolutionsText(): string {
    return this.solutions
      .filter((solution) => solution && solution.length === 81)
      .join("\n");
  }

  /**
   * Gets a puzzle at the specified index
   * @param index The index of the puzzle to retrieve
   * @returns Puzzle string or null if index is out of bounds
   */
  public getPuzzle(index: number): string | null {
    if (index >= 0 && index < this.puzzles.length) {
      return this.puzzles[index];
    }
    return null;
  }

  /**
   * Gets a solution at the specified index
   * @param index The index of the solution to retrieve
   * @returns Solution string or null if index is out of bounds or no solution exists
   */
  public getSolutionByIndex(index: number): string | null {
    if (index >= 0 && index < this.solutions.length && this.solutions[index]) {
      return this.solutions[index];
    }
    return null;
  }

  /**
   * Sets a callback function for progress updates
   * @param callback Function to call with progress information
   */
  public setProgressCallback(
    callback: (progress: SudokuProgress) => void,
  ): void {
    this.onProgressUpdate = callback;
  }

  /**
   * Sets a callback function for status updates
   * @param callback Function to call with status messages
   */
  public setStatusCallback(callback: (status: string) => void): void {
    this.onStatusChange = callback;
  }

  /**
   * Updates progress information and calls the progress callback if set
   * @private
   */
  private updateProgress(): void {
    if (!this.onProgressUpdate) return;

    const totalTime = performance.now() - this.startTime;
    const progressPercent =
      this.puzzles.length > 0
        ? (this.currentIndex / this.puzzles.length) * 100
        : 0;

    let timeRemaining: number | null = null;
    let estimatedCompletion: Date | null = null;

    if (this.currentIndex > 0 && this.currentIndex < this.puzzles.length) {
      const remainingPuzzles = this.puzzles.length - this.currentIndex;
      const secondsPerPuzzle = this.totalSolveTime / this.currentIndex / 1000;
      timeRemaining = remainingPuzzles * secondsPerPuzzle;
      estimatedCompletion = new Date(Date.now() + timeRemaining * 1000);
    }

    const progress: SudokuProgress = {
      currentIndex: this.currentIndex,
      totalPuzzles: this.puzzles.length,
      solvedCount: this.solvedCount,
      progressPercent,
      totalSolveTime: this.totalSolveTime,
      elapsedTime: totalTime,
      isProcessing: this.isProcessing,
      averageSolveTime:
        this.currentIndex > 0 ? this.totalSolveTime / this.currentIndex : 0,
      timeRemaining,
      estimatedCompletion,
    };

    this.onProgressUpdate(progress);
  }

  /**
   * Notifies of status changes by calling the status callback if set
   * @param status Status message
   * @private
   */
  private notifyStatusChange(status: string): void {
    if (this.onStatusChange) {
      this.onStatusChange(status);
    }
  }

  /**
   * Releases WebAssembly resources and clears all callbacks
   */
  public dispose(): void {
    if (this.freeAllBuffers) {
      this.freeAllBuffers();
    }

    this.solveSudoku = null;
    this.solveBatch = null;
    this.allocateInputBuffer = null;
    this.allocateOutputBuffer = null;
    this.allocateSolvedFlags = null;
    this.freeAllBuffers = null;
    this.setPuzzle = null;
    this.getSolution = null;
    this.wasSolved = null;
    this.getCompletedThreadCount = null;
    this.requestStop = null;
    this.resetStopFlag = null;

    this.onProgressUpdate = null;
    this.onStatusChange = null;
  }

  /**
   * Checks if the WebAssembly module is loaded
   * @returns True if WebAssembly module is loaded and ready to use
   */
  public isLoaded(): boolean {
    return this.wasmLoaded;
  }

  /**
   * Gets the last error that occurred during WebAssembly loading or initialization
   * @returns Error object or null if no error occurred
   */
  public getError(): Error | null {
    return this.wasmError;
  }

  /**
   * Gets the total number of puzzles loaded
   * @returns Number of puzzles
   */
  public getPuzzleCount(): number {
    return this.puzzles.length;
  }

  /**
   * Gets the number of successfully solved puzzles
   * @returns Number of solved puzzles
   */
  public getSolvedCount(): number {
    return this.solvedCount;
  }

  /**
   * Gets the current processing index
   * @returns Current puzzle index being processed
   */
  public getCurrentIndex(): number {
    return this.currentIndex;
  }

  /**
   * Checks if puzzle processing is currently running
   * @returns True if batch processing is in progress
   */
  public isRunning(): boolean {
    return this.isProcessing;
  }
}

/**
 * Result of a single Sudoku puzzle solve operation
 */
export interface SolveResult {
  /** Solution string or null if no solution found */
  solution: string | null;
  /** Time taken to solve in milliseconds */
  duration: number;
  /** Boolean indicating whether puzzle was solved */
  solved: boolean;
}

/**
 * Progress information for bulk Sudoku solving operations
 */
export interface SudokuProgress {
  /** Current puzzle index being processed */
  currentIndex: number;
  /** Total number of puzzles to solve */
  totalPuzzles: number;
  /** Number of successfully solved puzzles */
  solvedCount: number;
  /** Progress percentage (0-100) */
  progressPercent: number;
  /** Total time spent solving puzzles (ms) */
  totalSolveTime: number;
  /** Total elapsed time including overhead (ms) */
  elapsedTime: number;
  /** Whether processing is currently active */
  isProcessing: boolean;
  /** Average time to solve each puzzle (ms) */
  averageSolveTime: number;
  /** Estimated time remaining in seconds, or null if unknown */
  timeRemaining: number | null;
  /** Estimated completion date, or null if unknown */
  estimatedCompletion: Date | null;
}
