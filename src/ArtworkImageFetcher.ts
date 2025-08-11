import { put, head } from '@vercel/blob';
import sharp from 'sharp';
import { fetchTokenDetailsClient } from '@/src/TokenDetailsFetcher';

const BUCKET_PREFIX = 'images/';

export async function fetchArtworkImageUrl(tokenId: number): Promise<string | null> {
  if (!process?.env?.BLOB_READ_WRITE_TOKEN) {
    console.error('[fetchArtworkImageUrl] Blob read-write token is not configured');
    return null;
  }

  console.log(`[fetchArtworkImageUrl] Fetching artwork image URL for anglez #${tokenId}...`);

  const key = `${BUCKET_PREFIX}anglez-${tokenId}.png`;

  // If exists, return URL
  try {
    const meta = await head(key);
    console.log(
      `[fetchArtworkImageUrl] Found existing image for anglez #${tokenId}. URL: ${meta.url}`
    );
    if (meta?.url) {
      return meta.url;
    }
  } catch (error) {
    console.error(
      `[fetchArtworkImageUrl] Error fetching existing image for anglez #${tokenId}:`,
      error
    );
  }

  // Generate PNG
  console.log(`[fetchArtworkImageUrl] Generating PNG for anglez #${tokenId}...`);
  const token = await fetchTokenDetailsClient(tokenId);
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
