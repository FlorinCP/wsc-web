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

export function RowColumnStrategy() {
  const startRowColTour = () => {
    const driverObj = driver({
      showProgress: true,
      steps: [
        {
          element: "#sudoku-board",
          popover: {
            title: "Scanning Technique",
            description:
              "In this example, we'll use row and column scanning to find where a number can be placed.",
          },
        },
        {
          element: ".grid-cols-9 > div:nth-child(19)", // This would target a specific cell
          popover: {
            title: "Look at Row 3",
            description:
              "Notice how this row already has numbers 1, 3, 5, 7, and 9.",
          },
        },
        {
          element: ".grid-cols-9 > div:nth-child(46)", // Another specific cell
          popover: {
            title: "Check Column 1",
            description: "This column already has numbers 2, 3, 7, and 9.",
          },
        },
        {
          element: ".grid-cols-9 > div:nth-child(28)", // Target cell for placement
          popover: {
            title: "Find the Intersection",
            description:
              "By analyzing both the row and column, we can determine that only number 4 can go here!",
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
          <CardTitle>Row & Column Scanning</CardTitle>
          <CardDescription>
            Find numbers by analyzing rows and columns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            One of the most fundamental techniques in Sudoku is scanning rows
            and columns to identify where a number can be placed.
          </p>

          <div className="space-y-2">
            <h3 className="font-medium">Cross-Hatching Technique</h3>
            <p>
              For each number (1-9), scan each row and column to eliminate
              positions where that number cannot be placed. The intersections of
              these scans will reveal possible positions.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Single Position Rule</h3>
            <p>
              If there's only one position in a row, column, or box where a
              number can be placed, then that number must go in that position.
            </p>
          </div>

          <Button onClick={startRowColTour} className="mt-4">
            See Row & Column Scanning
          </Button>
        </CardContent>
      </Card>

      <Card id="interactive-demo">
        <CardHeader>
          <CardTitle>Practice This Technique</CardTitle>
          <CardDescription>Try scanning rows and columns</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="list-decimal list-inside space-y-2">
            <li>Pick a number (1-9) that appears several times on the board</li>
            <li>
              For each row that doesn't have this number, mark where it could go
            </li>
            <li>
              For each column that doesn't have this number, mark where it could
              go
            </li>
            <li>
              Look for cells that are the only possible position in a row or
              column
            </li>
          </ol>
          <p className="text-sm text-muted-foreground mt-4">
            In the example board, try to find where the number 6 must go in the
            middle box by scanning rows and columns.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
