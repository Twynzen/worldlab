import * as THREE from 'three';
import { EventBus, CommandSystem } from '@worldlab/events';
import { WorldGenerator } from '@worldlab/generators';
// import { PhysicsWorld, CharacterController } from '@worldlab/physics';

/**
 * Integrated World System - Main orchestrator for all WorldLab systems
 * Based on the comprehensive architecture from investigations
 */
export class IntegratedWorld {
  // Core systems
  private eventBus: EventBus;
  private commandSystem: CommandSystem;
  private worldGenerator: WorldGenerator;
  private physicsWorld: PhysicsWorld;
  private characterController: CharacterController;

  // Three.js components
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;

  // World state
  private playerEntity = { id: 1, position: { x: 0, y: 5, z: 0 } };
  private loadedChunks = new Map<string, any>();
  private chunkSize = 64;

  // Performance tracking
  private lastTime = 0;
  private frameCount = 0;
  private fps = 0;

  constructor(container: HTMLElement) {
    // Initialize event system
    this.eventBus = EventBus.getInstance();
    this.commandSystem = new CommandSystem(this.eventBus);

    // Initialize generator
    this.worldGenerator = new WorldGenerator({
      seed: 'worldlab-demo-2025',
      chunkSize: this.chunkSize,
      worldScale: 1
    });

    // Initialize physics with event integration
    this.physicsWorld = new PhysicsWorld({
      gravity: { x: 0, y: -9.81, z: 0 },
      timestep: 1/60
    }, this.eventBus);

    // Initialize character controller
    this.characterController = new CharacterController(this.physicsWorld, {
      radius: 0.5,
      height: 1.8,
      maxSlopeClimbAngle: Math.PI / 4
    });

    // Setup Three.js
    this.setupThreeJS(container);

    // Setup event listeners
    this.setupEventListeners();

    // Setup command handlers
    this.setupCommandHandlers();

    // Generate initial world
    this.generateInitialWorld();

    console.log('🌍 IntegratedWorld initialized with all systems');
  }

