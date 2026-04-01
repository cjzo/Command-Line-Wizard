import { z } from "zod";

export const DirectionCharsSchema = z.object({
  up: z.string(),
  down: z.string(),
  left: z.string(),
  right: z.string(),
});

export const AbilityVisualsSchema = z.object({
  chars: DirectionCharsSchema,
  color: z.string(),
  trailChar: z.string().optional(),
  trailColor: z.string().optional(),
  trailLifetime: z.number().optional(),
});

export const OnHitSchema = z.object({
  effect: z.string(),
  effectConfig: z.record(z.unknown()).optional(),
});

export const StatusEffectConfigSchema = z.object({
  effectType: z.enum(["slow", "dot", "stun"]),
  duration: z.number(),
  magnitude: z.number(),
});

export const AbilitySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  type: z.enum(["projectile", "beam", "cone", "delayed", "movement"]),
  cooldown: z.number(),
  damage: z.number(),
  chargeGain: z.number(),
  pattern: z.record(z.unknown()),
  visuals: AbilityVisualsSchema,
  onHit: OnHitSchema.optional(),
  statusEffect: StatusEffectConfigSchema.optional(),
});

export const UltimatePhaseSchema = z.object({
  tick: z.number(),
  shape: z.string(),
  radius: z.number(),
  char: z.string(),
  color: z.string(),
  damage: z.number().optional(),
});

export const UltimateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  chargeRequired: z.number(),
  windupTicks: z.number(),
  damage: z.number(),
  phases: z.array(UltimatePhaseSchema),
  screenShake: z.object({ intensity: z.number(), duration: z.number() }).optional(),
  hitstop: z.object({ duration: z.number() }).optional(),
  statusEffect: StatusEffectConfigSchema.optional(),
  persistent: z.object({
    radius: z.number(),
    durationTicks: z.number(),
    damagePerTick: z.number(),
    char: z.string(),
    color: z.string(),
  }).optional(),
});

export const EnemyVisualsSchema = z.object({
  char: z.string(),
  damagedChar: z.string(),
  color: z.string(),
  hitFlashColor: z.string(),
  hitFlashDuration: z.number(),
});

export const EnemyAISchema = z.object({
  behavior: z.enum(["chase", "ranged", "patrol", "blink", "charger"]),
  aggroRange: z.number(),
  attackProjectile: z.string().optional(),
  preferredRange: z.number().optional(),
  patrolRadius: z.number().optional(),
  chargeRange: z.number().optional(),
});

export const EnemySchema = z.object({
  id: z.string(),
  name: z.string(),
  hp: z.number(),
  speed: z.number(),
  damage: z.number(),
  attackRange: z.number(),
  attackCooldown: z.number(),
  chargeOnKill: z.number(),
  ai: EnemyAISchema,
  visuals: EnemyVisualsSchema,
});

export const WaveSpawnSchema = z.object({
  tick: z.number(),
  enemyId: z.string(),
  count: z.number(),
  positions: z.enum(["random_edge", "random", "fixed"]),
  fixedPositions: z.array(z.object({ x: z.number(), y: z.number() })).optional(),
});

export const WaveSchema = z.object({
  id: z.string(),
  name: z.string(),
  spawns: z.array(WaveSpawnSchema),
  clearCondition: z.enum(["all_dead", "timer", "boss_dead"]),
});

export const EffectFrameSchema = z.object({
  char: z.string(),
  color: z.string(),
  duration: z.number(),
});

export const EffectSchema = z.object({
  id: z.string(),
  name: z.string(),
  frames: z.array(EffectFrameSchema),
  radius: z.number().optional(),
  particleCount: z.number().optional(),
  particleSpeed: z.number().optional(),
});

export const GameConfigSchema = z.object({
  grid: z.object({ width: z.number(), height: z.number() }),
  sidebar: z.object({ width: z.number() }),
  tickMs: z.number(),
  player: z.object({
    hp: z.number(),
    speed: z.number(),
    ultimateChargeMax: z.number(),
    char: z.string(),
    color: z.string(),
  }),
  combat: z.object({
    hitstopOnKill: z.number(),
    screenShakeOnHit: z.number(),
  }),
});

export const BalanceConfigSchema = z.object({
  damageMultiplier: z.number(),
  chargeRateMultiplier: z.number(),
  enemySpeedMultiplier: z.number(),
  enemyDamageMultiplier: z.number(),
});

export type AbilityData = z.infer<typeof AbilitySchema>;
export type UltimateData = z.infer<typeof UltimateSchema>;
export type EnemyData = z.infer<typeof EnemySchema>;
export type WaveData = z.infer<typeof WaveSchema>;
export type EffectData = z.infer<typeof EffectSchema>;
export type BalanceConfig = z.infer<typeof BalanceConfigSchema>;
