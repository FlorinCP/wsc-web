import { useState, useEffect } from "react";
import {
  AllocateBufferFn,
  CWrapFunction,
  FreeAllBuffersFn,
  GetCompletedThreadCountFn,
  GetSolutionFn,
  ModuleStatus,
  RequestStopFn,
  ResetStopFlagFn,
  SetPuzzleFn,
  SolveBatchFn,
  SolveSudokuFn,
  UseSudokuModuleReturn,
  WasSolvedFn,
} from "@/components/deepseek/types";

/**
 * Custom hook for loading and using the Sudoku WebAssembly module
 * @param wasmPath Path to the WebAssembly JavaScript loader file
 * @returns Module status and wrapped functions
 */
export function useSudokuModule(wasmPath: string): UseSudokuModuleReturn {
  const [status, setStatus] = useState<ModuleStatus>("loading");
  const [error, setError] = useState<Error | null>(null);

  const [functions, setFunctions] = useState<
    UseSudokuModuleReturn["functions"]
  >({
    solveSudoku: null,
    solveBatch: null,
    allocateInputBuffer: null,
    allocateOutputBuffer: null,
    allocateSolvedFlags: null,
    freeAllBuffers: null,
    setPuzzle: null,
    getSolution: null,
    wasSolved: null,
    getCompletedThreadCount: null,
    requestStop: null,
    resetStopFlag: null,
  });

  useEffect(() => {
    let isMounted = true;
    const script = document.createElement("script");
    script.src = wasmPath;
    script.async = true;

    const onModuleLoaded = () => {
      if (!isMounted) return;

      try {
        // Access the module without TypeScript conflicts
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const wasmModule = (window as any).Module;
        const cwrap = wasmModule.cwrap as CWrapFunction;

        if (typeof cwrap !== "function") {
          throw new Error(
            "WebAssembly module does not have the expected cwrap function",
          );
        }

        // Wrap all the functions with proper type safety
        const wrappedFunctions = {
          solveSudoku: cwrap<SolveSudokuFn>("solveSudoku", "string", [
            "string",
          ]),
          solveBatch: cwrap<SolveBatchFn>("solveBatch", "number", ["number"]),
          allocateInputBuffer: cwrap<AllocateBufferFn>(
            "allocateInputBuffer",
            null,
            ["number"],
          ),
          allocateOutputBuffer: cwrap<AllocateBufferFn>(
            "allocateOutputBuffer",
            null,
            ["number"],
          ),
          allocateSolvedFlags: cwrap<AllocateBufferFn>(
            "allocateSolvedFlags",
            null,
            ["number"],
          ),
          freeAllBuffers: cwrap<FreeAllBuffersFn>("freeAllBuffers", null, []),
          setPuzzle: cwrap<SetPuzzleFn>("setPuzzle", null, [
            "number",
            "string",
          ]),
          getSolution: cwrap<GetSolutionFn>("getSolution", "string", [
            "number",
          ]),
          wasSolved: cwrap<WasSolvedFn>("wasSolved", "boolean", ["number"]),
          getCompletedThreadCount: cwrap<GetCompletedThreadCountFn>(
            "getCompletedThreadCount",
            "number",
            [],
          ),
          requestStop: cwrap<RequestStopFn>("requestStop", null, []),
          resetStopFlag: cwrap<ResetStopFlagFn>("resetStopFlag", null, []),
        };

        setFunctions(wrappedFunctions);
        setStatus("loaded");
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setStatus("error");
        }
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).Module = {
      onRuntimeInitialized: onModuleLoaded,
    };

    script.onerror = () => {
      if (isMounted) {
        setError(new Error("Failed to load WebAssembly module"));
        setStatus("error");
      }
    };

    document.body.appendChild(script);

    return () => {
      isMounted = false;
      document.body.removeChild(script);
    };
  }, [wasmPath]);

  return {
    status,
    error,
    isLoaded: status === "loaded",
    functions,
  };
}
