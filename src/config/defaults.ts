export interface GameConfig {
  grid: { width: number; height: number };
  sidebar: { width: number };
  tickMs: number;
  player: {
    hp: number;
    speed: number;
    ultimateChargeMax: number;
    char: string;
    color: string;
  };
  combat: {
    hitstopOnKill: number;
    screenShakeOnHit: number;
  };
}

export const DEFAULT_CONFIG: GameConfig = {
  grid: { width: 40, height: 20 },
  sidebar: { width: 28 },
  tickMs: 60,
  player: {
    hp: 150,
    speed: 1,
    ultimateChargeMax: 100,
    char: "@",
    color: "cyan",
  },
  combat: {
    hitstopOnKill: 2,
    screenShakeOnHit: 1,
  },
};
