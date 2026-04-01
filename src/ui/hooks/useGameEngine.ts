import { useState, useEffect, useRef } from "react";
import { GameEngine } from "../../core/engine/gameEngine.js";
import type { Cell } from "../../rendering/frameBuffer.js";
import type { GameConfig } from "../../config/defaults.js";

export interface GameEngineState {
  engine: GameEngine;
  cells: Cell[][];
  tick: number;
}

export function useGameEngine(config: GameConfig): GameEngineState {
  const engineRef = useRef<GameEngine | null>(null);

  if (!engineRef.current) {
    engineRef.current = new GameEngine(config);
  }

  const engine = engineRef.current;

  const [cells, setCells] = useState<Cell[][]>(() => {
    const rows: Cell[][] = [];
    for (let y = 0; y < config.grid.height; y++) {
      const row: Cell[] = [];
      for (let x = 0; x < config.grid.width; x++) {
        row.push({ char: " ", fg: "white", bg: "", layer: -1 });
      }
      rows.push(row);
    }
    return rows;
  });

  const [tick, setTick] = useState(0);

  useEffect(() => {
    engine.onFrame((newCells, newTick) => {
      setCells(newCells);
      setTick(newTick);
    });

    return () => {
      engine.stop();
    };
  }, [engine]);

  return { engine, cells, tick };
}
