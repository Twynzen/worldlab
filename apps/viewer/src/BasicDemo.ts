import * as THREE from 'three';
// Importar directamente desde los archivos compilados por ahora
// import { EventBus } from '../../packages/events/dist/EventBus';

/**
 * Demo básico que muestra solo Three.js funcionando
 */
export class BasicDemo {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;

  constructor(container: HTMLElement) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87CEEB);

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 5, 10);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(this.renderer.domElement);

    // Crear un cubo simple para probar
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    this.scene.add(cube);

    // Luces
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);

    console.log('✅ BasicDemo initialized - Three.js working!');
  }

  public update(): void {
    this.renderer.render(this.scene, this.camera);
  }

  public destroy(): void {
    this.renderer.dispose();
  }
}