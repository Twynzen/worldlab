import RAPIER from './stub-rapier';
import { PhysicsWorld } from './PhysicsWorld';
import {
  CharacterControllerConfig,
  CharacterMovement,
  CharacterControllerState,
  Vector3
} from './types';

/**
 * Kinematic Character Controller based on Rapier.js investigation
 * Provides smooth movement with slope handling and ground detection
 */
export class CharacterController {
  private controller: RAPIER.KinematicCharacterController;
  private physicsWorld: PhysicsWorld;
  private config: CharacterControllerConfig;
  private state: CharacterControllerState;

  constructor(
    physicsWorld: PhysicsWorld,
    config: Partial<CharacterControllerConfig> = {}
  ) {
    this.physicsWorld = physicsWorld;
    this.config = {
      radius: 0.5,
      height: 1.8,
      mass: 70,
      maxSlopeClimbAngle: Math.PI / 4, // 45 degrees
      minSlopeSlideAngle: Math.PI / 3, // 60 degrees
      maxStepHeight: 0.3,
      snapToGroundDistance: 0.1,
      autostep: true,
      frictionFactor: 0.8,
      ...config
    };

    this.state = {
      position: { x: 0, y: 0, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
      isGrounded: false,
      numTouchedWalls: 0,
      numTouchedCeiling: 0
    };

    // Create Rapier character controller
    this.controller = (physicsWorld as any).world.createCharacterController(0.01);

    // Configure controller properties
    this.controller.enableAutostep(
      this.config.maxStepHeight,
      this.config.minSlopeSlideAngle,
      this.config.autostep
    );
    this.controller.enableSnapToGround(this.config.snapToGroundDistance);
    this.controller.setMaxSlopeClimbAngle(this.config.maxSlopeClimbAngle);
    this.controller.setMinSlopeSlideAngle(this.config.minSlopeSlideAngle);
  }

  /**
   * Move the character controller
   */
  public move(
    colliderHandle: number,
    movement: CharacterMovement
  ): CharacterControllerState {
    const world = (this.physicsWorld as any).world;
    const collider = world.getCollider(colliderHandle);

    if (!collider) {
      throw new Error('Invalid collider handle for character controller');
    }

    // Apply movement
    const desiredTranslation = new RAPIER.Vector3(
      movement.desiredTranslation.x,
      movement.desiredTranslation.y,
      movement.desiredTranslation.z
    );

    // Compute movement
    this.controller.computeColliderMovement(
      collider,
      desiredTranslation,
      RAPIER.QueryFilterFlags.EXCLUDE_SENSORS
    );

    // Get corrected movement
    const correctedMovement = this.controller.computedMovement();

    // Apply the corrected movement to the collider
    const currentTranslation = collider.translation();
    const newTranslation = {
      x: currentTranslation.x + correctedMovement.x,
      y: currentTranslation.y + correctedMovement.y,
      z: currentTranslation.z + correctedMovement.z
    };

    collider.setTranslation(newTranslation);

    // Update state
    this.updateState(collider, correctedMovement, movement.deltaTime);

    return { ...this.state };
  }

  /**
   * Check if character is on ground
   */
  public isGrounded(): boolean {
    return this.state.isGrounded;
  }

  /**
   * Get current position
   */
  public getPosition(): Vector3 {
    return { ...this.state.position };
  }

  /**
   * Get current velocity
   */
  public getVelocity(): Vector3 {
    return { ...this.state.velocity };
  }

  /**
   * Set character position (teleport)
   */
  public setPosition(colliderHandle: number, position: Vector3): void {
    const world = (this.physicsWorld as any).world;
    const collider = world.getCollider(colliderHandle);

    if (collider) {
      collider.setTranslation({
        x: position.x,
        y: position.y,
        z: position.z
      });

      this.state.position = { ...position };
    }
  }

  /**
   * Apply impulse (for jumping, explosions, etc.)
   */
  public applyImpulse(impulse: Vector3): void {
    this.state.velocity.x += impulse.x;
    this.state.velocity.y += impulse.y;
    this.state.velocity.z += impulse.z;
  }

  /**
   * Get ground normal if grounded
   */
  public getGroundNormal(): Vector3 | null {
    return this.state.groundNormal ? { ...this.state.groundNormal } : null;
  }

  /**
   * Check if character is touching walls
   */
  public isTouchingWalls(): boolean {
    return this.state.numTouchedWalls > 0;
  }

  /**
   * Check if character is touching ceiling
   */
  public isTouchingCeiling(): boolean {
    return this.state.numTouchedCeiling > 0;
  }

  /**
   * Get character controller configuration
   */
  public getConfig(): CharacterControllerConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<CharacterControllerConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // Update Rapier controller settings
    if (newConfig.maxSlopeClimbAngle !== undefined) {
      this.controller.setMaxSlopeClimbAngle(newConfig.maxSlopeClimbAngle);
    }
    if (newConfig.minSlopeSlideAngle !== undefined) {
      this.controller.setMinSlopeSlideAngle(newConfig.minSlopeSlideAngle);
    }
    if (newConfig.maxStepHeight !== undefined || newConfig.autostep !== undefined) {
      this.controller.enableAutostep(
        this.config.maxStepHeight,
        this.config.minSlopeSlideAngle,
        this.config.autostep
      );
    }
    if (newConfig.snapToGroundDistance !== undefined) {
      this.controller.enableSnapToGround(newConfig.snapToGroundDistance);
    }
  }

  /**
   * Create a collider for this character controller
   */
  public createCollider(): number {
    const bodyOptions = {
      entityId: -1, // Special ID for character controller
      position: this.state.position,
      bodyType: 'kinematic' as const,
      shape: {
        type: 'capsule' as const,
        halfHeight: this.config.height / 2 - this.config.radius,
        radius: this.config.radius
      },
      material: {
        friction: this.config.frictionFactor,
        restitution: 0.0 // No bouncing for character
      }
    };

    return this.physicsWorld.addBody(bodyOptions);
  }

  /**
   * Cleanup
   */
  public destroy(): void {
    // Rapier will clean up the controller when the world is destroyed
  }

  private updateState(
    collider: RAPIER.Collider,
    correctedMovement: RAPIER.Vector3,
    deltaTime: number
  ): void {
    // Update position
    const translation = collider.translation();
    this.state.position = {
      x: translation.x,
      y: translation.y,
      z: translation.z
    };

    // Update velocity (movement per second)
    if (deltaTime > 0) {
      this.state.velocity = {
        x: correctedMovement.x / deltaTime,
        y: correctedMovement.y / deltaTime,
        z: correctedMovement.z / deltaTime
      };
    }

    // Update grounded state
    this.state.isGrounded = this.controller.computedGrounded();

    // Update contact counts
    this.state.numTouchedWalls = 0;
    this.state.numTouchedCeiling = 0;

    // Get contacts from controller
    for (let i = 0; i < this.controller.numComputedCollisions(); i++) {
      const collision = this.controller.computedCollision(i);
      const normal = collision.normal1;

      // Check if it's a wall (normal is mostly horizontal)
      if (Math.abs(normal.y) < 0.7) {
        this.state.numTouchedWalls++;
      }
      // Check if it's a ceiling (normal points down)
      else if (normal.y < -0.7) {
        this.state.numTouchedCeiling++;
      }
      // Ground contact (normal points up)
      else if (normal.y > 0.7) {
        this.state.groundNormal = {
          x: normal.x,
          y: normal.y,
          z: normal.z
        };
      }
    }
  }
}