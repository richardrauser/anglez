'use client';

import { useEffect, useState } from 'react';
import { isInMiniApp } from './isInMiniApp';

/**
 * Reports whether the page is running inside a Farcaster client.
 *
 * The answer requires a handshake with the host, so it can only be known after mount, and
 * never on the server. It starts out `false` because that is both the overwhelmingly
 * common case and the safe one - only a confirmed host flips it to `true`.
 */
export function useIsInMiniApp() {
  const [inMiniApp, setInMiniApp] = useState(false);

  useEffect(() => {
    let cancelled = false;

    isInMiniApp().then((result) => {
      if (!cancelled) {
        setInMiniApp(result);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return inMiniApp;
}
