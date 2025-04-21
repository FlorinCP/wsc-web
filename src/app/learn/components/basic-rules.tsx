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
import { useRef } from "react";

export function BasicRules() {
  const boardRef = useRef(null);

  const startBasicsTour = () => {
    const driverObj = driver({
      showProgress: true,
      steps: [
        {
          element: "#sudoku-board",
          popover: {
            title: "The Sudoku Grid",
            description:
              "A standard Sudoku is a 9×9 grid divided into 9 smaller 3×3 boxes.",
          },
        },
        {
          element: ".grid-cols-9",
          popover: {
            title: "Rows and Columns",
            description:
              "Each row, column, and 3×3 box must contain the numbers 1-9 without repetition.",
          },
        },
        {
          element: "#basic-rule-1",
          popover: {
            title: "Rule #1",
            description:
              "Fill in the grid so every row contains the numbers 1-9 exactly once.",
          },
        },
        {
          element: "#basic-rule-2",
          popover: {
            title: "Rule #2",
            description:
              "Fill in the grid so every column contains the numbers 1-9 exactly once.",
          },
        },
        {
          element: "#basic-rule-3",
          popover: {
            title: "Rule #3",
            description:
              "Fill in the grid so every 3×3 box contains the numbers 1-9 exactly once.",
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
          <CardTitle>How to Play Sudoku</CardTitle>
          <CardDescription>Learn the basic rules of Sudoku</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Sudoku is a logic-based number placement puzzle. The objective is to
            fill a 9×9 grid with digits so that each column, each row, and each
            of the nine 3×3 subgrids contain all of the digits from 1 to 9.
          </p>

          <div className="space-y-2">
            <h3 id="basic-rule-1" className="font-medium">
              Rule #1: Fill each row with numbers 1-9
            </h3>
            <p>
              Every horizontal row must contain the numbers 1-9 without
              repetition.
            </p>
          </div>

          <div className="space-y-2">
            <h3 id="basic-rule-2" className="font-medium">
              Rule #2: Fill each column with numbers 1-9
            </h3>
            <p>
              Every vertical column must contain the numbers 1-9 without
              repetition.
            </p>
          </div>

          <div className="space-y-2">
            <h3 id="basic-rule-3" className="font-medium">
              Rule #3: Fill each 3×3 box with numbers 1-9
            </h3>
            <p>
              Each of the nine 3×3 boxes must contain the numbers 1-9 without
              repetition.
            </p>
          </div>

          <Button onClick={startBasicsTour} className="mt-4">
            Take Interactive Tour
          </Button>
        </CardContent>
      </Card>

      <Card id="interactive-demo">
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>Try these steps to begin solving</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="list-decimal list-inside space-y-2">
            <li>Look for cells with only one possible value</li>
            <li>Check each row, column, and box for missing numbers</li>
            <li>Use the process of elimination to narrow down possibilities</li>
            <li>Start with the most filled rows, columns, or boxes</li>
          </ol>
          <p className="text-sm text-muted-foreground mt-4">
            Try clicking on the example board to see how it works. The board on
            the left demonstrates these basic principles.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
