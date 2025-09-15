// Stub temporal para alea
export default function alea(seed: string | number): () => number {
  return Math.random;
}