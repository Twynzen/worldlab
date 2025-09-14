/**
 * Seeded Random Number Generator for deterministic world generation
 * Based on the Mulberry32 algorithm for good distribution and speed
 */
export class RNG {
  private state: number;
  private originalSeed: number;
  
  constructor(seed: number) {
    this.originalSeed = seed;
    this.state = seed;
  }
  
  /**
   * Generate next random number between 0 and 1
   */
  random(): number {
    let t = this.state += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
  
  /**
   * Generate random integer between min (inclusive) and max (exclusive)
   */
  randomInt(min: number, max: number): number {
    return Math.floor(this.random() * (max - min)) + min;
  }
  
  /**
   * Generate random float between min and max
   */
  randomFloat(min: number, max: number): number {
    return this.random() * (max - min) + min;
  }
  
  /**
   * Random boolean with optional probability
   */
  randomBool(probability: number = 0.5): boolean {
    return this.random() < probability;
  }
  
  /**
   * Pick random element from array
   */
  randomChoice<T>(array: T[]): T {
    return array[this.randomInt(0, array.length)];
  }
  
  /**
   * Reset RNG to original seed
   */
  reset(): void {
    this.state = this.originalSeed;
  }
  
  /**
   * Get current seed
   */
  getSeed(): number {
    return this.originalSeed;
  }
  
  /**
   * Create a new RNG with a derived seed
   */
  derive(offset: number): RNG {
    return new RNG(this.originalSeed + offset);
  }
}