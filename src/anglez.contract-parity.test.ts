import { buildArtwork, generateRandomTokenParams, TokenParams } from './anglez';
import fixture from './__fixtures__/contract-svgs.json';

/**
 * The Solidity contract renders each token's SVG on-chain; this TS module renders the
 * preview shown before minting. If the two diverge, buyers see one artwork and receive
 * another - so for a selection of real minted tokens the two renderers must agree byte
 * for byte. The contract is the source of truth.
 *
 * The expected SVGs and the exact mint parameters are captured straight from the
 * deployed Base Mainnet contract (see scripts/capture-contract-svgs.mjs). Minted tokens
 * are immutable, so the fixture stays valid forever and this test needs no network
 * access or credentials.
 */

type FixtureToken = (typeof fixture.tokens)[number];

// The contract stores the tint alpha as a raw 0-255 byte; TokenParams carries it as a
// 0-1 fraction, which getColour scales back with Math.round().
function toTokenParams(params: FixtureToken['params']): TokenParams {
  return {
    seed: params.seed,
    shapeCount: params.shapeCount,
    tintColour: {
      r: params.tint.red,
      g: params.tint.green,
      b: params.tint.blue,
      a: params.tint.alpha / 255,
    },
    isCyclic: params.cyclic,
    isChaotic: params.chaotic,
  };
}

const label = (token: FixtureToken) =>
  `token ${token.tokenId} (${token.params.custom ? 'custom' : 'random'}, ` +
  `${token.params.shapeCount} shapes, ${token.attributes.style}/${token.attributes.structure}, ` +
  `alpha ${token.params.tint.alpha})`;

const allTokens = fixture.tokens.map((t) => [label(t), t] as [string, FixtureToken]);
const randomMints = fixture.tokens
  .filter((t) => !t.params.custom)
  .map((t) => [label(t), t] as [string, FixtureToken]);

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('contract parity: fixture coverage', () => {
  it('spans both mint kinds and every style/structure combination', () => {
    const combinations = new Set(
      fixture.tokens.map((t) => `${t.params.cyclic}/${t.params.chaotic}`)
    );
    const mintKinds = new Set(fixture.tokens.map((t) => t.params.custom));

    expect(combinations.size).toBe(4);
    expect(mintKinds).toEqual(new Set([true, false]));
    expect(fixture.tokens.length).toBeGreaterThanOrEqual(9);
  });

  it('pins the fixture to the deployed Base Mainnet contract', () => {
    expect(fixture.chainId).toBe(8453);
    expect(fixture.contractAddress).toBe('0x2F8c2A675962ecb07505684EeA496D02d5a9124A');
  });
});

describe('contract parity: rendering', () => {
  it.each(allTokens)('renders %s identically to the contract', (_label, token) => {
    expect(buildArtwork(toTokenParams(token.params))).toBe(token.svg);
  });
});

describe('contract parity: random mint derivation', () => {
  // A random mint gives the contract nothing but a seed, and the preview has to derive
  // the same parameters from it that the contract will. This is the path a buyer sees
  // before paying, so it has to agree end to end - parameters and pixels.
  it.each(randomMints)('derives the contract parameters for %s from its seed', (_label, token) => {
    expect(generateRandomTokenParams(token.params.seed)).toEqual(toTokenParams(token.params));
  });

  it.each(randomMints)(
    'renders %s identically to the contract from its seed alone',
    (_label, token) => {
      expect(buildArtwork(generateRandomTokenParams(token.params.seed))).toBe(token.svg);
    }
  );
});
