// Physics system types based on Rapier.js investigation

export type BodyHandle = number;
export type ColliderHandle = number;

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface PhysicsConfig {
  gravity: Vector3;
  timestep: number; // Fixed timestep for determinism (1/60 = 0.0167)
  maxSubsteps: number;
  enableCCD: boolean; // Continuous Collision Detection
}

export interface BodyOptions {
  entityId: number;
  position: Vector3;
  rotation?: { x: number; y: number; z: number; w: number }; // Quaternion
  bodyType: 'static' | 'dynamic' | 'kinematic';
  shape: ShapeOptions;
  material?: MaterialOptions;
  userData?: any;
}

export type ShapeOptions =
  | { type: 'sphere'; radius: number }
  | { type: 'box'; halfExtents: Vector3 }
  | { type: 'capsule'; halfHeight: number; radius: number }
  | { type: 'heightfield'; heights: Float32Array; scale: Vector3; nrows: number; ncols: number }
  | { type: 'trimesh'; vertices: Float32Array; indices: Uint32Array };

export interface MaterialOptions {
  friction: number;
  restitution: number;
  density?: number;
  frictionCombineRule?: 'average' | 'min' | 'multiply' | 'max';
  restitutionCombineRule?: 'average' | 'min' | 'multiply' | 'max';
}

export interface RaycastOptions {
  maxToi: number; // Maximum time of impact
  solid: boolean; // Stop at first hit or continue through
  groups?: number; // Collision groups
  filter?: (collider: any) => boolean;
}

export interface RaycastResult {
  collider: any; // Rapier.Collider
  toi: number; // Time of impact
  point: Vector3;
  normal: Vector3;
  entityId?: number;
}

export interface CollisionEvent {
  type: 'started' | 'stopped';
  collider1: any;
  collider2: any;
  entityId1?: number;
  entityId2?: number;
  contactPoint?: Vector3;
  contactNormal?: Vector3;
  impulse?: number;
}

// Character Controller types based on investigation
export interface CharacterControllerConfig {
  radius: number;
  height: number;
  mass: number;
  maxSlopeClimbAngle: number; // Radians
  minSlopeSlideAngle: number; // Radians
  maxStepHeight: number;
  snapToGroundDistance: number;
  autostep: boolean;
  frictionFactor: number;
}

export interface CharacterMovement {
  desiredTranslation: Vector3;
  deltaTime: number;
  minSlopeSlideAngle?: number;
  maxSlopeClimbAngle?: number;
  snapToGroundDistance?: number;
  autostep?: boolean;
}

export interface CharacterControllerState {
  position: Vector3;
  velocity: Vector3;
  isGrounded: boolean;
  groundNormal?: Vector3;
  numTouchedWalls: number;
  numTouchedCeiling: number;
}

export interface PhysicsDebugConfig {
  enableDebugRender: boolean;
  showColliders: boolean;
  showContacts: boolean;
  showJoints: boolean;
  contactPointSize: number;
  contactNormalLength: number;
}