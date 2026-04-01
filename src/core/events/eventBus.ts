import type { GameEvent } from "./gameEvents.js";

type EventHandler<T extends GameEvent = GameEvent> = (event: T) => void;

export class EventBus {
  private handlers = new Map<string, EventHandler[]>();
  private queue: GameEvent[] = [];

  on<T extends GameEvent>(eventType: T["type"], handler: EventHandler<T>): () => void {
    const existing = this.handlers.get(eventType) ?? [];
    existing.push(handler as EventHandler);
    this.handlers.set(eventType, existing);

    return () => {
      const list = this.handlers.get(eventType);
      if (list) {
        const idx = list.indexOf(handler as EventHandler);
        if (idx >= 0) list.splice(idx, 1);
      }
    };
  }

  emit(event: GameEvent): void {
    this.queue.push(event);
  }

  flush(): void {
    while (this.queue.length > 0) {
      const event = this.queue.shift()!;
      const handlers = this.handlers.get(event.type);
      if (handlers) {
        for (const handler of handlers) {
          handler(event);
        }
      }
    }
  }

  clear(): void {
    this.handlers.clear();
    this.queue = [];
  }
}
