// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export type CWrapFunction = <T extends Function>(
  name: string,
  returnType: string | null,
  argTypes: (string | null)[],
) => T;

export type SolveSudokuFn = (puzzleString: string) => string;
export type SolveBatchFn = (batchSize: number) => number;
export type AllocateBufferFn = (size: number) => void;
export type FreeAllBuffersFn = () => void;
export type SetPuzzleFn = (index: number, puzzleString: string) => void;
export type GetSolutionFn = (index: number) => string;
export type WasSolvedFn = (index: number) => boolean;
export type GetCompletedThreadCountFn = () => number;
export type RequestStopFn = () => void;
export type ResetStopFlagFn = () => void;

export type ModuleStatus = "loading" | "loaded" | "error";

export interface UseSudokuModuleReturn {
  status: ModuleStatus;
  error: Error | null;
  isLoaded: boolean;
  functions: {
    solveSudoku: SolveSudokuFn | null;
    solveBatch: SolveBatchFn | null;
    allocateInputBuffer: AllocateBufferFn | null;
    allocateOutputBuffer: AllocateBufferFn | null;
    allocateSolvedFlags: AllocateBufferFn | null;
    freeAllBuffers: FreeAllBuffersFn | null;
    setPuzzle: SetPuzzleFn | null;
    getSolution: GetSolutionFn | null;
    wasSolved: WasSolvedFn | null;
    getCompletedThreadCount: GetCompletedThreadCountFn | null;
    requestStop: RequestStopFn | null;
    resetStopFlag: ResetStopFlagFn | null;
  };
}
