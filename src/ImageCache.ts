import sharp from 'sharp';
import { fetchTokenDetails } from './BlockchainServerAPI';
import { promises as fs } from 'fs';
import path from 'path';

// Returns a cached PNG (Uint8Array) for a given token id. Cached on the Next.js incremental cache.
export async function getCachedArtworkPng(id: number): Promise<Uint8Array> {
  if (!Number.isFinite(id) || id < 0 || id > 512) {
    throw new Error('Invalid token id');
  }

  const imagesDir = path.join(process.cwd(), 'public', 'images');
  const filename = `anglez-${id}.png`;
  const filePath = path.join(imagesDir, filename);

  // Try reading from cache on disk
  try {
    const existing = await fs.readFile(filePath);
    return new Uint8Array(existing);
  } catch {}

  // Not cached: generate
  const token = await fetchTokenDetails(id);
  if (!token?.svg) {
    throw new Error('Token SVG not found');
  }

  const png = await sharp(Buffer.from(token.svg), { density: 300 })
    // .resize(1200, 1200, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toBuffer();

  // Ensure directory exists and write atomically-ish
  try {
    await fs.mkdir(imagesDir, { recursive: true });
    const tmpPath = filePath + '.tmp';
    await fs.writeFile(tmpPath, new Uint8Array(png));
    await fs.rename(tmpPath, filePath);
  } catch (e) {
    // Swallow write errors so at least the image is returned; log for observability.
    console.error('Image cache write failed:', e);
  }

  return new Uint8Array(png);
}
