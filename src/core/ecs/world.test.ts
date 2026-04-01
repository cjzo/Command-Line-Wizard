import { describe, it, expect, beforeEach } from "vitest";
import { GameWorld } from "./world.js";
import type { Component } from "./types.js";

interface TestPosition extends Component {
  readonly type: "position";
  x: number;
  y: number;
}

interface TestHealth extends Component {
  readonly type: "health";
  current: number;
  max: number;
}

describe("GameWorld", () => {
  let world: GameWorld;

  beforeEach(() => {
    world = new GameWorld();
  });

  it("should create entities with unique IDs", () => {
    const a = world.createEntity();
    const b = world.createEntity();
    expect(a).not.toBe(b);
  });

  it("should add and retrieve components", () => {
    const entity = world.createEntity();
    const pos: TestPosition = { type: "position", x: 5, y: 10 };
    world.addComponent(entity, pos);

    const result = world.getComponent<TestPosition>(entity, "position");
    expect(result).toBeDefined();
    expect(result!.x).toBe(5);
    expect(result!.y).toBe(10);
  });

  it("should return undefined for missing components", () => {
    const entity = world.createEntity();
    const result = world.getComponent<TestPosition>(entity, "position");
    expect(result).toBeUndefined();
  });

  it("should query entities by component types", () => {
    const e1 = world.createEntity();
    const e2 = world.createEntity();
    const e3 = world.createEntity();

    world.addComponent(e1, { type: "position", x: 0, y: 0 } as TestPosition);
    world.addComponent(e1, { type: "health", current: 100, max: 100 } as TestHealth);

    world.addComponent(e2, { type: "position", x: 5, y: 5 } as TestPosition);

    world.addComponent(e3, { type: "health", current: 50, max: 50 } as TestHealth);

    const withBoth = world.query("position", "health");
    expect(withBoth).toEqual([e1]);

    const withPos = world.query("position");
    expect(withPos).toContain(e1);
    expect(withPos).toContain(e2);
    expect(withPos).not.toContain(e3);
  });

  it("should destroy entities and remove all components", () => {
    const entity = world.createEntity();
    world.addComponent(entity, { type: "position", x: 0, y: 0 } as TestPosition);
    world.addComponent(entity, { type: "health", current: 100, max: 100 } as TestHealth);

    world.destroyEntity(entity);

    expect(world.hasEntity(entity)).toBe(false);
    expect(world.getComponent<TestPosition>(entity, "position")).toBeUndefined();
    expect(world.query("position")).not.toContain(entity);
  });

  it("should remove individual components", () => {
    const entity = world.createEntity();
    world.addComponent(entity, { type: "position", x: 0, y: 0 } as TestPosition);
    world.addComponent(entity, { type: "health", current: 100, max: 100 } as TestHealth);

    world.removeComponent(entity, "position");

    expect(world.hasComponent(entity, "position")).toBe(false);
    expect(world.hasComponent(entity, "health")).toBe(true);
  });

  it("should clear all entities", () => {
    world.createEntity();
    world.createEntity();
    world.createEntity();

    world.clear();

    expect(world.getEntities()).toHaveLength(0);
  });

  it("should mutate components in place", () => {
    const entity = world.createEntity();
    world.addComponent(entity, { type: "position", x: 0, y: 0 } as TestPosition);

    const pos = world.getComponent<TestPosition>(entity, "position")!;
    pos.x = 42;

    const pos2 = world.getComponent<TestPosition>(entity, "position")!;
    expect(pos2.x).toBe(42);
  });
});
