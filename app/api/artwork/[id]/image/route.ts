import { getCachedArtworkPng } from '@/src/ImageCache';

export const runtime = 'nodejs';
export const revalidate = 3600; // cache for 1 hour

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  if (Number.isNaN(id)) {
    return new Response('Invalid token id', { status: 400 });
  }

  try {
    const uint8 = await getCachedArtworkPng(id);
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(uint8);
        controller.close();
      },
    });
    return new Response(stream, {
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
