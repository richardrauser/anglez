import { fetchTokenDetailsServer } from '@/src/TokenDetailsFetcher';

export const runtime = 'nodejs';
export const revalidate = 60; // 1 minute

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const id = Number.parseInt(params.id, 10);
  if (!Number.isFinite(id) || id < 0) {
    return new Response(JSON.stringify({ error: 'Invalid token id' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }

  try {
    const details = await fetchTokenDetailsServer(id);
    if (!details) {
      return new Response(JSON.stringify({ error: 'Token not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      });
    }

    return new Response(JSON.stringify(details), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=60',
      },
    });
  } catch (e) {
    console.error('[api/token-details] Unexpected error:', e);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }
}
