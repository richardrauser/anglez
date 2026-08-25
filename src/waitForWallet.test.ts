import { waitForWalletToSettle } from './waitForWallet';
import { getConnection, watchConnection } from 'wagmi/actions';

jest.mock('wagmi/actions', () => ({
  getConnection: jest.fn(),
  watchConnection: jest.fn(),
}));

const mockGet = getConnection as jest.MockedFunction<any>;
const mockWatch = watchConnection as jest.MockedFunction<any>;

const config = {} as any;
const connected = { status: 'connected', isConnected: true, address: '0xabc' };
const reconnecting = { status: 'reconnecting', isConnected: false, address: undefined };
const disconnected = { status: 'disconnected', isConnected: false, address: undefined };

describe('waitForWalletToSettle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('returns immediately when the wallet is already settled', async () => {
    mockGet.mockReturnValue(connected);
    await expect(waitForWalletToSettle(config)).resolves.toEqual(connected);
    expect(mockWatch).not.toHaveBeenCalled();
  });

  // The case behind the bug: on a fresh load wagmi says `reconnecting` even when there is
  // no session to restore, so the answer must wait for it to become `disconnected`.
  it('waits through reconnecting and resolves with the settled state', async () => {
    mockGet.mockReturnValue(reconnecting);
    const unwatch = jest.fn();
    let emit: (c: any) => void = () => {};
    mockWatch.mockImplementation((_cfg: any, { onChange }: any) => {
      emit = onChange;
      return unwatch;
    });

    const pending = waitForWalletToSettle(config);
    emit(reconnecting); // still settling - must not resolve yet
    emit(disconnected);

    await expect(pending).resolves.toEqual(disconnected);
    expect(unwatch).toHaveBeenCalledTimes(1);
  });

  it('gives up after the timeout rather than hanging', async () => {
    jest.useFakeTimers();
    mockGet.mockReturnValue(reconnecting);
    const unwatch = jest.fn();
    mockWatch.mockReturnValue(unwatch);

    const pending = waitForWalletToSettle(config, 1000);
    jest.advanceTimersByTime(1000);

    await expect(pending).resolves.toEqual(reconnecting);
    expect(unwatch).toHaveBeenCalledTimes(1);
  });
});
