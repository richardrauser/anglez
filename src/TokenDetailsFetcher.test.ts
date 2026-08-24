import { head, put } from '@vercel/blob';
import { fetchTokenDetails as fetchTokenDetailsOnChain } from './BlockchainServerAPI';
import { fetchTokenDetailsServer } from './TokenDetailsFetcher';
import type { TokenDetails } from './TokenDetails';

jest.mock('@vercel/blob', () => ({
  head: jest.fn(),
  put: jest.fn(),
}));

jest.mock('./BlockchainServerAPI', () => ({
  fetchTokenDetails: jest.fn(),
}));

const mockHead = head as jest.Mock;
const mockPut = put as jest.Mock;
const mockOnChain = fetchTokenDetailsOnChain as jest.Mock;

const TOKEN: TokenDetails = {
  tokenId: 7,
  owner: '0x1111111111111111111111111111111111111111',
  svg: '<svg />',
  svgDataUri: 'data:image/svg+xml,%3Csvg%20%2F%3E',
  attributes: {
    seed: 648853,
    shapeCount: 8,
    tintColor: 'rgb(150, 187, 84)',
    tintOpacity: '0.3',
    style: 'linear',
    structure: 'folded',
    isCustom: 'false',
  },
};

const ORIGINAL_TOKEN_ENV = process.env.BLOB_READ_WRITE_TOKEN;

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  process.env.BLOB_READ_WRITE_TOKEN = 'test-token';
  mockOnChain.mockResolvedValue(TOKEN);
  global.fetch = jest.fn() as any;
});

afterEach(() => {
  jest.restoreAllMocks();
  if (ORIGINAL_TOKEN_ENV === undefined) {
    delete process.env.BLOB_READ_WRITE_TOKEN;
  } else {
    process.env.BLOB_READ_WRITE_TOKEN = ORIGINAL_TOKEN_ENV;
  }
});

describe('fetchTokenDetailsServer', () => {
  it('bypasses the cache entirely when no blob token is configured', async () => {
    // This is the local-dev path: no credentials, so it must not touch blob storage.
    delete process.env.BLOB_READ_WRITE_TOKEN;

    await expect(fetchTokenDetailsServer(7)).resolves.toEqual(TOKEN);

    expect(mockHead).not.toHaveBeenCalled();
    expect(mockPut).not.toHaveBeenCalled();
    expect(mockOnChain).toHaveBeenCalledWith(7);
  });

  it('serves a cache hit without going on-chain', async () => {
    mockHead.mockResolvedValue({ url: 'https://blob.example/details/anglez-7.json' });
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => TOKEN });

    await expect(fetchTokenDetailsServer(7)).resolves.toEqual(TOKEN);

    expect(global.fetch).toHaveBeenCalledWith('https://blob.example/details/anglez-7.json', {
      cache: 'no-store',
    });
    expect(mockOnChain).not.toHaveBeenCalled();
    expect(mockPut).not.toHaveBeenCalled();
  });

  it('looks the token up under a per-token cache key', async () => {
    mockHead.mockRejectedValue(new Error('not found'));

    await fetchTokenDetailsServer(7);

    expect(mockHead).toHaveBeenCalledWith('details/anglez-7.json');
  });

  it('falls back on-chain and writes through when the cache misses', async () => {
    mockHead.mockRejectedValue(new Error('BlobNotFound'));

    await expect(fetchTokenDetailsServer(7)).resolves.toEqual(TOKEN);

    expect(mockOnChain).toHaveBeenCalledWith(7);
    expect(mockPut).toHaveBeenCalledTimes(1);

    const [key, , options] = mockPut.mock.calls[0];
    expect(key).toBe('details/anglez-7.json');
    // addRandomSuffix must stay false or the write-through would never be readable
    // again by the deterministic key above.
    expect(options).toMatchObject({ access: 'public', addRandomSuffix: false });
  });

  it('refetches on-chain when the cached blob responds with an error status', async () => {
    mockHead.mockResolvedValue({ url: 'https://blob.example/details/anglez-7.json' });
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, json: async () => ({}) });

    await expect(fetchTokenDetailsServer(7)).resolves.toEqual(TOKEN);

    expect(mockOnChain).toHaveBeenCalledWith(7);
  });

  it('still returns the token when the cache write fails', async () => {
    // A blob outage must degrade to "slow but correct", never to a failed page.
    mockHead.mockRejectedValue(new Error('miss'));
    mockPut.mockRejectedValue(new Error('blob is down'));

    await expect(fetchTokenDetailsServer(7)).resolves.toEqual(TOKEN);
  });

  it('does not cache a token that does not exist on-chain', async () => {
    mockHead.mockRejectedValue(new Error('miss'));
    mockOnChain.mockResolvedValue(null);

    await expect(fetchTokenDetailsServer(9999)).resolves.toBeNull();

    expect(mockPut).not.toHaveBeenCalled();
  });
});
