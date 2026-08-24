/**
 * Captures on-chain SVGs *and the exact mint parameters* from the deployed Anglez
 * contract into a test fixture.
 *
 *   ALCHEMY_API_KEY=... node scripts/capture-contract-svgs.mjs [tokenId ...]
 *
 * Minted tokens are immutable, so the captured output is stable forever - the fixture
 * is committed and src/anglez.contract-parity.test.ts diffs the TS renderer against it
 * offline, with no network or credentials needed in CI.
 *
 * Only re-run this to widen the selection of tokens under test.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ethers } from 'ethers';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// A spread rather than every token: both mint types, all four style/structure
// combinations, the smallest and largest shape counts, and the first/last minted ids.
const DEFAULT_TOKEN_IDS = [0, 1, 2, 4, 7, 50, 100, 200, 209];

function resolveApiKey() {
  if (process.env.ALCHEMY_API_KEY) {
    return process.env.ALCHEMY_API_KEY.replace(/^["']|["']$/g, '');
  }
  try {
    const match = readFileSync(join(ROOT, '.env'), 'utf8').match(/^ALCHEMY_API_KEY=(.*)$/m);
    if (match) {
      return match[1].trim().replace(/^["']|["']$/g, '');
    }
  } catch {
    // no .env - fall through
  }
  throw new Error('ALCHEMY_API_KEY is not set');
}

function decodeTokenUri(uri) {
  if (uri.startsWith('data:application/json;base64,')) {
    return Buffer.from(uri.split(',')[1], 'base64').toString('utf8');
  }
  return uri.replace(/^data:(text\/plain|application\/json),/, '');
}

const CHAIN_ID = 8453; // Base Mainnet
const CONTRACT_ADDRESS = '0x2F8c2A675962ecb07505684EeA496D02d5a9124A';

// Anglez.sol keeps `mapping(uint256 => TokenParams) private tokenParamsMapping` at slot
// 14. The params are not exposed by any getter, and tokenURI's "tint opacity" trait is
// a lossy `alpha * 100 / 255`, so the raw alpha byte can only be recovered by reading
// storage directly. Every decoded field is cross-checked against tokenURI below, which
// is what makes this safe to rely on.
const TOKEN_PARAMS_SLOT = 14;

// TokenParams { uint24 randomSeed; bool custom; Tint tint; uint8 shapeCount; bool cyclic;
// bool chaotic; } - the nested Tint struct starts a fresh slot, and so does the member
// following it, giving three packed slots per token.
async function readTokenParams(provider, tokenId) {
  const base = BigInt(
    ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(['uint256', 'uint256'], [tokenId, TOKEN_PARAMS_SLOT])
    )
  );
  const slot = async (offset) =>
    ethers.getBytes(await provider.getStorage(CONTRACT_ADDRESS, base + offset)).reverse();

  const [head, tint, tail] = [await slot(0n), await slot(1n), await slot(2n)];

  return {
    seed: head[0] | (head[1] << 8) | (head[2] << 16),
    custom: head[3] === 1,
    tint: { red: tint[0], green: tint[1], blue: tint[2], alpha: tint[3] },
    shapeCount: tail[0],
    cyclic: tail[1] === 1,
    chaotic: tail[2] === 1,
  };
}

const { abi } = JSON.parse(readFileSync(join(ROOT, 'contract/Anglez.json'), 'utf8'));
const provider = new ethers.AlchemyProvider(CHAIN_ID, resolveApiKey());
const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

const tokenIds = process.argv.slice(2).length
  ? process.argv.slice(2).map(Number)
  : DEFAULT_TOKEN_IDS;

const tokens = [];

for (const tokenId of tokenIds) {
  const metadata = JSON.parse(decodeTokenUri(await contract.tokenURI(tokenId)));
  const attributeValue = (traitType) =>
    (metadata.attributes.find((a) => a.trait_type === traitType) || {}).value;

  // generateSvg() is the contract's own renderer; assert it agrees with the SVG
  // embedded in tokenURI so the fixture cannot capture a stale image.
  const svg = await contract.generateSvg(tokenId);
  const svgFromMetadata = metadata.image.replace('data:image/svg+xml,', '');
  if (svg !== svgFromMetadata) {
    throw new Error(`token ${tokenId}: generateSvg() disagrees with tokenURI image`);
  }

  const params = await readTokenParams(provider, tokenId);

  // Cross-check the storage decode against the public metadata. If the layout
  // assumption above is ever wrong, this fails here rather than silently baking bad
  // expectations into the fixture.
  const expected = {
    seed: Number(attributeValue('seed')),
    shapeCount: Number(attributeValue('shapes')),
    tint: attributeValue('tint color').match(/\d+/g).slice(0, 3).map(Number),
    cyclic: attributeValue('style') === 'cyclic',
    chaotic: attributeValue('structure') === 'chaotic',
    custom: attributeValue('custom') === 'true',
  };
  const mismatches = [];
  if (params.seed !== expected.seed) mismatches.push('seed');
  if (params.shapeCount !== expected.shapeCount) mismatches.push('shapeCount');
  if (params.tint.red !== expected.tint[0]) mismatches.push('tint.red');
  if (params.tint.green !== expected.tint[1]) mismatches.push('tint.green');
  if (params.tint.blue !== expected.tint[2]) mismatches.push('tint.blue');
  if (params.cyclic !== expected.cyclic) mismatches.push('cyclic');
  if (params.chaotic !== expected.chaotic) mismatches.push('chaotic');
  if (params.custom !== expected.custom) mismatches.push('custom');
  if (mismatches.length) {
    throw new Error(`token ${tokenId}: storage decode disagrees with tokenURI on ${mismatches.join(', ')}`);
  }
  // The alpha byte has no public counterpart to check against; assert the lossy trait
  // the contract derives from it instead.
  const derivedOpacity = Math.floor((params.tint.alpha * 100) / 255);
  if (String(derivedOpacity) !== attributeValue('tint opacity').replace(/^0\./, '').replace(/^0/, '')) {
    // tokenURI renders it as "0." + uintToString(alpha * 100 / 255)
    const rendered = `0.${derivedOpacity}`;
    if (rendered !== attributeValue('tint opacity')) {
      throw new Error(
        `token ${tokenId}: alpha ${params.tint.alpha} implies opacity ${rendered}, ` +
          `tokenURI says ${attributeValue('tint opacity')}`
      );
    }
  }

  tokens.push({
    tokenId,
    params,
    attributes: {
      seed: attributeValue('seed'),
      shapes: attributeValue('shapes'),
      tintColor: attributeValue('tint color'),
      tintOpacity: attributeValue('tint opacity'),
      style: attributeValue('style'),
      structure: attributeValue('structure'),
      custom: attributeValue('custom'),
    },
    svg,
  });

  console.log(`captured token ${tokenId} (alpha=${params.tint.alpha}, ${svg.length} bytes)`);
}

const out = join(ROOT, 'src/__fixtures__/contract-svgs.json');
writeFileSync(
  out,
  `${JSON.stringify({ chainId: CHAIN_ID, contractAddress: CONTRACT_ADDRESS, tokens }, null, 2)}\n`
);
console.log(`wrote ${tokens.length} tokens to ${out}`);
