// Tipos y interfaces principales para el sistema de generación

export interface BiomeConfig {
  id: number;
  name: string;
  color: { r: number; g: number; b: number };
  friction?: number;
  objectDensity?: number;
}

export interface GeneratorConfig {
  seed: number | string;
  chunkSize: number; // 32, 64, 128
  worldScale: number; // metros por unidad

  heightmapParams: {
    frequency: number;
    octaves: number;
    persistence: number;
    lacunarity: number;
    amplitude: number;
  };

  temperatureParams: {
    baseTemperature: number;
    frequency: number;
    altitudeLapseRate: number;
  };

  moistureParams: {
    frequency: number;
  };

  biomes: BiomeConfig[];
  biomeLookupTable: number[][]; // [humidity][temperature] -> biomeId
}

export interface GenerationContext {
  seed: number | string;
  chunkCoord: { x: number; z: number };
  chunkSize: number;
  config: GeneratorConfig;
  heightmap?: Float32Array;
}

export interface ObjectInstance {
  type: string; // 'tree_pine', 'rock_large'
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number; w: number };
  scale: { x: number; y: number; z: number };
}

export interface ChunkData {
  coord: { x: number; z: number };
  heightmap: Float32Array;
  biomemap: Uint8Array;
  temperature: Float32Array;
  moisture: Float32Array;
  objects: ObjectInstance[];
  metadata: {
    minHeight: number;
    maxHeight: number;
    generationTime: number;
    [key: string]: any;
  };
}

export interface Generator<T> {
  generate(context: GenerationContext): T;
}