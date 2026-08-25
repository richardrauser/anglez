'use client';

import { useEffect, useState } from 'react';

/**
 * Reports whether the page is running inside a Farcaster client.
 *
 * The Mini App SDK answers this by handshaking with the host over postMessage, so it can
 * only be known after mount, and never on the server. It starts out `false` because that
 * is both the overwhelmingly common case and the safe one: on the ordinary web the SDK
 * short-circuits on the first tick without ever talking to a host, and only an embedded
 * app flips this to `true`.
 */
export function useIsInMiniApp() {
  const [isInMiniApp, setIsInMiniApp] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { sdk } = await import('@farcaster/miniapp-sdk');
        const result = await sdk.isInMiniApp();
        if (!cancelled) {
          setIsInMiniApp(result);
        }
      } catch (error) {
        // An unanswerable handshake means no host, which is exactly the "not in
        // Farcaster" answer - so leave the default in place rather than break the page.
        console.warn('Mini App detection failed', error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return isInMiniApp;
}
