import { ObjectInstance, GenerationContext } from '../types';
import { generateHash } from '../utils/hash';

export class ObjectPlacer {
  /**
   * Poisson Disk Sampling para distribución natural
   */
  static poissonDiskSampling(
    chunkSize: number,
    minDistance: number,
    maxAttempts: number = 30,
    prng: () => number
  ): Array<{ x: number; z: number }> {
    const cellSize = minDistance / Math.sqrt(2);
    const gridWidth = Math.ceil(chunkSize / cellSize);
    const grid: number[][] = Array(gridWidth)
      .fill(null)
      .map(() => Array(gridWidth).fill(-1));

    const points: Array<{ x: number; z: number }> = [];
    const activeList: number[] = [];

    // Agregar primer punto aleatorio
    const firstPoint = {
      x: prng() * chunkSize,
      z: prng() * chunkSize
    };
    points.push(firstPoint);
    activeList.push(0);

    const gridX = Math.floor(firstPoint.x / cellSize);
    const gridZ = Math.floor(firstPoint.z / cellSize);
    grid[gridZ][gridX] = 0;

    while (activeList.length > 0) {
      const randomIndex = Math.floor(prng() * activeList.length);
      const pointIndex = activeList[randomIndex];
      const point = points[pointIndex];

      let found = false;

      for (let k = 0; k < maxAttempts; k++) {
        const angle = prng() * Math.PI * 2;
        const distance = minDistance + prng() * minDistance;

        const newPoint = {
          x: point.x + Math.cos(angle) * distance,
          z: point.z + Math.sin(angle) * distance
        };

        if (
          newPoint.x >= 0 &&
          newPoint.x < chunkSize &&
          newPoint.z >= 0 &&
          newPoint.z < chunkSize
        ) {
          const newGridX = Math.floor(newPoint.x / cellSize);
          const newGridZ = Math.floor(newPoint.z / cellSize);

          if (this.isValidPoint(newPoint, points, grid, gridWidth, cellSize, minDistance)) {
            points.push(newPoint);
            activeList.push(points.length - 1);
            grid[newGridZ][newGridX] = points.length - 1;
            found = true;
            break;
          }
        }
      }

      if (!found) {
        activeList.splice(randomIndex, 1);
      }
    }

    return points;
  }

  private static isValidPoint(
    point: { x: number; z: number },
    points: Array<{ x: number; z: number }>,
    grid: number[][],
    gridWidth: number,
    cellSize: number,
    minDistance: number
  ): boolean {
    const gridX = Math.floor(point.x / cellSize);
    const gridZ = Math.floor(point.z / cellSize);

    const searchRadius = 2;
    for (let dz = -searchRadius; dz <= searchRadius; dz++) {
      for (let dx = -searchRadius; dx <= searchRadius; dx++) {
        const checkX = gridX + dx;
        const checkZ = gridZ + dz;

        if (
          checkX >= 0 &&
          checkX < gridWidth &&
          checkZ >= 0 &&
          checkZ < gridWidth
        ) {
          const pointIndex = grid[checkZ][checkX];
          if (pointIndex !== -1) {
            const otherPoint = points[pointIndex];
            const dist = Math.sqrt(
              (point.x - otherPoint.x) ** 2 + (point.z - otherPoint.z) ** 2
            );
            if (dist < minDistance) {
              return false;
            }
          }
        }
      }
    }

    return true;
  }

  /**
   * Colocar objetos basado en biomas
   */
  static placeObjects(
    context: GenerationContext,
    biomemap: Uint8Array,
    heightmap: Float32Array,
    prng: () => number
  ): ObjectInstance[] {
    const objects: ObjectInstance[] = [];
    const { chunkCoord, chunkSize, config } = context;

    // Definir tipos de objetos por bioma
    const biomeObjects: { [biomeId: number]: string[] } = {
      0: ['rock_small'], // Tundra
      1: ['grass_tall'], // Pradera
      2: ['cactus', 'rock_desert'], // Desierto
      3: ['tree_pine', 'tree_spruce'], // Bosque Boreal
      4: ['tree_oak', 'tree_birch'], // Bosque Templado
      5: ['tree_acacia', 'rock_savanna'], // Sabana
      6: ['tree_pine_tall'], // Taiga
      7: ['tree_jungle', 'bush_fern'], // Selva Templada
      8: ['tree_palm', 'tree_tropical', 'bush_tropical'] // Selva Tropical
    };

    // Generar puntos usando Poisson Disk
    const minDistance = 5; // metros entre objetos
    const points = this.poissonDiskSampling(chunkSize, minDistance, 30, prng);

    // Para cada punto, decidir si colocar objeto basado en bioma
    for (const point of points) {
      const x = Math.floor(point.x);
      const z = Math.floor(point.z);
      const index = z * chunkSize + x;

      const biomeId = biomemap[index];
      const height = heightmap[index];

      // Obtener tipos de objetos para este bioma
      const objectTypes = biomeObjects[biomeId] || [];
      if (objectTypes.length === 0) continue;

      // Probabilidad de spawn basada en densidad del bioma
      const biome = config.biomes.find(b => b.id === biomeId);
      const density = biome?.objectDensity || 0.5;

      if (prng() < density) {
        // Seleccionar tipo de objeto aleatoriamente
        const type = objectTypes[Math.floor(prng() * objectTypes.length)];

        // Calcular posición mundial
        const worldX = chunkCoord.x * chunkSize + point.x;
        const worldZ = chunkCoord.z * chunkSize + point.z;
        const worldY = height * config.worldScale;

        // Rotación aleatoria en Y
        const rotationY = prng() * Math.PI * 2;

        // Escala con variación
        const scaleVariation = 0.8 + prng() * 0.4; // 0.8 - 1.2

        objects.push({
          type,
          position: { x: worldX, y: worldY, z: worldZ },
          rotation: { x: 0, y: rotationY, z: 0, w: 1 },
          scale: {
            x: scaleVariation,
            y: scaleVariation,
            z: scaleVariation
          }
        });
      }
    }

    return objects;
  }
}