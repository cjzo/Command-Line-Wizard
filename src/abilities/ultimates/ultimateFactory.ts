import type { World, EntityId } from "../../core/ecs/types.js";
import type { UltimateData } from "../../core/data/schemas.js";
import type { EventBus } from "../../core/events/eventBus.js";
import { executeNovaCataclysm } from "./novaCataclysm.js";
import { executeThunderCollapse } from "./thunderCollapse.js";
import { executeFrozenDomain } from "./frozenDomain.js";

type UltimateExecutor = (
  world: World,
  caster: EntityId,
  data: UltimateData,
  events: EventBus,
) => void;

const ULTIMATE_MAP: Record<string, UltimateExecutor> = {
  novaCataclysm: executeNovaCataclysm,
  thunderCollapse: executeThunderCollapse,
  frozenDomain: executeFrozenDomain,
};

export function executeUltimate(
  world: World,
  caster: EntityId,
  ultData: UltimateData,
  events: EventBus,
): boolean {
  const executor = ULTIMATE_MAP[ultData.id];
  if (!executor) return false;
  executor(world, caster, ultData, events);
  return true;
}
