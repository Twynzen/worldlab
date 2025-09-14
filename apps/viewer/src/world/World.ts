import * as THREE from 'three';
import { TerrainGenerator } from './TerrainGenerator';
import { EntityManager } from './EntityManager';

export class World {
  private scene: THREE.Scene;
  private seed: number;
  private terrainGenerator: TerrainGenerator;
  private entityManager: EntityManager;
  private time: number = 0;
  
  constructor(scene: THREE.Scene, seed: number) {
    this.scene = scene;
    this.seed = seed;
    this.terrainGenerator = new TerrainGenerator(seed);
    this.entityManager = new EntityManager(scene);
  }
  
  generate(): void {
    console.log(`Generating world with seed ${this.seed}`);
    
    // Generate terrain
    const terrain = this.terrainGenerator.generateTerrain(100, 100);
    this.scene.add(terrain);
    
    // Add some basic entities
    this.spawnInitialEntities();
  }
  
  private spawnInitialEntities(): void {
    // Spawn some trees
    for (let i = 0; i < 20; i++) {
      const x = (Math.random() - 0.5) * 80;
      const z = (Math.random() - 0.5) * 80;
      this.entityManager.spawnTree(x, 0, z);
    }
    
    // Spawn some rocks
    for (let i = 0; i < 15; i++) {
      const x = (Math.random() - 0.5) * 60;
      const z = (Math.random() - 0.5) * 60;
      this.entityManager.spawnRock(x, 0, z);
    }
    
    // Update entity count
    const entitiesElement = document.getElementById('entities');
    if (entitiesElement) {
      entitiesElement.textContent = this.entityManager.getEntityCount().toString();
    }
  }
  
  update(deltaTime: number): void {
    this.time += deltaTime;
    this.entityManager.update(deltaTime);
  }
  
  getEntityManager(): EntityManager {
    return this.entityManager;
  }
}