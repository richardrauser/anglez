import { fetchArtworkImageUrl } from '@/src/BlobImageCache';

export const runtime = 'nodejs';
export const revalidate = 3600; // cache for 1 hour

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  if (Number.isNaN(id)) {
    return new Response('Invalid token id', { status: 400 });
  }

  try {
    const url = await fetchArtworkImageUrl(id);
    return new Response(null, { status: 302, headers: { Location: url } });
  } catch (e) {
    console.error('Error generating token image', e);
    return new Response('Not found or generation failed', { status: 404 });
  }
}
