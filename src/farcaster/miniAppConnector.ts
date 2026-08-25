import type { CreateConnectorFn } from 'wagmi';
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector';
import { isInMiniApp } from './isInMiniApp';

/**
 * The Farcaster Mini App connector, refusing to hand out a provider unless a Farcaster
 * host is actually there to answer it.
 *
 * The stock connector hands one out unconditionally, and every call on that provider is
 * posted to a host that may not exist. How that fails depends on where the page is:
 *
 * - In a normal browser tab the SDK posts to `window.parent`, which is the page itself.
 *   Its own request comes back as the reply, and the connector reports an opaque
 *   "Internal JSON RPC error" that means nothing to the person who clicked.
 * - Inside a Farcaster client's in-app browser there IS a native bridge but no Mini App
 *   host behind it, so the message is posted and simply never answered. The request never
 *   settles - and because wagmi's reconnect awaits `getProvider()` and `isAuthorized()`
 *   with no timeout of its own, the whole wallet state stays stuck on `reconnecting` and
 *   every control that waits on it spins forever.
 *
 * `isInMiniApp()` always settles, so failing here turns both of those into the one thing
 * wagmi already handles: a connector with no provider, which reconnect skips.
 */
export function farcasterMiniAppWhenHosted(): CreateConnectorFn {
  const createFarcasterConnector = farcasterMiniApp();

  return (config) => {
    const connector = createFarcasterConnector(config);

    return {
      ...connector,
      async getProvider(parameters) {
        if (!(await isInMiniApp())) {
          throw new Error('Not running inside a Farcaster client.');
        }
        // The connector's other methods reach the provider through `this`, so they all
        // pass through this guard rather than only the calls made from outside.
        return connector.getProvider(parameters);
      },
    };
  };
}
