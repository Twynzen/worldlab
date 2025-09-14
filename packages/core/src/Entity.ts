/**
 * Entity Component System (ECS) interfaces for WorldLab
 */

export type EntityId = string;
export type ComponentType = string;

export interface Component {
  type: ComponentType;
}

export interface Transform extends Component {
  type: 'transform';
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
}

export interface Renderable extends Component {
  type: 'renderable';
  meshId: string;
  visible: boolean;
  castShadow: boolean;
  receiveShadow: boolean;
}

export interface Physics extends Component {
  type: 'physics';
  velocity: { x: number; y: number; z: number };
  acceleration: { x: number; y: number; z: number };
  mass: number;
  collisionEnabled: boolean;
}

export interface Metadata extends Component {
  type: 'metadata';
  name: string;
  tags: string[];
  spawnTime: number;
  seed?: number;
}

export class Entity {
  public id: EntityId;
  private components: Map<ComponentType, Component>;
  
  constructor(id: EntityId) {
    this.id = id;
    this.components = new Map();
  }
  
  addComponent(component: Component): void {
    this.components.set(component.type, component);
  }
  
  removeComponent(type: ComponentType): void {
    this.components.delete(type);
  }
  
  getComponent<T extends Component>(type: ComponentType): T | undefined {
    return this.components.get(type) as T;
  }
  
  hasComponent(type: ComponentType): boolean {
    return this.components.has(type);
  }
  
  getComponents(): Component[] {
    return Array.from(this.components.values());
  }
}

export class EntityManager {
  private entities: Map<EntityId, Entity>;
  private componentIndex: Map<ComponentType, Set<EntityId>>;
  private entityCounter: number;
  
  constructor() {
    this.entities = new Map();
    this.componentIndex = new Map();
    this.entityCounter = 0;
  }
  
  createEntity(id?: EntityId): Entity {
    const entityId = id || `entity_${this.entityCounter++}`;
    const entity = new Entity(entityId);
    this.entities.set(entityId, entity);
    return entity;
  }
  
  removeEntity(id: EntityId): void {
    const entity = this.entities.get(id);
    if (entity) {
      // Remove from component indices
      for (const component of entity.getComponents()) {
        const index = this.componentIndex.get(component.type);
        if (index) {
          index.delete(id);
        }
      }
      this.entities.delete(id);
    }
  }
  
  getEntity(id: EntityId): Entity | undefined {
    return this.entities.get(id);
  }
  
  getEntitiesWithComponent(type: ComponentType): Entity[] {
    const entityIds = this.componentIndex.get(type) || new Set();
    return Array.from(entityIds)
      .map(id => this.entities.get(id))
      .filter(entity => entity !== undefined) as Entity[];
  }
  
  updateComponentIndex(entity: Entity): void {
    // Update component indices
    for (const component of entity.getComponents()) {
      if (!this.componentIndex.has(component.type)) {
        this.componentIndex.set(component.type, new Set());
      }
      this.componentIndex.get(component.type)!.add(entity.id);
    }
  }
  
  getAllEntities(): Entity[] {
    return Array.from(this.entities.values());
  }
  
  getEntityCount(): number {
    return this.entities.size;
  }
}