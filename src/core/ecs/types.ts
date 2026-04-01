export type EntityId = number;

export interface Component {
  readonly type: string;
}

export interface System {
  readonly name: string;
  update(world: World, dt: number): void;
}

export interface World {
  createEntity(): EntityId;
  destroyEntity(id: EntityId): void;
  hasEntity(id: EntityId): boolean;
  addComponent<T extends Component>(id: EntityId, component: T): void;
  removeComponent(id: EntityId, componentType: string): void;
  getComponent<T extends Component>(id: EntityId, componentType: string): T | undefined;
  hasComponent(id: EntityId, componentType: string): boolean;
  query(...componentTypes: string[]): EntityId[];
  getEntities(): EntityId[];
  clear(): void;
}
