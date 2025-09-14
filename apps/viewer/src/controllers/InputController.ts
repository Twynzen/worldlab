import * as THREE from 'three';

export class InputController {
  private camera: THREE.Camera;
  private domElement: HTMLElement;
  
  // Movement state
  private moveForward = false;
  private moveBackward = false;
  private moveLeft = false;
  private moveRight = false;
  private canJump = true;
  private isRunning = false;
  
  // Mouse state
  private mouseX = 0;
  private mouseY = 0;
  private isPointerLocked = false;
  
  // Movement parameters
  private movementSpeed = 10;
  private runMultiplier = 2;
  private jumpVelocity = 10;
  private velocity = new THREE.Vector3();
  private direction = new THREE.Vector3();
  
  // Camera rotation
  private euler = new THREE.Euler(0, 0, 0, 'YXZ');
  private PI_2 = Math.PI / 2;
  
  constructor(camera: THREE.Camera, domElement: HTMLElement) {
    this.camera = camera;
    this.domElement = domElement;
    
    this.init();
  }
  
  private init(): void {
    // Keyboard events
    document.addEventListener('keydown', this.onKeyDown.bind(this));
    document.addEventListener('keyup', this.onKeyUp.bind(this));
    
    // Mouse events
    this.domElement.addEventListener('click', this.onPointerLockClick.bind(this));
    document.addEventListener('pointerlockchange', this.onPointerLockChange.bind(this));
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
  }
  
  private onKeyDown(event: KeyboardEvent): void {
    switch (event.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.moveForward = true;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.moveBackward = true;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.moveLeft = true;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.moveRight = true;
        break;
      case 'Space':
        if (this.canJump) {
          this.velocity.y = this.jumpVelocity;
          this.canJump = false;
        }
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.isRunning = true;
        break;
      case 'KeyR':
        // Replay functionality placeholder
        console.log('Replay requested');
        break;
      case 'KeyE':
        // Event menu placeholder
        console.log('Event menu requested');
        break;
    }
  }
  
  private onKeyUp(event: KeyboardEvent): void {
    switch (event.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.moveForward = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.moveBackward = false;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.moveLeft = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.moveRight = false;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.isRunning = false;
        break;
    }
  }
  
  private onPointerLockClick(): void {
    if (!this.isPointerLocked) {
      this.domElement.requestPointerLock();
    }
  }
  
  private onPointerLockChange(): void {
    this.isPointerLocked = document.pointerLockElement === this.domElement;
  }
  
  private onMouseMove(event: MouseEvent): void {
    if (!this.isPointerLocked) return;
    
    const movementX = event.movementX || 0;
    const movementY = event.movementY || 0;
    
    this.euler.setFromQuaternion(this.camera.quaternion);
    
    this.euler.y -= movementX * 0.002;
    this.euler.x -= movementY * 0.002;
    
    // Clamp vertical rotation
    this.euler.x = Math.max(-this.PI_2, Math.min(this.PI_2, this.euler.x));
    
    this.camera.quaternion.setFromEuler(this.euler);
  }
  
  update(deltaTime: number): void {
    // Calculate movement direction
    this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
    this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
    this.direction.normalize();
    
    // Apply movement
    const speed = this.movementSpeed * (this.isRunning ? this.runMultiplier : 1);
    
    if (this.moveForward || this.moveBackward) {
      this.velocity.z -= this.direction.z * speed * deltaTime;
    }
    if (this.moveLeft || this.moveRight) {
      this.velocity.x -= this.direction.x * speed * deltaTime;
    }
    
    // Apply gravity (simple implementation)
    this.velocity.y -= 9.8 * deltaTime;
    
    // Move camera
    const moveVector = new THREE.Vector3();
    moveVector.x = -this.velocity.x * deltaTime;
    moveVector.y = this.velocity.y * deltaTime;
    moveVector.z = -this.velocity.z * deltaTime;
    
    // Transform movement to camera space
    moveVector.applyQuaternion(this.camera.quaternion);
    this.camera.position.add(moveVector);
    
    // Ground check (simple)
    if (this.camera.position.y < 2) {
      this.camera.position.y = 2;
      this.velocity.y = 0;
      this.canJump = true;
    }
    
    // Apply friction
    this.velocity.x *= 0.9;
    this.velocity.z *= 0.9;
  }
  
  dispose(): void {
    document.removeEventListener('keydown', this.onKeyDown.bind(this));
    document.removeEventListener('keyup', this.onKeyUp.bind(this));
    document.removeEventListener('pointerlockchange', this.onPointerLockChange.bind(this));
    document.removeEventListener('mousemove', this.onMouseMove.bind(this));
  }
}