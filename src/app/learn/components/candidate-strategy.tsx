"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { driver } from "driver.js";

export function CandidateStrategy() {
  const startCandidateTour = () => {
    const driverObj = driver({
      showProgress: true,
      steps: [
        {
          element: "#sudoku-board",
          popover: {
            title: "Candidate Notation",
            description:
              'Notice how some cells have small numbers - these are candidates or "notes".',
          },
        },
        {
          element: ".grid-cols-9 > div:nth-child(22)", // Cell with notes
          popover: {
            title: "Cell Candidates",
            description:
              "This cell has candidates 3, 5, and 8 - these are the only possible values for this cell.",
          },
        },
        {
          element: ".grid-cols-9 > div:nth-child(23)", // Another cell with notes
          popover: {
            title: "Analyze Patterns",
            description:
              "This cell also has candidates 3 and 5. Notice the pattern forming?",
          },
        },
        {
          element: ".grid-cols-9 > div:nth-child(25)", // Cell affected by the pattern
          popover: {
            title: "Apply Naked Pair Strategy",
            description:
              "Since 3 and 5 must be in those two cells, we can eliminate 3 and 5 as candidates from other cells in this row!",
          },
        },
      ],
    });

    driverObj.drive();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Candidate Techniques</CardTitle>
          <CardDescription>
            Advanced strategies using pencil marks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Candidate techniques involve tracking all possible values for each
            empty cell and finding patterns that lead to eliminations.
          </p>

          <div className="space-y-2">
            <h3 className="font-medium">Naked Pairs/Triples</h3>
            <p>
              When two or three cells in the same row, column, or box contain
              exactly the same two or three candidates, those candidates can be
              eliminated from other cells in that row, column, or box.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Hidden Pairs/Triples</h3>
            <p>
              When two or three candidates appear only in the same two or three
              cells within a row, column, or box, all other candidates can be
              removed from those cells.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">X-Wing Pattern</h3>
            <p>
              When a candidate appears exactly twice in each of two different
              rows, and these candidates align in the same columns, that
              candidate can be eliminated from other cells in those columns.
            </p>
          </div>

          <Button onClick={startCandidateTour} className="mt-4">
            See Candidate Techniques
          </Button>
        </CardContent>
      </Card>

      <Card id="interactive-demo">
        <CardHeader>
          <CardTitle>Practice With Candidates</CardTitle>
          <CardDescription>Try using notes to solve puzzles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="list-decimal list-inside space-y-2">
            <li>Use the pencil icon to toggle notes mode</li>
            <li>Mark all possible candidates for each empty cell</li>
            <li>Look for patterns like naked pairs or hidden triples</li>
            <li>Eliminate candidates based on these patterns</li>
          </ol>
          <p className="text-sm text-muted-foreground mt-4">
            In the example board, try to identify the naked pair in the middle
            row and see how it affects other cells.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
