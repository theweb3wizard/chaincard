export class DeterministicPRNG {
  private state: number;

  constructor(seed: string) {
    this.state = this.hashSeed(seed);
  }

  private hashSeed(seed: string): number {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  next(): number {
    this.state = (this.state * 1664525 + 1013904223) & 0xFFFFFFFF;
    return (this.state >>> 0) / 0xFFFFFFFF;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  pick<T>(array: T[]): T {
    return array[Math.floor(this.next() * array.length)];
  }

  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  rgb(): [number, number, number] {
    return [this.next(), this.next(), this.next()];
  }

  hsl(): [number, number, number] {
    return [this.next() * 360, 40 + this.next() * 50, 30 + this.next() * 50];
  }

  angle(): number {
    return this.next() * Math.PI * 2;
  }

  gaussian(mean = 0, stdDev = 1): number {
    const u1 = this.next();
    const u2 = this.next();
    return mean + stdDev * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }
}

export function createSeedFromAddress(address: string): string {
  const clean = address.toLowerCase().replace('0x', '');
  const pairs: string[] = [];
  for (let i = 0; i < clean.length; i += 2) {
    pairs.push(clean.substring(i, i + 2));
  }
  return pairs.join('-');
}

export function generateColorPalette(address: string, archetype: string): string[] {
  const prng = new DeterministicPRNG(address + archetype);
  const palette: string[] = [];
  const baseHue = prng.next() * 360;

  for (let i = 0; i < 5; i++) {
    const hue = (baseHue + prng.next() * 60 - 30 + 360) % 360;
    const sat = 50 + prng.next() * 40;
    const light = 30 + prng.next() * 40;
    palette.push(`hsl(${hue.toFixed(0)}, ${sat.toFixed(0)}%, ${light.toFixed(0)}%)`);
  }

  return palette;
}

export function generateGeometryParams(address: string): {
  segments: number;
  complexity: number;
  radius: number;
  rotationSpeed: number;
  waveAmplitude: number;
  waveFrequency: number;
} {
  const prng = new DeterministicPRNG('geo-' + address);
  return {
    segments: prng.nextInt(4, 16) * 2,
    complexity: prng.nextFloat(0.3, 1.0),
    radius: prng.nextFloat(0.8, 1.5),
    rotationSpeed: prng.nextFloat(0.1, 0.5),
    waveAmplitude: prng.nextFloat(0.05, 0.3),
    waveFrequency: prng.nextFloat(0.5, 2.0),
  };
}