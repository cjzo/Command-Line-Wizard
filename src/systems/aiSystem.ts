import type { System, World } from "../core/ecs/types.js";
import type { PositionComponent } from "../components/position.js";
import type { AIComponent } from "../components/ai.js";
import type { EnemyComponent } from "../components/enemy.js";
import type { EventBus } from "../core/events/eventBus.js";
import type { DataRegistry } from "../core/data/registry.js";
import { updateChase } from "../enemies/behaviors/chaseBehavior.js";
import { updateRanged } from "../enemies/behaviors/rangedBehavior.js";
import { updatePatrol } from "../enemies/behaviors/patrolBehavior.js";

export class AISystem implements System {
  readonly name = "AISystem";

  constructor(
    private events: EventBus,
    private registry: DataRegistry,
  ) {}

  update(world: World): void {
    const players = world.query("player", "position");
    if (players.length === 0) return;

    const playerPos = world.getComponent<PositionComponent>(players[0], "position")!;
    const enemies = world.query("ai", "enemy", "position", "velocity");

    for (const eid of enemies) {
      const enemy = world.getComponent<EnemyComponent>(eid, "enemy")!;
      const ai = world.getComponent<AIComponent>(eid, "ai")!;

      if (enemy.currentAttackCooldown > 0) {
        enemy.currentAttackCooldown--;
      }

      const enemyData = this.registry.getEnemy(enemy.enemyId);
      if (!enemyData) continue;

      switch (ai.behaviorId) {
        case "chase":
          updateChase(world, eid, playerPos, enemyData, this.events);
          break;
        case "ranged":
          updateRanged(world, eid, playerPos, enemyData, this.events);
          break;
        case "patrol":
          updatePatrol(world, eid, playerPos, enemyData, this.events);
          break;
      }
    }
  }
}
