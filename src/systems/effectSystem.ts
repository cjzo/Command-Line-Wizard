import type { System, World } from "../core/ecs/types.js";
import type { EventBus } from "../core/events/eventBus.js";
import type { EntityKilledEvent, DamageDealtEvent } from "../core/events/gameEvents.js";
import type { PositionComponent } from "../components/position.js";
import type { EnemyComponent } from "../components/enemy.js";
import type { DataRegistry } from "../core/data/registry.js";
import { spawnHitSpark, spawnDeathEffect, spawnExplosion } from "../rendering/effects/particleEngine.js";
import { updateFlashEffects } from "../rendering/effects/flash.js";

export class EffectSystem implements System {
  readonly name = "EffectSystem";
  private pendingDeaths: EntityKilledEvent[] = [];
  private pendingHits: DamageDealtEvent[] = [];

  constructor(
    private events: EventBus,
    private registry: DataRegistry,
  ) {
    this.events.on("entityKilled", (event) => {
      this.pendingDeaths.push(event as EntityKilledEvent);
    });
    this.events.on("damageDealt", (event) => {
      this.pendingHits.push(event as DamageDealtEvent);
    });
  }

  update(world: World): void {
    for (const event of this.pendingHits) {
      const targetPos = world.getComponent<PositionComponent>(event.target, "position");
      if (targetPos) {
        spawnHitSpark(world, { x: targetPos.x, y: targetPos.y });
      }

      const ability = this.registry.getAbility(event.abilityId);
      if (ability?.onHit?.effect === "explosion") {
        const radius = (ability.onHit.effectConfig as { radius?: number })?.radius ?? 1;
        if (targetPos) {
          spawnExplosion(world, { x: targetPos.x, y: targetPos.y }, radius);
        }
      }
    }
    this.pendingHits = [];

    for (const event of this.pendingDeaths) {
      const entities = world.getEntities();
      for (const eid of entities) {
        if (eid === event.entity) {
          const pos = world.getComponent<PositionComponent>(eid, "position");
          const enemy = world.getComponent<EnemyComponent>(eid, "enemy");
          if (pos) {
            const enemyData = enemy ? this.registry.getEnemy(enemy.enemyId) : null;
            spawnDeathEffect(
              world,
              { x: pos.x, y: pos.y },
              enemyData?.visuals.color ?? "red",
            );
          }
        }
      }
    }
    this.pendingDeaths = [];

    updateFlashEffects(world, this.registry);
  }
}
