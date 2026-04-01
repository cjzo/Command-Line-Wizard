import type { World, EntityId } from "../core/ecs/types.js";
import type { AbilityData } from "../core/data/schemas.js";
import type { Direction } from "../utils/direction.js";
import type { EventBus } from "../core/events/eventBus.js";
import type { GameConfig } from "../config/defaults.js";
import { fireProjectile } from "./patterns/projectilePattern.js";
import { fireBeam } from "./patterns/beamPattern.js";
import { fireCone } from "./patterns/conePattern.js";
import { fireDelayed } from "./patterns/delayedPattern.js";
import { executeDash } from "./patterns/movementPattern.js";

type PatternExecutor = (
  world: World,
  caster: EntityId,
  ability: AbilityData,
  direction: Direction,
  events: EventBus,
  config: GameConfig,
) => void;

const PATTERN_MAP: Record<string, PatternExecutor> = {
  projectile: (w, c, a, d, e, _cfg) => fireProjectile(w, c, a, d, e),
  beam: (w, c, a, d, e, _cfg) => fireBeam(w, c, a, d, e),
  cone: (w, c, a, d, e, _cfg) => fireCone(w, c, a, d, e),
  delayed: (w, c, a, d, e, _cfg) => fireDelayed(w, c, a, d, e),
  movement: (w, c, a, d, e, cfg) => executeDash(w, c, a, d, e, cfg),
};

export function executeAbility(
  world: World,
  caster: EntityId,
  ability: AbilityData,
  direction: Direction,
  events: EventBus,
  config: GameConfig,
): boolean {
  const executor = PATTERN_MAP[ability.type];
  if (!executor) return false;
  executor(world, caster, ability, direction, events, config);
  return true;
}
