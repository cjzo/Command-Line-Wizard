export interface Cell {
  char: string;
  fg: string;
  bg: string;
  layer: number;
}

export function createEmptyCell(): Cell {
  return { char: " ", fg: "white", bg: "", layer: -1 };
}

export class FrameBuffer {
  private cells: Cell[][];
  readonly width: number;
  readonly height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.cells = [];
    for (let y = 0; y < height; y++) {
      const row: Cell[] = [];
      for (let x = 0; x < width; x++) {
        row.push(createEmptyCell());
      }
      this.cells.push(row);
    }
  }

  clear(): void {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const cell = this.cells[y][x];
        cell.char = " ";
        cell.fg = "white";
        cell.bg = "";
        cell.layer = -1;
      }
    }
  }

  write(x: number, y: number, char: string, fg: string, bg: string, layer: number): void {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
    const cell = this.cells[y][x];
    if (layer >= cell.layer) {
      cell.char = char;
      cell.fg = fg;
      cell.bg = bg;
      cell.layer = layer;
    }
  }

  read(x: number, y: number): Cell | undefined {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return undefined;
    return this.cells[y][x];
  }

  getRow(y: number): readonly Cell[] {
    return this.cells[y];
  }

  snapshot(): Cell[][] {
    return this.cells.map((row) =>
      row.map((cell) => ({ ...cell })),
    );
  }
}
