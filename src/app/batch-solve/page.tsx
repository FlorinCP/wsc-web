import { BatchSolver } from "@/components/batch-solver";

export default function BatchSolve() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Batch Solve Sudoku
      </h1>
      <BatchSolver />
    </main>
  );
}
