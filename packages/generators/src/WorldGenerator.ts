import alea from './stub-alea';
import { generateHash } from './utils/hash';
import { HeightmapGenerator } from './generators/HeightmapGenerator';
import { BiomeGenerator } from './generators/BiomeGenerator';
import { ObjectPlacer } from './generators/ObjectPlacer';
import {
  GeneratorConfig,
  GenerationContext,
  ChunkData,
  BiomeConfig
} from './types';

export class WorldGenerator {
  private config: GeneratorConfig;
  private globalSeed: number;

  constructor(config: GeneratorConfig) {
    this.config = this.initializeConfig(config);
    this.globalSeed = typeof config.seed === 'string'
      ? generateHash(config.seed)
      : config.seed;
  }

  private initializeConfig(config: GeneratorConfig): GeneratorConfig {
    // Valores por defecto si no se proporcionan
    const defaultConfig: GeneratorConfig = {
      seed: Date.now(),
      chunkSize: 64,
      worldScale: 1,
      heightmapParams: {
        frequency: 0.01,
        octaves: 4,
        persistence: 0.5,
        lacunarity: 2,
        amplitude: 1
      },
      temperatureParams: {
        baseTemperature: 0.5,
        frequency: 0.005,
        altitudeLapseRate: 0.1
      },
      moistureParams: {
        frequency: 0.008
      },
      biomes: this.getDefaultBiomes(),
      biomeLookupTable: this.getDefaultBiomeLookupTable()
    };

    return {
      ...defaultConfig,
      ...config,
      heightmapParams: { ...defaultConfig.heightmapParams, ...config.heightmapParams },
      temperatureParams: { ...defaultConfig.temperatureParams, ...config.temperatureParams },
      moistureParams: { ...defaultConfig.moistureParams, ...config.moistureParams }
    };
  }

  private getDefaultBiomes(): BiomeConfig[] {
    return [
      { id: 0, name: 'Tundra', color: { r: 176, g: 176, b: 176 }, objectDensity: 0.1 },
      { id: 1, name: 'Grassland', color: { r: 154, g: 205, b: 50 }, objectDensity: 0.3 },
      { id: 2, name: 'Desert', color: { r: 238, g: 203, b: 173 }, objectDensity: 0.1 },
      { id: 3, name: 'Boreal Forest', color: { r: 34, g: 139, b: 34 }, objectDensity: 0.8 },
      { id: 4, name: 'Temperate Forest', color: { r: 34, g: 90, b: 34 }, objectDensity: 0.7 },
      { id: 5, name: 'Savanna', color: { r: 189, g: 183, b: 107 }, objectDensity: 0.4 },
      { id: 6, name: 'Taiga', color: { r: 47, g: 79, b: 47 }, objectDensity: 0.9 },
      { id: 7, name: 'Temperate Rainforest', color: { r: 0, g: 100, b: 0 }, objectDensity: 0.9 },
      { id: 8, name: 'Tropical Rainforest', color: { r: 0, g: 128, b: 0 }, objectDensity: 1.0 }
    ];
  }

  private getDefaultBiomeLookupTable(): number[][] {
    // Tabla de Whittaker: [humedad][temperatura] -> biomeId
    //                     Frío  Templado  Cálido
    return [
      [0, 1, 2],  // Seco
      [3, 4, 5],  // Moderado
      [6, 7, 8]   // Húmedo
    ];
  }

  /**
   * Genera un chunk específico
   */
  async generateChunk(
    chunkCoord: { x: number; z: number },
    callbacks?: {
      onProgress?: (progress: number) => void;
      onComplete?: (data: ChunkData) => void;
      onError?: (error: Error) => void;
    }
  ): Promise<ChunkData> {
    const startTime = performance.now();

    try {
      callbacks?.onProgress?.(0);

      // Generar sub-seeds deterministas para cada sistema
      const chunkSeed = generateHash(this.globalSeed, chunkCoord.x, chunkCoord.z);
      const heightSeed = generateHash(chunkSeed, 'height');
      const tempSeed = generateHash(chunkSeed, 'temperature');
      const moistSeed = generateHash(chunkSeed, 'moisture');
      const objectSeed = generateHash(chunkSeed, 'objects');

      // Crear PRNGs para cada sistema
      const heightPrng = alea(heightSeed);
      const tempPrng = alea(tempSeed);
      const moistPrng = alea(moistSeed);
      const objectPrng = alea(objectSeed);

      // Contexto de generación
      const context: GenerationContext = {
        seed: chunkSeed,
        chunkCoord,
        chunkSize: this.config.chunkSize,
        config: this.config
      };

      // 1. Generar heightmap
      callbacks?.onProgress?.(0.25);
      const heightmapGen = new HeightmapGenerator(heightPrng);
      const paddedHeightmap = heightmapGen.generate(context);
      const heightmap = HeightmapGenerator.extractCenterArea(
        paddedHeightmap,
        this.config.chunkSize,
        1
      );

      // 2. Generar biomas (temperatura, humedad, clasificación)
      callbacks?.onProgress?.(0.5);
      const biomeGen = new BiomeGenerator(tempPrng, moistPrng);
      const contextWithHeight = { ...context, heightmap };
      const { temperature, moisture, biomemap } = biomeGen.generate(contextWithHeight);

      // 3. Colocar objetos
      callbacks?.onProgress?.(0.75);
      const objects = ObjectPlacer.placeObjects(
        context,
        biomemap,
        heightmap,
        objectPrng
      );

      // Calcular metadata
      let minHeight = Infinity;
      let maxHeight = -Infinity;
      for (const h of heightmap) {
        minHeight = Math.min(minHeight, h);
        maxHeight = Math.max(maxHeight, h);
      }

      const generationTime = performance.now() - startTime;

      const chunkData: ChunkData = {
        coord: chunkCoord,
        heightmap,
        biomemap,
        temperature,
        moisture,
        objects,
        metadata: {
          minHeight,
          maxHeight,
          generationTime,
          seed: chunkSeed
        }
      };

      callbacks?.onProgress?.(1);
      callbacks?.onComplete?.(chunkData);

      return chunkData;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      callbacks?.onError?.(err);
      throw err;
    }
  }

  /**
   * Genera múltiples chunks en espiral desde un centro
   */
  async generateChunksSpiral(
    centerChunk: { x: number; z: number },
    radius: number
  ): Promise<ChunkData[]> {
    const chunks: ChunkData[] = [];
    const coords: Array<{ x: number; z: number }> = [];

    // Generar coordenadas en espiral
    let x = 0, z = 0;
    let dx = 0, dz = -1;

    for (let i = 0; i < Math.pow(radius * 2 + 1, 2); i++) {
      if (Math.abs(x) <= radius && Math.abs(z) <= radius) {
        coords.push({
          x: centerChunk.x + x,
          z: centerChunk.z + z
        });
      }

      if (x === z || (x < 0 && x === -z) || (x > 0 && x === 1 - z)) {
        const temp = dx;
        dx = -dz;
        dz = temp;
      }

      x += dx;
      z += dz;
    }

    // Generar chunks
    for (const coord of coords) {
      const chunk = await this.generateChunk(coord);
      chunks.push(chunk);
    }

    return chunks;
  }

  /**
   * Actualiza la configuración
   */
  updateConfig(config: Partial<GeneratorConfig>): void {
    this.config = {
      ...this.config,
      ...config
    };
  }

  /**
   * Obtiene la configuración actual
   */
  getConfig(): GeneratorConfig {
    return { ...this.config };
  }
}