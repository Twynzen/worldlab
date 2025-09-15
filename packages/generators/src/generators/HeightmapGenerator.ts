import { createNoise2D, NoiseFunction2D } from '../stub-simplex';
import { GenerationContext, Generator } from '../types';

export class HeightmapGenerator implements Generator<Float32Array> {
  private noise2D: NoiseFunction2D;

  constructor(prng: () => number) {
    this.noise2D = createNoise2D(prng);
  }

  generate(context: GenerationContext): Float32Array {
    const { chunkCoord, chunkSize, config } = context;
    const { frequency, octaves, persistence, lacunarity, amplitude } = config.heightmapParams;

    // Generar con padding de 1 para bordes seamless
    const padding = 1;
    const dataSize = chunkSize + padding * 2;
    const heightmap = new Float32Array(dataSize * dataSize);

    const worldStartX = chunkCoord.x * chunkSize - padding;
    const worldStartZ = chunkCoord.z * chunkSize - padding;

    for (let z = 0; z < dataSize; z++) {
      for (let x = 0; x < dataSize; x++) {
        const worldX = worldStartX + x;
        const worldZ = worldStartZ + z;

        // Fractal Brownian Motion (FBM) para múltiples octavas
        let height = 0;
        let maxValue = 0;
        let amp = amplitude;
        let freq = frequency;

        for (let o = 0; o < octaves; o++) {
          const value = this.noise2D(worldX * freq, worldZ * freq);
          height += value * amp;
          maxValue += amp;

          amp *= persistence;
          freq *= lacunarity;
        }

        // Normalizar al rango [-1, 1]
        height /= maxValue;
        heightmap[z * dataSize + x] = height;
      }
    }

    return heightmap;
  }

  /**
   * Extrae el área central sin padding
   */
  static extractCenterArea(
    paddedData: Float32Array,
    chunkSize: number,
    padding: number
  ): Float32Array {
    const paddedSize = chunkSize + padding * 2;
    const result = new Float32Array(chunkSize * chunkSize);

    for (let z = 0; z < chunkSize; z++) {
      for (let x = 0; x < chunkSize; x++) {
        const paddedIndex = (z + padding) * paddedSize + (x + padding);
        const resultIndex = z * chunkSize + x;
        result[resultIndex] = paddedData[paddedIndex];
      }
    }

    return result;
  }
}