import RAPIER from './stub-rapier';
import type { EventBus } from './stub-events';
import {
  PhysicsConfig,
  BodyOptions,
  Vector3,
  BodyHandle,
  RaycastOptions,
  RaycastResult,
  CollisionEvent,
  MaterialOptions
} from './types';

/**
 * PhysicsWorld implementation using Rapier.js
 * Based on investigation: deterministic, fixed timestep, ECS integration
 */
export class PhysicsWorld {
  private world: RAPIER.World;
  private eventQueue: RAPIER.EventQueue;
  private bodyHandleToEntityId = new Map<BodyHandle, number>();
  private entityIdToBodyHandle = new Map<number, BodyHandle>();
  private eventBus?: EventBus;
  private accumulator = 0;
  private config: PhysicsConfig;

  constructor(config?: Partial<PhysicsConfig>, eventBus?: EventBus) {
    this.config = {
      gravity: { x: 0, y: -9.81, z: 0 },
      timestep: 1 / 60, // Fixed 60Hz for determinism
      maxSubsteps: 4,
      enableCCD: true,
      ...config
    };

    this.eventBus = eventBus;

    // Initialize Rapier world
    const gravity = new RAPIER.Vector3(
      this.config.gravity.x,
      this.config.gravity.y,
      this.config.gravity.z
    );
    this.world = new RAPIER.World(gravity);

    // Enable CCD for fast-moving objects
    if (this.config.enableCCD) {
      this.world.integrationParameters.allowedLinearError = 0.001;
      this.world.integrationParameters.predictionDistance = 0.002;
    }

    // Create event queue for collision events
    this.eventQueue = new RAPIER.EventQueue(true);
  }

  /**
   * Step physics simulation with fixed timestep for determinism
   */
  public step(deltaTime: number): void {
    this.accumulator += deltaTime;

    let substeps = 0;
    while (this.accumulator >= this.config.timestep && substeps < this.config.maxSubsteps) {
      this.world.timestep = this.config.timestep;
      this.world.step(this.eventQueue);
      this.accumulator -= this.config.timestep;
      substeps++;
    }

    // Process collision events
    this.processCollisionEvents();
  }

  /**
   * Add a rigid body to the physics world
   */
  public addBody(options: BodyOptions): BodyHandle {
    // Create rigid body
    let rigidBodyDesc: RAPIER.RigidBodyDesc;

    switch (options.bodyType) {
      case 'static':
        rigidBodyDesc = RAPIER.RigidBodyDesc.fixed();
        break;
      case 'kinematic':
        rigidBodyDesc = RAPIER.RigidBodyDesc.kinematicPositionBased();
        break;
      case 'dynamic':
      default:
        rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic();
        break;
    }

    rigidBodyDesc.setTranslation(
      options.position.x,
      options.position.y,
      options.position.z
    );

    if (options.rotation) {
      rigidBodyDesc.setRotation({
        x: options.rotation.x,
        y: options.rotation.y,
        z: options.rotation.z,
        w: options.rotation.w
      });
    }

    const rigidBody = this.world.createRigidBody(rigidBodyDesc);

    // Create collider
    const colliderDesc = this.createColliderDesc(options.shape);

    if (options.material) {
      this.applyMaterial(colliderDesc, options.material);
    }

    const collider = this.world.createCollider(colliderDesc, rigidBody);

    // Store entity mapping
    const bodyHandle = rigidBody.handle;
    this.bodyHandleToEntityId.set(bodyHandle, options.entityId);
    this.entityIdToBodyHandle.set(options.entityId, bodyHandle);

    // Store user data
    if (options.userData) {
      rigidBody.userData = options.userData;
    }

    return bodyHandle;
  }

  /**
   * Remove a rigid body from physics world
   */
  public removeBody(handle: BodyHandle): void {
    const rigidBody = this.world.getRigidBody(handle);
    if (rigidBody) {
      const entityId = this.bodyHandleToEntityId.get(handle);
      if (entityId !== undefined) {
        this.bodyHandleToEntityId.delete(handle);
        this.entityIdToBodyHandle.delete(entityId);
      }

      this.world.removeRigidBody(rigidBody);
    }
  }

  /**
   * Get rigid body by entity ID
   */
  public getBodyByEntityId(entityId: number): RAPIER.RigidBody | null {
    const handle = this.entityIdToBodyHandle.get(entityId);
    if (handle !== undefined) {
      return this.world.getRigidBody(handle);
    }
    return null;
  }

  /**
   * Update body position (useful for kinematic bodies)
   */
  public setBodyPosition(entityId: number, position: Vector3): void {
    const body = this.getBodyByEntityId(entityId);
    if (body) {
      body.setTranslation(new RAPIER.Vector3(position.x, position.y, position.z), true);
    }
  }

  /**
   * Get body position
   */
  public getBodyPosition(entityId: number): Vector3 | null {
    const body = this.getBodyByEntityId(entityId);
    if (body) {
      const translation = body.translation();
      return { x: translation.x, y: translation.y, z: translation.z };
    }
    return null;
  }

  /**
   * Apply impulse to a body
   */
  public applyImpulse(entityId: number, impulse: Vector3): void {
    const body = this.getBodyByEntityId(entityId);
    if (body && body.bodyType() === RAPIER.RigidBodyType.Dynamic) {
      body.applyImpulse(new RAPIER.Vector3(impulse.x, impulse.y, impulse.z), true);
    }
  }

