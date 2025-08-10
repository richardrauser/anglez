import sharp from 'sharp';
import { unstable_cache } from 'next/cache';
import { fetchTokenDetails } from './BlockchainServerAPI';

// Returns a cached PNG (Uint8Array) for a given token id. Cached on the Next.js incremental cache.
export async function getCachedArtworkPng(id: number): Promise<Uint8Array> {
  const cached = unstable_cache(
    async () => {
      const token = await fetchTokenDetails(id);
      if (!token?.svg) {
        throw new Error('Token SVG not found');
      }

      const png = await sharp(Buffer.from(token.svg), { density: 300 })
        // .resize(1200, 1200, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
        .png()
        .toBuffer();
      return new Uint8Array(png);
    },
    ['token-png', String(id)],
    { revalidate: 60 * 60 * 24 }
  );

  return cached();
}