  private setupThreeJS(container: HTMLElement): void {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87CEEB); // Sky blue

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 10, 10);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);

    // Handle window resize
    window.addEventListener('resize', () => {
      this.camera.aspect = container.clientWidth / container.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(container.clientWidth, container.clientHeight);
    });
  }

  private setupEventListeners(): void {
    // Entity spawned event
    this.eventBus.on('entity:spawned', (payload) => {
      this.createEntity(payload.entityId, payload.archetype, payload.position);
    });

    // Collision events
    this.eventBus.on('collision:enter', (payload) => {
      console.log('🔥 Collision detected:', payload);
    });

    // Chunk generated event
    this.eventBus.on('chunk:generated', (payload) => {
      this.createChunkMesh(payload);
    });

    // Command events for feedback
    this.eventBus.on('command:executed', (payload) => {
      console.log('✅ Command executed:', payload.command.action);
    });

    this.eventBus.on('command:failed', (payload) => {
      console.error('❌ Command failed:', payload.error);
    });
  }

  private setupCommandHandlers(): void {
    // Override default spawn handler to integrate with Three.js
    this.commandSystem.registerHandler('spawn', {
      execute: async (command: any) => {
        const { entity, position } = command;

        // Calculate actual position
        let actualPos = { x: 0, y: 0, z: 0 };

        if (position.x !== undefined && position.z !== undefined) {
          actualPos.x = position.x;
          actualPos.z = position.z;
          actualPos.y = position.y || 0;
        } else if (position.near === 'player') {
          const radius = position.radius || 10;
          const angle = Math.random() * Math.PI * 2;
          actualPos.x = this.playerEntity.position.x + Math.cos(angle) * radius;
          actualPos.z = this.playerEntity.position.z + Math.sin(angle) * radius;
          actualPos.y = this.playerEntity.position.y;
        }

        // Create entity
        const entityId = Math.floor(Math.random() * 10000);

        // Emit event for other systems
        this.eventBus.emit('entity:spawned', {
          entityId,
          archetype: entity,
          position: actualPos
        });
      }
    });
  }

  private createEntity(entityId: number, archetype: string, position: THREE.Vector3): void {
    let geometry: THREE.BufferGeometry;
    let material: THREE.Material;

    // Create geometry based on archetype
    switch (archetype) {
      case 'tree':
      case 'tree_oak':
      case 'tree_pine':
        geometry = new THREE.CylinderGeometry(0.3, 0.5, 3, 8);
        material = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        break;
      case 'rock':
      case 'rock_large':
        geometry = new THREE.SphereGeometry(1, 8, 6);
        material = new THREE.MeshLambertMaterial({ color: 0x696969 });
        break;
      case 'cactus':
        geometry = new THREE.CylinderGeometry(0.2, 0.3, 2, 6);
        material = new THREE.MeshLambertMaterial({ color: 0x228B22 });
        break;
      default:
        geometry = new THREE.BoxGeometry(1, 1, 1);
        material = new THREE.MeshLambertMaterial({ color: 0xff6b6b });
        break;
    }

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = { entityId, archetype };

    this.scene.add(mesh);

    // Add physics body
    this.physicsWorld.addBody({
      entityId,
      position,
      bodyType: 'static',
      shape: { type: 'box', halfExtents: { x: 0.5, y: 0.5, z: 0.5 } },
      material: { friction: 0.7, restitution: 0.1 }
    });

    console.log(`🌳 Created ${archetype} entity at`, position);
  }

  private async generateInitialWorld(): Promise<void> {
    // Generate a few chunks around the origin
    const chunksToGenerate = [
      { x: 0, z: 0 },
      { x: 1, z: 0 },
      { x: 0, z: 1 },
      { x: -1, z: 0 },
      { x: 0, z: -1 }
    ];

    for (const coord of chunksToGenerate) {
      try {
        const chunkData = await this.worldGenerator.generateChunk(coord);
        this.loadedChunks.set(`${coord.x},${coord.z}`, chunkData);

        // Emit event for other systems
        this.eventBus.emit('chunk:generated', {
          chunkCoord: coord,
          heightmap: chunkData.heightmap,
          biomemap: chunkData.biomemap,
          objects: chunkData.objects
        });
      } catch (error) {
        console.error('Failed to generate chunk:', coord, error);
      }
    }
  }

  private createChunkMesh(chunkData: any): void {
    const { chunkCoord, heightmap, objects } = chunkData;

    // Create terrain mesh
    this.createTerrainMesh(chunkCoord, heightmap);

    // Spawn objects
    objects.forEach((obj: any) => {
      this.createEntity(Math.floor(Math.random() * 10000), obj.type, obj.position);
    });
  }

  private createTerrainMesh(chunkCoord: any, heightmap: Float32Array): void {
    const size = this.chunkSize;
    const geometry = new THREE.PlaneGeometry(size, size, size - 1, size - 1);

    // Apply heightmap to vertices
    const vertices = geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < heightmap.length; i++) {
      vertices[i * 3 + 2] = heightmap[i] * 10; // Scale height
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();

    const material = new THREE.MeshLambertMaterial({
      color: 0x567d46,
      wireframe: false
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(
      chunkCoord.x * size + size / 2,
      0,
      chunkCoord.z * size + size / 2
    );
    mesh.receiveShadow = true;
    mesh.userData = { chunkCoord };

    this.scene.add(mesh);

    // Add physics collider
    this.physicsWorld.addBody({
      entityId: -Math.abs(chunkCoord.x * 1000 + chunkCoord.z), // Negative for terrain
      position: mesh.position,
      bodyType: 'static',
      shape: {
        type: 'heightfield',
        heights: heightmap,
        scale: { x: size / (size - 1), y: 10, z: size / (size - 1) },
        nrows: size,
        ncols: size
      },
      material: { friction: 0.8, restitution: 0.1 }
    });
  }

  /**
   * Execute command from console
   */
  public async executeCommand(commandText: string): Promise<void> {
    // Try natural language first
    const jsonCommand = this.commandSystem.parseNaturalCommand(commandText);

    if (jsonCommand) {
      await this.commandSystem.executeFromJSON(jsonCommand, this.getGameContext());
    } else {
      // Try as JSON directly
      try {
        await this.commandSystem.executeFromJSON(commandText, this.getGameContext());
      } catch (error) {
        console.error('❌ Invalid command format. Try: "spawn tree near player" or JSON');
      }
    }
  }

  private getGameContext(): any {
    return {
      playerPosition: this.playerEntity.position,
      nearbyEntities: [],
      currentChunk: { x: 0, z: 0 },
      worldBounds: { min: { x: -200, z: -200 }, max: { x: 200, z: 200 } },
      resources: {
        entityCount: this.scene.children.length,
        maxEntities: 1000,
        memoryUsage: 50,
        maxMemory: 100
      }
    };
  }

  /**
   * Update loop - call this every frame
   */
  public update(deltaTime: number): void {
    // Update physics
    this.physicsWorld.step(deltaTime);

    // Update FPS
    this.frameCount++;
    if (performance.now() - this.lastTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastTime = performance.now();
    }

    // Render
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Get performance metrics
   */
  public getMetrics(): { fps: number; entities: number; chunks: number } {
    return {
      fps: this.fps,
      entities: this.scene.children.filter(child => child.userData?.entityId).length,
      chunks: this.loadedChunks.size
    };
  }

  /**
   * Cleanup
   */
  public destroy(): void {
    this.physicsWorld.destroy();
    this.renderer.dispose();
  }
}