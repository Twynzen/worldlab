import * as THREE from 'three';

export class TerrainGenerator {
  private seed: number;
  
  constructor(seed: number) {
    this.seed = seed;
  }
  
  generateTerrain(width: number, depth: number): THREE.Mesh {
    // Create a simple plane for now
    const geometry = new THREE.PlaneGeometry(width, depth, 32, 32);
    
    // Add some basic height variation
    const vertices = geometry.attributes.position;
    for (let i = 0; i < vertices.count; i++) {
      const x = vertices.getX(i);
      const y = vertices.getY(i);
      // Simple noise function based on position and seed
      const height = this.noise(x * 0.05 + this.seed, y * 0.05 + this.seed) * 2;
      vertices.setZ(i, height);
    }
    
    geometry.computeVertexNormals();
    
    // Create material with grass-like color
    const material = new THREE.MeshStandardMaterial({
      color: 0x3a5f3a,
      roughness: 0.8,
      metalness: 0.1,
      side: THREE.DoubleSide
    });
    
    const terrain = new THREE.Mesh(geometry, material);
    terrain.rotation.x = -Math.PI / 2;
    terrain.receiveShadow = true;
    terrain.castShadow = false;
    
    return terrain;
  }
  
  // Simple pseudo-random noise function
  private noise(x: number, y: number): number {
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return (n - Math.floor(n)) * 2 - 1;
  }
}