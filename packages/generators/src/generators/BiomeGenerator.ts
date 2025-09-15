import { createNoise2D, NoiseFunction2D } from '../stub-simplex';
import { GenerationContext, Generator } from '../types';

export class BiomeGenerator implements Generator<{
  temperature: Float32Array;
  moisture: Float32Array;
  biomemap: Uint8Array;
}> {
  private temperatureNoise: NoiseFunction2D;
  private moistureNoise: NoiseFunction2D;

  constructor(tempPrng: () => number, moistPrng: () => number) {
    this.temperatureNoise = createNoise2D(tempPrng);
    this.moistureNoise = createNoise2D(moistPrng);
  }

  generate(context: GenerationContext): {
    temperature: Float32Array;
    moisture: Float32Array;
    biomemap: Uint8Array;
  } {
    const { chunkCoord, chunkSize, config } = context;
    const { temperatureParams, moistureParams, biomeLookupTable } = config;

    const size = chunkSize * chunkSize;
    const temperature = new Float32Array(size);
    const moisture = new Float32Array(size);
    const biomemap = new Uint8Array(size);

    const worldStartX = chunkCoord.x * chunkSize;
    const worldStartZ = chunkCoord.z * chunkSize;

    // Necesitamos el heightmap para ajustar temperatura por altitud
    // Esto se pasaría desde el WorldGenerator
    const heightmap = context.heightmap || new Float32Array(size);

    for (let z = 0; z < chunkSize; z++) {
      for (let x = 0; x < chunkSize; x++) {
        const worldX = worldStartX + x;
        const worldZ = worldStartZ + z;
        const index = z * chunkSize + x;

        // Generar temperatura base
        let temp = this.temperatureNoise(
          worldX * temperatureParams.frequency,
          worldZ * temperatureParams.frequency
        );
        // Normalizar a [0, 1]
        temp = (temp + 1) * 0.5;

        // Ajustar por altitud (temperatura baja con altura)
        const height = heightmap[index];
        const heightAdjustment = height * temperatureParams.altitudeLapseRate;
        temp = Math.max(0, Math.min(1, temp - heightAdjustment));
        temperature[index] = temp;

        // Generar humedad
        let moist = this.moistureNoise(
          worldX * moistureParams.frequency,
          worldZ * moistureParams.frequency
        );
        // Normalizar a [0, 1]
        moist = (moist + 1) * 0.5;
        moisture[index] = moist;

        // Determinar bioma usando tabla de Whittaker
        const biomeId = this.getBiomeFromWhittaker(
          temp,
          moist,
          biomeLookupTable
        );
        biomemap[index] = biomeId;
      }
    }

    return { temperature, moisture, biomemap };
  }

  private getBiomeFromWhittaker(
    temperature: number,
    moisture: number,
    lookupTable: number[][]
  ): number {
    // Dividir en 3 categorías de temperatura y humedad
    const tempIndex = Math.floor(temperature * 3);
    const moistIndex = Math.floor(moisture * 3);

    // Clampear índices
    const ti = Math.min(2, Math.max(0, tempIndex));
    const mi = Math.min(2, Math.max(0, moistIndex));

    return lookupTable[mi][ti];
  }
}