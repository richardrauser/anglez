import { head, put } from '@vercel/blob';
import type { TokenDetails } from './TokenDetails';
import { fetchTokenDetails as fetchTokenDetailsOnChain } from './BlockchainServerAPI';

const BUCKET_PREFIX = 'details/';

export async function fetchTokenDetailsClient(tokenId: number): Promise<TokenDetails | null> {
  if (!Number.isFinite(tokenId) || tokenId < 0) {
    console.error('[TokenDetailsFetcher.fetchTokenDetailsClient] Invalid token id');
    return null;
  }

  try {
    const res = await fetch(`/api/token-details/${tokenId}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error(
        `[TokenDetailsFetcher.fetchTokenDetailsClient] API returned ${res.status}: ${res.statusText}`
      );
      return null;
    }

    const json = (await res.json()) as TokenDetails;
    return json ?? null;
  } catch (err) {
    console.error('[TokenDetailsFetcher.fetchTokenDetailsClient] Request failed:', err);
    return null;
  }
}

/**
 * Fetch and cache TokenDetails in Vercel Blob (JSON), similar to ArtworkImageFetcher.
 * - On cache hit: read JSON from Blob and return the parsed TokenDetails.
 * - On miss: fetch from chain, upload JSON to Blob (public, immutable-ish), and return it.
 * - If BLOB_READ_WRITE_TOKEN is not set, just fetch from chain with no caching.
 */
export async function fetchTokenDetailsServer(tokenId: number): Promise<TokenDetails | null> {
  if (!Number.isFinite(tokenId) || tokenId < 0) {
    throw new Error('Invalid token id');
  }

  // If Blob token isn't configured (e.g., local dev), bypass caching.
  if (!process?.env?.BLOB_READ_WRITE_TOKEN) {
    console.error(
      '[TokenDetailsFetcher.fetchTokenDetailsServer] Blob token not configured; bypassing cache'
    );
    return fetchTokenDetailsOnChain(tokenId);
  }

  const tokenDetailsBlobKey = `${BUCKET_PREFIX}anglez-${tokenId}.json`;

  // Try cache first
  try {
    const meta = await head(tokenDetailsBlobKey);
    if (meta?.url) {
      const res = await fetch(meta.url, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        return json as TokenDetails;
      }
    }
  } catch (err) {
    console.error(
      '[TokenDetialsFetcher.fetchTokenDetailsServer] Cache read failed; will refetch:',
      err
    );
  }

  // Cache miss → fetch from chain and upload
  const tokenDetails = await fetchTokenDetailsOnChain(tokenId);
  if (!tokenDetails) {
    return null;
  }

  try {
    const body = Buffer.from(JSON.stringify(tokenDetails), 'utf-8');
    await put(tokenDetailsBlobKey, body, {
      access: 'public',
      addRandomSuffix: false,
      contentType: 'application/json; charset=utf-8',
      cacheControlMaxAge: 60 * 60 * 24 * 30, // 30 days
    });
  } catch (err) {
    console.error('[TokenDetailsFetcher.fetchTokenDetailsServer] Cache write failed:', err);
  }

  return tokenDetails;
}
