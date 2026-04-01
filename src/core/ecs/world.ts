import type { EntityId, Component, World } from "./types.js";

export class GameWorld implements World {
  private nextId: EntityId = 1;
  private entities = new Set<EntityId>();
  private componentStores = new Map<string, Map<EntityId, Component>>();
  private entityComponents = new Map<EntityId, Set<string>>();
  private queryCache = new Map<string, EntityId[]>();
  private dirty = true;

  createEntity(): EntityId {
    const id = this.nextId++;
    this.entities.add(id);
    this.entityComponents.set(id, new Set());
    this.dirty = true;
    return id;
  }

  destroyEntity(id: EntityId): void {
    if (!this.entities.has(id)) return;

    const types = this.entityComponents.get(id);
    if (types) {
      for (const type of types) {
        this.componentStores.get(type)?.delete(id);
      }
    }
    this.entityComponents.delete(id);
    this.entities.delete(id);
    this.dirty = true;
  }

  hasEntity(id: EntityId): boolean {
    return this.entities.has(id);
  }

  addComponent<T extends Component>(id: EntityId, component: T): void {
    if (!this.entities.has(id)) return;

    const type = component.type;
    let store = this.componentStores.get(type);
    if (!store) {
      store = new Map();
      this.componentStores.set(type, store);
    }
    store.set(id, component);
    this.entityComponents.get(id)!.add(type);
    this.dirty = true;
  }

  removeComponent(id: EntityId, componentType: string): void {
    this.componentStores.get(componentType)?.delete(id);
    this.entityComponents.get(id)?.delete(componentType);
    this.dirty = true;
  }

  getComponent<T extends Component>(id: EntityId, componentType: string): T | undefined {
    return this.componentStores.get(componentType)?.get(id) as T | undefined;
  }

  hasComponent(id: EntityId, componentType: string): boolean {
    return this.componentStores.get(componentType)?.has(id) ?? false;
  }

  query(...componentTypes: string[]): EntityId[] {
    const key = componentTypes.sort().join(",");

    if (!this.dirty) {
      const cached = this.queryCache.get(key);
      if (cached) return cached;
    }

    const result: EntityId[] = [];
    for (const id of this.entities) {
      const types = this.entityComponents.get(id);
      if (types && componentTypes.every((t) => types.has(t))) {
        result.push(id);
      }
    }

    this.queryCache.set(key, result);
    return result;
  }

  getEntities(): EntityId[] {
    return [...this.entities];
  }

  clear(): void {
    this.entities.clear();
    this.componentStores.clear();
    this.entityComponents.clear();
    this.queryCache.clear();
    this.nextId = 1;
    this.dirty = true;
  }

  invalidateCache(): void {
    this.dirty = true;
    this.queryCache.clear();
  }
}
