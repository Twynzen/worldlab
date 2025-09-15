// Stub temporal para simplex-noise
export type NoiseFunction2D = (x: number, y: number) => number;
export const createNoise2D = (prng?: any): NoiseFunction2D => (x: number, y: number) => Math.random() * 2 - 1;
export const createNoise3D = () => (x: number, y: number, z: number) => Math.random() * 2 - 1;