  /**
   * Raycast query
   */
  public raycast(
    from: Vector3,
    to: Vector3,
    options?: RaycastOptions
  ): RaycastResult | null {
    const ray = new RAPIER.Ray(
      new RAPIER.Vector3(from.x, from.y, from.z),
      new RAPIER.Vector3(to.x - from.x, to.y - from.y, to.z - from.z)
    );

    const maxToi = options?.maxToi || 1000;
    const solid = options?.solid !== false;

    const hit = this.world.castRay(ray, maxToi, solid);

    if (hit) {
      const point = ray.pointAt(hit.toi);
      const collider = this.world.getCollider(hit.collider);

      return {
        collider: collider,
        toi: hit.toi,
        point: { x: point.x, y: point.y, z: point.z },
        normal: { x: hit.normal.x, y: hit.normal.y, z: hit.normal.z },
        entityId: this.getEntityIdFromCollider(collider)
      };
    }

    return null;
  }

  /**
   * Get all bodies data for synchronization with ECS
   */
  public getAllBodiesData(): Array<{ entityId: number; position: Vector3; rotation: any }> {
    const bodies: Array<{ entityId: number; position: Vector3; rotation: any }> = [];

    this.entityIdToBodyHandle.forEach((handle, entityId) => {
      const body = this.world.getRigidBody(handle);
      if (body) {
        const translation = body.translation();
        const rotation = body.rotation();

        bodies.push({
          entityId,
          position: { x: translation.x, y: translation.y, z: translation.z },
          rotation: { x: rotation.x, y: rotation.y, z: rotation.z, w: rotation.w }
        });
      }
    });

    return bodies;
  }

  /**
   * Cleanup physics world
   */
  public destroy(): void {
    this.world.free();
    this.bodyHandleToEntityId.clear();
    this.entityIdToBodyHandle.clear();
  }

  private createColliderDesc(shape: BodyOptions['shape']): RAPIER.ColliderDesc {
    switch (shape.type) {
      case 'sphere':
        return RAPIER.ColliderDesc.ball(shape.radius);

      case 'box':
        return RAPIER.ColliderDesc.cuboid(
          shape.halfExtents.x,
          shape.halfExtents.y,
          shape.halfExtents.z
        );

      case 'capsule':
        return RAPIER.ColliderDesc.capsule(shape.halfHeight, shape.radius);

      case 'heightfield':
        return RAPIER.ColliderDesc.heightfield(
          shape.nrows - 1,
          shape.ncols - 1,
          shape.heights,
          new RAPIER.Vector3(shape.scale.x, shape.scale.y, shape.scale.z)
        );

      case 'trimesh':
        return RAPIER.ColliderDesc.trimesh(shape.vertices, shape.indices);

      default:
        throw new Error(`Unsupported shape type: ${(shape as any).type}`);
    }
  }

  private applyMaterial(colliderDesc: RAPIER.ColliderDesc, material: MaterialOptions): void {
    colliderDesc.setFriction(material.friction);
    colliderDesc.setRestitution(material.restitution);

    if (material.density !== undefined) {
      colliderDesc.setDensity(material.density);
    }

    if (material.frictionCombineRule) {
      const rule = this.mapCombineRule(material.frictionCombineRule);
      colliderDesc.setFrictionCombineRule(rule);
    }

    if (material.restitutionCombineRule) {
      const rule = this.mapCombineRule(material.restitutionCombineRule);
      colliderDesc.setRestitutionCombineRule(rule);
    }
  }

  private mapCombineRule(rule: string): RAPIER.CoefficientCombineRule {
    switch (rule) {
      case 'average': return RAPIER.CoefficientCombineRule.Average;
      case 'min': return RAPIER.CoefficientCombineRule.Min;
      case 'multiply': return RAPIER.CoefficientCombineRule.Multiply;
      case 'max': return RAPIER.CoefficientCombineRule.Max;
      default: return RAPIER.CoefficientCombineRule.Average;
    }
  }

  private processCollisionEvents(): void {
    if (!this.eventBus) return;

    this.eventQueue.drainCollisionEvents((handle1, handle2, started) => {
      const collider1 = this.world.getCollider(handle1);
      const collider2 = this.world.getCollider(handle2);

      if (collider1 && collider2) {
        const entityId1 = this.getEntityIdFromCollider(collider1);
        const entityId2 = this.getEntityIdFromCollider(collider2);

        if (started) {
          this.eventBus!.emit('collision:enter', {
            entityA: entityId1 || -1,
            entityB: entityId2 || -1,
            contactPoint: { x: 0, y: 0, z: 0 }, // TODO: Get actual contact point
            force: 0 // TODO: Calculate force
          });
        } else {
          this.eventBus!.emit('collision:exit', {
            entityA: entityId1 || -1,
            entityB: entityId2 || -1
          });
        }
      }
    });
  }

  private getEntityIdFromCollider(collider: RAPIER.Collider): number | undefined {
    const rigidBody = collider.parent();
    if (rigidBody) {
      return this.bodyHandleToEntityId.get(rigidBody.handle);
    }
    return undefined;
  }
}