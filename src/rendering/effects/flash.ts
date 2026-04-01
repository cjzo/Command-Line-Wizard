import type { World } from "../../core/ecs/types.js";
import type { EnemyComponent } from "../../components/enemy.js";
import type { PlayerComponent } from "../../components/player.js";
import type { RenderableComponent } from "../../components/renderable.js";
import type { DataRegistry } from "../../core/data/registry.js";

export function updateFlashEffects(world: World, registry?: DataRegistry): void {
  const enemies = world.query("enemy", "renderable");

  for (const id of enemies) {
    const enemy = world.getComponent<EnemyComponent>(id, "enemy")!;
    const ren = world.getComponent<RenderableComponent>(id, "renderable")!;

    if (enemy.hitFlashRemaining > 0) {
      enemy.hitFlashRemaining--;
      ren.fg = enemy.hitFlashColor;
      ren.char = enemy.damagedChar;
    } else {
      const enemyData = registry?.getEnemy(enemy.enemyId);
      if (enemyData) {
        ren.fg = enemyData.visuals.color;
        ren.char = enemyData.visuals.char;
      }
    }
  }

  const players = world.query("player", "renderable");
  for (const id of players) {
    const player = world.getComponent<PlayerComponent>(id, "player")!;
    const ren = world.getComponent<RenderableComponent>(id, "renderable")!;
    if (player.invincibleTicks > 0) {
      ren.fg = player.invincibleTicks % 2 === 0 ? "whiteBright" : "gray";
      player.invincibleTicks--;
    } else {
      ren.fg = "cyan";
    }
  }
}
