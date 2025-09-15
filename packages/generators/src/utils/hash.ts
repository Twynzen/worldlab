/**
 * Genera un hash entero de 32 bits determinista
 * Rápido, determinista y no criptográfico
 */
export function generateHash(...inputs: any[]): number {
  let hash = 0;
  for (const input of inputs) {
    const str = String(input);
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0; // Forzar a entero de 32 bits
    }
  }
  return hash;
}

/**
 * Convierte coordenada del mundo a coordenada de chunk
 */
export function worldToChunkCoord(worldCoordinate: number, chunkSize: number): number {
  return Math.floor(worldCoordinate / chunkSize);
}

/**
 * Obtiene las coordenadas del chunk para una posición en el mundo
 */
export function getChunkCoord(
  worldPos: { x: number; z: number },
  chunkSize: number
): { x: number; z: number } {
  return {
    x: worldToChunkCoord(worldPos.x, chunkSize),
    z: worldToChunkCoord(worldPos.z, chunkSize)
  };
}