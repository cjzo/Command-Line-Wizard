import type { World, EntityId } from "../../core/ecs/types.js";
import type { UltimateData } from "../../core/data/schemas.js";
import type { EventBus } from "../../core/events/eventBus.js";
import type { PositionComponent } from "../../components/position.js";
import { createPosition } from "../../components/position.js";
import { createRenderable, RenderLayer } from "../../components/renderable.js";
import { createLifetime } from "../../components/lifetime.js";
import { distance } from "../../utils/vector.js";

const BLADE_DIRECTIONS = [
  { x: 0, y: -1 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
  { x: 1, y: 0 },
  { x: -1, y: -1 },
  { x: 1, y: -1 },
  { x: -1, y: 1 },
  { x: 1, y: 1 },
];

const BLADE_CHARS = ["│", "│", "─", "─", "╲", "╱", "╱", "╲"];

export function executeBladeStorm(
  world: World,
  casterEntity: EntityId,
  ultData: UltimateData,
  events: EventBus,
): void {
  const casterPos = world.getComponent<PositionComponent>(casterEntity, "position");
  if (!casterPos) return;

  const cx = Math.round(casterPos.x);
  const cy = Math.round(casterPos.y);
  const maxRadius = 8;

  for (let dirIdx = 0; dirIdx < BLADE_DIRECTIONS.length; dirIdx++) {
    const dir = BLADE_DIRECTIONS[dirIdx];
    const bladeChar = BLADE_CHARS[dirIdx];

    for (let step = 1; step <= maxRadius; step++) {
      const bx = cx + dir.x * step;
      const by = cy + dir.y * step;

      const visual = world.createEntity();
      world.addComponent(visual, createPosition(bx, by));
      world.addComponent(visual, createRenderable(
        bladeChar,
        step <= 3 ? "whiteBright" : "gray",
        "",
        RenderLayer.EFFECT_HIGH,
      ));
      world.addComponent(visual, createLifetime(Math.floor(step / 2) + 2));
    }
  }

  for (const phase of ultData.phases) {
    for (let dy = -phase.radius; dy <= phase.radius; dy++) {
      for (let dx = -phase.radius; dx <= phase.radius; dx++) {
        if (Math.abs(dx) + Math.abs(dy) === phase.radius) {
          const visual = world.createEntity();
          world.addComponent(visual, createPosition(cx + dx, cy + dy));
          world.addComponent(visual, createRenderable(
            phase.char,
            phase.color,
            "",
            RenderLayer.EFFECT_HIGH,
          ));
          world.addComponent(visual, createLifetime(phase.tick + 2));
        }
      }
    }
  }

  const hitEntities = new Set<EntityId>();
  const enemies = world.query("position", "health", "enemy");

  for (const eid of enemies) {
    if (hitEntities.has(eid)) continue;
    const epos = world.getComponent<PositionComponent>(eid, "position")!;
    const ex = Math.round(epos.x);
    const ey = Math.round(epos.y);

    for (const dir of BLADE_DIRECTIONS) {
      for (let step = 1; step <= maxRadius; step++) {
        const bx = cx + dir.x * step;
        const by = cy + dir.y * step;
        if (ex === bx && ey === by) {
          hitEntities.add(eid);
          break;
        }
      }
      if (hitEntities.has(eid)) break;
    }

    if (!hitEntities.has(eid)) {
      const dist = distance(epos, { x: cx, y: cy });
      if (dist <= 2) {
        hitEntities.add(eid);
      }
    }
  }

  for (const eid of hitEntities) {
    events.emit({
      type: "damageDealt",
      source: casterEntity,
      target: eid,
      amount: ultData.damage,
      abilityId: ultData.id,
    });
  }
}
