import { put, head } from '@vercel/blob';
import sharp from 'sharp';
import { fetchTokenDetails } from './BlockchainServerAPI';

const BUCKET_PREFIX = 'images/';

export async function fetchArtworkImageUrl(tokenId: number): Promise<string | null> {
  if (!process?.env?.BLOB_READ_WRITE_TOKEN) {
    console.error('[fetchArtworkImageUrl] Blob read-write token is not configured');
    return null;
  }

  if (!Number.isFinite(tokenId) || tokenId < 0) {
    throw new Error('Invalid token id');
  }

  console.log(`[fetchArtworkImageUrl] Fetching artwork image URL for tokenId: ${tokenId}...`);

  const key = `${BUCKET_PREFIX}anglez-${tokenId}.png`;

  // If exists, return URL
  try {
    const meta = await head(key);
    if (meta?.url) {
      return meta.url;
    }
  } catch {}

  // Generate PNG
  const token = await fetchTokenDetails(tokenId);
  if (!token?.svg) {
    throw new Error('fetchArtworkImageUrl Token SVG not found');
  }

  console.log(`[fetchArtworkImageUrl] Generating PNG for tokenId: ${tokenId}...`);

  const png = await sharp(Buffer.from(token.svg), { density: 300 })
    // .resize(1000, 1000, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toBuffer();

  // Upload publicly readable
  const res = await put(key, png, {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'image/png',
    cacheControlMaxAge: 60 * 60 * 24 * 30,
  });

  console.log(`[fetchArtworkImageUrl] Uploaded PNG for tokenId: ${tokenId}. URL: ${res.url}`);
  return res.url;
}
