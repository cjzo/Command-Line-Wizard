import type { Vec2 } from "../../utils/vector.js";
import type { Direction } from "../../utils/direction.js";

export interface DamageDealtEvent {
  type: "damageDealt";
  source: number;
  target: number;
  amount: number;
  abilityId: string;
}

export interface EntityKilledEvent {
  type: "entityKilled";
  entity: number;
  killedBy: number;
}

export interface AbilityUsedEvent {
  type: "abilityUsed";
  caster: number;
  abilityId: string;
  direction: Direction;
}

export interface UltimateReadyEvent {
  type: "ultimateReady";
  entity: number;
}

export interface UltimateUsedEvent {
  type: "ultimateUsed";
  caster: number;
  ultimateId: string;
}

export interface WaveCompleteEvent {
  type: "waveComplete";
  waveNumber: number;
}

export interface PlayerDiedEvent {
  type: "playerDied";
}

export interface EffectSpawnedEvent {
  type: "effectSpawned";
  effectType: string;
  position: Vec2;
  config: Record<string, unknown>;
}

export interface ScreenShakeEvent {
  type: "screenShake";
  intensity: number;
  duration: number;
}

export interface HitstopEvent {
  type: "hitstop";
  duration: number;
}

export interface CombatLogEvent {
  type: "combatLog";
  message: string;
}

export type GameEvent =
  | DamageDealtEvent
  | EntityKilledEvent
  | AbilityUsedEvent
  | UltimateReadyEvent
  | UltimateUsedEvent
  | WaveCompleteEvent
  | PlayerDiedEvent
  | EffectSpawnedEvent
  | ScreenShakeEvent
  | HitstopEvent
  | CombatLogEvent;
