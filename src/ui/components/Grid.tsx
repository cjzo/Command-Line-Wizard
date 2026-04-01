import React from "react";
import { Text, Box } from "ink";
import chalk from "chalk";
import type { Cell } from "../../rendering/frameBuffer.js";

interface GridProps {
  cells: Cell[][];
  borderColor?: string;
}

const COLOR_MAP: Record<string, (s: string) => string> = {
  white: chalk.white,
  red: chalk.red,
  green: chalk.green,
  blue: chalk.blue,
  cyan: chalk.cyan,
  yellow: chalk.yellow,
  magenta: chalk.magenta,
  gray: chalk.gray,
  grey: chalk.grey,
  black: chalk.black,
  redBright: chalk.redBright,
  greenBright: chalk.greenBright,
  blueBright: chalk.blueBright,
  cyanBright: chalk.cyanBright,
  yellowBright: chalk.yellowBright,
  magentaBright: chalk.magentaBright,
  whiteBright: chalk.whiteBright,
};

function colorize(char: string, fg: string, bg: string): string {
  let result = char;
  const fgFn = COLOR_MAP[fg] ?? chalk.whiteBright;
  result = fgFn(result);

  if (bg) {
    const bgKey = `bg${bg.charAt(0).toUpperCase()}${bg.slice(1)}` as keyof typeof chalk;
    const bgFn = (chalk as unknown as Record<string, unknown>)[bgKey];
    if (typeof bgFn === "function") {
      result = (bgFn as (s: string) => string)(result);
    }
  }
  return result;
}

function renderRow(row: readonly Cell[]): string {
  return row.map((cell) => colorize(cell.char, cell.fg, cell.bg)).join("");
}

export const Grid: React.FC<GridProps> = ({ cells, borderColor = "whiteBright" }) => {
  if (cells.length === 0) return null;

  const width = cells[0].length;
  const topBorder = `┌${"─".repeat(width)}┐`;
  const bottomBorder = `└${"─".repeat(width)}┘`;

  const borderFn = COLOR_MAP[borderColor] ?? chalk.whiteBright;

  return (
    <Box flexDirection="column">
      <Text>{borderFn(topBorder)}</Text>
      {cells.map((row, y) => (
        <Text key={y}>
          {borderFn("│")}{renderRow(row)}{borderFn("│")}
        </Text>
      ))}
      <Text>{borderFn(bottomBorder)}</Text>
    </Box>
  );
};
