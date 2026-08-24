'use client';

import { useEffect } from 'react';

/**
 * Dismisses the Farcaster Mini App splash screen once the app has mounted.
 *
 * Farcaster holds its splash screen up until the embedded app calls `sdk.actions.ready()`
 * - an app that never calls it just appears to hang on load. Outside Farcaster this is a
 * no-op: the SDK is imported lazily so the bundle isn't paid for on the normal web path,
 * and any failure is swallowed rather than breaking the page for ordinary visitors.
 */
export function MiniAppReady() {
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { sdk } = await import('@farcaster/miniapp-sdk');
        if (!(await sdk.isInMiniApp())) {
          return;
        }
        if (!cancelled) {
          await sdk.actions.ready();
        }
      } catch (error) {
        // Not fatal - this only ever affects rendering inside a Farcaster client.
        console.warn('Mini App ready() failed', error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
