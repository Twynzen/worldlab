import * as THREE from 'three';

interface Entity {
  id: string;
  mesh: THREE.Mesh;
  type: string;
  update?: (deltaTime: number) => void;
}

export class EntityManager {
  private scene: THREE.Scene;
  private entities: Map<string, Entity> = new Map();
  private entityCounter: number = 0;
  
  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }
  
  spawnTree(x: number, y: number, z: number): string {
    const id = `tree_${this.entityCounter++}`;
    
    // Create tree group
    const treeGroup = new THREE.Group();
    
    // Trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.7, 4);
    const trunkMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x8B4513,
      roughness: 0.9 
    });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 2;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    
    // Leaves
    const leavesGeometry = new THREE.SphereGeometry(2, 8, 6);
    const leavesMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x228B22,
      roughness: 0.8
    });
    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
    leaves.position.y = 5;
    leaves.castShadow = true;
    leaves.receiveShadow = true;
    
    treeGroup.add(trunk);
    treeGroup.add(leaves);
    treeGroup.position.set(x, y, z);
    
    // Add to scene
    this.scene.add(treeGroup);
    
    // Store entity (we'll use the group as the mesh reference)
    this.entities.set(id, {
      id,
      mesh: treeGroup as any, // Type hack for now
      type: 'tree'
    });
    
    return id;
  }
  
  spawnRock(x: number, y: number, z: number): string {
    const id = `rock_${this.entityCounter++}`;
    
    // Create rock
    const geometry = new THREE.DodecahedronGeometry(0.5 + Math.random() * 0.5);
    const material = new THREE.MeshStandardMaterial({ 
      color: 0x808080,
      roughness: 0.9,
      metalness: 0.1
    });
    const rock = new THREE.Mesh(geometry, material);
    rock.position.set(x, y + 0.3, z);
    rock.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    rock.castShadow = true;
    rock.receiveShadow = true;
    
    this.scene.add(rock);
    
    this.entities.set(id, {
      id,
      mesh: rock,
      type: 'rock'
    });
    
    return id;
  }
  
  removeEntity(id: string): void {
    const entity = this.entities.get(id);
    if (entity) {
      this.scene.remove(entity.mesh);
      this.entities.delete(id);
    }
  }
  
  update(deltaTime: number): void {
    // Update all entities that have update functions
    this.entities.forEach(entity => {
      if (entity.update) {
        entity.update(deltaTime);
      }
    });
  }
  
  getEntityCount(): number {
    return this.entities.size;
  }
  
  getEntities(): Map<string, Entity> {
    return this.entities;
  }
}