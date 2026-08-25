/**
 * Whether this page can open a wallet popup that is still able to reach it.
 *
 * Base Account runs its entire handshake through `window.open`, and the popup answers by
 * posting back through its `window.opener`. Inside a native app's WebView that link does
 * not exist - the host opens the URL as another tab of its own browser instead of a real
 * popup, so keys.coinbase.com finds no opener and stops on "This app doesn't support
 * smart wallets". Its advice there is to relax Cross-Origin-Opener-Policy, which is a red
 * herring for this app: we send no COOP header at all, and no header could reattach an
 * opener the WebView never created. The entry can only be withheld, not fixed.
 *
 * `window.ReactNativeWebView` is the bridge a React Native WebView injects into the page,
 * and its presence is how we know we are inside one. Farcaster's in-app browser has it:
 * it is the same bridge the Mini App SDK posts to, and posting into it with no Mini App
 * host listening is precisely what used to hang wallet reconnection there.
 *
 * An iframe is deliberately not treated the same way. A framed page on the open web -
 * including a Farcaster Mini App on desktop - opens a genuine popup with a genuine opener,
 * so Base Account works there and should stay on offer.
 */
export function canOpenWalletPopup() {
  if (typeof window === 'undefined') {
    return false;
  }
  return !('ReactNativeWebView' in window);
}
