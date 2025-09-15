// WorldLab Basic Demo - Testing build system
import './basic-main';

console.log('🌍 WorldLab Demo Starting...');
console.log('📚 Systems loaded:');
console.log('  ✅ @worldlab/events - EventBus + CommandSystem');
console.log('  ✅ @worldlab/physics - Rapier.js integration');
console.log('  ✅ @worldlab/generators - Procedural world generation');
console.log('  ✅ Three.js - 3D rendering');
console.log('  ✅ Integration layer - All systems working together');
console.log('');
console.log('🎮 Ready for testing!');

// Legacy compatibility - keep the old viewer for comparison
import * as THREE from 'three';
import { World } from './world/World';
import { InputController } from './controllers/InputController';
import { StatsManager } from './ui/StatsManager';

class WorldLabViewerLegacy {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private world: World;
  private inputController: InputController;
  private statsManager: StatsManager;
  private clock: THREE.Clock;
  
  constructor() {
    this.container = document.getElementById('canvas-container')!;
    this.clock = new THREE.Clock();
    
    this.initRenderer();
    this.initScene();
    this.initCamera();
    this.initWorld();
    this.initControllers();
    this.initUI();
    
    this.hideLoading();
    this.animate();
    
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }
  
  private initRenderer(): void {
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    
    this.container.appendChild(this.renderer.domElement);
  }
  
  private initScene(): void {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87CEEB); // Sky blue
    this.scene.fog = new THREE.Fog(0x87CEEB, 50, 500);
    
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);
    
    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 200;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);
  }
  
  private initCamera(): void {
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 5, 10);
    this.camera.lookAt(0, 0, 0);
  }
  
  private initWorld(): void {
    // Generate a random seed for this session
    const seed = Math.floor(Math.random() * 1000000);
    console.log(`Initializing world with seed: ${seed}`);
    
    this.world = new World(this.scene, seed);
    this.world.generate();
    
    // Update UI with seed
    const seedElement = document.getElementById('seed');
    if (seedElement) {
      seedElement.textContent = seed.toString();
    }
  }
  
  private initControllers(): void {
    this.inputController = new InputController(this.camera, this.renderer.domElement);
  }
  
  private initUI(): void {
    this.statsManager = new StatsManager();
    
    // Show UI elements
    document.getElementById('stats')!.style.display = 'block';
    document.getElementById('info')!.style.display = 'block';
    document.getElementById('controls')!.style.display = 'block';
  }
  
  private hideLoading(): void {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
      loadingElement.style.display = 'none';
    }
  }
  
  private animate(): void {
    requestAnimationFrame(this.animate.bind(this));
    
    const deltaTime = this.clock.getDelta();
    
    // Update controllers
    this.inputController.update(deltaTime);
    
    // Update world
    this.world.update(deltaTime);
    
    // Update stats
    this.statsManager.update();
    
    // Update position display
    const position = this.camera.position;
    const posElement = document.getElementById('position');
    if (posElement) {
      posElement.textContent = `${position.x.toFixed(1)}, ${position.y.toFixed(1)}, ${position.z.toFixed(1)}`;
    }
    
    // Render
    this.renderer.render(this.scene, this.camera);
  }
  
  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

// Legacy viewer disabled for demo - using integrated systems instead
// document.addEventListener('DOMContentLoaded', () => {
//   new WorldLabViewerLegacy();
// });