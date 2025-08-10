import { getCachedArtworkPng } from '@/src/ImageCache';
import { promises as fs } from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const revalidate = 3600; // cache for 1 hour

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  if (Number.isNaN(id)) {
    return new Response('Invalid token id', { status: 400 });
  }

  try {
    const generate = getCachedArtworkPng(id);

    const fallback = new Promise<{ type: 'fallback'; data: Uint8Array }>((resolve) => {
      setTimeout(async () => {
        try {
          const fallbackPath = path.join(process.cwd(), 'public', 'anglez-square.png');
          const buf = await fs.readFile(fallbackPath);
          resolve({ type: 'fallback', data: new Uint8Array(buf) });
        } catch {
          // In the unlikely event fallback is missing, resolve empty PNG header to avoid 504
          resolve({ type: 'fallback', data: new Uint8Array() });
        }
      }, 1800);
    });

    const taggedGenerate = generate
      .then((data) => ({ type: 'gen' as const, data }))
      .catch(() => ({ type: 'error' as const, data: new Uint8Array() }));

    const result = await Promise.race([taggedGenerate, fallback]);

    // Let generation continue in background if fallback won the race
    generate.catch(() => {});

    const body = new ReadableStream({
      start(controller) {
        controller.enqueue(result.data);
        controller.close();
      },
    });

    const isGenerated = result.type === 'gen';
    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': isGenerated
          ? 'public, s-maxage=86400, stale-while-revalidate=604800'
          : 'public, s-maxage=60, stale-while-revalidate=86400',
        'X-Anglez-Image-Source': isGenerated ? 'cache' : 'fallback',
      },
    });
  } catch (e) {
    console.error('Error generating token image', e);
    return new Response('Server error', { status: 500 });
  }
}
