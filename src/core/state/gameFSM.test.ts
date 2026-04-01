import { describe, it, expect, vi } from "vitest";
import { GameFSM } from "./gameFSM.js";

describe("GameFSM", () => {
  it("should start in menu state", () => {
    const fsm = new GameFSM();
    expect(fsm.getState()).toBe("menu");
  });

  it("should transition through valid states", () => {
    const fsm = new GameFSM();

    expect(fsm.transition("abilitySelect")).toBe(true);
    expect(fsm.getState()).toBe("abilitySelect");

    expect(fsm.transition("combat")).toBe(true);
    expect(fsm.getState()).toBe("combat");

    expect(fsm.transition("death")).toBe(true);
    expect(fsm.getState()).toBe("death");

    expect(fsm.transition("menu")).toBe(true);
    expect(fsm.getState()).toBe("menu");
  });

  it("should reject invalid transitions", () => {
    const fsm = new GameFSM();

    expect(fsm.transition("combat")).toBe(false);
    expect(fsm.getState()).toBe("menu");

    expect(fsm.transition("death")).toBe(false);
    expect(fsm.getState()).toBe("menu");
  });

  it("should support victory path", () => {
    const fsm = new GameFSM();
    fsm.transition("abilitySelect");
    fsm.transition("combat");

    expect(fsm.transition("victory")).toBe(true);
    expect(fsm.getState()).toBe("victory");

    expect(fsm.transition("menu")).toBe(true);
  });

  it("should notify listeners on transition", () => {
    const fsm = new GameFSM();
    const listener = vi.fn();

    fsm.onTransition(listener);
    fsm.transition("abilitySelect");

    expect(listener).toHaveBeenCalledWith("abilitySelect", "menu");
  });

  it("should support unsubscribe", () => {
    const fsm = new GameFSM();
    const listener = vi.fn();

    const unsub = fsm.onTransition(listener);
    unsub();
    fsm.transition("abilitySelect");

    expect(listener).not.toHaveBeenCalled();
  });

  it("should reset to menu", () => {
    const fsm = new GameFSM();
    fsm.transition("abilitySelect");
    fsm.transition("combat");

    fsm.reset();
    expect(fsm.getState()).toBe("menu");
  });
});
