import { isInMiniApp } from './isInMiniApp';
import { farcasterMiniAppWhenHosted } from './miniAppConnector';

jest.mock('./isInMiniApp');

const hostProvider = { request: jest.fn() };

// The real connector reaches a Farcaster host over postMessage, which no test can supply.
// Only its shape matters here: the wrapper is what decides whether the provider is handed
// out at all.
jest.mock('@farcaster/miniapp-wagmi-connector', () => ({
  farcasterMiniApp: () => () => ({
    id: 'farcaster',
    name: 'Farcaster',
    type: 'farcasterMiniApp',
    getProvider: async () => hostProvider,
    getAccounts: async function getAccounts(this: any) {
      const provider = await this.getProvider();
      return provider.request({ method: 'eth_accounts' });
    },
    isAuthorized: async function isAuthorized(this: any) {
      try {
        return (await this.getAccounts()).length > 0;
      } catch {
        return false;
      }
    },
  }),
}));

const mockedIsInMiniApp = jest.mocked(isInMiniApp);

const connect = () => farcasterMiniAppWhenHosted()({} as any);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('farcasterMiniAppWhenHosted', () => {
  it('hands out the host provider inside a Farcaster client', async () => {
    mockedIsInMiniApp.mockResolvedValue(true);

    await expect(connect().getProvider()).resolves.toBe(hostProvider);
  });

  it('refuses to hand out a provider when no Farcaster host answers', async () => {
    mockedIsInMiniApp.mockResolvedValue(false);

    // wagmi's reconnect catches this and skips the connector. Without it, the calls below
    // would be posted to a host that never replies and never settle, leaving the whole
    // wallet state stuck on `reconnecting`.
    await expect(connect().getProvider()).rejects.toThrow(/Farcaster/);
  });

  it('gates the calls the connector makes through `this`, not just direct ones', async () => {
    mockedIsInMiniApp.mockResolvedValue(false);

    await expect(connect().isAuthorized()).resolves.toBe(false);
    expect(hostProvider.request).not.toHaveBeenCalled();
  });
});
