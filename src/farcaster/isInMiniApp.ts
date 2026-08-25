/**
 * Whether the page is running inside a Farcaster client that can answer Mini App calls.
 *
 * This is the only safe way to ask, because the answer is not a property of the page - it
 * is a handshake with a host that may not be listening. `sdk.isInMiniApp()` short-circuits
 * to `false` on the ordinary web and otherwise races the handshake against a timeout, so
 * unlike the wallet calls themselves it always settles.
 *
 * The SDK is imported lazily so that callers on the normal web path don't block on it.
 */
export async function isInMiniApp() {
  try {
    const { sdk } = await import('@farcaster/miniapp-sdk');
    return await sdk.isInMiniApp();
  } catch (error) {
    // An unanswerable handshake means there is no host, which is exactly the "not in
    // Farcaster" answer - so report that rather than letting it break the caller.
    console.warn('Mini App detection failed', error);
    return false;
  }
}
