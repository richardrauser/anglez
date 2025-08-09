import sharp from 'sharp';
import { fetchTokenDetails } from '@/src/BlockchainServerAPI';

export const runtime = 'nodejs';
export const revalidate = 3600; // cache for 1 hour

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  if (Number.isNaN(id)) {
    return new Response('Invalid token id', { status: 400 });
  }

  try {
    const token = await fetchTokenDetails(id);
    if (!token?.svg) {
      return new Response('Not found', { status: 404 });
    }

    const png = await sharp(Buffer.from(token.svg), { density: 300 })
      // .resize(1200, 1200, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .png()
      .toBuffer();

    const uint8 = new Uint8Array(png);
    return new Response(uint8, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
      },
    });
  } catch (e) {
    console.error('Error generating token image', e);
    return new Response('Server error', { status: 500 });
  }
}
