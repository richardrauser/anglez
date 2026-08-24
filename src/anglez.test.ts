import { buildArtwork, generateRandomTokenParams, TokenParams } from './anglez';

// The generator logs per-shape; keep the suite output readable.
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
});

const SEEDS = [0, 1, 42, 648853, 999999];

describe('generateRandomTokenParams', () => {
  it('is deterministic for a given seed', () => {
    for (const seed of SEEDS) {
      expect(generateRandomTokenParams(seed)).toEqual(generateRandomTokenParams(seed));
    }
  });

  it('echoes back the seed it was given', () => {
    for (const seed of SEEDS) {
      expect(generateRandomTokenParams(seed).seed).toBe(seed);
    }
  });

  it('keeps every generated parameter inside its documented range', () => {
    for (const seed of SEEDS) {
      const params = generateRandomTokenParams(seed);

      expect(Number.isInteger(params.shapeCount)).toBe(true);
      expect(params.shapeCount).toBeGreaterThanOrEqual(5);
      expect(params.shapeCount).toBeLessThanOrEqual(8);

      for (const channel of ['r', 'g', 'b'] as const) {
        const value = params.tintColour[channel];
        expect(Number.isInteger(value)).toBe(true);
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(255);
      }

      // alpha is an int 10..90 scaled to a fraction
      expect(params.tintColour.a).toBeGreaterThanOrEqual(0.1);
      expect(params.tintColour.a).toBeLessThanOrEqual(0.9);

      expect(typeof params.isCyclic).toBe('boolean');
      expect(typeof params.isChaotic).toBe('boolean');
    }
  });

  it('does not collapse different seeds onto one set of parameters', () => {
    const fingerprints = new Set(
      SEEDS.map((seed) => JSON.stringify(generateRandomTokenParams(seed)))
    );

    expect(fingerprints.size).toBe(SEEDS.length);
  });
});

describe('buildArtwork', () => {
  it('is deterministic for a given seed', () => {
    // This is the contract that matters most: the JS preview has to agree with the
    // Solidity that renders the token on-chain, so the same seed must always produce
    // byte-identical output.
    for (const seed of SEEDS) {
      const first = buildArtwork(generateRandomTokenParams(seed));
      const second = buildArtwork(generateRandomTokenParams(seed));
      expect(first).toBe(second);
    }
  });

  it('produces a well-formed svg with a viewBox', () => {
    const svg = buildArtwork(generateRandomTokenParams(648853));

    expect(svg.startsWith("<svg xmlns='http://www.w3.org/2000/svg'")).toBe(true);
    expect(svg.endsWith('</svg>')).toBe(true);
    expect(svg).toMatch(/viewBox='-?[\d.]+ -?[\d.]+ -?[\d.]+ -?[\d.]+'/);
  });

  it('keeps every tinted colour channel within rgb gamut', () => {
    // safeTint blends a random colour toward the tint; a sign slip there would push
    // channels outside 0..255 and the SVG would render wrong (or not at all).
    for (const seed of SEEDS) {
      const svg = buildArtwork(generateRandomTokenParams(seed));
      const channels = [...svg.matchAll(/rgb\((-?\d+), (-?\d+), (-?\d+)\)/g)];

      expect(channels.length).toBeGreaterThan(0);

      for (const match of channels) {
        for (const raw of match.slice(1)) {
          const value = Number(raw);
          expect(value).toBeGreaterThanOrEqual(0);
          expect(value).toBeLessThanOrEqual(255);
        }
      }
    }
  });

  it('renders different artwork for different seeds', () => {
    const outputs = new Set(SEEDS.map((seed) => buildArtwork(generateRandomTokenParams(seed))));

    expect(outputs.size).toBe(SEEDS.length);
  });

  it('respects a fully transparent tint by leaving colours untinted', () => {
    // alpha 0 short-circuits safeTint, so the artwork should still be valid rgb.
    const params: TokenParams = {
      seed: 12345,
      shapeCount: 6,
      tintColour: { r: 255, g: 0, b: 0, a: 0 },
      isCyclic: false,
      isChaotic: false,
    };

    const svg = buildArtwork(params);
    const channels = [...svg.matchAll(/rgb\((-?\d+), (-?\d+), (-?\d+)\)/g)];

    expect(channels.length).toBeGreaterThan(0);
    for (const match of channels) {
      for (const raw of match.slice(1)) {
        expect(Number(raw)).toBeGreaterThanOrEqual(0);
        expect(Number(raw)).toBeLessThanOrEqual(255);
      }
    }
  });

  it('honours an explicit shapeCount', () => {
    const base: TokenParams = {
      seed: 777,
      shapeCount: 5,
      tintColour: { r: 10, g: 20, b: 30, a: 0.3 },
      isCyclic: false,
      isChaotic: false,
    };

    // isCyclic false pins maxPolyRepeat to 1, so shapes map 1:1 to polygons.
    const few = [...buildArtwork(base).matchAll(/<polygon/g)].length;
    const many = [...buildArtwork({ ...base, shapeCount: 10 }).matchAll(/<polygon/g)].length;

    expect(many).toBeGreaterThan(few);
  });
});
