import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Code } from "@/components/ui/code";

export default function AboutPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-4 md:p-12 lg:p-24 space-y-8">
      <h1 className="text-4xl font-bold mb-4 text-center">
        About the Sudoku Solver Engine
      </h1>
      <p className="text-lg text-muted-foreground text-center max-w-3xl">
        This page delves into the C++ Sudoku solving engine compiled to
        WebAssembly (WASM) that powers the lightning-fast Sudoku experience on
        this site.
      </p>

      <div className="w-full max-w-4xl space-y-6">
        {/* Section: Why C++ and WASM? */}
        <Card>
          <CardHeader>
            <CardTitle>The Need for Speed: C++ and WebAssembly</CardTitle>
            <CardDescription>
              Leveraging native performance in the browser.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p>
              Solving Sudoku puzzles, especially complex ones or in large
              batches, can be computationally intensive. While JavaScript is
              powerful, achieving peak performance for algorithms like this
              often requires lower-level optimizations.
            </p>
            <p>
              This is where <Badge variant="secondary">C++</Badge> comes in. It
              allows for fine-grained memory management, explicit performance
              tuning, and compilation to highly efficient machine code.
            </p>
            <p>
              <Badge variant="secondary">WebAssembly (WASM)</Badge> acts as a
              compilation target for C++, enabling us to run this near-native
              speed code directly in the web browser, side-by-side with
              JavaScript. This gives us the best of both worlds: a fast core
              engine and a flexible web interface.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Core Algorithm: Backtracking with Optimizations
            </CardTitle>
            <CardDescription>
              How the solver efficiently finds solutions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              The fundamental approach used is a recursive{" "}
              <Badge variant="outline">Backtracking Algorithm</Badge>. It works
              like this:
            </p>
            <ol className="list-decimal list-inside space-y-2 mb-4 pl-4 text-sm">
              <li>Find an empty cell.</li>
              <li>Try placing a valid number (1-9) in that cell.</li>
              <li>
                If the number is valid (doesn't conflict with row, column, or
                3x3 box rules), recursively call the solver for the next empty
                cell.
              </li>
              <li>
                If the recursive call returns a solution, we're done! Pass the
                solution back up.
              </li>
              <li>
                If the recursive call fails (hits a dead end), or if the tried
                number leads to no solution, undo the choice (backtrack) and try
                the next valid number for the current cell.
              </li>
              <li>
                If all numbers (1-9) have been tried for the current cell and
                none led to a solution, return failure.
              </li>
            </ol>
            <p className="mb-4">
              While simple, basic backtracking can be slow. This engine employs
              several crucial optimizations:
            </p>

            <Accordion type="single" collapsible className="w-full">
              {/* Optimization 1: Bitmasks */}
              <AccordionItem value="item-1">
                <AccordionTrigger>
                  1. Bitmasking for State Tracking
                </AccordionTrigger>
                <AccordionContent className="space-y-2">
                  <p>
                    Instead of iterating through rows, columns, and boxes to
                    check validity, the solver uses <Badge>Bitmasks</Badge>.
                    Three arrays (<Code>rows</Code>, <Code>cols</Code>,{" "}
                    <Code>boxes</Code>) store the numbers already present in
                    each respective unit.
                  </p>
                  <p>
                    Each number (1-9) corresponds to a specific bit position
                    (e.g., number `n` corresponds to the `n`-th bit). A check
                    for validity becomes a fast bitwise OR operation followed by
                    a bitwise AND.
                  </p>
                  <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
                    <code>
                      {`// Simplified concept: Check if 'num' can be placed in cell (r, c, b)
uint16_t mask = 1 << num; // Create a mask for the number
bool isValid = !((rows[r] | cols[c] | boxes[b]) & mask);
// If the result of ORing the states and ANDing with the mask is 0,
// the bit for 'num' was not set, meaning it's a valid placement.`}
                    </code>
                  </pre>
                  <p>
                    Using <Code>uint16_t</Code> provides enough bits (0-15) to
                    represent numbers 1-9 (using bits 1 through 9).{" "}
                    <Code>alignas(64)</Code> hints to the compiler to align
                    these arrays on 64-byte boundaries, potentially improving
                    cache performance on some architectures.
                  </p>
                </AccordionContent>
              </AccordionItem>

              {/* Optimization 2: Precomputation */}
              <AccordionItem value="item-2">
                <AccordionTrigger>
                  2. Precomputed Cell Information
                </AccordionTrigger>
                <AccordionContent className="space-y-2">
                  <p>
                    Calculating the row, column, and 3x3 box index for each cell
                    (0-80) repeatedly within the solving loop is wasteful.
                  </p>
                  <p>
                    The <Code>preCell[81]</Code> array stores this information (
                    <Code>row</Code>, <Code>col</Code>, <Code>box</Code>)
                    upfront. During solving, the solver can instantly look up
                    these details using the cell index.
                  </p>
                  <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
                    <code>
                      {`struct CellInfo { uint8_t row, col, box; };
static constexpr CellInfo preCell[81] = { ... }; // Pre-filled lookup table

// Inside the solver:
const auto& info = preCell[cellIndex]; // Fast lookup
// Use info.row, info.col, info.box`}
                    </code>
                  </pre>
                </AccordionContent>
              </AccordionItem>

              {/* Optimization 3: MRV Heuristic */}
              <AccordionItem value="item-3">
                <AccordionTrigger>
                  3. Minimum Remaining Values (MRV) Heuristic
                </AccordionTrigger>
                <AccordionContent className="space-y-2">
                  <p>
                    Instead of picking the *next* empty cell linearly, the
                    solver intelligently selects the cell with the{" "}
                    <Badge>Minimum Remaining Values (MRV)</Badge>. This means
                    choosing the empty cell that has the *fewest* possible valid
                    numbers that can be placed in it.
                  </p>
                  <p>
                    This heuristic significantly prunes the search tree, as it
                    prioritizes cells that are most constrained, often leading
                    to earlier detection of dead ends or forcing specific number
                    placements.
                  </p>
                  <p>
                    The <Code>findMRV()</Code> function calculates the number of
                    possible values for each empty cell using bitwise operations
                    (specifically, complementing the combined bitmask and
                    counting set bits using a custom <Code>popcount</Code>) and
                    returns the index of the cell with the smallest count.
                  </p>
                  <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
                    <code>
                      {`// Simplified MRV concept:
int findMRV() const {
    int minCount = 10, bestCell = -1;
    for (/* each empty cell */) {
        const uint16_t used = rows[...] | cols[...] | boxes[...];
        // Count possible numbers (bits 1-9 that are NOT set in 'used')
        const int count = popcount(~used & 0x3FE); // 0x3FE is mask for bits 1-9
        if (count < minCount) {
            minCount = count;
            bestCell = cell;
            // ...
        }
    }
    return bestCell;
}`}
                    </code>
                  </pre>
                  <p>
                    The custom <Code>popcount</Code> (population count - counts
                    set bits) and <Code>ctz</Code> (count trailing zeros - finds
                    the index of the lowest set bit) functions are used likely
                    for maximum portability or potential performance gains over
                    standard library/built-in functions in some WASM compilation
                    scenarios.
                  </p>
                </AccordionContent>
              </AccordionItem>

              {/* Optimization 4: Efficient Empty Cell Management */}
              <AccordionItem value="item-4">
                <AccordionTrigger>
                  4. Efficient Empty Cell Tracking
                </AccordionTrigger>
                <AccordionContent className="space-y-2">
                  <p>
                    To quickly find the MRV cell, the solver needs efficient
                    access to only the *empty* cells. It maintains an array{" "}
                    <Code>emptyCells</Code> containing the indices of empty
                    cells and an integer <Code>emptyCount</Code>.
                  </p>
                  <p>
                    Crucially, when a cell is filled (<Code>place</Code>{" "}
                    method), it's removed from this list not by shifting
                    elements (which is slow), but by swapping it with the *last*
                    element in the active part of the list and decrementing{" "}
                    <Code>emptyCount</Code>. A reverse mapping array{" "}
                    <Code>position</Code> helps locate the cell within{" "}
                    <Code>emptyCells</Code> instantly for this swap.
                  </p>
                  <p>
                    When backtracking (<Code>remove</Code> method), the cell
                    index is simply added back to the end of the active list by
                    incrementing
                    <Code>emptyCount</Code> and updating <Code>position</Code>.
                    This makes adding/removing cells from the tracked empty list
                    an O(1) operation.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Section: Batch Processing & Multithreading */}
        <Card>
          <CardHeader>
            <CardTitle>
              Handling Bulk: Batch Processing & Multithreading
            </CardTitle>
            <CardDescription>
              Solving many puzzles efficiently using pthreads.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p>
              Calling the WASM module individually for hundreds or thousands of
              puzzles incurs significant overhead from the JavaScript-WASM
              boundary calls. To mitigate this, the engine supports{" "}
              <Badge>Batch Processing</Badge>.
            </p>
            <p>
              Large memory buffers (<Code>inputBuffer</Code>,{" "}
              <Code>outputBuffer</Code>, <Code>solvedFlags</Code>) are allocated
              within the WASM module's memory space. JavaScript code can fill
              the input buffer with multiple puzzles using functions like{" "}
              <Code>allocateInputBuffer</Code> and <Code>setPuzzle</Code>.
            </p>
            <p>
              The core batch function, <Code>solveBatch(count)</Code>, then
              processes <Code>count</Code> puzzles residing in this buffer. It
              leverages <Badge variant="secondary">pthreads</Badge> (POSIX
              Threads), a standard threading library, enabled for WASM. It
              spawns multiple worker threads (currently fixed at 4 in the code)
              to solve subsets of the puzzles in parallel.
            </p>
            <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
              <code>
                {`// Simplified Batch Processing Flow:
// 1. JS: Allocate WASM memory (allocateInputBuffer, allocateOutputBuffer, ...)
// 2. JS: Load puzzles into inputBuffer (setPuzzle)
// 3. JS: Call solveBatch(numberOfPuzzles)
// 4. WASM (solveBatch):
//    - Divide puzzles among N threads
//    - Create N pthreads, each running solvePuzzlesBatch on its subset
//    - Each thread:
//      - Initializes SudokuSolver for a puzzle
//      - Solves it
//      - Writes solution/original to outputBuffer
//      - Updates solvedFlags
//      - Updates shared counters (thread-safe using mutex)
//    - Wait for all threads to finish (pthread_join)
// 5. JS: Read results from outputBuffer (getSolution) and flags (wasSolved)`}
              </code>
            </pre>
            <p>
              A <Code>pthread_mutex_t</Code> (mutex) is used to safely update
              shared counters (<Code>totalSolvedCount</Code>,{" "}
              <Code>completedThreads</Code>) from different threads, preventing
              race conditions.
            </p>
            <p>
              Functions like <Code>getCompletedThreadCount</Code>,{" "}
              <Code>requestStop</Code>, and <Code>resetStopFlag</Code> provide
              mechanisms for JavaScript to monitor and control the batch process
              asynchronously.
            </p>
            <p>
              This combination of batching and multithreading drastically
              reduces overhead and maximizes throughput by utilizing multi-core
              processors effectively.
            </p>
          </CardContent>
        </Card>

        {/* Section: Interface */}
        <Card>
          <CardHeader>
            <CardTitle>JavaScript Interface (`extern "C"`)</CardTitle>
            <CardDescription>
              How JavaScript communicates with the WASM module.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p>
              The <Code>extern "C"</Code> block in the C++ code defines the
              functions that are exported and made callable from JavaScript once
              the code is compiled to WASM. This includes:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-4 text-sm">
              <li>
                <Code>solveSudoku</Code>: Solves a single puzzle (simpler
                interface).
              </li>
              <li>
                Memory Management: <Code>allocateInputBuffer</Code>,{" "}
                <Code>allocateOutputBuffer</Code>,{" "}
                <Code>allocateSolvedFlags</Code>, <Code>freeAllBuffers</Code>.
              </li>
              <li>
                Data Transfer: <Code>setPuzzle</Code>, <Code>getSolution</Code>,{" "}
                <Code>wasSolved</Code>.
              </li>
              <li>
                Batch Control: <Code>solveBatch</Code>,{" "}
                <Code>getCompletedThreadCount</Code>, <Code>requestStop</Code>,{" "}
                <Code>resetStopFlag</Code>.
              </li>
            </ul>
            <p>
              These functions form the bridge, allowing the web application to
              manage memory, send data to, execute tasks in, and receive results
              from the high-performance C++/WASM engine.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available as an NPM Package</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Want to use this solver in your own project? A version of this
              engine, packaged for ease of use, is available on NPM.
            </p>
            <p className="mt-2">
              <a
                href="https://www.npmjs.com/package/sudoku-wasm-engine"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Find Sudoku WASM Engine on npm
              </a>
            </p>
            <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto mt-2">
              <code>npm install sudoku-wasm-engine</code>
            </pre>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
