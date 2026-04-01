import { describe, it, expect, vi } from "vitest";
import { EventBus } from "./eventBus.js";
import type { GameEvent, CombatLogEvent } from "./gameEvents.js";

describe("EventBus", () => {
  it("should emit and receive events after flush", () => {
    const bus = new EventBus();
    const handler = vi.fn();

    bus.on("combatLog", handler);
    bus.emit({ type: "combatLog", message: "test" });
    expect(handler).not.toHaveBeenCalled();

    bus.flush();
    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith({ type: "combatLog", message: "test" });
  });

  it("should support multiple handlers for the same event", () => {
    const bus = new EventBus();
    const h1 = vi.fn();
    const h2 = vi.fn();

    bus.on("combatLog", h1);
    bus.on("combatLog", h2);
    bus.emit({ type: "combatLog", message: "hello" });
    bus.flush();

    expect(h1).toHaveBeenCalledOnce();
    expect(h2).toHaveBeenCalledOnce();
  });

  it("should unsubscribe handlers", () => {
    const bus = new EventBus();
    const handler = vi.fn();

    const unsub = bus.on("combatLog", handler);
    unsub();

    bus.emit({ type: "combatLog", message: "test" });
    bus.flush();

    expect(handler).not.toHaveBeenCalled();
  });

  it("should handle events of different types independently", () => {
    const bus = new EventBus();
    const logHandler = vi.fn();
    const deathHandler = vi.fn();

    bus.on("combatLog", logHandler);
    bus.on("playerDied", deathHandler);

    bus.emit({ type: "combatLog", message: "hit" });
    bus.flush();

    expect(logHandler).toHaveBeenCalledOnce();
    expect(deathHandler).not.toHaveBeenCalled();
  });

  it("should process events in FIFO order", () => {
    const bus = new EventBus();
    const messages: string[] = [];

    bus.on("combatLog", (event) => {
      messages.push((event as CombatLogEvent).message);
    });

    bus.emit({ type: "combatLog", message: "first" });
    bus.emit({ type: "combatLog", message: "second" });
    bus.emit({ type: "combatLog", message: "third" });
    bus.flush();

    expect(messages).toEqual(["first", "second", "third"]);
  });

  it("should clear all handlers and queue", () => {
    const bus = new EventBus();
    const handler = vi.fn();

    bus.on("combatLog", handler);
    bus.emit({ type: "combatLog", message: "test" });
    bus.clear();
    bus.flush();

    expect(handler).not.toHaveBeenCalled();
  });
});
